import { z } from "zod";
import { normalizeToMidnight } from "@/lib/util";

export const StreakEntrySchema = z.object({
  id: z.string(),
  date: z.coerce.date().transform(normalizeToMidnight),
  completed: z.boolean(),
  note: z.string().optional(),
});

export type StreakEntry = z.infer<typeof StreakEntrySchema>;
