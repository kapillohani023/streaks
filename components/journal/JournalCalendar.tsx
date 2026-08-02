"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { JournalDay } from "@/types/journal-entry";
import { SsButton } from "@/components/ui/SsButton";
import { SsCard } from "@/components/ui/SsCard";
import { SsTypography } from "@/components/ui/SsTypography";
import { toDateKey } from "@/lib/util";

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

  return (
    <SsCard padding="md" variant="elevated" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <CalendarDays size={16} className="text-muted-foreground shrink-0" />
          <SsTypography as="h2" variant="label" className="truncate">
            {month.toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
            })}
          </SsTypography>
        </div>
        <div className="flex items-center gap-0.5">
          <SsButton
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setMonth((current) => shiftMonth(current, -1))}
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </SsButton>
          <SsButton
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setMonth((current) => shiftMonth(current, 1))}
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </SsButton>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((label, index) => (
          <div
            key={`${label}-${index}`}
            aria-hidden
            className="text-muted-foreground pb-1 text-center text-[11px] font-medium"
          >
            {label}
          </div>
        ))}

        {cells.map((date, index) => {
          if (!date) return <div key={`pad-${index}`} />;

          const key = toDateKey(date);
          const entry = entriesByDay.get(key);
          const isToday = key === todayKey;
          const isFuture = date > today && !isToday;

          const base =
            "flex aspect-square min-h-9 w-full items-center justify-center rounded-lg text-sm transition-colors duration-150";

          if (!entry) {
            return (
              <div
                key={key}
                className={[
                  base,
                  isToday
                    ? "ring-ring text-foreground font-semibold ring-2"
                    : isFuture
                      ? "text-muted-foreground/40"
                      : "text-muted-foreground",
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
                "bg-primary text-primary-foreground focus-visible:ring-ring cursor-pointer font-semibold hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none active:scale-95",
                isToday
                  ? "ring-ring ring-offset-background ring-2 ring-offset-2"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      <div className="border-border flex items-center justify-between gap-2 border-t pt-3">
        <SsTypography variant="caption">
          {journaledThisMonth} {journaledThisMonth === 1 ? "day" : "days"}{" "}
          journaled
        </SsTypography>
        {!isCurrentMonth && (
          <button
            type="button"
            onClick={() => setMonth(startOfMonth(today))}
            className="text-foreground cursor-pointer text-xs font-medium underline underline-offset-2"
          >
            Back to today
          </button>
        )}
      </div>
    </SsCard>
  );
}
