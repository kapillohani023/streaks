"use client";
import { useState } from "react";
import { Check } from "lucide-react";
import { Streak } from "@/types/streak";
import { completedOffsets, currentRun, isDoneToday } from "@/lib/stats";
import { createStreakEntry } from "@/app/actions/streak-entry";
import { SsButton } from "@/components/ui/SsButton";
import { SsTextarea } from "@/components/ui/SsInput";
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.set("streakId", streak.id);
    formData.set("date", new Date().toISOString());
    formData.set("completed", "true");
    formData.set("note", note);

    await createStreakEntry(formData);
    setNote("");
    setIsSubmitting(false);
    onClose();
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
          <div className="mb-5">
            <SsTextarea
              id="daily-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              label="How did it go today?"
              placeholder="Optional note…"
              rows={5}
              autoFocus
              disabled={isSubmitting}
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
