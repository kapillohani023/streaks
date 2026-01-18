import { Streak } from "@/lib/util";
import { isCompletedToday } from "@/lib/util";

interface StreaksListProps {
    streaks: Streak[];
    onStreakClick: (streakId: string) => void;
}

export function StreaksList({ streaks, onStreakClick }: StreaksListProps) {
    return (
        <div className="flex-1 overflow-y-auto bg-white h-100 p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Streaks List</h2>
            </div>
            {streaks.length === 0 ? (
                <div className="p-6 text-center text-zinc-600 text-sm">
                    No streaks yet.<br />Create your first one!
                </div>
            ) : (
                <div className="py-2 flex flex-col gap-2">
                    {streaks.map(streak => {
                        const isCompleted = isCompletedToday(streak);
                        return (
                            <button
                                className={`w-full text-left px-6 py-3 bg-zinc-100 cursor-pointer hover:bg-zinc-200 transition-colors border-l-2 `}
                                key={streak.id}
                                onClick={() => onStreakClick(streak.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-medium">{streak.name}</span>
                                    <span className="text-sm text-zinc-600">{streak.startDate.toDateString()}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
