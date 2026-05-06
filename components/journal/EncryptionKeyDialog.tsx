"use client";
import { useState } from "react";
import { SsButton } from "@/components/ui/SsButton";
import { SsDialog } from "@/components/ui/SsDialog";
import { SsInput } from "@/components/ui/SsInput";
import { SsTypography } from "@/components/ui/SsTypography";

interface EncryptionKeyDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (key: string) => void;
  busy?: boolean;
}

export function EncryptionKeyDialog({
  open,
  onClose,
  onConfirm,
  busy = false,
}: EncryptionKeyDialogProps) {
  const [key, setKey] = useState("");
  const [confirmKey, setConfirmKey] = useState("");
  const [error, setError] = useState("");

  const reset = () => {
    setKey("");
    setConfirmKey("");
    setError("");
  };

  const handleClose = () => {
    if (busy) return;
    reset();
    onClose();
  };

  const handleEncrypt = () => {
    if (!key) {
      setError("A passphrase is required.");
      return;
    }
    if (key !== confirmKey) {
      setError("Passphrases do not match.");
      return;
    }
    setError("");
    onConfirm(key);
    reset();
  };

  return (
    <SsDialog
      open={open}
      onClose={handleClose}
      title="Encrypt this entry"
      subtitle="Choose a passphrase. The entry is encrypted in your browser with AES-GCM (PBKDF2-derived key) before being saved — only you can read it."
      disableClose={busy}
    >
      <div className="flex flex-col gap-4">
        <SsInput
          id="enc-key"
          type="password"
          label="Passphrase"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Your secret passphrase"
          autoFocus
          disabled={busy}
        />
        <SsInput
          id="enc-key-confirm"
          type="password"
          label="Confirm passphrase"
          value={confirmKey}
          onChange={(e) => setConfirmKey(e.target.value)}
          placeholder="Re-enter your passphrase"
          error={error || undefined}
          disabled={busy}
        />
        <SsTypography variant="caption" className="text-zinc-500">
          The passphrase is never sent to the server or stored. If you lose it,
          this entry cannot be recovered.
        </SsTypography>
        <div className="flex flex-col gap-2 pt-2">
          <SsButton
            type="button"
            block
            onClick={handleEncrypt}
            disabled={busy}
          >
            Encrypt & Save
          </SsButton>
          <SsButton
            type="button"
            variant="ghost"
            block
            onClick={handleClose}
            disabled={busy}
          >
            Cancel
          </SsButton>
        </div>
      </div>
    </SsDialog>
  );
}
