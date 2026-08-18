"use server";
import { revalidatePath } from "next/cache";
import { auth } from "@/app/auth";
import {
  createTodoForUser,
  deleteTodoForUser,
  flushStageForUser,
  moveStageForUser,
  moveTodoForUser,
} from "@/lib/todo-service";
import { TODO_TEXT_MAX, TodoStageSchema, type TodoStage } from "@/types/todo";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

/*
  The board lives on one route and is not summarised anywhere else, so these
  revalidate `/todos` alone rather than the whole layout the streak actions
  have to invalidate.
*/

export async function addTodo(input: { text: string; stage: string }) {
  const userId = await requireUserId();

  const text = input.text.trim();
  if (!text) throw new Error("Task is required");
  if (text.length > TODO_TEXT_MAX) {
    throw new Error(`Task must be ${TODO_TEXT_MAX} characters or fewer`);
  }

  const todo = await createTodoForUser(userId, {
    text,
    stage: parseStage(input.stage),
  });

  revalidatePath("/todos");
  return todo;
}

export async function moveTodo(input: {
  id: string;
  stage: string;
  beforeId: string | null;
}) {
  const userId = await requireUserId();
  await moveTodoForUser(userId, {
    id: input.id,
    stage: parseStage(input.stage),
    beforeId: input.beforeId,
  });
  revalidatePath("/todos");
}

export async function moveAllTodos(input: { from: string; to: string }) {
  const userId = await requireUserId();
  await moveStageForUser(userId, parseStage(input.from), parseStage(input.to));
  revalidatePath("/todos");
}

export async function deleteTodo(id: string) {
  const userId = await requireUserId();
  await deleteTodoForUser(userId, id);
  revalidatePath("/todos");
}

export async function flushTodoStage(stage: string) {
  const userId = await requireUserId();
  await flushStageForUser(userId, parseStage(stage));
  revalidatePath("/todos");
}

/**
 * Stage names cross the wire as strings, so every action re-validates rather
 * than trusting the client's word for which column a chip belongs in.
 */
function parseStage(value: string): TodoStage {
  const parsed = TodoStageSchema.safeParse(value);
  if (!parsed.success) throw new Error(`Unknown stage: ${value}`);
  return parsed.data;
}
