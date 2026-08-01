import { Streak } from "@/types/streak";
import { SsTypography } from "@/components/ui/SsTypography";
import { StreakListItem } from "@/components/streaks/StreakListItem";
import { isCompletedToday } from "@/lib/util";

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
  const completedCount = streaks.filter(isCompletedToday).length;

  return (
    <div className="bg-background h-100 flex-1 overflow-y-auto p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <SsTypography variant="h3">Streaks List</SsTypography>
        {streaks.length > 0 && (
          <SsTypography as="span" variant="muted">
            {completedCount} of {streaks.length} done today
          </SsTypography>
        )}
      </div>

      {streaks.length === 0 ? (
        <SsTypography variant="muted" className="py-8 text-center">
          No streaks yet. Add one to get started.
        </SsTypography>
      ) : (
        <div className="flex flex-col gap-2 py-2">
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
