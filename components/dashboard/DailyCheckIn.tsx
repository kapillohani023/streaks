import { Streak } from '@/types/Streak';
import { MarkAsCompleted } from "../streak-profile/MarkAsCompleted";

interface DailyCheckInProps {
    streaks: Streak[];
    onRefetch: () => void;
}
export function DailyCheckIn({ streaks, onRefetch }: DailyCheckInProps) {
    return (
        <>
            {streaks.length > 0 && (
                <div className="px-8 py-6">
                    <h2 className="text-sm text-zinc-600 mb-4">DAILY CHECK-IN</h2>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {streaks.map(streak => {
                            return (
                                <div key={streak.id}>
                                    <MarkAsCompleted streak={streak} label={streak.name} onSubmit={onRefetch} />
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </>

    );
}