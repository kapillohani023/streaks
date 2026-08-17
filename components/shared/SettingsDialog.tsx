"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { BellOff } from "lucide-react";
import {
  deleteAccount,
  getAccountSettings,
  setRemindersSnoozed,
} from "@/app/actions/account";
import { DELETE_CONFIRMATION } from "@/lib/account";
import { SsButton } from "@/components/ui/SsButton";
import { SsDialog } from "@/components/ui/SsDialog";
import { SsInput } from "@/components/ui/SsInput";
import { SsToggle } from "@/components/ui/SsToggle";
import { SsTypography } from "@/components/ui/SsTypography";

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
}

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const [busy, setBusy] = useState(false);

  return (
    <SsDialog
      open={open}
      onClose={onClose}
      eyebrow="ACCOUNT"
      title="Settings"
      divided
      showCloseButton
      disableClose={busy}
      closeOnBackdrop={!busy}
      contentClassName="p-0"
    >
      <SnoozeSetting disabled={busy} />
      <div className="border-divider border-t">
        <DeleteAccountSetting busy={busy} onBusyChange={setBusy} />
      </div>
    </SsDialog>
  );
}

/**
 * Optimistic so the switch never lags the tap; a failed write snaps back and
 * says why, rather than leaving the UI claiming reminders are muted when the
 * cron would still fire.
 */
function SnoozeSetting({ disabled }: { disabled: boolean }) {
  const [snoozed, setSnoozed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getAccountSettings()
      .then((settings) => {
        if (active) setSnoozed(settings.remindersSnoozed);
      })
      .catch((cause) => {
        if (active) setError(errorMessage(cause));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleToggle = async (next: boolean) => {
    setSnoozed(next);
    setError(null);
    try {
      await setRemindersSnoozed(next);
    } catch (cause) {
      setSnoozed(!next);
      setError(errorMessage(cause));
    }
  };

  return (
    <div className="px-6 py-5">
      <div className="flex items-start justify-between gap-4">
        <span className="flex items-start gap-2.5">
          <BellOff
            size={15}
            className={`mt-0.5 shrink-0 ${
              snoozed ? "text-foreground" : "text-faint"
            }`}
          />
          <span className="flex flex-col gap-0.5">
            <SsTypography as="span" className="text-sm font-semibold">
              Snooze all reminders
            </SsTypography>
            <SsTypography variant="muted" className="text-xs">
              Mutes every streak reminder without changing their individual
              settings.
            </SsTypography>
          </span>
        </span>
        <SsToggle
          label="Snooze all reminders"
          checked={snoozed}
          disabled={disabled || loading}
          onChange={handleToggle}
        />
      </div>
      {error && (
        <SsTypography variant="caption" className="text-bad mt-2 block">
          {error}
        </SsTypography>
      )}
    </div>
  );
}

/**
 * Nothing is armed until the exact phrase is typed, and the dialog is locked
 * while the delete runs so it can't be closed or re-fired mid-flight.
 */
function DeleteAccountSetting({
  busy,
  onBusyChange,
}: {
  busy: boolean;
  onBusyChange: (busy: boolean) => void;
}) {
  const [value, setValue] = useState("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matches = value.trim().toLowerCase() === DELETE_CONFIRMATION;

  const handleConfirm = async () => {
    setRunning(true);
    onBusyChange(true);
    setError(null);
    try {
      await deleteAccount(value);
      // The row is gone but the JWT session would still look valid, so the
      // sign-out has to happen here or the next request hits a missing user.
      await signOut({ callbackUrl: "/" });
    } catch (cause) {
      setError(errorMessage(cause));
      setRunning(false);
      onBusyChange(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 px-6 py-5">
      <div className="flex flex-col gap-0.5">
        <SsTypography as="span" className="text-sm font-semibold">
          Delete my account
        </SsTypography>
        <SsTypography variant="muted" className="text-xs">
          Permanently deletes your account and everything in it — streaks,
          check-ins, and journal entries. This cannot be undone.
        </SsTypography>
      </div>

      <SsInput
        id="settings-delete-confirm"
        size="sm"
        mono
        value={value}
        disabled={busy}
        autoComplete="off"
        placeholder={DELETE_CONFIRMATION}
        aria-label={`Type "${DELETE_CONFIRMATION}" to confirm`}
        onChange={(event) => {
          setValue(event.target.value);
          setError(null);
        }}
        hint={`Type "${DELETE_CONFIRMATION}" to enable this button`}
        error={error ?? undefined}
      />

      <SsButton
        type="button"
        variant="danger"
        mono
        size="md"
        block
        loading={running}
        disabled={!matches || busy}
        onClick={handleConfirm}
      >
        Delete my account
      </SsButton>
    </div>
  );
}
