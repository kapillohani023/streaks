import { Bell } from "lucide-react";
import { MonoTag } from "@/components/ui/SsMono";

interface StreakStatusChipProps {
  /** Whether the streak already has an entry for today. */
  completed: boolean;
  className?: string;
}

/**
 * Today's status as a mono readout rather than a pill.
 *
 * The glyph carries the state as well as the colour does — a filled dot for
 * closed, a hollow one for open — so the row still parses in a screenshot, in
 * high contrast, or for a reader who can't separate green from grey.
 */
export function StreakStatusChip({
  completed,
  className = "",
}: StreakStatusChipProps) {
  return (
    <span
      className={[
        "font-mono text-[10px] font-bold tracking-[0.08em] whitespace-nowrap",
        completed ? "text-ok" : "text-dim",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {completed ? "● DONE" : "○ PENDING"}
    </span>
  );
}

interface ReminderTagProps {
  time: string;
  className?: string;
}

/** The daily reminder, shown wherever a streak is named. */
export function ReminderTag({ time, className = "" }: ReminderTagProps) {
  return (
    <MonoTag
      icon={<Bell size={9} />}
      title={`Daily reminder at ${time}`}
      className={className}
    >
      {time}
    </MonoTag>
  );
}
