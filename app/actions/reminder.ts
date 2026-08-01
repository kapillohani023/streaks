"use server";
import { revalidatePath } from "next/cache";
import { auth } from "@/app/auth";
import {
  hasPushSubscription,
  setStreakReminderForUser,
  setUserTimezone,
} from "@/lib/streak-service";
import { isPushConfigured, saveSubscription, sendPushToUser } from "@/lib/push";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

/**
 * Persist the browser-detected IANA zone. Called on load whenever the detected
 * value differs from what the session carries, so it self-heals after travel
 * or an OS clock fix. Failures are swallowed — a bad zone string must never
 * break page load.
 */
export async function syncTimezone(
  timezone: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const userId = await requireUserId();
    await setUserTimezone(userId, timezone);
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[reminder] timezone sync failed:", error);
    // Returned rather than thrown so a bad zone can't break page load, but the
    // caller can still log it — a silent failure here means every reminder for
    // this user fires at the wrong hour.
    return { ok: false, error: message };
  }
}

export async function registerPushSubscription(subscription: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}) {
  const userId = await requireUserId();
  await saveSubscription(userId, subscription);
}

/**
 * Save a streak's reminder preference.
 *
 * Always writes, even with no device registered — the returned `hasDevice`
 * tells the UI whether to warn that nothing will actually arrive.
 */
export async function saveStreakReminder(input: {
  streakId: string;
  enabled: boolean;
  time?: string | null;
}): Promise<{ hasDevice: boolean }> {
  const userId = await requireUserId();
  await setStreakReminderForUser(userId, input);
  revalidatePath("/", "layout");
  return { hasDevice: await hasPushSubscription(userId) };
}

/**
 * Push a notification to the user's devices right now.
 *
 * This is the only practical way to verify the whole chain — permission,
 * subscription, VAPID keys, service-worker handler — without waiting for a
 * real cron tick.
 */
export async function sendTestNotification(): Promise<{
  sent: number;
  message: string;
}> {
  const userId = await requireUserId();

  if (!isPushConfigured()) {
    return {
      sent: 0,
      message: "Push isn't configured on the server (missing VAPID keys).",
    };
  }

  const result = await sendPushToUser(userId, {
    title: "Streaks",
    body: "Test notification — reminders are working.",
    url: "/streaks",
    tag: "streaks-test",
  });

  if (result.sent > 0) {
    return {
      sent: result.sent,
      message: `Sent to ${result.sent} device${result.sent === 1 ? "" : "s"}.`,
    };
  }
  return {
    sent: 0,
    message:
      result.pruned > 0
        ? "This device's subscription had expired — turn the reminder off and on again."
        : "No devices are registered for notifications yet.",
  };
}
