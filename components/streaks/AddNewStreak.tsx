"use client";
import React, { useState } from "react";
import { X, Plus } from "lucide-react";
import { addStreak } from "@/app/actions/streak";

interface CreateStreakDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

function CreateStreakDialog({ isOpen, onClose }: CreateStreakDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.set("name", name.trim());
      formData.set("description", description.trim());
      formData.set("startDate", new Date().toISOString());

      await addStreak(formData);

      setName("");
      setDescription("");
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md rounded-lg border-2 border-black bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black p-6">
          <h2 className="text-xl">Create New Streak</h2>
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
          <div className="mb-4">
            <label
              htmlFor="streak-name"
              className="mb-2 block text-sm text-zinc-600"
            >
              Streak Name
            </label>
            <input
              id="streak-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border-2 border-black bg-white px-4 py-2 text-black focus:ring-2 focus:ring-black focus:outline-none"
              placeholder="e.g., Daily Exercise, Read Books..."
              autoFocus
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="streak-description"
              className="mb-2 block text-sm text-zinc-600"
            >
              Description (optional)
            </label>
            <textarea
              id="streak-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-none rounded border-2 border-black bg-white px-4 py-2 text-black focus:ring-2 focus:ring-black focus:outline-none"
              placeholder="Add a description..."
              rows={3}
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
              className="flex-1 rounded bg-black py-2 text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
              disabled={!name.trim() || isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Streak"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AddNewStreak() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <>
      <div className="p-4">
        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded bg-black px-4 py-3 text-white"
        >
          <Plus size={20} />
          New Streak
        </button>
      </div>
      <CreateStreakDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
}
