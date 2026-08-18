"use client";

import { useState, type DragEvent, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, ChevronDown, Trash2 } from "lucide-react";
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
  /*
    Collapsed to start. Below `md` the three columns are stacked, so an open
    board would be a metre of scrolling before the third heading; closed, the
    whole board — every stage and its count — fits above the fold and the user
    opens the one they came for.

    This state only means anything on mobile: from `md` up the body is shown by
    CSS regardless, so the desktop board is never at the mercy of a toggle the
    user cannot see.
  */
  const [open, setOpen] = useState(false);

  const empty = items.length === 0;
  const canEscalate = Boolean(next) && !empty;
  const canDeescalate = Boolean(previous) && !empty;
  const active = dragOverStage === def.key && Boolean(dragId);
  const bodyId = `todo-column-${def.key}`;

  /** Shown on mobile only when open; always shown from `md` up. */
  const collapsible = open ? "flex" : "hidden md:flex";

  const handleZoneDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    onDragOver(def.key, null);
  };

  const handleZoneDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    onDrop(def.key, null);
  };

  const heading = (
    <>
      <span className="flex min-w-0 items-center gap-2">
        <span
          aria-hidden
          className="h-[7px] w-[7px] shrink-0 rounded-[2px]"
          style={{ background: def.dot }}
        />
        <MonoLabel as="span" size="tile" tone="soft" className="truncate">
          {def.label}
        </MonoLabel>
      </span>
      <span className="flex shrink-0 items-center gap-2">
        <MonoLabel as="span" size="readout" className="font-bold">
          {items.length}
        </MonoLabel>
        <ChevronDown
          size={14}
          aria-hidden
          className={[
            "text-faint transition-transform duration-200 md:hidden",
            open ? "rotate-180" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      </span>
    </>
  );

  /*
    A collapsed board is the whole card, so it keeps all four corners and the
    divider under the heading goes away with the body it was separating.
  */
  const headerEdge = open
    ? "border-b rounded-t-xl"
    : "md:border-b rounded-xl md:rounded-b-none";

  return (
    <section
      aria-label={def.label}
      className="border-border bg-panel flex w-full flex-col rounded-xl border md:min-h-[200px]"
    >
      {/*
        The heading is a real button on mobile and plain text from `md` up,
        rather than one button that goes inert at the breakpoint. A control that
        reports `aria-expanded` while doing nothing is worse than no control:
        the two renderings each say exactly what they are.
      */}
      <button
        type="button"
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        aria-expanded={open}
        aria-controls={bodyId}
        className={`border-divider hover:bg-sunken flex w-full cursor-pointer items-center justify-between gap-2 px-3.5 py-3 transition-colors duration-150 md:hidden ${headerEdge}`}
      >
        {heading}
      </button>
      {/*
        Only one of the two headings is ever displayed, and `display:none` keeps
        the other out of the accessibility tree, so neither needs hiding by hand.
      */}
      <div
        className={`border-divider hidden items-center justify-between gap-2 px-3.5 py-3 md:flex ${headerEdge}`}
      >
        {heading}
      </div>

      <div
        id={bodyId}
        onDragOver={handleZoneDragOver}
        onDrop={handleZoneDrop}
        /*
          A fixed 264px on mobile — about three and a half chips — rather than a
          height that follows the contents. Stacked boards that each grow to
          their own length make the page jump every time an item moves, and the
          part-visible fourth chip is what says the list keeps going.
        */
        className={[
          collapsible,
          "h-[264px] min-h-0 flex-col gap-2 overflow-y-auto rounded-b-xl p-3 transition-colors duration-150 md:h-auto md:max-h-[340px] md:flex-1",
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

      <footer
        className={`${collapsible} border-divider items-center gap-1.5 border-t px-3 py-2.5`}
      >
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
