"use client";
import { DashboardCards } from "@/components/dashboard/DashboardCards";
import { DailyCheckIn } from "@/components/dashboard/DailyCheckIn";
import { Streak } from "@/types/streak";

interface DashboardContentProps {
  streaks: Streak[];
}

export function DashboardContent({ streaks }: DashboardContentProps) {
  return (
    <div className="flex h-full min-h-0 w-full overflow-y-scroll bg-background text-foreground">
      <div className="flex flex-1 flex-col justify-start">
        <DashboardCards streaks={streaks} />
        <DailyCheckIn streaks={streaks} />
      </div>
    </div>
  );
}
