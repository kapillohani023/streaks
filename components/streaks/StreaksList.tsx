import { Streak } from "@/types/streak";
import { SsTypography } from "@/components/ui/SsTypography";
import { StreakListItem } from "@/components/streaks/StreakListItem";

interface StreaksListProps {
  streaks: Streak[];
  onStreakClick: (streakId: string) => void;
  onDelete: (streakId: string) => Promise<void> | void;
}

export function StreaksList({
  streaks,
  onStreakClick,
  onDelete,
}: StreaksListProps) {
  return (
    <div>
      {streaks.length === 0 ? (
        <SsTypography variant="muted" className="py-8 text-center">
          No streaks yet. Add one to get started.
        </SsTypography>
      ) : (
        <div className="flex flex-col gap-2">
          {streaks.map((streak) => (
            <StreakListItem
              key={streak.id}
              streak={streak}
              onStreakClick={onStreakClick}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
