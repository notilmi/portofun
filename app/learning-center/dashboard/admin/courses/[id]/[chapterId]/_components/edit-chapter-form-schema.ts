import { z } from "zod";

/**
 * Client-side form validation schema for editing chapter
 * Simpler than server schema - only allows title editing
 */
export const editChapterFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Chapter title is required")
    .max(120, "Title is too long"),
});

export type EditChapterFormValues = z.infer<typeof editChapterFormSchema>;
