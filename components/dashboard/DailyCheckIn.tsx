import { Streak } from "@/types/streak";
import { MarkAsCompleted } from "@/components/streak-profile/MarkAsCompleted";

interface DailyCheckInProps {
  streaks: Streak[];
}

export function DailyCheckIn({ streaks }: DailyCheckInProps) {
  return (
    <>
      {streaks.length > 0 && (
        <div className="px-8 py-6">
          <h2 className="mb-4 text-sm text-zinc-600">DAILY CHECK-IN</h2>
          <div className="flex flex-wrap gap-3 pb-2">
            {streaks.map((streak) => {
              return (
                <div key={streak.id}>
                  <MarkAsCompleted streak={streak} label={streak.name} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
