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
      eyebrow="DESTRUCTIVE"
      eyebrowTone="bad"
      title={entryTitle ? `Delete ${entryTitle}?` : "Delete entry?"}
      disableClose={isDeleting}
      maxWidthClassName="max-w-[400px]"
    >
      <SsTypography variant="muted" className="mb-5">
        This entry will be permanently removed. There is no undo.
      </SsTypography>
      <div className="flex gap-2.5">
        <SsButton
          type="button"
          variant="outline"
          mono
          block
          disabled={isDeleting}
          onClick={onClose}
        >
          Cancel
        </SsButton>
        <SsButton
          type="button"
          variant="danger"
          mono
          block
          loading={isDeleting}
          onClick={handleConfirm}
        >
          Delete
        </SsButton>
      </div>
    </SsDialog>
  );
}
