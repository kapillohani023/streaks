"use client"
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface NotesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  streakName: string;
  existingNote: string;
  onSave: (note: string) => void;
}

export function NotesDialog({ isOpen, onClose, streakName, existingNote, onSave }: NotesDialogProps) {
  const [note, setNote] = useState(existingNote);

  useEffect(() => {
    setNote(existingNote);
  }, [existingNote]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(note);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-2 border-black rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-black">
          <div>
            <h2 className="text-xl">Daily Note</h2>
            <p className="text-sm text-zinc-600">{streakName}</p>
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