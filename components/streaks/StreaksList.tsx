import { Streak } from "@/types/streak";
import { SsButton } from "@/components/ui/SsButton";
import { SsTypography } from "@/components/ui/SsTypography";

interface StreaksListProps {
  streaks: Streak[];
  onStreakClick: (streakId: string) => void;
}

export function StreaksList({ streaks, onStreakClick }: StreaksListProps) {
  return (
    <div className="h-100 flex-1 overflow-y-auto bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <SsTypography variant="h3">Streaks List</SsTypography>
      </div>
      <div className="flex flex-col gap-2 py-2">
        {streaks.map((streak) => {
          return (
            <SsButton
              key={streak.id}
              onClick={() => onStreakClick(streak.id)}
              variant="secondary"
              block
              className="justify-between rounded-none border-l-2 border-black bg-zinc-100 px-6 py-3 text-left hover:bg-zinc-200"
            >
              <SsTypography as="span" className="text-lg font-medium">
                {streak.name}
              </SsTypography>
              <SsTypography as="span" variant="muted">
                {streak.startDate.toDateString()}
              </SsTypography>
            </SsButton>
          );
        })}
      </div>
    </div>
  );
}
