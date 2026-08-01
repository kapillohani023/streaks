"use client";

import { useEffect, useState } from "react";
import { Streak } from "@/types/streak";
import { SsDialog } from "@/components/ui/SsDialog";
import { SsButton } from "@/components/ui/SsButton";
import { SsTypography } from "@/components/ui/SsTypography";
import {
  saveStreakReminder,
  sendTestNotification,
} from "@/app/actions/reminder";
import {
  blockedNotice,
  DEFAULT_REMINDER_TIME,
  DeliveryNotice,
  ReminderFields,
} from "@/components/streaks/ReminderSettings";
import { enablePushOnThisDevice } from "@/lib/push-client";

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
  const [testMessage, setTestMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-seed from the streak each time the dialog opens so a cancelled edit
  // doesn't linger, and surface an already-blocked permission up front.
  useEffect(() => {
    if (!open) return;
    setEnabled(streak.reminderEnabled);
    setTime(streak.reminderTime ?? DEFAULT_REMINDER_TIME);
    setNotice(streak.reminderEnabled ? blockedNotice() : null);
    setTestMessage(null);
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

  const handleTest = async () => {
    setIsTesting(true);
    setTestMessage(null);
    try {
      // Register this device first. Without it, testing before ever flipping
      // the toggle just reports "no devices registered", which tells the user
      // nothing they can act on. Idempotent when already subscribed.
      const setup = await enablePushOnThisDevice();
      if (!setup.ok) {
        setNotice({ message: setup.message, tone: "warning" });
        return;
      }

      const result = await sendTestNotification();
      setTestMessage(result.message);
    } catch (e) {
      setTestMessage(
        e instanceof Error ? e.message : "Couldn't send a test notification."
      );
    } finally {
      setIsTesting(false);
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

        <div className="border-border flex flex-col gap-2 border-t pt-4">
          <SsButton
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleTest}
            loading={isTesting}
          >
            Send test notification
          </SsButton>
          {testMessage && (
            <SsTypography variant="muted" className="text-xs">
              {testMessage}
            </SsTypography>
          )}
        </div>

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
