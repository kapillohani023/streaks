import { z } from "zod";
import { normalizeToMidnight } from "../utils/streak";

export const CreateStreakSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name is too long"),
    description: z.string().max(500, "Description is too long"),
    startDate: z.coerce.date().transform(normalizeToMidnight).optional(),
});

export const UpdateStreakSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name is too long").optional(),
    description: z.string().max(500, "Description is too long").optional(),
});

// StreakEntry input validation schemas
export const CreateStreakEntrySchema = z.object({
    date: z.coerce.date().transform(normalizeToMidnight),
    completed: z.boolean(),
    note: z.string().max(1000, "Note is too long").optional(),
});

export const UpdateStreakEntrySchema = z.object({
    completed: z.boolean().optional(),
    note: z.string().max(1000, "Note is too long").optional(),
});

// Type exports
export type CreateStreakInput = z.infer<typeof CreateStreakSchema>;
export type UpdateStreakInput = z.infer<typeof UpdateStreakSchema>;
export type CreateStreakEntryInput = z.infer<typeof CreateStreakEntrySchema>;
export type UpdateStreakEntryInput = z.infer<typeof UpdateStreakEntrySchema>;
