import "server-only";
import { prisma } from "@/lib/db";
import { Streak } from "@/types/streak";
import { StreakEntry } from "@/types/streak-entry";

type StreakRow = {
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
};

function parseStreakDates(streak: StreakRow): Streak {
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

/** All streaks (with entries) owned by a user, newest-started first. */
export async function getStreaksForUser(userId: string): Promise<Streak[]> {
  const streaks = await prisma.streak.findMany({
    where: { userId },
    include: { entries: { orderBy: { date: "desc" } } },
    orderBy: { startDate: "desc" },
  });
  return streaks.map(parseStreakDates);
}

/** A single streak (with entries) if it belongs to the user, else null. */
export async function getStreakByIdForUser(
  userId: string,
  id: string
): Promise<Streak | null> {
  const streak = await prisma.streak.findFirst({
    where: { id, userId },
    include: { entries: { orderBy: { date: "desc" } } },
  });
  return streak ? parseStreakDates(streak) : null;
}

/** Entries for a streak the user owns. Throws if the streak isn't theirs. */
export async function getStreakEntriesForUser(
  userId: string,
  streakId: string
): Promise<StreakEntry[]> {
  const streak = await getStreakByIdForUser(userId, streakId);
  if (!streak) throw new Error("Streak not found");
  return streak.entries;
}

/** Create a streak owned by the user. `startDate` defaults to now. */
export async function createStreakForUser(
  userId: string,
  input: { name: string; description?: string; startDate?: string | Date }
) {
  return prisma.streak.create({
    data: {
      name: input.name,
      description: input.description ?? "",
      startDate: input.startDate ? new Date(input.startDate) : new Date(),
      userId,
    },
  });
}

/**
 * Add an entry to a streak the user owns. Verifies ownership first so a
 * caller can't write into someone else's streak by guessing a streakId.
 * `date` defaults to now, `completed` to true.
 */
export async function addStreakEntryForUser(
  userId: string,
  input: {
    streakId: string;
    date?: string | Date;
    completed?: boolean;
    note?: string;
  }
) {
  const streak = await prisma.streak.findFirst({
    where: { id: input.streakId, userId },
    select: { id: true },
  });
  if (!streak) throw new Error("Streak not found");

  return prisma.streakEntry.create({
    data: {
      streakId: input.streakId,
      date: input.date ? new Date(input.date) : new Date(),
      completed: input.completed ?? true,
      note: input.note,
    },
  });
}
