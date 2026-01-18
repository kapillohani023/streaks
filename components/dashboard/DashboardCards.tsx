import { Flame, Target, TrendingUp, TrendingDown } from 'lucide-react';
import { Streak } from '@/types/Streak';
import { isCompletedToday } from '@/lib/util';

interface DashboardCardsProps {
  streaks: Streak[];
}

export function DashboardCards({ streaks }: DashboardCardsProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  var completedToday = 0;
  streaks.forEach(streak => {
    if (isCompletedToday(streak)) completedToday++;
  })

  // Calculate overall consistency (last 30 days)
  const calculateConsistency = (days: number) => {
    if (streaks.length === 0) return 0;

    let totalPossible = streaks.length * days;
    let totalCompleted = 0;

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      streaks.forEach(streak => {
        if (isCompletedToday(streak)) totalCompleted++;
      });
    }

    return totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
  };

  const consistencyLast30Days = calculateConsistency(30);
  const consistencyPrevious30Days = calculateConsistency(60) - consistencyLast30Days;
  const growth = consistencyPrevious30Days == 0 ? 0 : Math.round((consistencyLast30Days - consistencyPrevious30Days) / consistencyPrevious30Days * 100);

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Completed Today */}
        <div className="border-2 border-black rounded-lg p-6 bg-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white">
              <Flame size={20} />
            </div>
            <div className="text-sm text-zinc-600">Completed Today</div>
          </div>
          <div className="text-4xl">
            {completedToday}/{streaks.length}
          </div>
        </div>

        {/* Overall Consistency */}
        <div className="border-2 border-black rounded-lg p-6 bg-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white">
              <Target size={20} />
            </div>
            <div className="text-sm text-zinc-600">Overall Consistency</div>
          </div>
          <div className="text-4xl">
            {consistencyLast30Days}%
          </div>
          <div className="text-sm text-zinc-500 mt-2">Last 30 days</div>
        </div>

        {/* Consistency Growth */}
        <div className="border-2 border-black rounded-lg p-6 bg-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white">
              {growth >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            </div>
            <div className="text-sm text-zinc-600">Consistency Growth</div>
          </div>
          <div className={`text-4xl ${growth >= 0 ? 'text-black' : 'text-black'}`}>
            {growth >= 0 ? '+' : ''}{growth.toFixed(2)}%
          </div>
          <div className="text-sm text-zinc-500 mt-2">vs previous 30 days</div>
        </div>
      </div>
    </div>
  );
}
