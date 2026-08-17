"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { JournalEntry } from "@/types/journal-entry";
import { MonoLabel } from "@/components/ui/SsMono";
import { formatClock } from "@/lib/util";

interface JournalEntryNavProps {
  /** The entry written after this one — the one above it in the list. */
  newer: JournalEntry | null;
  /** The entry written before this one — the one below it in the list. */
  older: JournalEntry | null;
  onNavigate: (entry: JournalEntry | null) => void;
}

/**
 * Labelled steps to the entries either side of this one.
 *
 * The header carries two bare chevrons in the old design, which on a screen
 * whose entire subject is dated entries never says *which* entry you'd land on.
 * Naming the target date is the whole value here — and putting the pair at the
 * foot of the page is also where a reader is when they finish reading, and
 * where the ← / → shortcuts finally become discoverable.
 */
export function JournalEntryNav({
  newer,
  older,
  onNavigate,
}: JournalEntryNavProps) {
  if (!newer && !older) return null;

  return (
    <nav
      aria-label="Adjacent entries"
      className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
    >
      <NavStep
        entry={newer}
        direction="newer"
        onNavigate={onNavigate}
        shortcut="←"
      />
      <NavStep
        entry={older}
        direction="older"
        onNavigate={onNavigate}
        shortcut="→"
      />
    </nav>
  );
}

interface NavStepProps {
  entry: JournalEntry | null;
  direction: "newer" | "older";
  shortcut: string;
  onNavigate: (entry: JournalEntry | null) => void;
}

function NavStep({ entry, direction, shortcut, onNavigate }: NavStepProps) {
  const isNewer = direction === "newer";
  const label = isNewer ? "NEWER" : "OLDER";

  // The end of the journal is a fact worth stating, so the slot keeps its
  // footprint and says so rather than collapsing and shifting its neighbour.
  if (!entry) {
    return (
      <div
        className={`border-border text-faint flex items-center gap-2.5 rounded-lg border border-dashed px-4 py-3 ${
          isNewer ? "" : "sm:flex-row-reverse sm:text-right"
        }`}
      >
        {isNewer ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
        <MonoLabel as="span" size="tile" className="tracking-[0.08em]">
          NO {label} ENTRY
        </MonoLabel>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onNavigate(entry)}
      title={`${label.toLowerCase()} entry: ${entry.title}`}
      className={`border-border bg-panel hover:border-border-strong hover:bg-panel-2 focus-visible:ring-ring flex cursor-pointer items-center gap-2.5 rounded-lg border px-4 py-3 text-left transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none ${
        isNewer ? "" : "sm:flex-row-reverse sm:text-right"
      }`}
    >
      {isNewer ? (
        <ChevronLeft size={15} className="text-faint shrink-0" />
      ) : (
        <ChevronRight size={15} className="text-faint shrink-0" />
      )}
      <span className="flex min-w-0 flex-col gap-0.5">
        <MonoLabel as="span" size="tile" className="tracking-[0.08em]">
          {label} <span className="text-mid">{shortcut}</span>
        </MonoLabel>
        {/* Date *and* time, exactly as the list rows show it — several entries
            can share a day, and the date alone wouldn't say which one. */}
        <span
          className={`flex min-w-0 items-baseline gap-2 ${
            isNewer ? "" : "sm:flex-row-reverse"
          }`}
        >
          <span className="text-foreground truncate font-mono text-xs font-bold">
            {entry.title}
          </span>
          <span className="text-faint shrink-0 font-mono text-[10px]">
            {formatClock(entry.createdAt)}
          </span>
        </span>
      </span>
    </button>
  );
}
