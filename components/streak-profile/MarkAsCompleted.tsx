"use client"
import { Streak } from "@/models/Streak";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { isCompletedToday } from "@/utils/streak";
import { createStreakEntry } from "@/lib/api";


interface EntrySubmissionDialogProps {
    isOpen: boolean;
    streak: Streak;
    onClose: () => void;
    onSubmit: () => void;
}

export function EntrySubmissionDialog({ isOpen, onClose, streak, onSubmit }: EntrySubmissionDialogProps) {
    const [note, setNote] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await createStreakEntry(streak.id, {
            date: new Date(),
            completed: true,
            note,
        });
        onSubmit();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white border-2 border-black rounded-lg w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b-2 border-black">
                    <div>
                        <h2 className="text-xl">Daily Note</h2>
                        <p className="text-sm text-zinc-600">{streak.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-zinc-600 hover:text-black transition-colors"
                        aria-label="Close dialog"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-6">
                        <label htmlFor="daily-note" className="block text-sm text-zinc-600 mb-2">
                            How did it go today?
                        </label>
                        <textarea
                            id="daily-note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full bg-white border-2 border-black rounded px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-black resize-none"
                            placeholder="Add your notes here..."
                            rows={6}
                            autoFocus
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 border-2 border-black rounded hover:bg-zinc-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2 bg-black text-white rounded hover:bg-zinc-800 transition-colors"
                        >
                            Save Note
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
    onSubmit?: () => void;
}
export function MarkAsCompleted({ streak, label, onSubmit }: MarkAsCompletedProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const streakId = streak.id; 
    const isCompleted = isCompletedToday(streak);
    return (
        <>
            <EntrySubmissionDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                streak={streak}
                onSubmit={onSubmit ?? (() => {})}
            />
            <button
                key={streakId}
                onClick={() => setIsDialogOpen(true)}
                disabled={isCompleted}
                className={`flex items-center gap-2 px-4 py-2 rounded border-2 transition-colors whitespace-nowrap ${isCompleted
                    ? 'border-black bg-black text-white cursor-pointer'
                    : 'border-black hover:bg-zinc-100'
                    }`}
            >
                {isCompleted && <Check size={16} />}
                {label}
            </button>
        </>

    );
}