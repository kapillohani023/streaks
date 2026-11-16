"use server";
import { revalidatePath } from "next/cache";
import { auth } from "@/app/auth";
import {
  addStreakEntryForUser,
  deleteStreakEntryForUser,
  markStreakCompletedOnDateForUser,
  markStreakCompletedTodayForUser,
  updateStreakEntryForUser,
} from "@/lib/streak-service";

export async function createStreakEntry(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const streakId = formData.get("streakId") as string;
  const date = formData.get("date") as string;
  const completed = formData.get("completed") as string;
  const note = formData.get("note") as string;

  const entry = await addStreakEntryForUser(session.user.id, {
    streakId,
    date,
    completed: completed === "true",
    note,
  });

  revalidatePath("/", "layout");
  return entry;
}

/**
 * Check in for today with the same idempotent path the MCP tool uses, so the
 * UI can't create a second "today" row if the user double-submits.
 */
export async function markStreakCompletedToday(input: {
  streakId: string;
  note?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const result = await markStreakCompletedTodayForUser(session.user.id, {
    streakId: input.streakId,
    note: input.note,
  });

  revalidatePath("/", "layout");
  return result;
}

/**
 * Backfill a completed day. `date` is a local calendar "YYYY-MM-DD" — the
 * service interprets it in the owner's timezone and rejects futures / pre-start.
 */
export async function markStreakCompletedOnDate(input: {
  streakId: string;
  date: string;
  note?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const result = await markStreakCompletedOnDateForUser(session.user.id, {
    streakId: input.streakId,
    date: input.date,
    note: input.note,
  });

  revalidatePath("/", "layout");
  return result;
}

export async function updateStreakEntry(input: {
  streakId: string;
  entryId: string;
  date?: string;
  note?: string | null;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const entry = await updateStreakEntryForUser(session.user.id, input);

  revalidatePath("/", "layout");
  return entry;
}

export async function deleteStreakEntry(streakId: string, entryId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const result = await deleteStreakEntryForUser(session.user.id, {
    streakId,
    entryId,
  });

  revalidatePath("/", "layout");
  return result;
}
