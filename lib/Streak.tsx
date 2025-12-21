import { z } from "zod";
import { StreakEntrySchema } from "./StreakEntry";

export const StreakSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    startDate: z.number(), // Store as timestamp for localStorage persistence
    entries: z.array(StreakEntrySchema)
});

export type Streak = z.infer<typeof StreakSchema>;