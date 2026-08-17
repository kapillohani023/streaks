"use client";
import { useState } from "react";
import { SsButton } from "@/components/ui/SsButton";
import { SsDialog } from "@/components/ui/SsDialog";
import { SsTypography } from "@/components/ui/SsTypography";

interface DeleteStreakDialogProps {
  open: boolean;
  streakId: string;
  streakName?: string;
  onClose: () => void;
  handleDelete: (streakId: string) => Promise<void> | void;
}

export function DeleteStreakDialog({
  open,
  streakId,
  streakName,
  onClose,
  handleDelete,
}: DeleteStreakDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const onConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await handleDelete(streakId);
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
      title={streakName ? `Delete ${streakName}?` : "Delete streak?"}
      disableClose={isDeleting}
      maxWidthClassName="max-w-[400px]"
    >
      <SsTypography variant="muted" className="mb-5">
        This removes the streak and its full history. There is no undo.
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
          onClick={onConfirmDelete}
        >
          Delete
        </SsButton>
      </div>
    </SsDialog>
  );
}
