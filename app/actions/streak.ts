"use server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/app/auth";
import { createStreakForUser } from "@/lib/streak-service";

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

export async function deleteStreak(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.streak.delete({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/", "layout");
}
