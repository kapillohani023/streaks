"use client";
import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { Streak } from "@/types/streak";
import { completedOffsets, currentRun, isDoneToday } from "@/lib/stats";
import { toDateKey } from "@/lib/util";
import {
  markStreakCompletedOnDate,
  markStreakCompletedToday,
} from "@/app/actions/streak-entry";
import { SsButton } from "@/components/ui/SsButton";
import { SsInput, SsTextarea } from "@/components/ui/SsInput";
import { SsLoaderOverlay } from "@/components/ui/SsLoader";
import { SsDialog } from "@/components/ui/SsDialog";

interface EntrySubmissionDialogProps {
  isOpen: boolean;
  streak: Streak;
  onClose: () => void;
}

export function EntrySubmissionDialog({
  isOpen,
  onClose,
  streak,
}: EntrySubmissionDialogProps) {
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setNote("");
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await markStreakCompletedToday({
        streakId: streak.id,
        note: note.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save entry");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SsLoaderOverlay open={isSubmitting} label="Saving entry..." />
      <SsDialog
        open={isOpen}
        onClose={onClose}
        eyebrow="CHECK-IN"
        title={streak.name}
        disableClose={isSubmitting}
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-5 flex flex-col gap-3.5">
            <SsTextarea
              id="daily-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              label="How did it go today?"
              placeholder="Optional note…"
              rows={5}
              autoFocus
              disabled={isSubmitting}
              error={error ?? undefined}
            />
          </div>

          <div className="flex gap-2.5">
            <SsButton
              type="button"
              onClick={onClose}
              variant="outline"
              mono
              block
              disabled={isSubmitting}
            >
              Cancel
            </SsButton>
            <SsButton type="submit" mono block disabled={isSubmitting}>
              Complete day
            </SsButton>
          </div>
        </form>
      </SsDialog>
    </>
  );
}

interface PastEntryDialogProps {
  isOpen: boolean;
  streak: Streak;
  onClose: () => void;
}

/** Yesterday as YYYY-MM-DD — the newest day "Add past entry" may target. */
function yesterdayKey(from = new Date()): string {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  d.setDate(d.getDate() - 1);
  return toDateKey(d);
}

/** Default the picker to yesterday, clamped into the streak's valid range. */
function defaultPastDate(maxKey: string, minKey: string) {
  let key = yesterdayKey();
  if (key > maxKey) key = maxKey;
  if (key < minKey) key = minKey;
  return key;
}

/**
 * Backfill a completed day after the streak already exists — date + optional
 * note. Shares the same server path as the MCP tool so rules stay one place.
 * Today is intentionally out of range here; use Mark complete for that.
 */
export function PastEntryDialog({
  isOpen,
  onClose,
  streak,
}: PastEntryDialogProps) {
  const minKey = useMemo(() => toDateKey(streak.startDate), [streak.startDate]);

  const [maxKey, setMaxKey] = useState(() => yesterdayKey());
  const [date, setDate] = useState(() => defaultPastDate(yesterdayKey(), minKey));
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const max = yesterdayKey();
      setMaxKey(max);
      setDate(defaultPastDate(max, minKey));
      setNote("");
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, minKey]);

  if (!isOpen) return null;

  const noPastDays = maxKey < minKey;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      setError("Pick a date");
      return;
    }
    if (date > maxKey) {
      setError("Pick a past day — use Mark complete for today");
      return;
    }
    if (date < minKey) {
      setError(`Can't log before the streak started (${minKey})`);
      return;
    }
    setIsSubmitting(true);
    setError(null);

    // Capture before any revalidation re-renders reset the controlled input.
    const dateToSave = date;
    const noteToSave = note.trim() || undefined;

    try {
      await markStreakCompletedOnDate({
        streakId: streak.id,
        date: dateToSave,
        note: noteToSave,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save entry");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SsLoaderOverlay open={isSubmitting} label="Saving entry..." />
      <SsDialog
        open={isOpen}
        onClose={onClose}
        eyebrow="PAST ENTRY"
        title={streak.name}
        disableClose={isSubmitting}
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-5 flex flex-col gap-3.5">
            <SsInput
              id="past-entry-date"
              type="date"
              mono
              label="Date"
              value={date}
              min={minKey}
              max={maxKey}
              onChange={(e) => {
                setDate(e.target.value);
                setError(null);
              }}
              disabled={isSubmitting || noPastDays}
              required
              autoFocus
              hint={
                noPastDays
                  ? "No past days yet — streak started today"
                  : `Between ${minKey} and ${maxKey}`
              }
              error={error ?? undefined}
            />
            <SsTextarea
              id="past-entry-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              label="Note / optional"
              placeholder="What happened that day?"
              rows={4}
              disabled={isSubmitting || noPastDays}
            />
          </div>

          <div className="flex gap-2.5">
            <SsButton
              type="button"
              onClick={onClose}
              variant="outline"
              mono
              block
              disabled={isSubmitting}
            >
              Cancel
            </SsButton>
            <SsButton
              type="submit"
              mono
              block
              disabled={isSubmitting || !date || noPastDays}
            >
              Add entry
            </SsButton>
          </div>
        </form>
      </SsDialog>
    </>
  );
}

interface MarkAsCompletedProps {
  streak: Streak;
}

/**
 * One streak's check-in row: state, run length, and the single tap that closes
 * the day.
 *
 * A completed card dims rather than disappearing — the point of the grid is
 * seeing the whole day at once, and a list that shrinks as you work through it
 * loses the "how much is left" reading it exists to give.
 */
export function MarkAsCompleted({ streak }: MarkAsCompletedProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const offsets = completedOffsets(streak);
  const completed = isDoneToday(offsets);
  const meta = [
    `${currentRun(offsets)}D RUN`,
    streak.reminderEnabled && streak.reminderTime ? streak.reminderTime : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <EntrySubmissionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        streak={streak}
      />

      <div
        className={`border-border bg-panel flex items-center justify-between gap-3 rounded-[10px] border px-4 py-3 transition-colors duration-150 ${
          completed ? "opacity-65" : ""
        }`}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={`h-[7px] w-[7px] shrink-0 rounded-full ${
              completed ? "bg-ok" : "border-faint border"
            }`}
          />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold" title={streak.name}>
              {streak.name}
            </div>
            <div className="text-faint font-mono text-[10px]">{meta}</div>
          </div>
        </div>

        {completed ? (
          <span className="text-ok inline-flex shrink-0 items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.08em]">
            <Check size={12} strokeWidth={3} className="ss-animate-scale-in" />
            DONE
          </span>
        ) : (
          <SsButton
            mono
            size="sm"
            variant="outline"
            onClick={() => setIsDialogOpen(true)}
            className="hover:bg-foreground hover:text-background hover:border-foreground shrink-0 text-[color:var(--fg)]"
          >
            Mark
          </SsButton>
        )}
      </div>
    </>
  );
}
