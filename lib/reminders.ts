import "server-only";
import { prisma } from "@/lib/db";
import {
  localDateKey,
  localDateStamp,
  localDayBounds,
  localMinutesOfDay,
  parseReminderTime,
} from "@/lib/timezone";
import { sendPushToUser } from "@/lib/push";

/**
 * How late a reminder may still be delivered, in minutes.
 *
 * The cron ticks every 5 minutes but external schedulers drift and occasionally
 * miss a tick entirely, so matching the clock exactly would silently drop a
 * day's reminder. Instead we fire on the first tick at-or-after the target and
 * dedupe per local day. The cap stops a stale morning reminder from ambushing
 * someone in the afternoon after a long outage.
 */
export const GRACE_WINDOW_MINUTES = 30;

export interface ReminderRunSummary {
  checked: number;
  sent: number;
  failed: number;
  pruned: number;
  /** Due, but the streak was already completed for the user's local day. */
  skippedCompleted: number;
  /** Due and claimed, but not a single device accepted the push. */
  undeliverable: number;
}

/**
 * Consecutive completed days ending today (or yesterday, if today isn't done
 * yet — which is the normal case at reminder time), counted in the user's zone.
 */
function currentStreakInZone(
  completedAt: Date[],
  timeZone: string,
  now: Date
): number {
  const days = new Set(completedAt.map((date) => localDateKey(timeZone, date)));

  const cursor = localDateStamp(timeZone, now);
  if (!days.has(cursor.toISOString().slice(0, 10))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  let count = 0;
  while (count < 366 && days.has(cursor.toISOString().slice(0, 10))) {
    count += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return count;
}

function reminderBody(streakLength: number, description: string): string {
  if (streakLength > 0) {
    return `You're on a ${streakLength}-day streak — don't break it today.`;
  }
  return description.trim() || "Time to check in and start your streak.";
}

/**
 * Find every reminder that is due right now and push it.
 *
 * Ordering matters: the `lastRemindedOn` stamp is claimed with a conditional
 * update *before* sending, so two overlapping cron ticks can't both deliver the
 * same reminder. The cost is that a total send failure burns the day's slot —
 * we log it and report `undeliverable` rather than risk duplicate buzzing.
 */
export async function runDueReminders(
  now: Date = new Date()
): Promise<ReminderRunSummary> {
  const streaks = await prisma.streak.findMany({
    // A globally snoozed user drops out here rather than having their per-streak
    // preferences rewritten, so unsnoozing restores everything untouched. Their
    // streaks are never claimed, so a snooze that ends mid-window can still fire.
    where: {
      reminderEnabled: true,
      reminderTime: { not: null },
      user: { remindersSnoozed: false },
    },
    include: { user: { select: { id: true, timezone: true } } },
  });

  const summary: ReminderRunSummary = {
    checked: streaks.length,
    sent: 0,
    failed: 0,
    pruned: 0,
    skippedCompleted: 0,
    undeliverable: 0,
  };

  for (const streak of streaks) {
    const timeZone = streak.user.timezone;
    const dueAtMinutes = parseReminderTime(streak.reminderTime as string);
    if (dueAtMinutes === null) {
      console.error(
        `[reminders] streak ${streak.id} has unparseable reminderTime "${streak.reminderTime}"`
      );
      continue;
    }

    const minutesLate = localMinutesOfDay(timeZone, now) - dueAtMinutes;
    if (minutesLate < 0 || minutesLate > GRACE_WINDOW_MINUTES) continue;

    const localToday = localDateStamp(timeZone, now);
    if (streak.lastRemindedOn?.getTime() === localToday.getTime()) continue;

    const { start, end } = localDayBounds(timeZone, now);
    const completedToday = await prisma.streakEntry.findFirst({
      where: {
        streakId: streak.id,
        completed: true,
        date: { gte: start, lt: end },
      },
      select: { id: true },
    });
    if (completedToday) {
      // Deliberately not stamped: if the entry is later deleted, the reminder
      // can still fire inside the grace window.
      summary.skippedCompleted += 1;
      continue;
    }

    // Atomic claim — only the tick that moves the stamp forward gets to send.
    const claim = await prisma.streak.updateMany({
      where: {
        id: streak.id,
        OR: [{ lastRemindedOn: null }, { lastRemindedOn: { lt: localToday } }],
      },
      data: { lastRemindedOn: localToday },
    });
    if (claim.count === 0) continue;

    const completions = await prisma.streakEntry.findMany({
      where: { streakId: streak.id, completed: true },
      select: { date: true },
      orderBy: { date: "desc" },
      take: 400,
    });

    const streakLength = currentStreakInZone(
      completions.map((entry) => entry.date),
      timeZone,
      now
    );

    const result = await sendPushToUser(streak.userId, {
      title: streak.name,
      body: reminderBody(streakLength, streak.description),
      url: `/streaks/${streak.id}`,
      tag: streak.id,
    });

    summary.sent += result.sent;
    summary.failed += result.failed;
    summary.pruned += result.pruned;
    if (result.sent === 0) {
      summary.undeliverable += 1;
      console.warn(
        `[reminders] streak ${streak.id} was due but no device accepted the push`
      );
    }
  }

  return summary;
}
