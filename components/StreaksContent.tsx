"use client";
import { Streak } from "@/types/streak";
import { useRouter } from "next/navigation";
import { StreaksList } from "@/components/streaks/StreaksList";
import { AddNewStreak } from "@/components/streaks/AddNewStreak";

interface StreaksContentProps {
  streaks: Streak[];
}

export function StreaksContent({ streaks }: StreaksContentProps) {
  const router = useRouter();

  const handleStreakClick = (streakId: string) => {
    router.push(`/streaks/${streakId}`);
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-white text-black">
      <div className="flex flex-1 flex-col justify-start overflow-hidden">
        <StreaksList streaks={streaks} onStreakClick={handleStreakClick} />
        <AddNewStreak />
      </div>
    </div>
  );
}
