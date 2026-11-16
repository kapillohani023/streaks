"use client";
import { useMemo, useState } from "react";
import { CalendarPlus, Check, ChevronDown, History, Pencil, Trash2 } from "lucide-react";
import { Streak } from "@/types/streak";
import { StreakEntry } from "@/types/streak-entry";
import { dayIndex, todayIndex } from "@/lib/stats";
import { formatLogDate } from "@/lib/util";
import { MonoLabel, MonoTag } from "@/components/ui/SsMono";
import { SsButton } from "@/components/ui/SsButton";
import { SsMenu } from "@/components/ui/SsMenu";
import { SsTypography } from "@/components/ui/SsTypography";
import {
  DeleteEntryDialog,
  EditEntryDialog,
} from "@/components/streak-profile/EntryDialogs";

interface StreakEntryHistoryProps {
  streak: Streak;
  /** Opens the note dialog from the empty state so a first entry is one tap away. */
  onAddEntry?: () => void;
  /** Opens the backfill dialog for a day that wasn't logged when it happened. */
  onAddPastEntry?: () => void;
}

/** How many rows render before the reader has to ask for more. */
const PAGE_SIZE = 12;
/** Notes longer than this get clamped to two lines with an expand affordance. */
const CLAMP_THRESHOLD = 120;

/**
 * "YYYY-MM-DD" from local parts. `toISOString()` would roll the date back a
 * day for any positive UTC offset.
 */
const toISODate = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

/**
 * "TODAY" / "YESTERDAY" only. Beyond that the absolute date is more useful than
 * "4 days ago", which forces the reader to do arithmetic to place it.
 */
const relativeLabel = (date: Date, today: number): string | null => {
  const diff = today - dayIndex(date);
  if (diff === 0) return "TODAY";
  if (diff === 1) return "YESTERDAY";
  return null;
};

interface Row {
  entry: StreakEntry;
  /** Days with no entry between this row and the newer one above it. */
  missedBefore: number;
}

const buildRows = (entries: StreakEntry[]): Row[] => {
  const sorted = [...entries].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  return sorted.map((entry, index) => {
    const newer = sorted[index - 1];
    const gapDays = newer ? dayIndex(newer.date) - dayIndex(entry.date) - 1 : 0;
    return { entry, missedBefore: Math.max(gapDays, 0) };
  });
};

/**
 * The log: every logged day, newest first, with the breaks left in.
 *
 * Missed days are the story in a streak app, so a gap is drawn as its own
 * dashed segment rather than collapsed away — two dates a fortnight apart
 * stacked flush would read as consecutive.
 */
export function StreakEntryHistory({
  streak,
  onAddEntry,
  onAddPastEntry,
}: StreakEntryHistoryProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<StreakEntry | null>(null);
  const [deleting, setDeleting] = useState<StreakEntry | null>(null);

  const rows = useMemo(() => buildRows(streak.entries), [streak.entries]);
  const today = useMemo(() => todayIndex(), []);

  const toggleExpanded = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const dialogs = (
    <>
      <EditEntryDialog
        open={editing !== null}
        streakId={streak.id}
        streakName={streak.name}
        streakStartDate={streak.startDate}
        entry={editing}
        onClose={() => setEditing(null)}
      />
      <DeleteEntryDialog
        open={deleting !== null}
        streakId={streak.id}
        entry={deleting}
        onClose={() => setDeleting(null)}
      />
    </>
  );

  if (rows.length === 0) {
    return (
      <>
        <div className="border-border bg-panel rounded-xl border px-6 py-10 text-center">
          <div className="bg-sunken text-faint mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
            <History size={20} />
          </div>
          <SsTypography as="p" className="mb-1 font-semibold">
            No entries yet
          </SsTypography>
          <SsTypography variant="muted" className="mx-auto max-w-xs">
            Every day you mark complete shows up here, newest first.
          </SsTypography>
          {(onAddEntry || onAddPastEntry) && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {onAddEntry && (
                <SsButton
                  onClick={onAddEntry}
                  variant="outline"
                  mono
                  size="sm"
                  leftIcon={<Check size={13} />}
                >
                  Mark today complete
                </SsButton>
              )}
              {onAddPastEntry && (
                <SsButton
                  onClick={onAddPastEntry}
                  variant="ghost"
                  mono
                  size="sm"
                  leftIcon={<CalendarPlus size={13} />}
                >
                  Add past entry
                </SsButton>
              )}
            </div>
          )}
        </div>
        {dialogs}
      </>
    );
  }

  const visibleRows = rows.slice(0, visibleCount);
  const remaining = rows.length - visibleRows.length;

  return (
    <>
      <div className="border-border bg-panel overflow-hidden rounded-xl border">
        <div className="border-divider flex items-center justify-between gap-2 border-b px-5 py-3">
          <MonoLabel as="h2">LOG / NEWEST FIRST</MonoLabel>
          <div className="flex items-center gap-2">
            <MonoLabel as="span" size="tile" className="tracking-[0.08em]">
              {rows.length} {rows.length === 1 ? "ENTRY" : "ENTRIES"}
            </MonoLabel>
            {onAddPastEntry && (
              <SsButton
                onClick={onAddPastEntry}
                variant="ghost"
                mono
                size="sm"
                leftIcon={<CalendarPlus size={12} />}
                className="shrink-0"
              >
                Past
              </SsButton>
            )}
          </div>
        </div>

        <ol className="m-0 list-none px-5 py-2.5">
          {visibleRows.map(({ entry, missedBefore }, index) => {
            const isLast = index === visibleRows.length - 1;
            const note = entry.note?.trim();
            const isLong = !!note && note.length > CLAMP_THRESHOLD;
            const isExpanded = expandedIds.has(entry.id);
            const badge = relativeLabel(entry.date, today);

            return (
              <li key={entry.id}>
                {missedBefore > 0 && (
                  <div className="flex items-center gap-2.5 pt-0.5 pb-1.5 pl-[3px]">
                    <span
                      className="border-border-strong ml-1 h-4 border-l border-dashed"
                      aria-hidden="true"
                    />
                    <MonoLabel as="span" size="tile" tone="dim">
                      — {missedBefore} {missedBefore === 1 ? "DAY" : "DAYS"}{" "}
                      MISSED
                    </MonoLabel>
                  </div>
                )}

                <div className="group/entry relative pb-3.5 pl-6.5">
                  {!isLast && (
                    <span
                      className="bg-border absolute top-[18px] bottom-0 left-1 w-px"
                      aria-hidden="true"
                    />
                  )}
                  {/* A square, not a dot: it matches the heatmap cell, so the
                      same event reads the same way in both views. */}
                  <span
                    className={[
                      "absolute top-[7px] left-0 h-[9px] w-[9px] rounded-[2px]",
                      entry.completed
                        ? "bg-foreground"
                        : "border-border-strong border",
                    ].join(" ")}
                    aria-hidden="true"
                  />

                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <time
                          dateTime={toISODate(entry.date)}
                          className="text-foreground font-mono text-xs font-semibold"
                        >
                          {formatLogDate(entry.date)}
                        </time>
                        {badge && (
                          <MonoTag className="border-border-strong text-soft font-bold">
                            {badge}
                          </MonoTag>
                        )}
                        {!entry.completed && (
                          <MonoTag className="border-border-strong text-soft font-bold">
                            NOT COMPLETED
                          </MonoTag>
                        )}
                      </div>

                      {note ? (
                        isLong ? (
                          <button
                            type="button"
                            onClick={() => toggleExpanded(entry.id)}
                            aria-expanded={isExpanded}
                            className="focus-visible:ring-ring group mt-0.5 w-full cursor-pointer rounded-md text-left focus-visible:ring-2 focus-visible:outline-none"
                          >
                            <p
                              className={`text-soft m-0 text-[13px] whitespace-pre-line ${
                                isExpanded ? "" : "line-clamp-2"
                              }`}
                            >
                              {note}
                            </p>
                            <span className="text-faint group-hover:text-foreground mt-0.5 inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.06em] uppercase transition-colors duration-150">
                              {isExpanded ? "Show less" : "Show more"}
                              <ChevronDown
                                size={12}
                                className={`transition-transform duration-200 ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                              />
                            </span>
                          </button>
                        ) : (
                          <p className="text-soft mt-0.5 mb-0 text-[13px] whitespace-pre-line">
                            {note}
                          </p>
                        )
                      ) : (
                        <p className="text-mid mt-0.5 mb-0 text-[13px] italic">
                          No note
                        </p>
                      )}
                    </div>

                    <div className="relative z-10 shrink-0 opacity-100 transition-opacity duration-150 sm:opacity-0 sm:group-hover/entry:opacity-100 sm:group-focus-within/entry:opacity-100">
                      <SsMenu
                        label={`Actions for ${formatLogDate(entry.date)}`}
                        items={[
                          {
                            label: "Edit",
                            icon: <Pencil size={14} />,
                            onSelect: () => setEditing(entry),
                          },
                          {
                            label: "Delete",
                            icon: <Trash2 size={14} />,
                            danger: true,
                            onSelect: () => setDeleting(entry),
                          },
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {remaining > 0 && (
          <div className="border-divider border-t p-2">
            <SsButton
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              variant="ghost"
              mono
              size="sm"
              block
              rightIcon={<ChevronDown size={13} />}
            >
              Show {Math.min(remaining, PAGE_SIZE)} more
            </SsButton>
          </div>
        )}
      </div>
      {dialogs}
    </>
  );
}
