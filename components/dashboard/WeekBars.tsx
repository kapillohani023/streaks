"use client";

import { MonoLabel } from "@/components/ui/SsMono";
import type { DaySlice } from "@/lib/stats";

const WEEKDAY_INITIAL = ["S", "M", "T", "W", "T", "F", "S"];

interface WeekBarsProps {
  /** Seven days, oldest first. */
  days: DaySlice[];
  /** How many completions a full day would be. */
  total: number;
  /** Mean completion rate over the window, already formatted. */
  average: string;
  bestDay: string;
  atRisk: string;
}

/**
 * The week as seven bars.
 *
 * Bars are floored at 4% rather than collapsing to nothing: a zero-height bar
 * is indistinguishable from a missing column, and "we have data and it was
 * zero" is exactly the thing this chart exists to show.
 */
export function WeekBars({
  days,
  total,
  average,
  bestDay,
  atRisk,
}: WeekBarsProps) {
  return (
    <div className="border-border bg-panel flex flex-col gap-3.5 rounded-xl border p-5">
      <div className="flex items-center justify-between">
        <MonoLabel>LAST 7 DAYS</MonoLabel>
        <MonoLabel as="span" size="readout" tone="soft">
          avg <span className="text-foreground font-bold">{average}</span>
        </MonoLabel>
      </div>

      <div className="flex h-18 items-end gap-2">
        {days.map((day, index) => {
          const percent = total > 0 ? Math.round((day.count / total) * 100) : 0;
          const isToday = day.offset === 0;

          return (
            <div
              key={day.offset}
              className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
            >
              <div
                title={`${day.count} of ${total}`}
                style={{
                  height: `${Math.max(percent, 4)}%`,
                  animationDelay: `${index * 0.05}s`,
                }}
                className={`ss-animate-bar-up w-full max-w-[26px] rounded-t-[3px] ${
                  isToday ? "bg-foreground" : "bg-mid"
                }`}
              />
              <span
                className={`font-mono text-[9px] ${
                  isToday ? "text-foreground font-bold" : "text-faint"
                }`}
              >
                {WEEKDAY_INITIAL[day.date.getDay()]}
              </span>
            </div>
          );
        })}
      </div>

      <div className="border-divider text-faint flex justify-between gap-2 border-t pt-2.5 font-mono text-[10px] tracking-[0.06em]">
        <span className="truncate">
          BEST DAY <span className="text-foreground">{bestDay}</span>
        </span>
        <span className="truncate">
          AT RISK <span className="text-foreground">{atRisk}</span>
        </span>
      </div>
    </div>
  );
}
