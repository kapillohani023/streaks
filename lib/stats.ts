import { Streak } from "@/types/streak";
import { StreakEntry } from "@/types/streak-entry";

const DAY_MS = 24 * 60 * 60 * 1000;

/** How far back every "activity" surface looks. One column per week, 53 weeks. */
export const YEAR_DAYS = 365;
export const HEATMAP_WEEKS = 53;

/**
 * Which calendar day a timestamp falls on locally, as a day count since the
 * epoch.
 *
 * Entries carry a wall-clock time, so subtracting raw milliseconds would
 * compare *elapsed time* rather than dates — an entry from 22:00 yesterday is
 * two hours before midnight and would round to "today". Reducing both sides to
 * a day index first makes every comparison here purely calendrical, and
 * side-steps DST days that aren't 24 hours long.
 */
export const dayIndex = (date: Date): number =>
  Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS
  );

export const todayIndex = (): number => dayIndex(new Date());

/** The Date `offset` days before today, at local midnight. */
export const dateForOffset = (offset: number, from = new Date()): Date => {
  const date = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  date.setDate(date.getDate() - offset);
  return date;
};

/**
 * A streak's completed days as offsets from today: 0 is today, 1 is yesterday.
 *
 * Offsets rather than dates because every view here — the run length, the
 * sparkline, the heatmap, the milestones — asks "how long ago?", and a Set of
 * small integers answers that in one lookup.
 */
export function completedOffsets(
  streak: Streak,
  today = todayIndex()
): Set<number> {
  const offsets = new Set<number>();
  for (const entry of streak.entries as StreakEntry[]) {
    if (!entry.completed) continue;
    const offset = today - dayIndex(entry.date);
    if (offset >= 0) offsets.add(offset);
  }
  return offsets;
}

export const isDoneToday = (offsets: Set<number>): boolean => offsets.has(0);

/**
 * The run of consecutive days ending now.
 *
 * A day that hasn't been marked *yet* is not a break — the count starts at
 * yesterday until today is logged, which is why a pending streak still shows
 * its full run instead of dropping to zero every midnight.
 */
export function currentRun(offsets: Set<number>): number {
  let offset = offsets.has(0) ? 0 : 1;
  let run = 0;
  while (offsets.has(offset)) {
    run++;
    offset++;
  }
  return run;
}

/** The longest consecutive run inside the last `span` days. */
export function longestRun(offsets: Set<number>, span = YEAR_DAYS): number {
  let best = 0;
  let run = 0;
  for (let offset = span - 1; offset >= 0; offset--) {
    if (offsets.has(offset)) {
      run++;
      if (run > best) best = run;
    } else {
      run = 0;
    }
  }
  return best;
}

/** Share of the last `days` days that were completed, as a whole percent. */
export function consistency(offsets: Set<number>, days: number): number {
  if (days <= 0) return 0;
  let hits = 0;
  for (let offset = 0; offset < days; offset++) {
    if (offsets.has(offset)) hits++;
  }
  return Math.round((hits / days) * 100);
}

/** Completions per day across every streak, indexed by offset. */
export function dailyTotals(
  offsetsByStreak: Set<number>[],
  span = YEAR_DAYS
): number[] {
  const totals = new Array<number>(span).fill(0);
  for (const offsets of offsetsByStreak) {
    for (const offset of offsets) {
      if (offset < span) totals[offset] += 1;
    }
  }
  return totals;
}

/**
 * Single-streak activity for the heatmap: 1 on a completed day, 0 otherwise.
 *
 * One streak has no middle ground — the day is logged or it isn't — so this
 * pairs with the heatmap's `binary` scale rather than its graded one.
 */
export function soloTotals(offsets: Set<number>, span = YEAR_DAYS): number[] {
  const totals = new Array<number>(span).fill(0);
  for (const offset of offsets) {
    if (offset < span) totals[offset] = 1;
  }
  return totals;
}

export interface DaySlice {
  /** Days ago. 0 is today. */
  offset: number;
  date: Date;
  count: number;
}

/**
 * The last `days` days oldest-first — the reading order for a bar chart or a
 * sparkline, where time has to run left to right.
 */
export function recentDays(totals: number[], days: number): DaySlice[] {
  const slices: DaySlice[] = [];
  for (let offset = days - 1; offset >= 0; offset--) {
    slices.push({
      offset,
      date: dateForOffset(offset),
      count: totals[offset] ?? 0,
    });
  }
  return slices;
}

/** Which day of its own year today is — the "DAY 229 / 365" readout. */
export function dayOfYear(date = new Date()): number {
  return dayIndex(date) - dayIndex(new Date(date.getFullYear(), 0, 1)) + 1;
}

export function daysInYear(date = new Date()): number {
  const year = date.getFullYear();
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  return isLeap ? 366 : 365;
}

/** Milestone rungs a single streak climbs, in days. */
export const MILESTONES = [7, 21, 50, 100, 365] as const;

export interface MilestoneProgress {
  /** The next unreached rung — capped at the last one, which is never "past". */
  next: number;
  /** Days still to go. */
  remaining: number;
  /** Percent of the way from the last earned rung to the next. */
  percent: number;
}

export function milestoneProgress(run: number): MilestoneProgress {
  const next = MILESTONES.find((days) => days > run) ?? MILESTONES.at(-1)!;
  const previous = [...MILESTONES].filter((days) => days <= run).pop() ?? 0;
  const span = next - previous;
  return {
    next,
    remaining: Math.max(next - run, 0),
    percent:
      span > 0
        ? Math.min(100, Math.round(((run - previous) / span) * 100))
        : 100,
  };
}

/** "SUN 17 AUG 2026" — the header's clock line. */
export function formatStamp(date = new Date()): string {
  return date
    .toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(/,/g, "")
    .toUpperCase();
}
