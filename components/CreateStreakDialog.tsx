import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CreateStreakDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
}

export function CreateStreakDialog({ isOpen, onClose, onCreate }: CreateStreakDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim(), description.trim());
      setName('');
      setDescription('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-2 border-black rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-black">
          <h2 className="text-xl">Create New Streak</h2>
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
          <div className="mb-4">
            <label htmlFor="streak-name" className="block text-sm text-zinc-600 mb-2">
              Streak Name
            </label>
            <input
              id="streak-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border-2 border-black rounded px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="e.g., Daily Exercise, Read Books..."
              autoFocus
            />
          </div>

          <div className="mb-6">
            <label htmlFor="streak-description" className="block text-sm text-zinc-600 mb-2">
              Description (optional)
            </label>
            <textarea
              id="streak-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border-2 border-black rounded px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black resize-none"
              placeholder="Add a description..."
              rows={3}
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
              disabled={!name.trim()}
            >
              Create Streak
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}