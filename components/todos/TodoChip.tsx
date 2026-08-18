"use client";

import type { DragEvent } from "react";
import { chipText, type Todo } from "@/types/todo";

export interface TodoChipProps {
  todo: Todo;
  /** Struck through and dimmed in the done column — the column's whole point. */
  completed: boolean;
  dragging: boolean;
  /** True while a drag is hovering this chip, which draws the insertion rule. */
  insertBefore: boolean;
  onOpen: () => void;
  onDragStart: () => void;
  onDragOverChip: () => void;
  onDropOnChip: () => void;
  onDragEnd: () => void;
}

/**
 * One card on the board.
 *
 * The chip is the drag handle and the tap target at once. Pointer users grab
 * it; touch users — where HTML5 drag-and-drop simply does not fire — tap it and
 * move the item from the actions dialog instead. Both paths are always
 * present rather than feature-detected, because a hybrid laptop is allowed to
 * use either.
 */
export function TodoChip({
  todo,
  completed,
  dragging,
  insertBefore,
  onOpen,
  onDragStart,
  onDragOverChip,
  onDropOnChip,
  onDragEnd,
}: TodoChipProps) {
  const handleDragStart = (event: DragEvent<HTMLDivElement>) => {
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      // Firefox refuses to start a drag unless some payload is set. The id is
      // carried in React state; this is only there to arm the gesture.
      try {
        event.dataTransfer.setData("text/plain", todo.id);
      } catch {
        /* Safari can throw here mid-gesture; the drag still works. */
      }
    }
    onDragStart();
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    onDragOverChip();
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onDropOnChip();
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={onDragEnd}
      className={[
        "border-border bg-panel-2 hover:border-mid flex cursor-grab flex-col rounded-lg border p-2.5 transition-[border-color,opacity,box-shadow] duration-150 active:cursor-grabbing",
        dragging ? "border-dashed opacity-35" : "",
        insertBefore ? "shadow-[0_-2px_0_0_var(--fg)]" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onOpen();
        }}
        title={todo.text}
        /*
          A fixed two-line box (39px at 13px/1.5) rather than an auto height:
          chips of wildly different heights make the column read as noise, and
          a stable row height is what lets the eye scan a column for the one
          card it wants.
        */
        className={[
          "block h-[39px] max-h-[39px] min-h-[39px] w-full cursor-pointer overflow-hidden text-left text-[13px] leading-normal",
          completed ? "text-dim line-through" : "text-fg-soft",
        ].join(" ")}
      >
        {chipText(todo.text)}
      </button>
    </div>
  );
}
