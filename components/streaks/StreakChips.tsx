import { Bell } from "lucide-react";
import { Streak } from "@/types/streak";
import { isCompletedToday } from "@/lib/util";
import { StreakStatusChip } from "@/components/streaks/StreakStatusChip";

interface StreakChipsProps {
  streak: Streak;
  className?: string;
}

/**
 * The at-a-glance row for a streak: today's status, plus the reminder time
 * when one is set. Shared by the list and the profile so both surfaces show
 * the same facts in the same order.
 *
 * `shrink-0` keeps the row at its natural width — in the list that stops the
 * chips drifting left as streak names get longer, which is what lines them up
 * down the column.
 */
export function StreakChips({ streak, className = "" }: StreakChipsProps) {
  return (
    <div
      className={["flex shrink-0 flex-wrap items-center gap-2", className]
        .filter(Boolean)
        .join(" ")}
    >
      <StreakStatusChip completed={isCompletedToday(streak)} />
      {streak.reminderEnabled && streak.reminderTime && (
        <span
          className="bg-muted text-muted-foreground inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-medium"
          title={`Daily reminder at ${streak.reminderTime}`}
        >
          <Bell size={10} />
          {streak.reminderTime}
        </span>
      )}
    </div>
  );
}
