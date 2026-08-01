"use client";
import { useState } from "react";
import { Bell, CalendarDays, Check, Clock, Flame, Trash2 } from "lucide-react";
import { Streak } from "@/types/streak";
import {
  calculateCurrentStreak,
  formatStreakDate,
  getCompletedDates,
  isCompletedToday,
} from "@/lib/util";
import { SsCard } from "@/components/ui/SsCard";
import { SsTypography } from "@/components/ui/SsTypography";
import { SsMenu } from "@/components/ui/SsMenu";
import { EntrySubmissionDialog } from "@/components/streak-profile/MarkAsCompleted";
import { DeleteStreakDialog } from "@/components/streak-profile/DeleteStreakButton";
import { ReminderDialog } from "@/components/streaks/ReminderDialog";

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
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);

  const completedToday = isCompletedToday(streak);
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
              <div className="flex shrink-0 items-center gap-2">
                {completedToday ? (
                  <span className="bg-success/10 text-success inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-medium">
                    <Check size={10} />
                    completed
                  </span>
                ) : (
                  <span className="bg-muted text-muted-foreground inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-medium">
                    <Clock size={10} />
                    pending
                  </span>
                )}
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

          <SsMenu
            label={`Actions for ${streak.name}`}
            items={[
              {
                label: completedToday
                  ? "Completed today"
                  : "Mark complete",
                icon: <Check size={16} />,
                disabled: completedToday,
                onSelect: () => setIsEntryDialogOpen(true),
              },
              {
                label: streak.reminderEnabled
                  ? `Reminder at ${streak.reminderTime}`
                  : "Set reminder",
                icon: <Bell size={16} />,
                onSelect: () => setIsReminderDialogOpen(true),
              },
              {
                label: "Delete",
                icon: <Trash2 size={16} />,
                danger: true,
                onSelect: () => setIsDeleteDialogOpen(true),
              },
            ]}
          />
        </div>
      </SsCard>

      <EntrySubmissionDialog
        isOpen={isEntryDialogOpen}
        onClose={() => setIsEntryDialogOpen(false)}
        streak={streak}
      />
      <ReminderDialog
        open={isReminderDialogOpen}
        streak={streak}
        onClose={() => setIsReminderDialogOpen(false)}
      />
      <DeleteStreakDialog
        open={isDeleteDialogOpen}
        streakId={streak.id}
        streakName={streak.name}
        onClose={() => setIsDeleteDialogOpen(false)}
        handleDelete={onDelete}
      />
    </>
  );
}
