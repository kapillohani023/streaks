"use client";
import { useRouter } from "next/navigation";
import { MarkAsCompleted } from "@/components/streak-profile/MarkAsCompleted";
import { Streak } from "@/types/streak";
import { StreakCalendar } from "@/components/streak-profile/StreakCalendar";
import {
  calculateCurrentStreak,
  getCompletedDates,
  isCompletedToday,
} from "@/lib/util";
import { DeleteStreakButton } from "@/components/streak-profile/DeleteStreakButton";
import { deleteStreak } from "@/app/actions/streak";
import { SsCard } from "@/components/ui/SsCard";
import { SsTypography } from "@/components/ui/SsTypography";
import { SsButton } from "@/components/ui/SsButton";
import { ArrowLeft } from "lucide-react";

interface StreakProfileContentProps {
  streak: Streak;
}

export function StreakProfileContent({ streak }: StreakProfileContentProps) {
  const router = useRouter();

  const handleBack = () => {
    // Fall back to the list when the page was opened directly (no history to pop).
    if (window.history.length > 1) router.back();
    else router.push("/streaks");
  };

  const handleDelete = async (streakId: string) => {
    try {
      await deleteStreak(streakId);
      router.push("/dashboard");
    } catch (e) {
      console.error("Failed to delete streak:", e);
    }
  };

  const completedDates = getCompletedDates(streak);

  const completedDatesSet = new Set(completedDates.map((d) => d.getTime()));

  const calculateLongestStreak = () => {
    if (completedDatesSet.size === 0) return 0;
    let maxStreak = 1;
    let currentStreak = 1;
    const sortedDates = [...completedDatesSet].sort();
    for (let i = 1; i < sortedDates.length; i++) {
      const diffTime = sortedDates[i] - sortedDates[i - 1];
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      if (diffDays === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
    return maxStreak;
  };

  const currentStreak = calculateCurrentStreak(completedDates);
  const longestStreak = calculateLongestStreak();
  const totalScore = completedDatesSet.size;

  return (
    <div className="bg-background text-foreground h-full w-full p-6">
      {/* Header */}
      <div className="mb-6 flex items-start gap-2">
        <SsButton
          onClick={handleBack}
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground shrink-0"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </SsButton>
        <div className="min-w-0 flex-1">
          <SsTypography variant="h3" className="mb-1">
            {streak.name}
          </SsTypography>
          {streak.description && (
            <SsTypography variant="muted">{streak.description}</SsTypography>
          )}
        </div>
        <DeleteStreakButton streakId={streak.id} handleDelete={handleDelete} />
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <SsCard>
          <SsTypography variant="muted" className="mb-1">
            Current Streak
          </SsTypography>
          <SsTypography as="p" className="text-3xl">
            {currentStreak}
          </SsTypography>
        </SsCard>
        <SsCard>
          <SsTypography variant="muted" className="mb-1">
            Longest Streak
          </SsTypography>
          <SsTypography as="p" className="text-3xl">
            {longestStreak}
          </SsTypography>
        </SsCard>
        <SsCard>
          <SsTypography variant="muted" className="mb-1">
            Total Score
          </SsTypography>
          <SsTypography as="p" className="text-3xl">
            {totalScore}
          </SsTypography>
        </SsCard>
      </div>

      {/* Calendar */}
      <div className="mb-6">
        <StreakCalendar completedDates={completedDates} />
      </div>

      {/* Today button */}
      <MarkAsCompleted
        streak={streak}
        label={
          isCompletedToday(streak) ? "Completed Today" : "Mark Today Complete"
        }
      />
    </div>
  );
}
