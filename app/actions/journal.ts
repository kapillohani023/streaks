"use server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/app/auth";
import { formatJournalTitle } from "@/lib/util";

export async function addJournalEntry(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const entry = (formData.get("entry") as string)?.trim();
  if (!entry) throw new Error("Entry is required");

  const title = formatJournalTitle(new Date());

  await prisma.journalEntry.create({
    data: { entry, title, userId: session.user.id },
  });

  revalidatePath("/journal");
}
