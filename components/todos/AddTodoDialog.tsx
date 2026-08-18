"use client";

import { type FormEvent, useState } from "react";
import { SsButton } from "@/components/ui/SsButton";
import { SsDialog } from "@/components/ui/SsDialog";
import { SsInput } from "@/components/ui/SsInput";
import { MonoLabel } from "@/components/ui/SsMono";
import { TODO_STAGES, TODO_TEXT_MAX, type TodoStage } from "@/types/todo";

export interface AddTodoDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (text: string, stage: TodoStage) => void;
}

/**
 * New chips pick their column up front rather than always landing in TO DO.
 * Half of what gets typed here is something already underway that the board
 * simply did not know about yet, and starting it in the right column saves
 * a drag every time.
 */
export function AddTodoDialog({ open, onClose, onAdd }: AddTodoDialogProps) {
  const [text, setText] = useState("");
  const [stage, setStage] = useState<TodoStage>("todo");

  const trimmed = text.trim();

  const close = () => {
    setText("");
    setStage("todo");
    onClose();
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!trimmed) return;
    onAdd(trimmed, stage);
    close();
  };

  return (
    <SsDialog
      open={open}
      onClose={close}
      eyebrow="BOARD / NEW"
      title="Add Todo"
      maxWidthClassName="max-w-[420px]"
    >
      <form onSubmit={submit}>
        <div className="mb-5 flex flex-col gap-3.5">
          <SsInput
            id="new-todo-text"
            label="Task"
            value={text}
            maxLength={TODO_TEXT_MAX}
            onChange={(event) => setText(event.target.value)}
            placeholder="e.g. Draft reminder copy"
            autoFocus
          />

          <div className="flex flex-col gap-1.5">
            <MonoLabel
              as="label"
              size="readout"
              tone="soft"
              className="uppercase"
            >
              Stage
            </MonoLabel>
            <div className="flex gap-1.5">
              {TODO_STAGES.map((def) => {
                const selected = stage === def.key;
                return (
                  <button
                    key={def.key}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setStage(def.key)}
                    className={[
                      /*
                        The label wraps rather than ellipsizes: at 320px each
                        third of the dialog is ~80px and "IN PROGRESS" clipped
                        to "IN PROGRE…" is unreadable, while broken over two
                        lines it is still the column's own name.
                      */
                      "min-h-[34px] min-w-0 flex-1 cursor-pointer rounded-md border px-1 py-2 font-mono text-[9px] leading-[1.3] font-bold tracking-[0.08em] transition-all duration-150",
                      selected
                        ? "border-foreground bg-sunken text-foreground"
                        : "border-border text-faint hover:text-foreground bg-transparent",
                    ].join(" ")}
                  >
                    {def.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-2.5">
          <SsButton type="button" variant="outline" mono block onClick={close}>
            Cancel
          </SsButton>
          <SsButton type="submit" mono block disabled={!trimmed}>
            Add
          </SsButton>
        </div>
      </form>
    </SsDialog>
  );
}
