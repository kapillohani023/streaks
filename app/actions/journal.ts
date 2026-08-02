"use server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/app/auth";

export async function addJournalEntry(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const entry = (formData.get("entry") as string)?.trim();
  if (!entry) throw new Error("Entry is required");

  const title = (formData.get("title") as string)?.trim();
  if (!title) throw new Error("Title is required");

  await prisma.journalEntry.create({
    data: { entry, title, userId: session.user.id },
  });

  // The dashboard calendar marks journaled days, so it goes stale too.
  revalidatePath("/", "layout");
}

export async function deleteJournalEntry(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Scoped by userId so an id alone is never enough to delete someone else's entry.
  await prisma.journalEntry.deleteMany({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/", "layout");
}
