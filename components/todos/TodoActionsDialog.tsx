"use client";

import { SsButton } from "@/components/ui/SsButton";
import { SsDialog } from "@/components/ui/SsDialog";
import { MonoLabel } from "@/components/ui/SsMono";
import { TODO_STAGES, stageDef, type Todo, type TodoStage } from "@/types/todo";

export interface TodoActionsDialogProps {
  todo: Todo | null;
  onClose: () => void;
  onMove: (stage: TodoStage) => void;
  onDelete: () => void;
}

/**
 * Everything a chip can do, without a drag.
 *
 * This is not a convenience — on touch it is the *only* way to move a card,
 * since HTML5 drag-and-drop never fires from a finger. It doubles as the place
 * the full text is readable, which the two-line chip cannot show.
 */
export function TodoActionsDialog({
  todo,
  onClose,
  onMove,
  onDelete,
}: TodoActionsDialogProps) {
  return (
    <SsDialog
      open={Boolean(todo)}
      onClose={onClose}
      eyebrow={todo ? `TODO / ${stageDef(todo.stage).label}` : undefined}
      title={todo?.text}
      maxWidthClassName="max-w-[400px]"
    >
      <MonoLabel size="tile" tone="soft" className="mb-2">
        MOVE TO
      </MonoLabel>

      <div className="mb-4 flex flex-col gap-1.5">
        {TODO_STAGES.map((def) => {
          const current = todo?.stage === def.key;
          return (
            <button
              key={def.key}
              type="button"
              disabled={current}
              onClick={() => onMove(def.key)}
              className={[
                "flex h-11 w-full items-center justify-between gap-2.5 rounded-lg border px-3.5 text-left text-[13px] transition-all duration-150",
                current
                  ? "border-foreground bg-sunken text-foreground cursor-default"
                  : "border-border text-fg-soft hover:border-foreground hover:text-foreground cursor-pointer bg-transparent",
              ].join(" ")}
            >
              <span>{def.label}</span>
              {current && (
                <MonoLabel as="span" size="micro" tone="fg">
                  CURRENT
                </MonoLabel>
              )}
            </button>
          );
        })}
      </div>

      <div className="border-divider flex gap-2.5 border-t pt-4">
        <SsButton type="button" variant="outline" mono block onClick={onClose}>
          Close
        </SsButton>
        <SsButton
          type="button"
          variant="danger-outline"
          mono
          block
          onClick={onDelete}
        >
          Delete
        </SsButton>
      </div>
    </SsDialog>
  );
}
