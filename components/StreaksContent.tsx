"use client";
import { Streak } from "@/types/streak";
import { useRouter } from "next/navigation";
import { StreaksList } from "@/components/streaks/StreaksList";
import { AddNewStreak } from "@/components/streaks/AddNewStreak";
import { deleteStreak } from "@/app/actions/streak";

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

  return (
    <div className="bg-background text-foreground flex h-full min-h-0 w-full overflow-y-scroll">
      <div className="flex flex-1 flex-col justify-start overflow-hidden">
        <StreaksList
          streaks={streaks}
          onStreakClick={handleStreakClick}
          onDelete={handleDelete}
        />
        <AddNewStreak />
      </div>
    </div>
  );
}
