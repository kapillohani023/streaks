"use client";
import { useEffect, useMemo, useState } from "react";
import { StreakEntry } from "@/types/streak-entry";
import { toDateKey, formatLogDate } from "@/lib/util";
import {
  deleteStreakEntry,
  updateStreakEntry,
} from "@/app/actions/streak-entry";
import { SsButton } from "@/components/ui/SsButton";
import { SsInput, SsTextarea } from "@/components/ui/SsInput";
import { SsLoaderOverlay } from "@/components/ui/SsLoader";
import { SsDialog } from "@/components/ui/SsDialog";
import { SsTypography } from "@/components/ui/SsTypography";

interface EditEntryDialogProps {
  open: boolean;
  streakId: string;
  streakName: string;
  streakStartDate: Date;
  entry: StreakEntry | null;
  onClose: () => void;
}

export function EditEntryDialog({
  open,
  streakId,
  streakName,
  streakStartDate,
  entry,
  onClose,
}: EditEntryDialogProps) {
  const minKey = useMemo(
    () => toDateKey(streakStartDate),
    [streakStartDate]
  );

  const [todayKey, setTodayKey] = useState(() => toDateKey(new Date()));
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && entry) {
      const today = toDateKey(new Date());
      setTodayKey(today);
      setDate(toDateKey(entry.date));
      setNote(entry.note ?? "");
      setError(null);
      setIsSubmitting(false);
    }
  }, [open, entry]);

  if (!open || !entry) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      setError("Pick a date");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      await updateStreakEntry({
        streakId,
        entryId: entry.id,
        date,
        note: note.trim() || null,
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
        open={open}
        onClose={onClose}
        eyebrow="EDIT ENTRY"
        title={streakName}
        disableClose={isSubmitting}
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-5 flex flex-col gap-3.5">
            <SsInput
              id="edit-entry-date"
              type="date"
              mono
              label="Date"
              value={date}
              min={minKey}
              max={todayKey}
              onChange={(e) => {
                setDate(e.target.value);
                setError(null);
              }}
              disabled={isSubmitting}
              required
              autoFocus
              hint={`Between ${minKey} and ${todayKey}`}
              error={error ?? undefined}
            />
            <SsTextarea
              id="edit-entry-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              label="Note / optional"
              placeholder="What happened that day?"
              rows={4}
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
            <SsButton type="submit" mono block disabled={isSubmitting || !date}>
              Save
            </SsButton>
          </div>
        </form>
      </SsDialog>
    </>
  );
}

interface DeleteEntryDialogProps {
  open: boolean;
  streakId: string;
  entry: StreakEntry | null;
  onClose: () => void;
}

export function DeleteEntryDialog({
  open,
  streakId,
  entry,
  onClose,
}: DeleteEntryDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setIsDeleting(false);
      setError(null);
    }
  }, [open]);

  if (!open || !entry) return null;

  const onConfirm = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await deleteStreakEntry(streakId, entry.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete entry");
      setIsDeleting(false);
    }
  };

  return (
    <SsDialog
      open={open}
      onClose={onClose}
      eyebrow="DESTRUCTIVE"
      eyebrowTone="bad"
      title="Delete this entry?"
      disableClose={isDeleting}
      maxWidthClassName="max-w-[400px]"
    >
      <SsTypography variant="muted" className="mb-5">
        Removes {formatLogDate(entry.date)}
        {entry.note?.trim() ? " and its note" : ""}. There is no undo.
      </SsTypography>
      {error && (
        <p className="text-bad mb-3 font-mono text-[10px] tracking-[0.06em] uppercase">
          {error}
        </p>
      )}
      <div className="flex gap-2.5">
        <SsButton
          type="button"
          variant="outline"
          mono
          block
          disabled={isDeleting}
          onClick={onClose}
        >
          Cancel
        </SsButton>
        <SsButton
          type="button"
          variant="danger"
          mono
          block
          loading={isDeleting}
          onClick={onConfirm}
        >
          Delete
        </SsButton>
      </div>
    </SsDialog>
  );
}
