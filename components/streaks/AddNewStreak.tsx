"use client";
import React, { useState } from "react";
import { X, Plus } from "lucide-react";
import { addStreak } from "@/app/actions/streak";
import {
  SsCard,
  SsCardContent,
  SsCardHeader,
  SsCardTitle,
} from "@/components/ui/SsCard";
import { SsButton } from "@/components/ui/SsButton";
import { SsInput, SsTextarea } from "@/components/ui/SsInput";
import { SsTypography } from "@/components/ui/SsTypography";

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
      <SsCard className="w-full max-w-md p-0">
        <SsCardHeader className="mb-0 flex items-center justify-between border-b-2 border-black p-6">
          <SsCardTitle>Create New Streak</SsCardTitle>
          <SsButton
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-zinc-600 hover:text-black"
            aria-label="Close dialog"
          >
            <X size={24} />
          </SsButton>
        </SsCardHeader>

        <SsCardContent className="p-6">
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
              />
            </div>

            <div className="flex gap-3">
              <SsButton type="button" onClick={onClose} variant="secondary" block>
                Cancel
              </SsButton>
              <SsButton
                type="submit"
                block
                loading={isSubmitting}
                disabled={!name.trim()}
              >
                Create Streak
              </SsButton>
            </div>
          </form>
        </SsCardContent>
      </SsCard>
    </div>
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
