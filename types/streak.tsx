import { z } from "zod";
import { StreakEntrySchema } from "@/types/streak-entry";
import { normalizeToMidnight } from "@/lib/util";

export const StreakSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  startDate: z.coerce.date().transform(normalizeToMidnight),
  /** Reminder intent — may be true even when no device can receive push. */
  reminderEnabled: z.boolean().default(false),
  /** Local wall-clock "HH:MM" in the owner's timezone. */
  reminderTime: z.string().optional(),
  entries: z.array(StreakEntrySchema),
});

export type Streak = z.infer<typeof StreakSchema>;
