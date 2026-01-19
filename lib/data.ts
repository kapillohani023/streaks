import { prisma } from "@/lib/db";
import { auth } from "@/app/auth";
import { cache } from "react";
import { Streak } from "@/types/streak";
import { StreakEntry } from "@/types/streak-entry";

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
        entries: streak.entries.map((entry): StreakEntry => ({
            id: entry.id,
            date: new Date(entry.date),
            completed: entry.completed,
            note: entry.note ?? undefined,
        })),
    };
}

export const getStreaks = cache(async (): Promise<Streak[]> => {
    const session = await auth();
    if (!session?.user?.id) return [];
    const streaks = await prisma.streak.findMany({
        where: {
            userId: session.user.id
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

export const getStreakById = cache(async (id: string): Promise<Streak | null> => {
    const session = await auth();
    if (!session?.user?.id) return null;
    const streak = await prisma.streak.findFirst({
        where: {
            id,
            userId: session.user.id
        },
        include: {
            entries: {
                orderBy: { date: "desc" },
            },
        },
    });
    if (!streak) return null;
    return parseStreakDates(streak);
});