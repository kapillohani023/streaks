import { JournalDay } from "@/types/journal-entry";
import { MonoLabel } from "@/components/ui/SsMono";
import { dayIndex, todayIndex } from "@/lib/stats";

interface WritingStreakProps {
  days: JournalDay[];
}

/**
 * How many of the last seven days got written on.
 *
 * A rolling week rather than Sunday-to-Saturday: a calendar week resets the
 * number to zero every Monday morning, which reads as losing progress the
 * writer didn't actually lose.
 */
export function WritingStreak({ days }: WritingStreakProps) {
  const today = todayIndex();
  const written = new Set(
    days
      .map((day) => today - dayIndex(day.createdAt))
      .filter((offset) => offset >= 0 && offset < 7)
  );

  return (
    <div className="border-border bg-panel flex flex-col gap-2 rounded-xl border p-4">
      <MonoLabel size="tile">WRITING STREAK</MonoLabel>
      <div className="flex items-baseline gap-2">
        <span className="text-foreground font-mono text-2xl font-bold">
          {written.size}
        </span>
        <MonoLabel as="span" size="tile" className="tracking-[0.08em]">
          DAYS THIS WEEK
        </MonoLabel>
      </div>
    </div>
  );
}
