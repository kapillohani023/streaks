"use client";

import { useOptimistic, useState, useTransition } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { PageHeader, PageShell } from "@/components/shared/PageShell";
import { SsButton } from "@/components/ui/SsButton";
import { AddTodoDialog } from "@/components/todos/AddTodoDialog";
import { FlushColumnDialog } from "@/components/todos/FlushColumnDialog";
import { TodoActionsDialog } from "@/components/todos/TodoActionsDialog";
import { TodoColumn } from "@/components/todos/TodoColumn";
import {
  addTodo,
  deleteTodo,
  flushTodoStage,
  moveAllTodos,
  moveTodo,
} from "@/app/actions/todo";
import { reduceBoard, todosInStage, type BoardAction } from "@/lib/todo-board";
import { TODO_STAGES, type Todo, type TodoStage } from "@/types/todo";

interface TodosContentProps {
  todos: Todo[];
}

export function TodosContent({ todos }: TodosContentProps) {
  /*
    The board is optimistic because it has to be: a drag that only lands after
    a round trip means the chip springs back under your cursor and then jumps
    forward, which reads as a failed drop. `useOptimistic` replays the queued
    actions over whatever the server last sent, so the moment the revalidation
    lands the local guesses simply fall away rather than needing to be undone.
  */
  const [board, applyOptimistic] = useOptimistic(todos, reduceBoard);
  const [, startTransition] = useTransition();

  const [addOpen, setAddOpen] = useState(false);
  const [actionsFor, setActionsFor] = useState<string | null>(null);
  const [flushStage, setFlushStage] = useState<TodoStage | null>(null);

  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<TodoStage | null>(null);
  const [dragBeforeId, setDragBeforeId] = useState<string | null>(null);

  const mutate = (action: BoardAction, run: () => Promise<unknown>) => {
    startTransition(async () => {
      applyOptimistic(action);
      try {
        await run();
      } catch (error) {
        // The optimistic entry is discarded when the transition settles, so the
        // board falls back to the server's version on its own.
        console.error("Todo update failed:", error);
      }
    });
  };

  const endDrag = () => {
    setDragId(null);
    setDragOverStage(null);
    setDragBeforeId(null);
  };

  const handleDragOver = (stage: TodoStage, beforeId: string | null) => {
    if (dragOverStage !== stage || dragBeforeId !== beforeId) {
      setDragOverStage(stage);
      setDragBeforeId(beforeId);
    }
  };

  const handleDrop = (stage: TodoStage, beforeId: string | null) => {
    const id = dragId;
    endDrag();
    if (!id) return;
    // A drop onto the chip you picked up is a no-op, not a move to itself.
    if (beforeId === id) return;
    mutate({ type: "move", id, stage, beforeId }, () =>
      moveTodo({ id, stage, beforeId })
    );
  };

  const handleAdd = (text: string, stage: TodoStage) => {
    // A temporary id, replaced by the server's cuid on the next render. It only
    // has to survive long enough to be a React key.
    const id = `optimistic-${crypto.randomUUID()}`;
    mutate({ type: "add", todo: { id, text, stage } }, () =>
      addTodo({ text, stage })
    );
  };

  const handleMoveAll = (from: TodoStage, to: TodoStage) =>
    mutate({ type: "moveAll", from, to }, () => moveAllTodos({ from, to }));

  const handleMoveOne = (id: string, stage: TodoStage) => {
    setActionsFor(null);
    mutate({ type: "move", id, stage, beforeId: null }, () =>
      moveTodo({ id, stage, beforeId: null })
    );
  };

  const handleDelete = (id: string) => {
    setActionsFor(null);
    mutate({ type: "remove", id }, () => deleteTodo(id));
  };

  const handleFlush = (stage: TodoStage) => {
    setFlushStage(null);
    mutate({ type: "flush", stage }, () => flushTodoStage(stage));
  };

  const activeTodo = board.find((todo) => todo.id === actionsFor) ?? null;
  const flushCount = flushStage ? todosInStage(board, flushStage).length : 0;

  return (
    <PageShell width="wide">
      <PageHeader
        eyebrow={`BOARD / ${board.length} ${board.length === 1 ? "ITEM" : "ITEMS"}`}
        title="Todos"
        actions={
          <SsButton
            mono
            onClick={() => setAddOpen(true)}
            leftIcon={<Plus size={14} strokeWidth={2.5} />}
          >
            Add todo
          </SsButton>
        }
      />

      {/*
        One board, two layouts. Below md the three stages stack as collapsed
        accordions — the page then scrolls one way instead of two, which is the
        difference between a board you can skim on a phone and one you have to
        swipe through to find out what is on it. At md it becomes an equal
        three-up grid and every stage is open at once.
      */}
      <div className="flex flex-col gap-3 md:grid md:grid-cols-3 md:items-start md:gap-4">
        {TODO_STAGES.map((def, index) => (
          <TodoColumn
            key={def.key}
            def={def}
            items={todosInStage(board, def.key)}
            previous={index > 0 ? TODO_STAGES[index - 1] : null}
            next={
              index < TODO_STAGES.length - 1 ? TODO_STAGES[index + 1] : null
            }
            // The first stage is the one you work out of, so it is the one the
            // mobile board opens on. Which stage that is stays a property of
            // TODO_STAGES rather than a name hard-coded in the column.
            defaultOpen={index === 0}
            dragId={dragId}
            dragOverStage={dragOverStage}
            dragBeforeId={dragBeforeId}
            onOpenChip={setActionsFor}
            onDragStart={setDragId}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={endDrag}
            onMoveAll={handleMoveAll}
            onFlush={setFlushStage}
          />
        ))}
      </div>

      <p className="text-faint flex items-start gap-2 font-mono text-[10px] tracking-[0.08em]">
        <ArrowRight size={12} className="mt-px shrink-0" />
        <span>
          <span className="hidden md:inline">DRAG A CHIP BETWEEN COLUMNS</span>
          <span className="md:hidden">
            TAP A STAGE TO OPEN IT · TAP A CHIP TO MOVE IT
          </span>
          {" · BULK ACTIONS MOVE EVERY ITEM"}
        </span>
      </p>

      <AddTodoDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={handleAdd}
      />

      <TodoActionsDialog
        todo={activeTodo}
        onClose={() => setActionsFor(null)}
        onMove={(stage) => activeTodo && handleMoveOne(activeTodo.id, stage)}
        onDelete={() => activeTodo && handleDelete(activeTodo.id)}
      />

      <FlushColumnDialog
        stage={flushStage}
        count={flushCount}
        onClose={() => setFlushStage(null)}
        onConfirm={() => flushStage && handleFlush(flushStage)}
      />
    </PageShell>
  );
}
