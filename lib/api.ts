import { Streak } from "@/types/Streak";
import { StreakEntry } from "@/types/StreakEntry";
const API_BASE = "/api/streaks";

// Helper to parse dates in API responses
function parseStreakDates(streak: Streak): Streak {
    return {
        ...streak,
        startDate: new Date(streak.startDate),
        entries: streak.entries.map((entry) => ({
            ...entry,
            date: new Date(entry.date),
        })),
    };
}

// Streak API
export async function fetchStreaks(): Promise<Streak[]> {
    const response = await fetch(API_BASE);
    if (!response.ok) {
        throw new Error("Failed to fetch streaks");
    }
    const streaks = await response.json();
    return streaks.map(parseStreakDates);
}

export async function createStreak(name: string, description: string): Promise<Streak> {
    const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
    });
    if (!response.ok) {
        throw new Error("Failed to create streak");
    }
    const streak = await response.json();
    return parseStreakDates(streak);
}

export async function deleteStreak(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) {
        throw new Error("Failed to delete streak");
    }
}

// StreakEntry API
export async function createStreakEntry(
    streakId: string,
    entry: { date: Date; completed: boolean; note?: string }
): Promise<StreakEntry> {
    const response = await fetch(`${API_BASE}/${streakId}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            date: entry.date.toISOString(),
            completed: entry.completed,
            note: entry.note,
        }),
    });
    if (!response.ok) {
        throw new Error("Failed to create streak entry");
    }
    const createdEntry = await response.json();
    return {
        ...createdEntry,
        date: new Date(createdEntry.date),
    };
}

export async function deleteStreakEntry(
    streakId: string,
    entryId: string
): Promise<void> {
    const response = await fetch(`${API_BASE}/${streakId}/entries/${entryId}`, {
        method: "DELETE",
    });
    if (!response.ok) {
        throw new Error("Failed to delete streak entry");
    }
}
