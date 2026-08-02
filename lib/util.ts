import { Streak } from "@/types/streak";
import { StreakEntry } from "@/types/streak-entry";

export const isCompletedToday = (streak: Streak) => {
  const today = new Date().toDateString();
  return streak.entries.some(
    (entry: StreakEntry) => entry.date.toDateString() === today
  );
};

export const getCompletedDates = (streak: Streak): Date[] =>
  streak.entries
    .filter((entry: StreakEntry) => entry.completed)
    .map((entry: StreakEntry) => entry.date);

/**
 * Number of consecutive completed days ending today (looking back up to a year).
 */
export const calculateCurrentStreak = (completedDates: Date[]): number => {
  const completedTimes = new Set(
    completedDates.map((date) => normalizeToMidnight(date).getTime())
  );

  const today = normalizeToMidnight(new Date());
  let count = 0;

  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    if (!completedTimes.has(date.getTime())) break;
    count++;
  }
  return count;
};

export const normalizeToMidnight = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

/** "Aug 01, 2026" — no weekday, unlike Date.toDateString(). */
export const formatStreakDate = (date: Date): string =>
  date.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

export const formatJournalTitle = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

/** "2026-08-02" in local time — stable key for "which calendar day is this?". */
export const toDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const countWords = (text: string): number => {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
};
