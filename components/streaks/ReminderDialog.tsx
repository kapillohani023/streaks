"use client";

import { useEffect, useState } from "react";
import { Streak } from "@/types/streak";
import { SsDialog } from "@/components/ui/SsDialog";
import { SsButton } from "@/components/ui/SsButton";
import { SsTypography } from "@/components/ui/SsTypography";
import { saveStreakReminder } from "@/app/actions/reminder";
import {
  blockedNotice,
  DEFAULT_REMINDER_TIME,
  DeliveryNotice,
  ReminderFields,
} from "@/components/streaks/ReminderSettings";

interface ReminderDialogProps {
  open: boolean;
  streak: Streak;
  onClose: () => void;
}

export function ReminderDialog({ open, streak, onClose }: ReminderDialogProps) {
  const [enabled, setEnabled] = useState(streak.reminderEnabled);
  const [time, setTime] = useState(
    streak.reminderTime ?? DEFAULT_REMINDER_TIME
  );
  const [notice, setNotice] = useState<DeliveryNotice | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-seed from the streak each time the dialog opens so a cancelled edit
  // doesn't linger, and surface an already-blocked permission up front.
  useEffect(() => {
    if (!open) return;
    setEnabled(streak.reminderEnabled);
    setTime(streak.reminderTime ?? DEFAULT_REMINDER_TIME);
    setNotice(streak.reminderEnabled ? blockedNotice() : null);
    setError(null);
  }, [open, streak.reminderEnabled, streak.reminderTime]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const { hasDevice } = await saveStreakReminder({
        streakId: streak.id,
        enabled,
        time: enabled ? time : null,
      });

      if (enabled && !hasDevice) {
        setNotice({
          message:
            "Saved — but no device is set up to receive notifications yet, so nothing will arrive until you enable them on a device.",
          tone: "warning",
        });
        return;
      }
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save the reminder.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SsDialog
      open={open}
      onClose={onClose}
      title="Reminder"
      subtitle={streak.name}
      disableClose={isSaving}
    >
      <div className="flex flex-col gap-5">
        <ReminderFields
          enabled={enabled}
          time={time}
          onEnabledChange={setEnabled}
          onTimeChange={setTime}
          disabled={isSaving}
          notice={notice}
          onNoticeChange={setNotice}
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
            disabled={enabled && !time}
          >
            Save
          </SsButton>
        </div>
      </div>
    </SsDialog>
  );
}
