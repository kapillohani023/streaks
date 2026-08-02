import "server-only";
import { prisma } from "@/lib/db";

/** Whether the user has globally muted every reminder. */
export async function isRemindersSnoozedForUser(
  userId: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { remindersSnoozed: true },
  });
  return user?.remindersSnoozed ?? false;
}

/**
 * Mute or unmute every reminder at once.
 *
 * Per-streak preferences are deliberately left alone — snoozing is a temporary
 * override, so turning it back off restores the exact set of reminders the user
 * had configured rather than making them re-enable each streak.
 */
export async function setRemindersSnoozedForUser(
  userId: string,
  snoozed: boolean
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { remindersSnoozed: snoozed },
  });
}

/**
 * Delete the account. Every owned row (streaks, entries, journal, push
 * subscriptions) goes with it through the schema's cascades, so the caller only
 * has to drop the session afterwards.
 */
export async function deleteAccountForUser(userId: string): Promise<void> {
  await prisma.user.delete({ where: { id: userId } });
}
