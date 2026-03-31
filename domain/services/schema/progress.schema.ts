import { z } from "zod";

/**
 * Progress / Quiz input schemas & inferred types for the service layer.
 *
 * IMPORTANT:
 * - These schemas are intended to be used by the Server Action / Controller layer.
 * - Services should accept the inferred types WITHOUT re-validating.
 *
 * Domain notes:
 * - `markMaterialCompleted` is idempotent in the service.
 * - Quiz validation should be performed in the service (business rule),
 *   but input shape validation belongs upstream (server action).
 */

export const uuidSchema = z.string().uuid();

/**
 * Mark a material completed (idempotent).
 */
export const markMaterialCompletedSchema = z.object({
  userId: z.string(),
  materialId: uuidSchema,
});

export type MarkMaterialCompletedInput = z.infer<
  typeof markMaterialCompletedSchema
>;

/**
 * Represents a user's answer payload for a quiz question.
 *
 * Note:
 * - The service will validate against `QuizQuestion.correctAnswer`.
 */
export const quizAnswerSchema = z.object({
  questionId: uuidSchema,
  answer: z.string(),
});

export type QuizAnswerInput = z.infer<typeof quizAnswerSchema>;

/**
 * Validate quiz answers for a quiz material, then mark completed.
 */
export const validateQuizAndCompleteSchema = z.object({
  userId: z.string(),
  materialId: uuidSchema,
  answers: z.array(quizAnswerSchema),
});

export type ValidateQuizAndCompleteInput = z.infer<
  typeof validateQuizAndCompleteSchema
>;

/**
 * Get a user progress record for a material.
 */
export const getProgressSchema = z.object({
  userId: z.string(),
  materialId: uuidSchema,
});

export type GetProgressInput = z.infer<typeof getProgressSchema>;

/**
 * List progress for all materials in a course for a user.
 */
export const listCourseProgressSchema = z.object({
  userId: z.string(),
  courseId: uuidSchema,
});

export type ListCourseProgressInput = z.infer<typeof listCourseProgressSchema>;
