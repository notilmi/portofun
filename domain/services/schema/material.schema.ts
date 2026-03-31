import { z } from "zod";

/**
 * Material input schemas & inferred types for the service layer.
 *
 * IMPORTANT:
 * - These schemas are intended to be used by the Server Action / Controller layer.
 * - Services should accept the inferred types WITHOUT re-validating.
 *
 * Domain notes:
 * - `type` is a String in Prisma, but in the domain we treat it as a strict union.
 * - For polymorphic validation rules:
 *   - markdown => requires `content`
 *   - video    => requires `videoUrl`
 *   - quiz     => requires `quizQuestions` (non-empty)
 *   These validations should be done upstream (server action). The service will assume inputs conform.
 */

export const uuidSchema = z.string().uuid();

export const materialTypeSchema = z.enum(["markdown", "video", "quiz"]);
export type MaterialType = z.infer<typeof materialTypeSchema>;

export const quizQuestionInputSchema = z.object({
  question: z.string().trim().min(1, "Question is required"),
  answer: z.string().trim().min(1, "Answer is required"),
  correctAnswer: z.string().trim().min(1, "Correct answer is required"),
});
export type QuizQuestionInput = z.infer<typeof quizQuestionInputSchema>;

/**
 * Create Material input.
 *
 * - `sequenceOrder` is optional; if omitted, material is appended to the end of the chapter.
 * - `quizQuestions` is only meaningful when `type === "quiz"`.
 * - `content` is only meaningful when `type === "markdown"`.
 * - `videoUrl` is only meaningful when `type === "video"`.
 */
export const createMaterialSchema = z.object({
  chapterId: uuidSchema,
  title: z.string().trim().min(1, "Title is required"),
  type: materialTypeSchema,
  content: z.string().min(1).optional(),
  videoUrl: z.string().url("videoUrl must be a valid URL").optional(),
  sequenceOrder: z.number().int().positive().optional(),
  quizQuestions: z.array(quizQuestionInputSchema).optional(),
});
export type CreateMaterialInput = z.infer<typeof createMaterialSchema>;

/**
 * Update Material input.
 *
 * Notes:
 * - `sequenceOrder` (if provided) requests a reorder within the current chapter.
 * - If `quizQuestions` is provided while resulting type is `quiz`, the service may replace the full set.
 */
export const updateMaterialSchema = z
  .object({
    id: uuidSchema,
    title: z.string().trim().min(1, "Title is required").optional(),
    type: materialTypeSchema.optional(),
    content: z.string().min(1).optional(),
    videoUrl: z.string().url("videoUrl must be a valid URL").optional(),
    isArchived: z.boolean().optional(),
    sequenceOrder: z.number().int().positive().optional(),
    quizQuestions: z.array(quizQuestionInputSchema).optional(),
  })
  .refine(
    (v) =>
      v.title !== undefined ||
      v.type !== undefined ||
      v.content !== undefined ||
      v.videoUrl !== undefined ||
      v.isArchived !== undefined ||
      v.sequenceOrder !== undefined ||
      v.quizQuestions !== undefined,
    {
      message:
        "At least one field must be provided to update (title, type, content, videoUrl, isArchived, sequenceOrder, quizQuestions)",
      path: ["title"],
    },
  );
export type UpdateMaterialInput = z.infer<typeof updateMaterialSchema>;

export const getMaterialByIdSchema = z.object({
  id: uuidSchema,
  includeQuizQuestions: z.boolean().optional(),
});
export type GetMaterialByIdInput = z.infer<typeof getMaterialByIdSchema>;

export const listMaterialsByChapterSchema = z.object({
  chapterId: uuidSchema,
  includeArchived: z.boolean().optional(),
});
export type ListMaterialsByChapterInput = z.infer<
  typeof listMaterialsByChapterSchema
>;

export const deleteMaterialSchema = z.object({
  id: uuidSchema,
});
export type DeleteMaterialInput = z.infer<typeof deleteMaterialSchema>;

export const archiveMaterialSchema = z.object({
  id: uuidSchema,
});
export type ArchiveMaterialInput = z.infer<typeof archiveMaterialSchema>;

export const resequenceMaterialsSchema = z.object({
  chapterId: uuidSchema,
});
export type ResequenceMaterialsInput = z.infer<typeof resequenceMaterialsSchema>;
