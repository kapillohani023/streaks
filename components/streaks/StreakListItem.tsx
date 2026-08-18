"use client";
import { Streak } from "@/types/streak";
import {
  completedOffsets,
  currentRun,
  isDoneToday,
  longestRun,
} from "@/lib/stats";
import { StreakSparkline } from "@/components/shared/StreakSparkline";
import { useStreakActions } from "@/components/streaks/StreakActions";
import {
  ReminderTag,
  StreakStatusChip,
} from "@/components/streaks/StreakStatusChip";

/**
 * The registry's column track. Declared once and reused by the header row so
 * the labels can't drift out of alignment with the data underneath them.
 */
export const REGISTRY_COLUMNS =
  "md:grid-cols-[minmax(180px,1.4fr)_minmax(140px,1fr)_72px_72px_100px_32px]";

interface StreakListItemProps {
  streak: Streak;
  onStreakClick: (streakId: string) => void;
  onDelete: (streakId: string) => Promise<void> | void;
}

/**
 * One row of the registry.
 *
 * Below `md` the six columns collapse to two stacked bands — identity, then
 * measurements — via `md:contents` on the metrics wrapper, so both layouts come
 * from a single DOM rather than a duplicated mobile copy that would have to be
 * kept in sync by hand.
 */
export function StreakListItem({
  streak,
  onStreakClick,
  onDelete,
}: StreakListItemProps) {
  const { menu, dialogs } = useStreakActions({ streak, onDelete });

  const offsets = completedOffsets(streak);
  const current = currentRun(offsets);
  const best = longestRun(offsets);
  const completed = isDoneToday(offsets);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onStreakClick(streak.id)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onStreakClick(streak.id);
          }
        }}
        className={`border-divider hover:bg-panel-2 focus-visible:ring-ring relative grid cursor-pointer grid-cols-1 gap-2.5 border-b px-4.5 py-3.5 transition-colors duration-150 last:border-b-0 focus-visible:ring-2 focus-visible:-outline-offset-2 focus-visible:outline-none md:items-center md:gap-3 ${REGISTRY_COLUMNS}`}
      >
        <div className="min-w-0 pr-9 md:pr-0">
          <div className="flex items-center gap-2">
            <span
              className="truncate text-[15px] font-semibold"
              title={streak.name}
            >
              {streak.name}
            </span>
            {streak.reminderEnabled && streak.reminderTime && (
              <ReminderTag time={streak.reminderTime} />
            )}
          </div>
          <div
            className="text-dim truncate text-xs"
            title={streak.description || undefined}
          >
            {streak.description || "No description"}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 md:contents">
          <StreakSparkline offsets={offsets} />
          <span className="font-mono text-[15px] font-bold md:text-right">
            {current}
            <span className="text-faint text-[9px]">d</span>
          </span>
          <span className="text-soft font-mono text-[15px] font-bold md:text-right">
            {best}
            <span className="text-faint text-[9px]">d</span>
          </span>
          <StreakStatusChip completed={completed} className="md:text-right" />
        </div>

        {/* Absolute on mobile so the row keeps two clean bands; back in the
            grid from md up, where it has a column of its own. Positioned and
            raised so the open menu paints over the rows below it rather than
            disappearing behind the next one. */}
        <div className="absolute top-2.5 right-2.5 z-20 md:relative md:inset-auto md:justify-self-end">
          {menu}
        </div>
      </div>

      {dialogs}
    </>
  );
}
