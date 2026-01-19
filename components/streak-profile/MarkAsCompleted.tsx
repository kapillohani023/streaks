"use client";
import { Streak } from "@/types/streak";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { isCompletedToday } from "@/lib/util";
import { createStreakEntry } from "@/app/actions/streak-entry";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md rounded-lg border-2 border-black bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black p-6">
          <div>
            <h2 className="text-xl">Daily Note</h2>
            <p className="text-sm text-zinc-600">{streak.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-600 transition-colors hover:text-black"
            aria-label="Close dialog"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label
              htmlFor="daily-note"
              className="mb-2 block text-sm text-zinc-600"
            >
              How did it go today?
            </label>
            <textarea
              id="daily-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full resize-none rounded border-2 border-black bg-white px-4 py-3 text-black focus:ring-2 focus:ring-black focus:outline-none"
              placeholder="Add your notes here..."
              rows={6}
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded border-2 border-black py-2 transition-colors hover:bg-zinc-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded bg-black py-2 text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
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
      <button
        key={streakId}
        onClick={() => setIsDialogOpen(true)}
        disabled={isCompleted}
        className={`flex items-center gap-2 rounded border-2 px-4 py-2 whitespace-nowrap transition-colors ${
          isCompleted
            ? "cursor-pointer border-black bg-black text-white"
            : "border-black hover:bg-zinc-100"
        }`}
      >
        {isCompleted && <Check size={16} />}
        {label}
      </button>
    </>
  );
}
