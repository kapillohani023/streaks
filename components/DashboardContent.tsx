"use client";
import { LayoutDashboard } from "lucide-react";
import { DashboardCards } from "@/components/dashboard/DashboardCards";
import { DailyCheckIn } from "@/components/dashboard/DailyCheckIn";
import { PageHeader, PageShell } from "@/components/shared/PageShell";
import { isCompletedToday } from "@/lib/util";
import { Streak } from "@/types/streak";

interface DashboardContentProps {
  streaks: Streak[];
}

export function DashboardContent({ streaks }: DashboardContentProps) {
  const completedCount = streaks.filter(isCompletedToday).length;

  return (
    <PageShell width="wide">
      <PageHeader
        icon={<LayoutDashboard size={20} />}
        title="Dashboard"
        subtitle={
          streaks.length === 0
            ? "No streaks yet"
            : `${completedCount} of ${streaks.length} done today`
        }
      />
      <DashboardCards streaks={streaks} />
      <DailyCheckIn streaks={streaks} />
    </PageShell>
  );
}
