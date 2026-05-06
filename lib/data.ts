import { prisma } from "@/lib/db";
import { auth } from "@/app/auth";
import { cache } from "react";
import { Streak } from "@/types/streak";
import { StreakEntry } from "@/types/streak-entry";
import { JournalEntry } from "@/types/journal-entry";

function parseStreakDates(streak: {
  id: string;
  name: string;
  description: string | null;
  startDate: Date;
  userId: string;
  entries: {
    id: string;
    streakId: string;
    date: Date;
    completed: boolean;
    note: string | null;
  }[];
}): Streak {
  return {
    id: streak.id,
    name: streak.name,
    description: streak.description ?? "",
    startDate: new Date(streak.startDate),
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

export const getStreaks = cache(async (): Promise<Streak[]> => {
  const session = await auth();
  if (!session?.user?.id) return [];
  const streaks = await prisma.streak.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      entries: {
        orderBy: { date: "desc" },
      },
    },
    orderBy: { startDate: "desc" },
  });
  return streaks.map(parseStreakDates);
});

export const getStreakById = cache(
  async (id: string): Promise<Streak | null> => {
    const session = await auth();
    if (!session?.user?.id) return null;
    const streak = await prisma.streak.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        entries: {
          orderBy: { date: "desc" },
        },
      },
    });
    if (!streak) return null;
    return parseStreakDates(streak);
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
