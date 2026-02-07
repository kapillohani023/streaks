"use client";
import { useRouter } from "next/navigation";
import { MarkAsCompleted } from "@/components/streak-profile/MarkAsCompleted";
import { Streak } from "@/types/streak";
import { StreakCalendar } from "@/components/streak-profile/StreakCalendar";
import { isCompletedToday } from "@/lib/util";
import { DeleteStreakButton } from "@/components/streak-profile/DeleteStreakButton";
import { deleteStreak } from "@/app/actions/streak";
import { SsCard } from "@/components/ui/SsCard";
import { SsTypography } from "@/components/ui/SsTypography";

interface StreakProfileContentProps {
  streak: Streak;
}

export function StreakProfileContent({ streak }: StreakProfileContentProps) {
  const router = useRouter();

  const handleDelete = async (streakId: string) => {
    try {
      await deleteStreak(streakId);
      router.push("/dashboard");
    } catch (e) {
      console.error("Failed to delete streak:", e);
    }
  };

  const completedDates = streak.entries
    .filter((entry) => entry.completed)
    .map((entry) => entry.date);

  const completedDatesSet = new Set(completedDates.map((d) => d.getTime()));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const calculateCurrentStreak = () => {
    let count = 0;

    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      if (completedDatesSet.has(date.getTime())) count++;
      else break;
    }
    return count;
  };

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

  const currentStreak = calculateCurrentStreak();
  const longestStreak = calculateLongestStreak();
  const totalScore = completedDatesSet.size;

  return (
    <div className="h-full w-full bg-white p-6 text-black">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
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
        <SsCard className="rounded p-4">
          <SsTypography variant="muted" className="mb-1">
            Current Streak
          </SsTypography>
          <SsTypography as="p" className="text-3xl">
            {currentStreak}
          </SsTypography>
        </SsCard>
        <SsCard className="rounded p-4">
          <SsTypography variant="muted" className="mb-1">
            Longest Streak
          </SsTypography>
          <SsTypography as="p" className="text-3xl">
            {longestStreak}
          </SsTypography>
        </SsCard>
        <SsCard className="rounded p-4">
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
