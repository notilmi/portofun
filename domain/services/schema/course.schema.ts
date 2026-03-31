import { z } from "zod";

/**
 * Course input schemas & inferred types for the service layer.
 *
 * IMPORTANT:
 * - These schemas are intended to be used by the Server Action / Controller layer.
 * - Services should accept the inferred types WITHOUT re-validating.
 */

export const uuidSchema = z.string().uuid();

export const createCourseSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description is required"),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;

export const getCourseByIdSchema = z.object({
  id: uuidSchema,
});

export type GetCourseByIdInput = z.infer<typeof getCourseByIdSchema>;

export const listCoursesSchema = z
  .object({
    /**
     * If provided, filter archived/non-archived courses.
     * - true  => only archived
     * - false => only active
     */
    isArchived: z.boolean().optional(),

    /**
     * Pagination
     */
    skip: z.number().int().min(0).optional(),
    take: z.number().int().min(1).max(100).optional(),

    /**
     * Ordering
     */
    orderBy: z
      .enum(["createdAt", "updatedAt", "title"])
      .optional()
      .default("createdAt"),
    orderDirection: z.enum(["asc", "desc"]).optional().default("desc"),
  })
  .optional();

export type ListCoursesInput = z.infer<typeof listCoursesSchema>;

export const updateCourseSchema = z
  .object({
    id: uuidSchema,
    title: z.string().trim().min(1, "Title is required").optional(),
    description: z.string().trim().min(1, "Description is required").optional(),
    /**
     * Allow toggling archive state via update as well (optional).
     * Prefer explicit `archiveCourse`/`unarchiveCourse` service methods for intent.
     */
    isArchived: z.boolean().optional(),
  })
  .refine(
    (v) =>
      v.title !== undefined ||
      v.description !== undefined ||
      v.isArchived !== undefined,
    {
      message:
        "At least one field must be provided to update (title, description, isArchived)",
      path: ["title"],
    },
  );

export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

export const archiveCourseSchema = z.object({
  id: uuidSchema,
});

export type ArchiveCourseInput = z.infer<typeof archiveCourseSchema>;

export const unarchiveCourseSchema = z.object({
  id: uuidSchema,
});

export type UnarchiveCourseInput = z.infer<typeof unarchiveCourseSchema>;

export const deleteCourseSchema = z.object({
  id: uuidSchema,
});

export type DeleteCourseInput = z.infer<typeof deleteCourseSchema>;

export const getCourseHierarchySchema = z.object({
  courseId: uuidSchema,
});

export type GetCourseHierarchyInput = z.infer<typeof getCourseHierarchySchema>;
