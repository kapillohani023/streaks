import { Streak } from "@/types/streak";
import { StreakEntry } from "@/types/streak-entry";

export const isCompletedToday = (streak: Streak) => {
  const today = new Date().toDateString();
  return streak.entries.some(
    (entry: StreakEntry) => entry.date.toDateString() === today
  );
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

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

/*
  Every stamp below is built from fixed tables rather than `toLocaleString`.

  Two reasons. The design specifies these forms exactly — uppercase, mono,
  zero-padded — and no locale produces them reliably. And `toLocaleString` is
  resolved by whichever ICU build is running, so Node and Chrome disagree on
  details like the case of "PM"; rendering one on the server and the other in
  the browser is a hydration mismatch that throws away the server's HTML.
*/

/** "02-AUG-2026" */
export const formatJournalTitle = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

/** "22:42" — 24-hour, so it sorts and aligns as well as it reads. */
export const formatClock = (date: Date): string =>
  `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;

/** "AUG 2026" */
export const formatMonthLabel = (date: Date): string =>
  `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;

/** "MON" */
export const formatWeekday = (date: Date): string => WEEKDAYS[date.getDay()];

/** "MON, AUG 17" — the weekday carries the rhythm a bare date hides. */
export const formatLogDate = (date: Date): string =>
  `${WEEKDAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${String(
    date.getDate()
  ).padStart(2, "0")}`;

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
