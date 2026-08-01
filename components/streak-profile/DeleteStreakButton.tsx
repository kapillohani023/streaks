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
      title="Delete streak?"
      subtitle={streakName}
      disableClose={isDeleting}
    >
      <SsTypography variant="muted" className="mb-6">
        This action cannot be undone.
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
          onClick={onConfirmDelete}
        >
          Delete
        </SsButton>
      </div>
    </SsDialog>
  );
}
