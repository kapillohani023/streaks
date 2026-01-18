import { Streak } from "@/types/Streak";
import { StreakEntry } from "@/types/StreakEntry";

export const isCompletedToday = (streak: Streak) => {
    const today = new Date().toDateString();
    return streak.entries.some((entry: StreakEntry) => entry.date.toDateString() === today);
}

export const normalizeToMidnight = (date: Date): Date => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
};