"use client";
import { DashboardCards } from "@/components/dashboard/DashboardCards";
import { DailyCheckIn } from "@/components/dashboard/DailyCheckIn";
import { Streak } from "@/types/streak";
import { signOut } from "next-auth/react";
import { SsButton } from "@/components/ui/SsButton";

interface DashboardContentProps {
  streaks: Streak[];
}

export function DashboardContent({ streaks }: DashboardContentProps) {
  return (
    <div className="flex h-full min-h-0 w-full overflow-y-scroll bg-white text-black">
      <div className="flex flex-1 flex-col justify-start">
        <div className="flex w-full justify-end p-2">
          <SsButton
            onClick={() => signOut()}
            variant="secondary"
            size="sm"
          >
            Sign out
          </SsButton>
        </div>
        <DashboardCards streaks={streaks} />
        <DailyCheckIn streaks={streaks} />
      </div>
    </div>
  );
}
