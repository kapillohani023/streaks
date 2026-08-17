"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { JournalDay } from "@/types/journal-entry";
import { SsButton } from "@/components/ui/SsButton";
import { MonoLabel } from "@/components/ui/SsMono";
import { formatMonthLabel, toDateKey } from "@/lib/util";

interface JournalCalendarProps {
  days: JournalDay[];
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

const startOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

const shiftMonth = (date: Date, delta: number) =>
  new Date(date.getFullYear(), date.getMonth() + delta, 1);

/**
 * The month at a glance: which days got written on, and a way into each one.
 *
 * Marks are keyed by local date string rather than timestamp so an entry
 * written at 11pm lands on the day the writer thinks it did.
 */
export function JournalCalendar({ days }: JournalCalendarProps) {
  const router = useRouter();
  const today = new Date();
  const [month, setMonth] = useState(() => startOfMonth(today));

  // Newest-first input, so the last write of a day wins as its representative.
  const entriesByDay = useMemo(() => {
    const map = new Map<string, JournalDay>();
    for (const day of days) {
      const key = toDateKey(day.createdAt);
      if (!map.has(key)) map.set(key, day);
    }
    return map;
  }, [days]);

  const cells = useMemo(() => {
    const first = startOfMonth(month);
    const daysInMonth = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0
    ).getDate();
    const leading = Array.from({ length: first.getDay() }, () => null);
    const dates = Array.from(
      { length: daysInMonth },
      (_, index) => new Date(month.getFullYear(), month.getMonth(), index + 1)
    );
    return [...leading, ...dates];
  }, [month]);

  const todayKey = toDateKey(today);
  const isCurrentMonth =
    month.getFullYear() === today.getFullYear() &&
    month.getMonth() === today.getMonth();

  const journaledThisMonth = cells.filter(
    (date) => date && entriesByDay.has(toDateKey(date))
  ).length;

  const monthLabel = formatMonthLabel(month);

  return (
    <div className="border-border bg-panel flex flex-col gap-2.5 rounded-xl border p-4">
      <div className="flex items-center justify-between gap-2">
        <MonoLabel as="h2" size="tile" className="truncate">
          {monthLabel}
        </MonoLabel>
        <div className="flex gap-0.5">
          <SsButton
            variant="outline"
            size="icon-sm"
            className="border-border h-6.5 w-6.5"
            onClick={() => setMonth((current) => shiftMonth(current, -1))}
            aria-label="Previous month"
          >
            <ChevronLeft size={13} />
          </SsButton>
          <SsButton
            variant="outline"
            size="icon-sm"
            className="border-border h-6.5 w-6.5"
            onClick={() => setMonth((current) => shiftMonth(current, 1))}
            aria-label="Next month"
          >
            <ChevronRight size={13} />
          </SsButton>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-[3px]">
        {WEEKDAYS.map((label, index) => (
          <div
            key={`${label}-${index}`}
            aria-hidden
            className="text-faint pb-0.5 text-center font-mono text-[9px]"
          >
            {label}
          </div>
        ))}

        {cells.map((date, index) => {
          if (!date)
            return <div key={`pad-${index}`} className="aspect-square" />;

          const key = toDateKey(date);
          const entry = entriesByDay.get(key);
          const isToday = key === todayKey;
          const isFuture = date > today && !isToday;

          const base =
            "flex aspect-square items-center justify-center rounded-md font-mono text-[11px] transition-colors duration-150";

          if (!entry) {
            return (
              <div
                key={key}
                className={[
                  base,
                  // An inset ring rather than an outline: today has to be
                  // marked without changing the cell's footprint, or the whole
                  // grid shifts by a pixel on the current day.
                  isToday
                    ? "text-foreground font-bold shadow-[inset_0_0_0_1px_var(--fg)]"
                    : isFuture
                      ? "text-mid"
                      : "text-dim",
                ].join(" ")}
              >
                {date.getDate()}
              </div>
            );
          }

          return (
            <button
              key={key}
              type="button"
              onClick={() => router.push(`/journal/${entry.id}`)}
              aria-label={`Journal entry for ${entry.title}`}
              className={[
                base,
                "bg-foreground text-background focus-visible:ring-ring cursor-pointer font-bold hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none active:scale-95",
              ].join(" ")}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      <div className="border-divider flex items-center justify-between gap-2 border-t pt-2.5">
        <MonoLabel as="span" size="tile" className="tracking-[0.08em]">
          {journaledThisMonth} {journaledThisMonth === 1 ? "DAY" : "DAYS"}{" "}
          JOURNALED
        </MonoLabel>
        {!isCurrentMonth && (
          <button
            type="button"
            onClick={() => setMonth(startOfMonth(today))}
            className="text-foreground cursor-pointer font-mono text-[10px] underline underline-offset-2"
          >
            TODAY
          </button>
        )}
      </div>
    </div>
  );
}
