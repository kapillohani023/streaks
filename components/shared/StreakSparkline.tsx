interface StreakSparklineProps {
  /** Completed days as offsets from today. 0 is today. */
  offsets: Set<number>;
  /** How many days to show, oldest on the left. */
  days?: number;
  className?: string;
}

/**
 * The last fortnight as bars — the smallest chart that still shows a pattern.
 *
 * Today is drawn as a dashed outline while it's still open rather than as an
 * empty cell: an unfilled slot in the last position would read as a miss, and
 * a miss the reader can still prevent is a different fact.
 */
export function StreakSparkline({
  offsets,
  days = 14,
  className = "",
}: StreakSparklineProps) {
  return (
    <div
      className={["flex gap-[3px]", className].filter(Boolean).join(" ")}
      aria-hidden="true"
    >
      {Array.from({ length: days }, (_, index) => {
        const offset = days - 1 - index;
        const done = offsets.has(offset);
        const isOpenToday = offset === 0 && !done;

        return (
          <span
            key={offset}
            className={[
              "h-[18px] w-[9px] rounded-[2px]",
              done ? "bg-foreground" : "bg-sunken",
              isOpenToday
                ? "border-mid border border-dashed bg-transparent"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
          />
        );
      })}
    </div>
  );
}
