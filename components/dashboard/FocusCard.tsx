"use client";

import { MonoLabel } from "@/components/ui/SsMono";
import { SsButton } from "@/components/ui/SsButton";

/** Circumference of an r=46 circle, rounded — the dasharray the ring animates. */
const RING_LENGTH = 289;

interface FocusCardProps {
  doneCount: number;
  total: number;
  /** The streak to nudge next, or null when the day is clear. */
  nextUpName: string | null;
  onMarkNextUp: () => void;
  /** Mono line under the prompt: what's left, or that nothing is. */
  summary: string;
}

/**
 * Today in one card: how much of it is done, and the single next thing to do.
 *
 * The ring and the prompt are deliberately one unit — the number alone doesn't
 * tell you what to *do*, and a bare "next up" row doesn't tell you how close
 * you are to finishing. Splitting them into two cards made both weaker.
 */
export function FocusCard({
  doneCount,
  total,
  nextUpName,
  onMarkNextUp,
  summary,
}: FocusCardProps) {
  const ratio = total > 0 ? doneCount / total : 0;

  return (
    <div className="border-border bg-panel flex items-center gap-5 rounded-xl border p-5">
      <div className="relative h-24 w-24 shrink-0">
        <svg width="96" height="96" viewBox="0 0 100 100" className="block">
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="var(--sunken)"
            strokeWidth="6"
          />
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="var(--fg)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={RING_LENGTH}
            strokeDashoffset={Math.round(RING_LENGTH * (1 - ratio))}
            transform="rotate(-90 50 50)"
            className="ss-animate-ring-in transition-[stroke-dashoffset] duration-400 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span className="text-foreground font-mono text-[19px] leading-none font-bold">
            {doneCount}/{total}
          </span>
          <MonoLabel size="micro" className="tracking-[0.2em]">
            TODAY
          </MonoLabel>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <MonoLabel>FOCUS / NEXT UP</MonoLabel>

        {nextUpName ? (
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="bg-foreground ss-animate-pulse-dot h-[7px] w-[7px] shrink-0 rounded-full" />
              <span className="truncate text-[15px] font-semibold">
                {nextUpName}
              </span>
            </div>
            <SsButton
              mono
              size="sm"
              onClick={onMarkNextUp}
              className="shrink-0"
            >
              Done
            </SsButton>
          </div>
        ) : (
          <div className="text-ok text-[15px] font-semibold">
            {total === 0
              ? "No streaks yet. Create one to start the chain."
              : "All clear. Every streak completed today."}
          </div>
        )}

        <MonoLabel as="p" size="readout" tone="soft" className="truncate">
          {summary}
        </MonoLabel>
      </div>
    </div>
  );
}
