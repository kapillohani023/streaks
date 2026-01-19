"use server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/app/auth";

export async function createStreakEntry(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const streakId = formData.get("streakId") as string;
  const date = formData.get("date") as string;
  const completed = formData.get("completed") as string;
  const note = formData.get("note") as string;

  const entry = await prisma.streakEntry.create({
    data: { streakId, date, completed: completed === "true", note },
  });

  revalidatePath("/", "layout");
  return entry;
}

export async function deleteStreakEntry(streakId: string, entryId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.streakEntry.delete({
    where: { id: entryId },
  });

  revalidatePath("/", "layout");
}
