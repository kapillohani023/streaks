"use client";
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { addStreak } from "@/app/actions/streak";
import { SsButton } from "@/components/ui/SsButton";
import { SsInput, SsTextarea } from "@/components/ui/SsInput";
import { SsTypography } from "@/components/ui/SsTypography";
import { SsLoaderOverlay } from "@/components/ui/SsLoader";
import { SsDialog } from "@/components/ui/SsDialog";

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
    <>
      <SsLoaderOverlay open={isSubmitting} label="Creating streak..." />
      <SsDialog
        open={isOpen}
        onClose={onClose}
        title="Create New Streak"
        disableClose={isSubmitting}
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <SsInput
              id="streak-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              label="Streak Name"
              placeholder="e.g., Daily Exercise, Read Books..."
              autoFocus
              disabled={isSubmitting}
            />
          </div>

          <div className="mb-6">
            <SsTextarea
              id="streak-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              label="Description (optional)"
              placeholder="Add a description..."
              rows={3}
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
            <SsButton type="submit" block disabled={!name.trim() || isSubmitting}>
              Create Streak
            </SsButton>
          </div>
        </form>
      </SsDialog>
    </>
  );
}

export function AddNewStreak() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <>
      <div className="p-4">
        <SsButton
          onClick={() => setIsDialogOpen(true)}
          block
          size="lg"
          leftIcon={<Plus size={20} />}
        >
          <SsTypography as="span" className="text-white">
            New Streak
          </SsTypography>
        </SsButton>
      </div>
      <CreateStreakDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
}
