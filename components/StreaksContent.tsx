"use client";
import { ListChecks } from "lucide-react";
import { Streak } from "@/types/streak";
import { useRouter } from "next/navigation";
import { StreaksList } from "@/components/streaks/StreaksList";
import { AddNewStreak } from "@/components/streaks/AddNewStreak";
import { PageHeader, PageShell } from "@/components/shared/PageShell";
import { deleteStreak } from "@/app/actions/streak";
import { isCompletedToday } from "@/lib/util";

interface StreaksContentProps {
  streaks: Streak[];
}

export function StreaksContent({ streaks }: StreaksContentProps) {
  const router = useRouter();

  const handleStreakClick = (streakId: string) => {
    router.push(`/streaks/${streakId}`);
  };

  const handleDelete = async (streakId: string) => {
    try {
      await deleteStreak(streakId);
    } catch (e) {
      console.error("Failed to delete streak:", e);
    }
  };

  const completedCount = streaks.filter(isCompletedToday).length;

  return (
    <PageShell width="wide">
      <PageHeader
        icon={<ListChecks size={20} />}
        title="My Streaks"
        subtitle={
          streaks.length === 0
            ? "No streaks yet"
            : `${completedCount} of ${streaks.length} done today`
        }
        actions={<AddNewStreak />}
      />
      <StreaksList
        streaks={streaks}
        onStreakClick={handleStreakClick}
        onDelete={handleDelete}
      />
    </PageShell>
  );
}
