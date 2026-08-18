"use client";

import { SsButton } from "@/components/ui/SsButton";
import { SsDialog } from "@/components/ui/SsDialog";
import { SsTypography } from "@/components/ui/SsTypography";
import { stageDef, type TodoStage } from "@/types/todo";

export interface FlushColumnDialogProps {
  stage: TodoStage | null;
  count: number;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Flushing is the only board action with no undo — a drag can always be dragged
 * back, and a delete is one chip — so it is the only one that stops to ask, and
 * it names the count so "flush completed" cannot quietly take twelve items when
 * the user was thinking of two.
 */
export function FlushColumnDialog({
  stage,
  count,
  onClose,
  onConfirm,
}: FlushColumnDialogProps) {
  const label = stage ? stageDef(stage).label.toLowerCase() : "";

  return (
    <SsDialog
      open={Boolean(stage)}
      onClose={onClose}
      eyebrow="DESTRUCTIVE"
      eyebrowTone="bad"
      title={`Flush ${label}?`}
      maxWidthClassName="max-w-[400px]"
    >
      <SsTypography variant="muted" className="mb-5">
        {count} {count === 1 ? "item" : "items"} will be permanently removed
        from this column. This cannot be undone.
      </SsTypography>
      <div className="flex gap-2.5">
        <SsButton type="button" variant="outline" mono block onClick={onClose}>
          Cancel
        </SsButton>
        <SsButton type="button" variant="danger" mono block onClick={onConfirm}>
          Flush
        </SsButton>
      </div>
    </SsDialog>
  );
}
