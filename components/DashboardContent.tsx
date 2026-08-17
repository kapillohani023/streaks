"use client";
import { useMemo, useState } from "react";
import { Streak } from "@/types/streak";
import { DailyCheckIn } from "@/components/dashboard/DailyCheckIn";
import { FocusCard } from "@/components/dashboard/FocusCard";
import { WeekBars } from "@/components/dashboard/WeekBars";
import { ActivityHeatmap } from "@/components/shared/ActivityHeatmap";
import { PageHeader, PageShell } from "@/components/shared/PageShell";
import { EntrySubmissionDialog } from "@/components/streak-profile/MarkAsCompleted";
import { MonoLabel, MonoStat } from "@/components/ui/SsMono";
import {
  completedOffsets,
  consistency,
  currentRun,
  dailyTotals,
  dayOfYear,
  daysInYear,
  isDoneToday,
  longestRun,
  recentDays,
  todayIndex,
} from "@/lib/stats";

interface DashboardContentProps {
  streaks: Streak[];
}

const WEEKDAY_SHORT = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

/** How far back "at risk" looks. Two weeks is long enough to be a habit, short enough to be recoverable. */
const RISK_WINDOW = 14;

export function DashboardContent({ streaks }: DashboardContentProps) {
  const [markingStreak, setMarkingStreak] = useState<Streak | null>(null);

  const stats = useMemo(() => buildStats(streaks), [streaks]);

  return (
    <PageShell width="wide">
      <PageHeader
        eyebrow="OVERVIEW"
        title="Dashboard"
        align="start"
        meta={
          <MonoLabel as="span" size="readout" tone="soft">
            DAY{" "}
            <span className="text-foreground font-bold">{stats.dayOfYear}</span>{" "}
            / {stats.daysInYear}
          </MonoLabel>
        }
      />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-3.5">
        <FocusCard
          doneCount={stats.doneCount}
          total={stats.total}
          nextUpName={stats.nextUp?.name ?? null}
          onMarkNextUp={() => setMarkingStreak(stats.nextUp ?? null)}
          summary={stats.summary}
        />
        <WeekBars
          days={stats.week}
          total={Math.max(stats.total, 1)}
          average={stats.weekAverage}
          bestDay={stats.bestDay}
          atRisk={stats.atRisk}
        />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3.5">
        <MonoStat
          label="Active streaks"
          value={stats.total}
          sub="ALL SYSTEMS TRACKED"
        />
        <MonoStat
          label="Consistency / 30d"
          value={`${stats.consistency30}%`}
          sub={stats.consistencyDelta.text}
          subTone={stats.consistencyDelta.tone}
        />
        <MonoStat
          label="Longest run"
          value={`${stats.longest.days}d`}
          sub={stats.longest.name}
        />
        <MonoStat
          label="Entries logged"
          value={stats.entriesLogged}
          sub="ACROSS ALL STREAKS"
        />
      </div>

      <ActivityHeatmap
        label="ACTIVITY / 365 DAYS / ALL STREAKS"
        totals={stats.totals}
        legend
      />

      <DailyCheckIn streaks={streaks} />

      {markingStreak && (
        <EntrySubmissionDialog
          isOpen
          streak={markingStreak}
          onClose={() => setMarkingStreak(null)}
        />
      )}
    </PageShell>
  );
}

/**
 * Everything the dashboard reads, derived once.
 *
 * Each streak's completed days get turned into an offset set exactly once here
 * and then reused by the run lengths, the week bars, the heatmap and the risk
 * ranking — walking the entry list separately per card was the old shape, and
 * it was both slower and prone to the cards disagreeing with each other.
 */
function buildStats(streaks: Streak[]) {
  const today = todayIndex();
  const offsetsByStreak = streaks.map((streak) =>
    completedOffsets(streak, today)
  );
  const total = streaks.length;
  const doneCount = offsetsByStreak.filter(isDoneToday).length;

  const pending = streaks.filter(
    (_, index) => !isDoneToday(offsetsByStreak[index])
  );

  const totals = dailyTotals(offsetsByStreak);
  const week = recentDays(totals, 7);

  const weekAverage =
    total > 0
      ? Math.round(
          (week.reduce((sum, day) => sum + day.count, 0) /
            (week.length * total)) *
            100
        )
      : 0;

  const best = week.reduce(
    (top, day) => (day.count > top.count ? day : top),
    week[0]
  );

  // Whoever has missed the most of the last fortnight; ties break toward the
  // shorter current run, since that's the one with less to lose by breaking.
  const risk = streaks
    .map((streak, index) => ({
      name: streak.name,
      misses:
        RISK_WINDOW - consistencyDays(offsetsByStreak[index], RISK_WINDOW),
      run: currentRun(offsetsByStreak[index]),
    }))
    .filter((candidate) => candidate.misses > 0)
    .sort((a, b) => b.misses - a.misses || a.run - b.run)[0];

  const consistency30 = averageConsistency(offsetsByStreak, 0, 30);
  const consistencyPrev = averageConsistency(offsetsByStreak, 30, 30);

  const longest = streaks.reduce(
    (top, streak, index) => {
      const days = longestRun(offsetsByStreak[index]);
      return days > top.days ? { days, name: streak.name.toUpperCase() } : top;
    },
    { days: 0, name: "NO RUNS YET" }
  );

  const entriesLogged = offsetsByStreak.reduce(
    (sum, offsets) => sum + offsets.size,
    0
  );

  return {
    total,
    doneCount,
    nextUp: pending[0],
    summary:
      total === 0
        ? "NOTHING TRACKED YET"
        : pending.length > 0
          ? `${pending.length} PENDING · ${pending
              .map((streak) => streak.name.toUpperCase())
              .join(" / ")}`
          : "STREAK CHAIN INTACT",
    week,
    weekAverage: `${weekAverage}%`,
    bestDay:
      total > 0 && best && best.count > 0
        ? `${WEEKDAY_SHORT[best.date.getDay()]} ${Math.round(
            (best.count / total) * 100
          )}%`
        : "—",
    atRisk: risk ? risk.name.toUpperCase() : "NONE",
    consistency30,
    consistencyDelta: describeDelta(consistency30 - consistencyPrev),
    longest,
    entriesLogged,
    totals,
    dayOfYear: dayOfYear(),
    daysInYear: daysInYear(),
  };
}

/** Completed days inside a window — the raw count behind a consistency percent. */
function consistencyDays(offsets: Set<number>, days: number): number {
  let hits = 0;
  for (let offset = 0; offset < days; offset++) {
    if (offsets.has(offset)) hits++;
  }
  return hits;
}

/** Mean consistency across streaks over `days`, starting `from` days ago. */
function averageConsistency(
  offsetsByStreak: Set<number>[],
  from: number,
  days: number
): number {
  if (offsetsByStreak.length === 0) return 0;
  const shifted = offsetsByStreak.map((offsets) => {
    const window = new Set<number>();
    for (let offset = 0; offset < days; offset++) {
      if (offsets.has(from + offset)) window.add(offset);
    }
    return window;
  });
  const sum = shifted.reduce(
    (running, offsets) => running + consistency(offsets, days),
    0
  );
  return Math.round(sum / shifted.length);
}

/**
 * Points, not percent-of-percent. "Consistency rose 6 points" is a fact the
 * reader can check against the number above it; "rose 8%" of a percentage is
 * a different quantity that happens to look like the same one.
 */
function describeDelta(points: number): {
  text: string;
  tone: "ok" | "bad" | "faint";
} {
  if (points > 0) return { text: `▲ ${points} PTS VS PREV`, tone: "ok" };
  if (points < 0)
    return { text: `▼ ${Math.abs(points)} PTS VS PREV`, tone: "bad" };
  return { text: "NO CHANGE VS PREV", tone: "faint" };
}
