import { Streak } from "../lib/Streak";

export const isCompletedToday = (streak: Streak) => {
    const today = new Date().toDateString().split('T')[0];
    return streak.entries.some(entry => new Date(entry.date).toDateString().split('T')[0] === today);
}