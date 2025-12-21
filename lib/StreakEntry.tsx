import { z } from "zod";

export const StreakEntrySchema = z.object({
    id: z.string(),
    date: z.number(), // Store as timestamp for localStorage persistence
    completed: z.boolean(),
    note: z.string().optional(),
});

export type StreakEntry = z.infer<typeof StreakEntrySchema>;