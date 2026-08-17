"use client";
import { Clock } from "lucide-react";
import { Streak } from "@/types/streak";
import { useRouter } from "next/navigation";
import { StreaksList } from "@/components/streaks/StreaksList";
import { AddNewStreak } from "@/components/streaks/AddNewStreak";
import { PageHeader, PageShell } from "@/components/shared/PageShell";
import { deleteStreak } from "@/app/actions/streak";

interface StreaksContentProps {
  streaks: Streak[];
}

export function StreaksContent({ streaks }: StreaksContentProps) {
  const router = useRouter();

  const handleDelete = async (streakId: string) => {
    try {
      await deleteStreak(streakId);
    } catch (e) {
      console.error("Failed to delete streak:", e);
    }
  };

  return (
    <PageShell width="wide">
      <PageHeader
        eyebrow="REGISTRY"
        title="My Streaks"
        actions={<AddNewStreak />}
      />

      <StreaksList
        streaks={streaks}
        onStreakClick={(streakId) => router.push(`/streaks/${streakId}`)}
        onDelete={handleDelete}
      />

      {streaks.length > 0 && (
        <div className="text-faint flex items-center gap-2 font-mono text-[10px] tracking-[0.08em]">
          <Clock size={12} />
          PENDING STREAKS RESET AT MIDNIGHT
        </div>
      )}
    </PageShell>
  );
}
