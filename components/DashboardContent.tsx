"use client";
import { DashboardCards } from "@/components/dashboard/DashboardCards";
import { DailyCheckIn } from "@/components/dashboard/DailyCheckIn";
import { Streak } from "@/types/streak";

interface DashboardContentProps {
  streaks: Streak[];
}

export function DashboardContent({ streaks }: DashboardContentProps) {
  return (
    <div className="bg-background text-foreground h-full min-h-0 w-full overflow-y-scroll">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-4 pb-10 lg:p-8">
        <DashboardCards streaks={streaks} />
        <DailyCheckIn streaks={streaks} />
      </div>
    </div>
  );
}
