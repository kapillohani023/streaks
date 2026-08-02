"use client";
import { useMemo, useState } from "react";
import { Check, ChevronDown, History, Minus, X } from "lucide-react";
import { StreakEntry } from "@/types/streak-entry";
import { SsCard } from "@/components/ui/SsCard";
import { SsTypography } from "@/components/ui/SsTypography";
import { SsButton } from "@/components/ui/SsButton";

interface StreakEntryHistoryProps {
  entries: StreakEntry[];
  /** Opens the note dialog from the empty state so a first entry is one tap away. */
  onAddEntry?: () => void;
}

/** How many rows render before the reader has to ask for more. */
const PAGE_SIZE = 12;
/** Notes longer than this get clamped to two lines with an expand affordance. */
const CLAMP_THRESHOLD = 120;

const DAY_MS = 24 * 60 * 60 * 1000;

/** "Sat, Aug 02" — weekday carries the habit rhythm the plain date hides. */
const formatEntryDate = (date: Date): string =>
  date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "2-digit",
  });

/**
 * "YYYY-MM-DD" from local parts. `toISOString()` would roll the date back a
 * day for any positive UTC offset.
 */
const toISODate = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

/**
 * Which calendar day this falls on locally, as a day count since the epoch.
 *
 * Entries are stored as full wall-clock timestamps, not midnight, so
 * subtracting raw milliseconds compares *elapsed time* rather than dates:
 * an entry logged yesterday at 22:00 is only two hours before today's
 * midnight and rounds to a zero-day difference, i.e. "Today". Reducing both
 * sides to a day index first makes every comparison here purely calendrical,
 * and side-steps DST days that aren't 24 hours long.
 */
const localDayIndex = (date: Date): number =>
  Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS
  );

const formatMonthLabel = (date: Date): string =>
  date.toLocaleDateString(undefined, { month: "long", year: "numeric" });

/**
 * "Today" / "Yesterday" only. Beyond that the absolute date is more useful than
 * "4 days ago", which forces the reader to do arithmetic to place it.
 */
const relativeLabel = (date: Date, todayIndex: number): string | null => {
  const diff = todayIndex - localDayIndex(date);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return null;
};

interface Row {
  entry: StreakEntry;
  /** Days with no entry between this row and the newer one above it. */
  missedBefore: number;
  /** First row of a new month — gets a month heading above it. */
  monthLabel: string | null;
}

const buildRows = (entries: StreakEntry[]): Row[] => {
  const sorted = [...entries].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  return sorted.map((entry, index) => {
    const newer = sorted[index - 1];
    const gapDays = newer
      ? localDayIndex(newer.date) - localDayIndex(entry.date) - 1
      : 0;

    const month = formatMonthLabel(entry.date);
    const prevMonth = newer ? formatMonthLabel(newer.date) : null;

    return {
      entry,
      missedBefore: Math.max(gapDays, 0),
      monthLabel: month === prevMonth ? null : month,
    };
  });
};

export function StreakEntryHistory({
  entries,
  onAddEntry,
}: StreakEntryHistoryProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const rows = useMemo(() => buildRows(entries), [entries]);
  const todayIndex = useMemo(() => localDayIndex(new Date()), []);

  const toggleExpanded = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  if (rows.length === 0) {
    return (
      <SsCard padding="lg" className="text-center">
        <div className="bg-muted text-muted-foreground mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
          <History size={20} />
        </div>
        <SsTypography as="p" className="mb-1 font-medium">
          No entries yet
        </SsTypography>
        <SsTypography variant="muted" className="mx-auto max-w-xs">
          Every day you mark complete shows up here, newest first.
        </SsTypography>
        {onAddEntry && (
          <SsButton
            onClick={onAddEntry}
            variant="secondary"
            size="sm"
            className="mt-4"
            leftIcon={<Check size={14} />}
          >
            Mark today complete
          </SsButton>
        )}
      </SsCard>
    );
  }

  const visibleRows = rows.slice(0, visibleCount);
  const remaining = rows.length - visibleRows.length;

  return (
    <SsCard padding="none" className="overflow-hidden">
      <div className="border-border flex items-baseline justify-between gap-2 border-b px-4 py-3">
        <SsTypography as="h2" className="text-base font-semibold">
          History
        </SsTypography>
        <SsTypography variant="caption">
          {rows.length} {rows.length === 1 ? "entry" : "entries"} · newest first
        </SsTypography>
      </div>

      <ol className="px-4 py-2">
        {visibleRows.map(({ entry, missedBefore, monthLabel }, index) => {
          const isLast = index === visibleRows.length - 1;
          const note = entry.note?.trim();
          const isLong = !!note && note.length > CLAMP_THRESHOLD;
          const isExpanded = expandedIds.has(entry.id);
          const badge = relativeLabel(entry.date, todayIndex);

          return (
            <li key={entry.id}>
              {monthLabel && (
                <div className="text-muted-foreground py-2 text-xs font-semibold tracking-wider uppercase">
                  {monthLabel}
                </div>
              )}

              {/* Missed days are the story in a streak app — show the break
                  rather than silently collapsing two distant dates together. */}
              {missedBefore > 0 && (
                <div className="relative flex items-center gap-3 pb-1 pl-1">
                  <span
                    className="border-border ml-[6px] h-6 border-l border-dashed"
                    aria-hidden="true"
                  />
                  <SsTypography
                    as="span"
                    variant="caption"
                    className="inline-flex items-center gap-1"
                  >
                    <Minus size={10} />
                    {missedBefore} day{missedBefore === 1 ? "" : "s"} missed
                  </SsTypography>
                </div>
              )}

              <div className="relative pb-4 pl-8">
                {!isLast && (
                  <span
                    className="bg-border absolute top-6 bottom-0 left-[7px] w-px"
                    aria-hidden="true"
                  />
                )}
                <span
                  className={[
                    "absolute top-1.5 left-0 flex h-[15px] w-[15px] items-center justify-center rounded-full",
                    entry.completed
                      ? "bg-success text-white"
                      : "border-border bg-muted text-muted-foreground border",
                  ].join(" ")}
                  aria-hidden="true"
                >
                  {entry.completed ? <Check size={9} /> : <X size={9} />}
                </span>

                <div className="flex items-center gap-2">
                  <time
                    dateTime={toISODate(entry.date)}
                    className="text-foreground text-sm font-medium"
                  >
                    {formatEntryDate(entry.date)}
                  </time>
                  {badge && (
                    <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                      {badge}
                    </span>
                  )}
                  {!entry.completed && (
                    <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                      not completed
                    </span>
                  )}
                </div>

                {note ? (
                  isLong ? (
                    <button
                      type="button"
                      onClick={() => toggleExpanded(entry.id)}
                      aria-expanded={isExpanded}
                      className="focus-visible:ring-ring focus-visible:ring-offset-background group mt-1 w-full cursor-pointer rounded-md text-left focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                      <SsTypography
                        variant="muted"
                        className={`whitespace-pre-line ${isExpanded ? "" : "line-clamp-2"}`}
                      >
                        {note}
                      </SsTypography>
                      <span className="text-muted-foreground group-hover:text-foreground mt-0.5 inline-flex items-center gap-1 text-xs transition-colors duration-150">
                        {isExpanded ? "Show less" : "Show more"}
                        <ChevronDown
                          size={12}
                          className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </span>
                    </button>
                  ) : (
                    <SsTypography
                      variant="muted"
                      className="mt-1 whitespace-pre-line"
                    >
                      {note}
                    </SsTypography>
                  )
                ) : (
                  <SsTypography
                    variant="muted"
                    className="text-muted-foreground/50 mt-1 italic"
                  >
                    No note
                  </SsTypography>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {remaining > 0 && (
        <div className="border-border border-t p-2">
          <SsButton
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            variant="ghost"
            size="sm"
            block
            rightIcon={<ChevronDown size={14} />}
          >
            +
          </SsButton>
        </div>
      )}
    </SsCard>
  );
}
