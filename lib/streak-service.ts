import "server-only";
import { prisma } from "@/lib/db";
import { Streak } from "@/types/streak";
import { StreakEntry } from "@/types/streak-entry";
import {
  DEFAULT_TIMEZONE,
  isValidTimezone,
  localDayBounds,
  parseReminderTime,
} from "@/lib/timezone";

type StreakRow = {
  id: string;
  name: string;
  description: string | null;
  startDate: Date;
  userId: string;
  reminderEnabled: boolean;
  reminderTime: string | null;
  entries: {
    id: string;
    streakId: string;
    date: Date;
    completed: boolean;
    note: string | null;
  }[];
};

function parseStreakDates(streak: StreakRow): Streak {
  return {
    id: streak.id,
    name: streak.name,
    description: streak.description ?? "",
    startDate: new Date(streak.startDate),
    reminderEnabled: streak.reminderEnabled,
    reminderTime: streak.reminderTime ?? undefined,
    entries: streak.entries.map(
      (entry): StreakEntry => ({
        id: entry.id,
        date: new Date(entry.date),
        completed: entry.completed,
        note: entry.note ?? undefined,
      })
    ),
  };
}

/** All streaks (with entries) owned by a user, newest-started first. */
export async function getStreaksForUser(userId: string): Promise<Streak[]> {
  const streaks = await prisma.streak.findMany({
    where: { userId },
    include: { entries: { orderBy: { date: "desc" } } },
    orderBy: { startDate: "desc" },
  });
  return streaks.map(parseStreakDates);
}

/** A single streak (with entries) if it belongs to the user, else null. */
export async function getStreakByIdForUser(
  userId: string,
  id: string
): Promise<Streak | null> {
  const streak = await prisma.streak.findFirst({
    where: { id, userId },
    include: { entries: { orderBy: { date: "desc" } } },
  });
  return streak ? parseStreakDates(streak) : null;
}

/** Entries for a streak the user owns. Throws if the streak isn't theirs. */
export async function getStreakEntriesForUser(
  userId: string,
  streakId: string
): Promise<StreakEntry[]> {
  const streak = await getStreakByIdForUser(userId, streakId);
  if (!streak) throw new Error("Streak not found");
  return streak.entries;
}

/** Create a streak owned by the user. `startDate` defaults to now. */
export async function createStreakForUser(
  userId: string,
  input: {
    name: string;
    description?: string;
    startDate?: string | Date;
    /** Optional daily reminder, local "HH:MM" in the owner's timezone. */
    reminderTime?: string | null;
  }
) {
  const reminderTime = input.reminderTime?.trim() || null;
  if (reminderTime && parseReminderTime(reminderTime) === null) {
    throw new Error(
      `Invalid reminder time "${reminderTime}" — expected 24h HH:MM`
    );
  }

  return prisma.streak.create({
    data: {
      name: input.name,
      description: input.description ?? "",
      startDate: input.startDate ? new Date(input.startDate) : new Date(),
      userId,
      reminderEnabled: reminderTime !== null,
      reminderTime,
    },
  });
}

/**
 * Add an entry to a streak the user owns. Verifies ownership first so a
 * caller can't write into someone else's streak by guessing a streakId.
 * `date` defaults to now, `completed` to true. Used by the manual "log an
 * entry" UI form, which lets a user backfill/edit any date — unlike
 * markStreakCompletedTodayForUser, it does not dedupe against today.
 */
export async function addStreakEntryForUser(
  userId: string,
  input: {
    streakId: string;
    date?: string | Date;
    completed?: boolean;
    note?: string;
  }
) {
  await assertOwnedStreak(userId, input.streakId);

  return prisma.streakEntry.create({
    data: {
      streakId: input.streakId,
      date: input.date ? new Date(input.date) : new Date(),
      completed: input.completed ?? true,
      note: input.note,
    },
  });
}

/**
 * [start of day, start of next day) for right now, in the given IANA zone.
 *
 * This used to use the *server's* local time, which on a UTC host meant an
 * entry logged at 01:00 IST counted as the previous day. Everything that
 * decides what "today" means now goes through the user's stored timezone.
 */
function todayBounds(timezone: string): { start: Date; end: Date } {
  return localDayBounds(timezone);
}

/** The user's IANA zone, falling back to UTC if the row is somehow missing. */
export async function getUserTimezone(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { timezone: true },
  });
  return user?.timezone ?? DEFAULT_TIMEZONE;
}

async function assertOwnedStreak(userId: string, streakId: string) {
  const streak = await prisma.streak.findFirst({
    where: { id: streakId, userId },
    select: { id: true },
  });
  if (!streak) throw new Error("Streak not found");
}

/** Whether a streak the user owns already has a completed entry for today. */
export async function isStreakCompletedTodayForUser(
  userId: string,
  streakId: string
): Promise<boolean> {
  await assertOwnedStreak(userId, streakId);
  const { start, end } = todayBounds(await getUserTimezone(userId));
  const entry = await prisma.streakEntry.findFirst({
    where: {
      streakId,
      completed: true,
      date: { gte: start, lt: end },
    },
    select: { id: true },
  });
  return entry !== null;
}

/**
 * Mark a streak the user owns as completed for today. Idempotent: if
 * today is already marked completed, the existing entry is returned
 * instead of creating a duplicate.
 */
export async function markStreakCompletedTodayForUser(
  userId: string,
  input: { streakId: string; note?: string }
): Promise<{ alreadyCompleted: boolean; entry: StreakRow["entries"][number] }> {
  await assertOwnedStreak(userId, input.streakId);
  const { start, end } = todayBounds(await getUserTimezone(userId));

  const existing = await prisma.streakEntry.findFirst({
    where: {
      streakId: input.streakId,
      completed: true,
      date: { gte: start, lt: end },
    },
  });
  if (existing) {
    return { alreadyCompleted: true, entry: existing };
  }

  const entry = await prisma.streakEntry.create({
    data: {
      streakId: input.streakId,
      date: new Date(),
      completed: true,
      note: input.note,
    },
  });
  return { alreadyCompleted: false, entry };
}

/**
 * Set a streak's daily reminder. `time` is local wall-clock "HH:MM" in the
 * owner's timezone.
 *
 * Saving is deliberately unconditional: enabling records *intent* even when
 * the caller has no push subscription (a denied permission, another device,
 * or the MCP tools, which have no browser at all). Callers surface that gap in
 * the UI instead — see `hasPushSubscription`.
 *
 * `lastRemindedOn` is cleared on every change so that moving a reminder to a
 * later time today, or re-enabling it, can still fire today rather than being
 * deduped against an earlier send.
 */
export async function setStreakReminderForUser(
  userId: string,
  input: { streakId: string; enabled: boolean; time?: string | null }
) {
  await assertOwnedStreak(userId, input.streakId);

  const time = input.time?.trim() || null;
  if (input.enabled) {
    if (!time) throw new Error("A reminder time is required to enable alerts");
    if (parseReminderTime(time) === null) {
      throw new Error(`Invalid reminder time "${time}" — expected 24h HH:MM`);
    }
  }

  return prisma.streak.update({
    where: { id: input.streakId },
    data: {
      reminderEnabled: input.enabled,
      reminderTime: time,
      lastRemindedOn: null,
    },
    select: { id: true, reminderEnabled: true, reminderTime: true },
  });
}

/** Whether the user has at least one device registered for push. */
export async function hasPushSubscription(userId: string): Promise<boolean> {
  const count = await prisma.pushSubscription.count({ where: { userId } });
  return count > 0;
}

/** Persist the browser-detected IANA zone. Ignores unknown zone names. */
export async function setUserTimezone(userId: string, timezone: string) {
  if (!isValidTimezone(timezone)) {
    throw new Error(`Unknown timezone "${timezone}"`);
  }
  await prisma.user.update({
    where: { id: userId },
    data: { timezone },
  });
}
