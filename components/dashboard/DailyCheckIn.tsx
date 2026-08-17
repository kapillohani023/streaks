import { Streak } from "@/types/streak";
import { MarkAsCompleted } from "@/components/streak-profile/MarkAsCompleted";
import { MonoLabel } from "@/components/ui/SsMono";

interface DailyCheckInProps {
  streaks: Streak[];
}

export function DailyCheckIn({ streaks }: DailyCheckInProps) {
  if (streaks.length === 0) return null;

  return (
    <div className="flex flex-col gap-2.5">
      <MonoLabel as="h2">DAILY CHECK-IN</MonoLabel>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-2.5">
        {streaks.map((streak) => (
          <MarkAsCompleted key={streak.id} streak={streak} />
        ))}
      </div>
    </div>
  );
}
