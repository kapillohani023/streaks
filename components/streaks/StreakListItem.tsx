"use client";
import { CalendarDays, Flame } from "lucide-react";
import { Streak } from "@/types/streak";
import {
  calculateCurrentStreak,
  formatStreakDate,
  getCompletedDates,
} from "@/lib/util";
import { SsCard } from "@/components/ui/SsCard";
import { SsTypography } from "@/components/ui/SsTypography";
import { useStreakActions } from "@/components/streaks/StreakActions";
import { StreakChips } from "@/components/streaks/StreakChips";

interface StreakListItemProps {
  streak: Streak;
  onStreakClick: (streakId: string) => void;
  onDelete: (streakId: string) => Promise<void> | void;
}

export function StreakListItem({
  streak,
  onStreakClick,
  onDelete,
}: StreakListItemProps) {
  const { menu, dialogs } = useStreakActions({ streak, onDelete });

  const currentStreak = calculateCurrentStreak(getCompletedDates(streak));

  return (
    <>
      <SsCard
        role="button"
        tabIndex={0}
        onClick={() => onStreakClick(streak.id)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onStreakClick(streak.id);
          }
        }}
        padding="none"
        className="border-l-primary hover:bg-muted focus-visible:ring-ring focus-visible:ring-offset-background cursor-pointer border-l-4 px-4 py-3 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <SsTypography
                as="span"
                className="min-w-0 flex-1 truncate text-lg font-medium"
                title={streak.name}
              >
                {streak.name}
              </SsTypography>
              {/* Pinned right so the chips line up down the list instead of
                  drifting with each streak's name length. */}
              <StreakChips streak={streak} />
            </div>

            {/* Always rendered (even when empty) so every card is the same height */}
            <SsTypography
              variant="muted"
              className={`mt-1 line-clamp-2 min-h-10 ${
                streak.description ? "" : "text-muted-foreground/50 italic"
              }`}
              title={streak.description || undefined}
            >
              {streak.description || "No description"}
            </SsTypography>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
              <SsTypography
                as="span"
                variant="caption"
                className="inline-flex items-center gap-1"
              >
                <Flame size={12} />
                {currentStreak} day{currentStreak === 1 ? "" : "s"} streak
              </SsTypography>
              <SsTypography
                as="span"
                variant="caption"
                className="inline-flex items-center gap-1"
              >
                <CalendarDays size={12} />
                Since {formatStreakDate(streak.startDate)}
              </SsTypography>
            </div>
          </div>

          {menu}
        </div>
      </SsCard>

      {dialogs}
    </>
  );
}
