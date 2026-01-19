"use server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/app/auth";

export async function addStreak(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const startDate =
    (formData.get("startDate") as string) || new Date().toISOString();

  const streak = await prisma.streak.create({
    data: { name, description, startDate, userId: session.user.id },
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
