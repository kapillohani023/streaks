import { Check, Clock } from "lucide-react";

interface StreakStatusChipProps {
  /** Whether the streak already has an entry for today. */
  completed: boolean;
  className?: string;
}

/**
 * Today's status for a streak. Shared by the list and the profile so the same
 * state never renders two different ways.
 */
export function StreakStatusChip({
  completed,
  className = "",
}: StreakStatusChipProps) {
  const base =
    "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-medium";

  return completed ? (
    <span
      className={[base, "bg-success/10 text-success", className]
        .filter(Boolean)
        .join(" ")}
    >
      <Check size={10} />
      completed
    </span>
  ) : (
    <span
      className={[base, "bg-muted text-muted-foreground", className]
        .filter(Boolean)
        .join(" ")}
    >
      <Clock size={10} />
      pending
    </span>
  );
}
