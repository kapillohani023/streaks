import { Streak } from "@/types/streak";
import { isCompletedToday } from "@/lib/util";

interface StreaksListProps {
  streaks: Streak[];
  onStreakClick: (streakId: string) => void;
}

export function StreaksList({ streaks, onStreakClick }: StreaksListProps) {
  return (
    <div className="h-100 flex-1 overflow-y-auto bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Streaks List</h2>
      </div>
      <div className="flex flex-col gap-2 py-2">
        {streaks.map((streak) => {
          const isCompleted = isCompletedToday(streak);
          return (
            <button
              className={`w-full cursor-pointer border-l-2 bg-zinc-100 px-6 py-3 text-left transition-colors hover:bg-zinc-200`}
              key={streak.id}
              onClick={() => onStreakClick(streak.id)}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">{streak.name}</span>
                <span className="text-sm text-zinc-600">
                  {streak.startDate.toDateString()}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
