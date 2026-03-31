import { z } from "zod";

/**
 * Enrollment input schemas & inferred types for the service layer.
 *
 * IMPORTANT:
 * - These schemas are intended to be used by the Server Action / Controller layer.
 * - Services should accept the inferred types WITHOUT re-validating.
 *
 * Domain rules that services will enforce (not via schema):
 * - Idempotent enrollment under @@unique([userId, courseId])
 *   - If ACTIVE/COMPLETED => "Already enrolled" error (standardized service error)
 *   - If DROPPED => transition back to ACTIVE
 * - Explicit status transitions via markAsCompleted / dropCourse
 */

export const uuidSchema = z.string().uuid();

export const enrollmentStatusSchema = z.enum(["ACTIVE", "COMPLETED", "DROPPED"]);
export type EnrollmentStatus = z.infer<typeof enrollmentStatusSchema>;

/**
 * Enroll a user in a course (idempotent behavior in service).
 */
export const enrollUserSchema = z.object({
  userId: z.string(),
  courseId: uuidSchema,
});
export type EnrollUserInput = z.infer<typeof enrollUserSchema>;

/**
 * Lookup enrollment by id.
 */
export const getEnrollmentByIdSchema = z.object({
  id: uuidSchema,
});
export type GetEnrollmentByIdInput = z.infer<typeof getEnrollmentByIdSchema>;

/**
 * Lookup enrollment by unique composite (userId, courseId).
 */
export const getEnrollmentSchema = z.object({
  userId: z.string(),
  courseId: uuidSchema,
});
export type GetEnrollmentInput = z.infer<typeof getEnrollmentSchema>;

/**
 * List enrollments for a course with optional status and pagination.
 */
export const listEnrollmentsByCourseSchema = z.object({
  courseId: uuidSchema,
  status: enrollmentStatusSchema.optional(),
  skip: z.number().int().min(0).optional(),
  take: z.number().int().min(1).max(100).optional(),
});
export type ListEnrollmentsByCourseInput = z.infer<
  typeof listEnrollmentsByCourseSchema
>;

/**
 * List enrollments for a user with optional status and pagination.
 */
export const listEnrollmentsByUserSchema = z.object({
  userId: z.string(),
  status: enrollmentStatusSchema.optional(),
  skip: z.number().int().min(0).optional(),
  take: z.number().int().min(1).max(100).optional(),
});
export type ListEnrollmentsByUserInput = z.infer<
  typeof listEnrollmentsByUserSchema
>;

/**
 * Mark enrollment as completed (service sets status to COMPLETED).
 */
export const markAsCompletedSchema = z.object({
  userId: z.string(),
  courseId: uuidSchema,
});
export type MarkAsCompletedInput = z.infer<typeof markAsCompletedSchema>;

/**
 * Drop a course (service sets status to DROPPED).
 */
export const dropCourseSchema = z.object({
  userId: z.string(),
  courseId: uuidSchema,
});
export type DropCourseInput = z.infer<typeof dropCourseSchema>;

/**
 * Update enrollment status explicitly (prefer markAsCompleted/dropCourse for intent).
 */
export const updateEnrollmentStatusSchema = z.object({
  enrollmentId: uuidSchema,
  status: enrollmentStatusSchema,
});
export type UpdateEnrollmentStatusInput = z.infer<
  typeof updateEnrollmentStatusSchema
>;

/**
 * Delete enrollment (hard delete).
 */
export const deleteEnrollmentSchema = z.object({
  enrollmentId: uuidSchema,
});
export type DeleteEnrollmentInput = z.infer<typeof deleteEnrollmentSchema>;
