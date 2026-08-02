"use server";
import { revalidatePath } from "next/cache";
import { auth } from "@/app/auth";
import {
  deleteAccountForUser,
  isRemindersSnoozedForUser,
  setRemindersSnoozedForUser,
} from "@/lib/account-service";
import { DELETE_CONFIRMATION } from "@/lib/account";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

/**
 * The client also checks the phrase before enabling its button, but that check
 * is cosmetic — a server action is a public endpoint, so the real gate is here.
 */
function assertConfirmed(input: string, expected: string) {
  if (input.trim().toLowerCase() !== expected) {
    throw new Error(`Type "${expected}" to confirm`);
  }
}

export async function getAccountSettings(): Promise<{
  remindersSnoozed: boolean;
}> {
  const userId = await requireUserId();
  return { remindersSnoozed: await isRemindersSnoozedForUser(userId) };
}

export async function setRemindersSnoozed(snoozed: boolean): Promise<void> {
  const userId = await requireUserId();
  await setRemindersSnoozedForUser(userId, snoozed);
  revalidatePath("/", "layout");
}

export async function deleteAccount(confirmation: string): Promise<void> {
  const userId = await requireUserId();
  assertConfirmed(confirmation, DELETE_CONFIRMATION);

  await deleteAccountForUser(userId);
  revalidatePath("/", "layout");
}
