"use client";
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { addStreak } from "@/app/actions/streak";
import { SsButton } from "@/components/ui/SsButton";
import { SsLoaderOverlay } from "@/components/ui/SsLoader";
import { SsDialog } from "@/components/ui/SsDialog";
import { StreakFields } from "@/components/streaks/StreakFields";
import {
  DEFAULT_REMINDER_TIME,
  DeliveryNotice,
} from "@/components/streaks/ReminderSettings";

interface CreateStreakDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

function CreateStreakDialog({ isOpen, onClose }: CreateStreakDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState(DEFAULT_REMINDER_TIME);
  const [reminderNotice, setReminderNotice] = useState<DeliveryNotice | null>(
    null
  );

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.set("name", name.trim());
      formData.set("description", description.trim());
      formData.set("startDate", new Date().toISOString());
      // A denied notification permission must never block creating the streak:
      // the preference is saved either way and the warning already showed
      // inline while they were toggling.
      if (reminderEnabled && reminderTime) {
        formData.set("reminderTime", reminderTime);
      }

      await addStreak(formData);

      setName("");
      setDescription("");
      setReminderEnabled(false);
      setReminderTime(DEFAULT_REMINDER_TIME);
      setReminderNotice(null);
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
          <div className="mb-6">
            <StreakFields
              name={name}
              description={description}
              onNameChange={setName}
              onDescriptionChange={setDescription}
              reminderEnabled={reminderEnabled}
              reminderTime={reminderTime}
              onReminderEnabledChange={setReminderEnabled}
              onReminderTimeChange={setReminderTime}
              notice={reminderNotice}
              onNoticeChange={setReminderNotice}
              disabled={isSubmitting}
              autoFocusName
              idPrefix="new-streak"
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
            <SsButton
              type="submit"
              block
              disabled={!name.trim() || isSubmitting}
            >
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
      <SsButton
        onClick={() => setIsDialogOpen(true)}
        size="icon"
        variant="ghost"
        aria-label="New streak"
        title="New streak"
        className="rounded-full"
      >
        <Plus size={20} />
      </SsButton>
      <CreateStreakDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
}
