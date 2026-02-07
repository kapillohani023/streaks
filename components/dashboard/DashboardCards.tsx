import { Flame, Target, TrendingUp, TrendingDown } from "lucide-react";
import { Streak } from "@/types/streak";
import { isCompletedToday } from "@/lib/util";
import {
  SsCard,
  SsCardDescription,
} from "@/components/ui/SsCard";
import { SsTypography } from "@/components/ui/SsTypography";

interface DashboardCardsProps {
  streaks: Streak[];
}

export function DashboardCards({ streaks }: DashboardCardsProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let completedToday = 0;
  streaks.forEach((streak) => {
    if (isCompletedToday(streak)) completedToday++;
  });

  // Calculate overall consistency (last 30 days)
  const calculateConsistency = (days: number) => {
    if (streaks.length === 0) return 0;

    const totalPossible = streaks.length * days;
    let totalCompleted = 0;

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      streaks.forEach((streak) => {
        if (isCompletedToday(streak)) totalCompleted++;
      });
    }

    return totalPossible > 0
      ? Math.round((totalCompleted / totalPossible) * 100)
      : 0;
  };

  const consistencyLast30Days = calculateConsistency(30);
  const consistencyPrevious30Days =
    calculateConsistency(60) - consistencyLast30Days;
  const growth =
    consistencyPrevious30Days == 0
      ? 0
      : Math.round(
        ((consistencyLast30Days - consistencyPrevious30Days) /
          consistencyPrevious30Days) *
        100
      );

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Completed Today */}
        <SsCard className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
              <Flame size={20} />
            </div>
            <SsCardDescription>Completed Today</SsCardDescription>
          </div>
          <SsTypography as="p" className="text-4xl">
            {completedToday}/{streaks.length}
          </SsTypography>
        </SsCard>

        {/* Overall Consistency */}
        <SsCard className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
              <Target size={20} />
            </div>
            <SsCardDescription>Overall Consistency</SsCardDescription>
          </div>
          <SsTypography as="p" className="text-4xl">
            {consistencyLast30Days}%
          </SsTypography>
          <SsTypography variant="caption" className="mt-2">
            Last 30 days
          </SsTypography>
        </SsCard>

        {/* Consistency Growth */}
        <SsCard className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
              {growth >= 0 ? (
                <TrendingUp size={20} />
              ) : (
                <TrendingDown size={20} />
              )}
            </div>
            <SsCardDescription>Consistency Growth</SsCardDescription>
          </div>
          <SsTypography
            as="p"
            className={`text-4xl ${growth >= 0 ? "text-black" : "text-black"}`}
          >
            {growth >= 0 ? "+" : ""}
            {growth.toFixed(2)}%
          </SsTypography>
          <SsTypography variant="caption" className="mt-2">
            vs previous 30 days
          </SsTypography>
        </SsCard>
      </div>
    </div>
  );
}
