import { Flame, Target, TrendingUp, TrendingDown } from "lucide-react";
import { Streak } from "@/types/_streak";
import { isCompletedToday } from "@/lib/util";

interface DashboardCardsProps {
  streaks: Streak[];
}

export function DashboardCards({ streaks }: DashboardCardsProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  var completedToday = 0;
  streaks.forEach((streak) => {
    if (isCompletedToday(streak)) completedToday++;
  });

  // Calculate overall consistency (last 30 days)
  const calculateConsistency = (days: number) => {
    if (streaks.length === 0) return 0;

    let totalPossible = streaks.length * days;
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
        <div className="rounded-lg border-2 border-black bg-white p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
              <Flame size={20} />
            </div>
            <div className="text-sm text-zinc-600">Completed Today</div>
          </div>
          <div className="text-4xl">
            {completedToday}/{streaks.length}
          </div>
        </div>

        {/* Overall Consistency */}
        <div className="rounded-lg border-2 border-black bg-white p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
              <Target size={20} />
            </div>
            <div className="text-sm text-zinc-600">Overall Consistency</div>
          </div>
          <div className="text-4xl">{consistencyLast30Days}%</div>
          <div className="mt-2 text-sm text-zinc-500">Last 30 days</div>
        </div>

        {/* Consistency Growth */}
        <div className="rounded-lg border-2 border-black bg-white p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
              {growth >= 0 ? (
                <TrendingUp size={20} />
              ) : (
                <TrendingDown size={20} />
              )}
            </div>
            <div className="text-sm text-zinc-600">Consistency Growth</div>
          </div>
          <div
            className={`text-4xl ${growth >= 0 ? "text-black" : "text-black"}`}
          >
            {growth >= 0 ? "+" : ""}
            {growth.toFixed(2)}%
          </div>
          <div className="mt-2 text-sm text-zinc-500">vs previous 30 days</div>
        </div>
      </div>
    </div>
  );
}
