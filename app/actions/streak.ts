"use server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/app/auth";
import {
  createStreakForUser,
  getStreakReminderForUser,
  hasPushSubscription,
  setStreakReminderForUser,
  updateStreakDetailsForUser,
} from "@/lib/streak-service";

export async function addStreak(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const startDate =
    (formData.get("startDate") as string) || new Date().toISOString();
  // Absent when the user left the reminder toggle off; creation never depends
  // on notification permission having been granted.
  const reminderTime = (formData.get("reminderTime") as string) || null;

  const streak = await createStreakForUser(session.user.id, {
    name,
    description,
    startDate,
    reminderTime,
  });

  revalidatePath("/", "layout");
  return streak;
}

/**
 * Save an edit to a streak: name, description, and reminder.
 *
 * The reminder is written only when it actually changed. That is not an
 * optimisation — `setStreakReminderForUser` clears `lastRemindedOn` on every
 * write, so saving it unchanged would let today's already-delivered reminder
 * fire a second time after something as innocent as fixing a typo in the name.
 *
 * `reminderChanged` comes back so the caller knows whether the returned
 * `hasDevice` is worth acting on — a missing device is only news to someone who
 * just asked for a notification.
 */
export async function updateStreak(input: {
  id: string;
  name: string;
  description: string;
  reminderEnabled: boolean;
  reminderTime?: string | null;
}): Promise<{ reminderChanged: boolean; hasDevice: boolean }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  await updateStreakDetailsForUser(userId, {
    streakId: input.id,
    name: input.name,
    description: input.description,
  });

  const time = input.reminderTime?.trim() || null;
  const current = await getStreakReminderForUser(userId, input.id);
  const reminderChanged =
    current.enabled !== input.reminderEnabled ||
    (input.reminderEnabled && current.time !== time);

  if (reminderChanged) {
    await setStreakReminderForUser(userId, {
      streakId: input.id,
      enabled: input.reminderEnabled,
      time,
    });
  }

  revalidatePath("/", "layout");

  return {
    reminderChanged,
    hasDevice: reminderChanged ? await hasPushSubscription(userId) : true,
  };
}

export async function deleteStreak(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.streak.delete({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/", "layout");
}
