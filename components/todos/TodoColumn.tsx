"use client";

import type { DragEvent, ReactNode } from "react";
import { ArrowLeft, ArrowRight, Trash2 } from "lucide-react";
import { MonoLabel } from "@/components/ui/SsMono";
import { TodoChip } from "@/components/todos/TodoChip";
import type { Todo, TodoStage, TodoStageDef } from "@/types/todo";

export interface TodoColumnProps {
  def: TodoStageDef;
  items: Todo[];
  /** The neighbours the bulk arrows push into; null at either end of the board. */
  previous: TodoStageDef | null;
  next: TodoStageDef | null;
  dragId: string | null;
  dragOverStage: TodoStage | null;
  dragBeforeId: string | null;
  onOpenChip: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragOver: (stage: TodoStage, beforeId: string | null) => void;
  onDrop: (stage: TodoStage, beforeId: string | null) => void;
  onDragEnd: () => void;
  onMoveAll: (from: TodoStage, to: TodoStage) => void;
  onFlush: (stage: TodoStage) => void;
}

export function TodoColumn({
  def,
  items,
  previous,
  next,
  dragId,
  dragOverStage,
  dragBeforeId,
  onOpenChip,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onMoveAll,
  onFlush,
}: TodoColumnProps) {
  const empty = items.length === 0;
  const canEscalate = Boolean(next) && !empty;
  const canDeescalate = Boolean(previous) && !empty;
  const active = dragOverStage === def.key && Boolean(dragId);

  const handleZoneDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    onDragOver(def.key, null);
  };

  const handleZoneDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    onDrop(def.key, null);
  };

  return (
    <section
      aria-label={def.label}
      /*
        Below md the board is a horizontal snap carousel, so a column is a fixed
        78%-wide page you swipe between; at md it becomes a third of a grid and
        gives all of that up. 78% rather than 100% deliberately leaves the next
        column peeking, which is the only affordance saying there is more board
        to the right.
      */
      className="border-border bg-panel flex min-h-[200px] w-[78%] min-w-[264px] shrink-0 snap-start flex-col rounded-xl border md:w-auto md:min-w-0 md:shrink"
    >
      <header className="border-divider flex items-center justify-between gap-2 border-b px-3.5 py-3">
        <span className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden
            className="h-[7px] w-[7px] shrink-0 rounded-[2px]"
            style={{ background: def.dot }}
          />
          <MonoLabel as="h2" size="tile" tone="soft" className="truncate">
            {def.label}
          </MonoLabel>
        </span>
        <MonoLabel as="span" size="readout" className="font-bold">
          {items.length}
        </MonoLabel>
      </header>

      <div
        onDragOver={handleZoneDragOver}
        onDrop={handleZoneDrop}
        className={[
          "flex max-h-[340px] min-h-0 flex-1 flex-col gap-2 overflow-y-auto rounded-b-xl p-3 transition-colors duration-150",
          active ? "bg-sunken" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {items.map((todo) => (
          <TodoChip
            key={todo.id}
            todo={todo}
            completed={def.key === "done"}
            dragging={dragId === todo.id}
            insertBefore={
              dragBeforeId === todo.id && !!dragId && dragId !== todo.id
            }
            onOpen={() => onOpenChip(todo.id)}
            onDragStart={() => onDragStart(todo.id)}
            onDragOverChip={() => onDragOver(def.key, todo.id)}
            onDropOnChip={() => onDrop(def.key, todo.id)}
            onDragEnd={onDragEnd}
          />
        ))}

        {empty && (
          <p className="border-border text-faint rounded-lg border border-dashed px-3 py-[18px] text-center font-mono text-[10px] tracking-[0.12em]">
            EMPTY
          </p>
        )}
      </div>

      <footer className="border-divider flex items-center gap-1.5 border-t px-3 py-2.5">
        <BulkButton
          onClick={() => previous && onMoveAll(def.key, previous.key)}
          disabled={!canDeescalate}
          label={
            canDeescalate && previous
              ? `De-escalate all to ${previous.label}`
              : "Nothing to de-escalate"
          }
        >
          <ArrowLeft size={12} />
        </BulkButton>
        <BulkButton
          onClick={() => next && onMoveAll(def.key, next.key)}
          disabled={!canEscalate}
          label={
            canEscalate && next
              ? `Escalate all to ${next.label}`
              : "Nothing to escalate"
          }
        >
          <ArrowRight size={12} />
        </BulkButton>
        <BulkButton
          onClick={() => onFlush(def.key)}
          disabled={empty}
          label={empty ? "Nothing to flush" : `Flush ${def.label}`}
          tone="bad"
        >
          <Trash2 size={12} />
        </BulkButton>
      </footer>
    </section>
  );
}

/**
 * A column's bulk control. 36px square rather than the design's 34: below the
 * `md` breakpoint these are the only touch targets on the board that are not
 * a whole chip, and 34px sits under every touch-target guideline going.
 */
function BulkButton({
  onClick,
  disabled,
  label,
  tone = "neutral",
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  tone?: "neutral" | "bad";
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={[
        "focus-visible:ring-ring focus-visible:ring-offset-background inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition-all duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        // The flush button is pushed to the far edge so a destructive click can
        // never be a near-miss of the arrow beside it.
        tone === "bad" ? "ml-auto" : "",
        disabled
          ? "border-border text-faint cursor-not-allowed opacity-40"
          : tone === "bad"
            ? "border-bad-soft text-bad hover:bg-bad-soft cursor-pointer"
            : "border-border text-soft hover:border-foreground hover:text-foreground cursor-pointer",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </button>
  );
}
