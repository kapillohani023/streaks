"use client";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { SsButton } from "@/components/ui/SsButton";
import { SsDialog } from "@/components/ui/SsDialog";
import { SsTypography } from "@/components/ui/SsTypography";

interface DeleteStreakButtonProps {
  streakId: string;
  handleDelete: (streakId: string) => Promise<void> | void;
}

export function DeleteStreakButton({
  streakId,
  handleDelete,
}: DeleteStreakButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const onConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await handleDelete(streakId);
      setIsDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <SsButton
        onClick={() => setIsDialogOpen(true)}
        variant="ghost"
        size="icon"
        className="text-zinc-600 hover:text-black"
        aria-label="Delete streak"
      >
        <Trash2 size={20} />
      </SsButton>

      <SsDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Delete streak?"
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
            onClick={() => setIsDialogOpen(false)}
          >
            Cancel
          </SsButton>
          <SsButton type="button" variant="danger" block disabled={isDeleting} onClick={onConfirmDelete}>
            Delete
          </SsButton>
        </div>
      </SsDialog>
    </>
  );
}
