import { z } from "zod";

/**
 * Chapter input validation schemas for the service layer.
 *
 * Goal:
 * - Validate *service-layer* inputs (not Prisma inputs) and provide strong typing
 *   via `z.infer<>`.
 *
 * Notes:
 * - `sequenceOrder` is optional on create and update. The service will:
 *   - Create: append to end when omitted
 *   - Reorder: clamp and shift other chapters to keep contiguous ordering
 */

/**
 * Common UUID schema used by our domain.
 */
export const uuidSchema = z.string().uuid();

/**
 * Create Chapter input.
 *
 * This is intentionally decoupled from Prisma types.
 * The service should translate this into Prisma calls.
 */
export const createChapterSchema = z.object({
  courseId: uuidSchema,
  title: z.string().trim().min(1, "Title is required"),
  /**
   * Optional desired chapter position in the course.
   * If omitted, chapter is appended to the end.
   */
  sequenceOrder: z
    .number()
    .int("sequenceOrder must be an integer")
    .positive("sequenceOrder must be >= 1")
    .optional(),
});

export type CreateChapterInput = z.infer<typeof createChapterSchema>;

/**
 * Update Chapter input.
 *
 * `title` and/or `sequenceOrder` must be provided.
 */
export const updateChapterSchema = z
  .object({
    id: uuidSchema,
    title: z.string().trim().min(1, "Title is required").optional(),
    /**
     * Optional requested position within the course.
     * If present, service will reorder within the chapter's course.
     */
    sequenceOrder: z
      .number()
      .int("sequenceOrder must be an integer")
      .positive("sequenceOrder must be >= 1")
      .optional(),
  })
  .refine((val) => val.title !== undefined || val.sequenceOrder !== undefined, {
    message:
      "At least one field must be provided to update (title, sequenceOrder)",
    path: ["title"],
  });

export type UpdateChapterInput = z.infer<typeof updateChapterSchema>;

/**
 * Delete Chapter input.
 */
export const deleteChapterSchema = z.object({
  id: uuidSchema,
});

export type DeleteChapterInput = z.infer<typeof deleteChapterSchema>;

/**
 * Get Chapter by id input.
 */
export const getChapterByIdSchema = z.object({
  id: uuidSchema,
});

export type GetChapterByIdInput = z.infer<typeof getChapterByIdSchema>;

/**
 * List chapters by course input.
 */
export const listChaptersByCourseSchema = z.object({
  courseId: uuidSchema,
});

export type ListChaptersByCourseInput = z.infer<
  typeof listChaptersByCourseSchema
>;

/**
 * Resequence chapters input.
 */
export const resequenceChaptersSchema = z.object({
  courseId: uuidSchema,
});

export type ResequenceChaptersInput = z.infer<typeof resequenceChaptersSchema>;
