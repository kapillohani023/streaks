import { Streak } from "@/types/streak";
import { MarkAsCompleted } from "@/components/streak-profile/MarkAsCompleted";
import { SsTypography } from "@/components/ui/SsTypography";

interface DailyCheckInProps {
  streaks: Streak[];
}

export function DailyCheckIn({ streaks }: DailyCheckInProps) {
  return (
    <>
      {streaks.length > 0 && (
        <div className="px-8 py-6">
          <SsTypography as="h2" variant="label" className="mb-4">
            DAILY CHECK-IN
          </SsTypography>
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
