import { z } from "zod";

/**
 * Client-side form validation schema for editing chapter
 * Simpler than server schema - only allows title editing
 */
export const editChapterFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Judul bab wajib diisi")
    .max(120, "Judul terlalu panjang"),
});

export type EditChapterFormValues = z.infer<typeof editChapterFormSchema>;
