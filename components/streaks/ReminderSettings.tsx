"use client";

import { useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { SsInput } from "@/components/ui/SsInput";
import { SsToggle } from "@/components/ui/SsToggle";
import { SsTypography } from "@/components/ui/SsTypography";
import { MonoLabel } from "@/components/ui/SsMono";
import {
  enablePushOnThisDevice,
  isPushBlocked,
  isPushGranted,
} from "@/lib/push-client";

export const DEFAULT_REMINDER_TIME = "09:00";

/** A warning that the preference was saved but won't actually be delivered. */
export interface DeliveryNotice {
  message: string;
  tone: "warning" | "info";
}

interface ReminderFieldsProps {
  enabled: boolean;
  time: string;
  onEnabledChange: (enabled: boolean) => void;
  onTimeChange: (time: string) => void;
  disabled?: boolean;
  notice: DeliveryNotice | null;
  onNoticeChange: (notice: DeliveryNotice | null) => void;
}

/**
 * Toggle + time picker, shared by the reminder dialog and the create-streak
 * flow.
 *
 * Turning the toggle on triggers the browser permission prompt in context —
 * the only place a prompt has a decent chance of being granted. If permission
 * is refused or the device can't subscribe, the toggle *stays on*: the
 * preference is real and applies to the user's other devices. What changes is
 * that we say plainly that this device won't receive anything.
 */
export function ReminderFields({
  enabled,
  time,
  onEnabledChange,
  onTimeChange,
  disabled = false,
  notice,
  onNoticeChange,
}: ReminderFieldsProps) {
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleToggle = async (next: boolean) => {
    onEnabledChange(next);

    if (!next) {
      onNoticeChange(null);
      return;
    }

    if (!time) onTimeChange(DEFAULT_REMINDER_TIME);

    setIsSubscribing(true);
    try {
      // Idempotent: reuses an existing subscription when there is one, so this
      // is safe to run on every enable.
      const result = await enablePushOnThisDevice();
      onNoticeChange(
        result.ok ? null : { message: result.message, tone: "warning" }
      );
    } finally {
      setIsSubscribing(false);
    }
  };

  const isBusy = disabled || isSubscribing;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2">
          {enabled ? (
            <Bell size={14} className="text-foreground" />
          ) : (
            <BellOff size={14} className="text-faint" />
          )}
          <MonoLabel as="span" size="readout" tone="soft" className="uppercase">
            Daily reminder
          </MonoLabel>
        </span>
        <SsToggle
          label="Daily reminder"
          checked={enabled}
          disabled={isBusy}
          onChange={handleToggle}
        />
      </div>

      {enabled && (
        <SsInput
          id="reminder-time"
          type="time"
          label="Remind me at"
          mono
          value={time}
          disabled={isBusy}
          onChange={(event) => onTimeChange(event.target.value)}
          hint={
            isPushGranted() && !notice
              ? "Uses your device's timezone"
              : undefined
          }
        />
      )}

      {isSubscribing && (
        <SsTypography variant="caption">
          Setting up notifications on this device...
        </SsTypography>
      )}

      {notice && (
        <SsTypography
          as="p"
          className={`text-xs ${notice.tone === "warning" ? "text-bad" : "text-dim"}`}
        >
          {notice.message}
        </SsTypography>
      )}
    </div>
  );
}

/** Notice shown when the site's notification permission is already blocked. */
export function blockedNotice(): DeliveryNotice | null {
  if (typeof window === "undefined" || !isPushBlocked()) return null;
  return {
    message:
      "Notifications are blocked for this site, so this device won't buzz. Re-enable them in your browser's site settings.",
    tone: "warning",
  };
}
