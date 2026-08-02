import { prisma } from "@/lib/db";
import { auth } from "@/app/auth";
import { cache } from "react";
import { Streak } from "@/types/streak";
import { JournalEntry } from "@/types/journal-entry";
import { getStreaksForUser, getStreakByIdForUser } from "@/lib/streak-service";

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

/**
 * The entries either side of `entry` in the journal's own ordering (newest
 * first), for the detail page's prev/next arrows. `createdAt` is not unique —
 * two entries saved in the same millisecond would otherwise point at each other
 * forever — so `id` breaks the tie and gives a total order.
 */
export const getAdjacentJournalEntries = cache(
  async (
    entry: Pick<JournalEntry, "id" | "createdAt">
  ): Promise<{ newer: JournalEntry | null; older: JournalEntry | null }> => {
    const session = await auth();
    if (!session?.user?.id) return { newer: null, older: null };

    const select = {
      id: true,
      title: true,
      entry: true,
      createdAt: true,
    } as const;

    const [newer, older] = await Promise.all([
      prisma.journalEntry.findFirst({
        where: {
          userId: session.user.id,
          OR: [
            { createdAt: { gt: entry.createdAt } },
            { createdAt: entry.createdAt, id: { gt: entry.id } },
          ],
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        select,
      }),
      prisma.journalEntry.findFirst({
        where: {
          userId: session.user.id,
          OR: [
            { createdAt: { lt: entry.createdAt } },
            { createdAt: entry.createdAt, id: { lt: entry.id } },
          ],
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        select,
      }),
    ]);

    const toEntry = (row: typeof newer): JournalEntry | null =>
      row ? { ...row, createdAt: new Date(row.createdAt) } : null;

    return { newer: toEntry(newer), older: toEntry(older) };
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
      ...(query ? { title: { contains: query, mode: "insensitive" } } : {}),
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
