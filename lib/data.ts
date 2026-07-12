import { prisma } from "@/lib/db";
import { auth } from "@/app/auth";
import { cache } from "react";
import { Streak } from "@/types/streak";
import { JournalEntry } from "@/types/journal-entry";
import {
  getStreaksForUser,
  getStreakByIdForUser,
} from "@/lib/streak-service";

export const getStreaks = cache(async (): Promise<Streak[]> => {
  const session = await auth();
  if (!session?.user?.id) return [];
  return getStreaksForUser(session.user.id);
});

export const getStreakById = cache(
  async (id: string): Promise<Streak | null> => {
    const session = await auth();
    if (!session?.user?.id) return null;
    return getStreakByIdForUser(session.user.id, id);
  }
);

export const getJournalEntryById = cache(
  async (id: string): Promise<JournalEntry | null> => {
    const session = await auth();
    if (!session?.user?.id) return null;
    const entry = await prisma.journalEntry.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!entry) return null;
    return {
      id: entry.id,
      title: entry.title,
      entry: entry.entry,
      createdAt: new Date(entry.createdAt),
    };
  }
);

export const getJournalEntries = async (
  query?: string
): Promise<JournalEntry[]> => {
  const session = await auth();
  if (!session?.user?.id) return [];
  const entries = await prisma.journalEntry.findMany({
    where: {
      userId: session.user.id,
      ...(query
        ? { title: { contains: query, mode: "insensitive" } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  return entries.map((entry) => ({
    id: entry.id,
    title: entry.title,
    entry: entry.entry,
    createdAt: new Date(entry.createdAt),
  }));
};
