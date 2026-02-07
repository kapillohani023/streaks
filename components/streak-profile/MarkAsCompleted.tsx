"use client";
import { Streak } from "@/types/streak";
import { Check } from "lucide-react";
import { useState } from "react";
import { isCompletedToday } from "@/lib/util";
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
        title="Daily Note"
        subtitle={streak.name}
        disableClose={isSubmitting}
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <SsTextarea
              id="daily-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              label="How did it go today?"
              placeholder="Add your notes here..."
              rows={6}
              autoFocus
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-3">
            <SsButton
              type="button"
              onClick={onClose}
              variant="secondary"
              block
              disabled={isSubmitting}
            >
              Cancel
            </SsButton>
            <SsButton type="submit" block disabled={isSubmitting}>
              Save Note
            </SsButton>
          </div>
        </form>
      </SsDialog>
    </>
  );
}

interface MarkAsCompletedProps {
  streak: Streak;
  label: string;
}

export function MarkAsCompleted({ streak, label }: MarkAsCompletedProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const streakId = streak.id;
  const isCompleted = isCompletedToday(streak);

  return (
    <>
      <EntrySubmissionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        streak={streak}
      />
      <SsButton
        key={streakId}
        onClick={() => setIsDialogOpen(true)}
        disabled={isCompleted}
        variant={isCompleted ? "primary" : "secondary"}
        className="whitespace-nowrap"
        leftIcon={isCompleted ? <Check size={16} /> : undefined}
      >
        {label}
      </SsButton>
    </>
  );
}
