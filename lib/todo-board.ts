import type { Todo, TodoStage } from "@/types/todo";

/**
 * Board arithmetic, as pure list transforms.
 *
 * These run twice for every gesture: once on the client to move the chip before
 * the network is involved, and once on the server to work out which rows to
 * rewrite. Sharing the functions is the point — a drop that lands between two
 * chips optimistically and after a different rule server-side would snap back
 * on refresh, and that snap is exactly the bug this file exists to prevent.
 */

/** Index just past the last item of `stage`, or the end of the list. */
function endOfStage(todos: Todo[], stage: TodoStage): number {
  let last = -1;
  todos.forEach((todo, index) => {
    if (todo.stage === stage) last = index;
  });
  return last + 1;
}

/**
 * Move `id` into `stage`, landing immediately before `beforeId`.
 *
 * A null `beforeId` — dropped on the column's empty space rather than on a
 * chip — appends to the end of that column rather than the end of the whole
 * list, so the item stays inside the column it was dropped on.
 */
export function moveTodo(
  todos: Todo[],
  id: string,
  stage: TodoStage,
  beforeId: string | null
): Todo[] {
  const moving = todos.find((todo) => todo.id === id);
  if (!moving) return todos;

  const rest = todos.filter((todo) => todo.id !== id);
  const target =
    beforeId && beforeId !== id
      ? rest.findIndex((todo) => todo.id === beforeId)
      : -1;
  const at = target < 0 ? endOfStage(rest, stage) : target;

  const next = rest.slice();
  next.splice(at, 0, { ...moving, stage });
  return next;
}

/** Bulk escalate / de-escalate: every chip in `from` lands in `to`. */
export function moveAllTodos(
  todos: Todo[],
  from: TodoStage,
  to: TodoStage
): Todo[] {
  return todos.map((todo) =>
    todo.stage === from ? { ...todo, stage: to } : todo
  );
}

export function removeTodo(todos: Todo[], id: string): Todo[] {
  return todos.filter((todo) => todo.id !== id);
}

export function flushStage(todos: Todo[], stage: TodoStage): Todo[] {
  return todos.filter((todo) => todo.stage !== stage);
}

/** New chips join at the end of the list, so they land last in their column. */
export function appendTodo(todos: Todo[], todo: Todo): Todo[] {
  return todos.concat(todo);
}

export function todosInStage(todos: Todo[], stage: TodoStage): Todo[] {
  return todos.filter((todo) => todo.stage === stage);
}

export type BoardAction =
  | { type: "add"; todo: Todo }
  | { type: "move"; id: string; stage: TodoStage; beforeId: string | null }
  | { type: "moveAll"; from: TodoStage; to: TodoStage }
  | { type: "remove"; id: string }
  | { type: "flush"; stage: TodoStage };

export function reduceBoard(todos: Todo[], action: BoardAction): Todo[] {
  switch (action.type) {
    case "add":
      return appendTodo(todos, action.todo);
    case "move":
      return moveTodo(todos, action.id, action.stage, action.beforeId);
    case "moveAll":
      return moveAllTodos(todos, action.from, action.to);
    case "remove":
      return removeTodo(todos, action.id);
    case "flush":
      return flushStage(todos, action.stage);
  }
}
