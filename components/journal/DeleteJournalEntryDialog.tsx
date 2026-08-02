"use client";
import { useState } from "react";
import { SsButton } from "@/components/ui/SsButton";
import { SsDialog } from "@/components/ui/SsDialog";
import { SsTypography } from "@/components/ui/SsTypography";

interface DeleteJournalEntryDialogProps {
  open: boolean;
  entryTitle?: string;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export function DeleteJournalEntryDialog({
  open,
  entryTitle,
  onClose,
  onConfirm,
}: DeleteJournalEntryDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirm();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SsDialog
      open={open}
      onClose={onClose}
      title="Delete entry?"
      subtitle={entryTitle}
      disableClose={isDeleting}
    >
      <SsTypography variant="muted" className="mb-6">
        This entry will be permanently removed. This action cannot be undone.
      </SsTypography>
      <div className="flex gap-3">
        <SsButton
          type="button"
          variant="secondary"
          block
          disabled={isDeleting}
          onClick={onClose}
        >
          Cancel
        </SsButton>
        <SsButton
          type="button"
          variant="danger"
          block
          disabled={isDeleting}
          onClick={handleConfirm}
        >
          Delete
        </SsButton>
      </div>
    </SsDialog>
  );
}
