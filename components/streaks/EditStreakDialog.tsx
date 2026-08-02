"use client";

import { useEffect, useState } from "react";
import { Streak } from "@/types/streak";
import { SsDialog } from "@/components/ui/SsDialog";
import { SsButton } from "@/components/ui/SsButton";
import { SsTypography } from "@/components/ui/SsTypography";
import { updateStreak } from "@/app/actions/streak";
import { StreakFields } from "@/components/streaks/StreakFields";
import {
  blockedNotice,
  DEFAULT_REMINDER_TIME,
  DeliveryNotice,
} from "@/components/streaks/ReminderSettings";

interface EditStreakDialogProps {
  open: boolean;
  streak: Streak;
  onClose: () => void;
}

export function EditStreakDialog({
  open,
  streak,
  onClose,
}: EditStreakDialogProps) {
  const [name, setName] = useState(streak.name);
  const [description, setDescription] = useState(streak.description);
  const [reminderEnabled, setReminderEnabled] = useState(streak.reminderEnabled);
  const [reminderTime, setReminderTime] = useState(
    streak.reminderTime ?? DEFAULT_REMINDER_TIME
  );
  const [notice, setNotice] = useState<DeliveryNotice | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-seed from the streak each time the dialog opens so a cancelled edit
  // doesn't linger, and surface an already-blocked permission up front.
  useEffect(() => {
    if (!open) return;
    setName(streak.name);
    setDescription(streak.description);
    setReminderEnabled(streak.reminderEnabled);
    setReminderTime(streak.reminderTime ?? DEFAULT_REMINDER_TIME);
    setNotice(streak.reminderEnabled ? blockedNotice() : null);
    setError(null);
  }, [
    open,
    streak.name,
    streak.description,
    streak.reminderEnabled,
    streak.reminderTime,
  ]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const { reminderChanged, hasDevice } = await updateStreak({
        id: streak.id,
        name,
        description,
        reminderEnabled,
        reminderTime: reminderEnabled ? reminderTime : null,
      });

      // Only hold the dialog open when this edit is the thing that asked for a
      // notification. A stale "no device" condition must not block someone who
      // came here to fix a name.
      if (reminderChanged && reminderEnabled && !hasDevice) {
        setNotice({
          message:
            "Saved — but no device is set up to receive notifications yet, so nothing will arrive until you enable them on a device.",
          tone: "warning",
        });
        return;
      }
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save your changes.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SsDialog
      open={open}
      onClose={onClose}
      title="Edit Streak"
      subtitle={streak.name}
      disableClose={isSaving}
    >
      <div className="flex flex-col gap-5">
        <StreakFields
          name={name}
          description={description}
          onNameChange={setName}
          onDescriptionChange={setDescription}
          reminderEnabled={reminderEnabled}
          reminderTime={reminderTime}
          onReminderEnabledChange={setReminderEnabled}
          onReminderTimeChange={setReminderTime}
          notice={notice}
          onNoticeChange={setNotice}
          disabled={isSaving}
          autoFocusName
          idPrefix="edit-streak"
        />

        {error && (
          <SsTypography as="p" className="text-destructive text-xs">
            {error}
          </SsTypography>
        )}

        <div className="flex gap-3">
          <SsButton
            type="button"
            variant="secondary"
            block
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </SsButton>
          <SsButton
            type="button"
            block
            onClick={handleSave}
            loading={isSaving}
            disabled={!name.trim() || (reminderEnabled && !reminderTime)}
          >
            Save
          </SsButton>
        </div>
      </div>
    </SsDialog>
  );
}
