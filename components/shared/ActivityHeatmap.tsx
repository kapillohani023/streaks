"use client";

import { MonoLabel } from "@/components/ui/SsMono";
import { useIsHydrated } from "@/hooks/use-hydrated";
import { HEATMAP_WEEKS, YEAR_DAYS, dateForOffset } from "@/lib/stats";

type HeatScale = "graded" | "binary";

interface ActivityHeatmapProps {
  /** Completions per day, indexed by days-ago. Index 0 is today. */
  totals: number[];
  /** Section eyebrow inside the panel. */
  label: string;
  /** Shows the LESS→MORE ramp above the grid. */
  legend?: boolean;
  /**
   * How many rungs the cells can take. A single streak's day is done or it
   * isn't, so its chart says so with two — printing four swatches there would
   * advertise two shades the data can never produce.
   */
  scale?: HeatScale;
}

/**
 * Discrete steps, not a gradient. A continuous ramp over 0-4 completions
 * produced neighbouring cells nobody could tell apart; rungs make "one habit"
 * and "all of them" read differently at a glance, which is the only comparison
 * this chart is for.
 */
const RAMPS: Record<HeatScale, string[]> = {
  graded: ["bg-sunken", "bg-mid", "bg-heat-2", "bg-foreground"],
  binary: ["bg-sunken", "bg-foreground"],
};

const heatClass = (ramp: string[], count: number) =>
  ramp[Math.min(Math.max(count, 0), ramp.length - 1)];

export function ActivityHeatmap({
  totals,
  label,
  legend = false,
  scale = "graded",
}: ActivityHeatmapProps) {
  const ramp = RAMPS[scale];
  /*
    Which weekday each column ends on depends on the reader's clock, not the
    server's. Rendering the grid before mount would guarantee a hydration
    mismatch across every one of its 371 cells for anyone outside the deploy
    region, so the shape is held back for one frame instead.
  */
  const today = useIsHydrated() ? new Date() : null;

  return (
    <div className="border-border bg-panel flex flex-col gap-3 rounded-xl border px-3.5 py-4 sm:px-5 sm:py-4.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <MonoLabel>{label}</MonoLabel>
        {legend && (
          <div className="text-faint flex items-center gap-1.5 font-mono text-[9px]">
            <span>LESS</span>
            {ramp.map((tone) => (
              <span
                key={tone}
                className={`h-[9px] w-[9px] rounded-[2px] ${tone}`}
              />
            ))}
            <span>MORE</span>
          </div>
        )}
      </div>

      {/*
        The grid fills whatever width it is given rather than claiming a fixed
        686px and forcing a scroll track: every column is `flex-1`, so a cell is
        ~10px on a desktop panel and ~4px on a phone, and all 53 weeks stay on
        screen either way. `max-w` caps the cells at their intended 10px so a
        wide panel centres the chart instead of inflating it into blocks.
      */}
      <div className="mx-auto flex w-full max-w-[686px] gap-px sm:gap-[3px]">
        {today
          ? buildWeeks(totals, today).map((week, weekIndex) => (
              <div
                key={weekIndex}
                className="flex min-w-0 flex-1 flex-col gap-px sm:gap-[3px]"
              >
                {week.map((cell, dayIndex) =>
                  cell ? (
                    <div
                      key={dayIndex}
                      title={cell.tip}
                      className={[
                        "aspect-square w-full rounded-[1px] sm:rounded-[2px]",
                        heatClass(ramp, cell.count),
                        cell.isToday
                          ? "outline-foreground outline outline-offset-1"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    />
                  ) : (
                    <div key={dayIndex} className="aspect-square w-full" />
                  )
                )}
              </div>
            ))
          : Array.from({ length: HEATMAP_WEEKS }, (_, weekIndex) => (
              <div
                key={weekIndex}
                className="flex min-w-0 flex-1 flex-col gap-px sm:gap-[3px]"
              >
                {Array.from({ length: 7 }, (_, dayIndex) => (
                  <div
                    key={dayIndex}
                    className="bg-sunken aspect-square w-full rounded-[1px] opacity-40 sm:rounded-[2px]"
                  />
                ))}
              </div>
            ))}
      </div>
    </div>
  );
}

interface Cell {
  count: number;
  tip: string;
  isToday: boolean;
}

/**
 * Columns are weeks, oldest on the left; rows are weekdays, so a habit that
 * only ever happens on Tuesdays shows up as a horizontal band. The trailing
 * column is partial — days after today don't exist yet and render as gaps.
 */
function buildWeeks(totals: number[], today: Date): (Cell | null)[][] {
  const todayDow = today.getDay();
  const weeks: (Cell | null)[][] = [];

  for (let week = HEATMAP_WEEKS - 1; week >= 0; week--) {
    const days: (Cell | null)[] = [];
    for (let dow = 0; dow < 7; dow++) {
      const offset = week * 7 + (todayDow - dow);
      if (offset < 0 || offset >= YEAR_DAYS) {
        days.push(null);
        continue;
      }
      const count = totals[offset] ?? 0;
      const date = dateForOffset(offset, today);
      days.push({
        count,
        isToday: offset === 0,
        tip: `${date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })} · ${count}`,
      });
    }
    weeks.push(days);
  }

  return weeks;
}
