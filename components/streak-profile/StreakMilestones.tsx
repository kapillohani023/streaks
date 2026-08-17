import { MILESTONES, milestoneProgress } from "@/lib/stats";
import { MonoLabel } from "@/components/ui/SsMono";

interface StreakMilestonesProps {
  /** The current run, in days. */
  run: number;
}

/**
 * The rungs: 7, 21, 50, 100, 365 days.
 *
 * Earned rungs invert to solid foreground and unearned ones stay as dashed
 * outlines, so the row reads as a filling progress bar in its own right — the
 * count of lit tiles is the headline, and the thin bar beside it only has to
 * answer "how close to the next one".
 */
export function StreakMilestones({ run }: StreakMilestonesProps) {
  const { next, remaining, percent } = milestoneProgress(run);

  return (
    <div className="border-border bg-panel flex flex-col gap-3 rounded-xl border px-5 py-4.5">
      <MonoLabel>MILESTONES</MonoLabel>
      <div className="flex flex-wrap items-center gap-2.5">
        {MILESTONES.map((days) => {
          const earned = run >= days;
          return (
            <div
              key={days}
              title={`${days}-day milestone${earned ? " — earned" : ""}`}
              className={[
                "flex h-[58px] w-[58px] flex-col items-center justify-center gap-px rounded-[10px]",
                earned
                  ? "bg-foreground text-background shadow-[0_0_16px_var(--glow-20)]"
                  : "border-border-strong text-faint border border-dashed",
              ].join(" ")}
            >
              <span className="font-mono text-base font-bold">{days}</span>
              <span className="font-mono text-[8px] tracking-[0.12em]">
                DAYS
              </span>
            </div>
          );
        })}

        <div className="flex flex-col justify-center gap-1 pl-1.5">
          <MonoLabel as="span" size="readout" tone="soft">
            NEXT: {next}D · {remaining} TO GO
          </MonoLabel>
          <div className="bg-sunken h-[3px] w-40 overflow-hidden rounded-full">
            <div
              style={{ width: `${percent}%` }}
              className="bg-foreground h-full rounded-full transition-[width] duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
