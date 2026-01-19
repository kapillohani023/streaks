import { z } from "zod";
import { StreakEntrySchema } from "./streak-entry";
import { normalizeToMidnight } from "../lib/util";

export const StreakSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    startDate: z.coerce.date().transform(normalizeToMidnight),
    entries: z.array(StreakEntrySchema)
});

export type Streak = z.infer<typeof StreakSchema>;