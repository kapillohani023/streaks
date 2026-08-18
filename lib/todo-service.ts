import "server-only";
import { prisma } from "@/lib/db";
import { moveTodo, moveAllTodos } from "@/lib/todo-board";
import {
  TODO_TEXT_MAX,
  TodoStageSchema,
  type Todo,
  type TodoStage,
} from "@/types/todo";

type TodoRow = { id: string; text: string; stage: string };

/**
 * An unrecognised `stage` falls back to the first column rather than throwing.
 * The column is a plain string in the database, so a row written by an older
 * or newer build must not be able to take the whole board down — the worst case
 * is a chip that needs dragging back where it belongs.
 */
function parseTodo(row: TodoRow): Todo {
  const stage = TodoStageSchema.safeParse(row.stage);
  return {
    id: row.id,
    text: row.text,
    stage: stage.success ? stage.data : "todo",
  };
}

/** The user's board as one ordered list; columns are this filtered by stage. */
export async function getTodosForUser(userId: string): Promise<Todo[]> {
  const rows = await prisma.todo.findMany({
    where: { userId },
    // `position` is not unique — two rows can tie after a bulk move — so `id`
    // supplies a total order and keeps successive reads in the same sequence.
    orderBy: [{ position: "asc" }, { id: "asc" }],
    select: { id: true, text: true, stage: true },
  });
  return rows.map(parseTodo);
}

export async function createTodoForUser(
  userId: string,
  input: { text: string; stage: TodoStage }
): Promise<Todo> {
  const text = input.text.trim().slice(0, TODO_TEXT_MAX);
  if (!text) throw new Error("Todo text is required");

  const last = await prisma.todo.findFirst({
    where: { userId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const row = await prisma.todo.create({
    data: {
      userId,
      text,
      stage: input.stage,
      position: (last?.position ?? -1) + 1,
    },
    select: { id: true, text: true, stage: true },
  });
  return parseTodo(row);
}

/**
 * Persist a reordered board.
 *
 * Positions are rewritten densely from zero rather than patched, and only rows
 * whose position or stage actually moved are written. Boards are small enough
 * that renumbering is cheap, and a dense sequence means no amount of dragging
 * can exhaust the gaps between neighbours the way midpoint insertion
 * eventually does.
 */
async function persistOrder(
  userId: string,
  before: Todo[],
  after: Todo[]
): Promise<void> {
  const previous = new Map(
    before.map((todo, index) => [todo.id, { index, stage: todo.stage }])
  );

  const writes = after.flatMap((todo, index) => {
    const was = previous.get(todo.id);
    if (was && was.index === index && was.stage === todo.stage) return [];
    return [
      prisma.todo.updateMany({
        where: { id: todo.id, userId },
        data: { position: index, stage: todo.stage },
      }),
    ];
  });

  if (writes.length > 0) await prisma.$transaction(writes);
}

/** Drag-and-drop: `id` moves into `stage`, ahead of `beforeId` (null = last). */
export async function moveTodoForUser(
  userId: string,
  input: { id: string; stage: TodoStage; beforeId: string | null }
): Promise<void> {
  const todos = await getTodosForUser(userId);
  if (!todos.some((todo) => todo.id === input.id)) return;
  await persistOrder(
    userId,
    todos,
    moveTodo(todos, input.id, input.stage, input.beforeId)
  );
}

/**
 * Move one todo to a stage without saying where in the column it lands — it
 * goes last, the same place the actions dialog puts it.
 *
 * Unlike `moveTodoForUser` this reports what happened rather than shrugging at
 * an unknown id. The drag path can afford to no-op, because the id came from a
 * chip the user was holding; a caller working from an id it was *told* about
 * needs to know the difference between "moved" and "that isn't yours".
 */
export async function setTodoStageForUser(
  userId: string,
  input: { id: string; stage: TodoStage }
): Promise<{ todo: Todo; previousStage: TodoStage; changed: boolean }> {
  const todos = await getTodosForUser(userId);
  const todo = todos.find((t) => t.id === input.id);
  if (!todo) throw new Error(`No todo ${input.id} belonging to this user`);

  await persistOrder(
    userId,
    todos,
    moveTodo(todos, input.id, input.stage, null)
  );

  return {
    todo: { ...todo, stage: input.stage },
    previousStage: todo.stage,
    changed: todo.stage !== input.stage,
  };
}

/** Bulk escalate / de-escalate one column into its neighbour. */
export async function moveStageForUser(
  userId: string,
  from: TodoStage,
  to: TodoStage
): Promise<void> {
  const todos = await getTodosForUser(userId);
  await persistOrder(userId, todos, moveAllTodos(todos, from, to));
}

/** Returns false when the id matched nothing the user owns. */
export async function deleteTodoForUser(
  userId: string,
  id: string
): Promise<boolean> {
  // Scoped by userId so an id alone is never enough to delete someone else's.
  const { count } = await prisma.todo.deleteMany({ where: { id, userId } });
  return count > 0;
}

export async function flushStageForUser(
  userId: string,
  stage: TodoStage
): Promise<void> {
  await prisma.todo.deleteMany({ where: { userId, stage } });
}
