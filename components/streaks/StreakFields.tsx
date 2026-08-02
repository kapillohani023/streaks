"use client";

import { SsInput, SsTextarea } from "@/components/ui/SsInput";
import {
  DeliveryNotice,
  ReminderFields,
} from "@/components/streaks/ReminderSettings";

interface StreakFieldsProps {
  name: string;
  description: string;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  reminderEnabled: boolean;
  reminderTime: string;
  onReminderEnabledChange: (enabled: boolean) => void;
  onReminderTimeChange: (time: string) => void;
  notice: DeliveryNotice | null;
  onNoticeChange: (notice: DeliveryNotice | null) => void;
  disabled?: boolean;
  autoFocusName?: boolean;
  /** Keeps input ids unique if two of these ever mount at once. */
  idPrefix?: string;
}

/**
 * Everything a streak is made of, as editable fields: name, description, and
 * the daily reminder.
 *
 * Shared by the create and edit dialogs so the two surfaces can't drift apart
 * field-by-field. Deliberately stateless — each dialog owns its own values,
 * because their submit paths differ (create implies `enabled` from the time it
 * was given, edit carries an explicit toggle so a reminder can be turned off).
 */
export function StreakFields({
  name,
  description,
  onNameChange,
  onDescriptionChange,
  reminderEnabled,
  reminderTime,
  onReminderEnabledChange,
  onReminderTimeChange,
  notice,
  onNoticeChange,
  disabled = false,
  autoFocusName = false,
  idPrefix = "streak",
}: StreakFieldsProps) {
  return (
    <div className="flex flex-col gap-5">
      <SsInput
        id={`${idPrefix}-name`}
        type="text"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        label="Streak Name"
        placeholder="e.g., Daily Exercise, Read Books..."
        autoFocus={autoFocusName}
        disabled={disabled}
      />

      <SsTextarea
        id={`${idPrefix}-description`}
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        label="Description (optional)"
        placeholder="Add a description..."
        rows={3}
        disabled={disabled}
      />

      <div className="border-border border-t pt-5">
        <ReminderFields
          enabled={reminderEnabled}
          time={reminderTime}
          onEnabledChange={onReminderEnabledChange}
          onTimeChange={onReminderTimeChange}
          disabled={disabled}
          notice={notice}
          onNoticeChange={onNoticeChange}
        />
      </div>
    </div>
  );
}
