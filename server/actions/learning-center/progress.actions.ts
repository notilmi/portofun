"use server";

import ProgressService from "@/domain/services/progress.service";
import {
  getProgressSchema,
  listCourseProgressSchema,
  markMaterialCompletedSchema,
  validateQuizAndCompleteSchema,
  type GetProgressInput,
  type ListCourseProgressInput,
  type MarkMaterialCompletedInput,
  type ValidateQuizAndCompleteInput,
} from "@/domain/services/schema/progress.schema";
import {
  handleServerActionError,
  ServerActionError,
  type ServerActionResponse,
  validateInput,
} from "@/server/actions/_common";
import { getSessionThrowable } from "@/server/actions/auth";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";

/**
 * Read Actions
 */

export async function getProgress(input: GetProgressInput) {
  "use cache";
  cacheTag("progress", input.userId, input.materialId);
  cacheLife("hours");

  const parsedInput = validateInput(getProgressSchema, input);
  return ProgressService.getProgress(parsedInput);
}

export async function getCourseProgress(input: ListCourseProgressInput) {
  "use cache";
  cacheTag("courseProgress", input.userId, input.courseId);
  cacheLife("hours");

  const parsedInput = validateInput(listCourseProgressSchema, input);
  return ProgressService.listCourseProgress(parsedInput);
}

/**
 * Write Actions
 *
 * NOTE:
 * - These return `ServerActionResponse<void>` to standardize error handling.
 * - They also enforce auth where appropriate.
 */

export async function markMaterialCompleted(
  input: MarkMaterialCompletedInput,
): Promise<ServerActionResponse<void>> {
  try {
    // Any logged-in user can complete materials, but only for themselves.
    const session = await getSessionThrowable(false);
    const parsedInput = validateInput(markMaterialCompletedSchema, input);

    if (parsedInput.userId !== session.id) {
      throw new ServerActionError("Forbidden", "FORBIDDEN");
    }

    await ProgressService.markMaterialCompleted(parsedInput);

    // Only use supported cacheLife profiles here.
    revalidateTag("courseProgress", "max");
    revalidateTag("progress", "max");
  } catch (error) {
    return handleServerActionError(error);
  }
}

export type ValidateQuizAndCompleteResult = {
  correct: boolean;
  results: Array<{
    questionId: string;
    correct: boolean;
    expected: string;
    received: string;
  }>;
};

export async function validateQuizAndComplete(
  input: ValidateQuizAndCompleteInput,
): Promise<ServerActionResponse<ValidateQuizAndCompleteResult>> {
  try {
    // Any logged-in user can take quizzes, but only for themselves.
    const session = await getSessionThrowable(false);
    const parsedInput = validateInput(validateQuizAndCompleteSchema, input);

    if (parsedInput.userId !== session.id) {
      throw new ServerActionError("Forbidden", "FORBIDDEN");
    }

    const result = await ProgressService.validateQuizAndComplete(parsedInput);

    // Refresh progress caches.
    revalidateTag("courseProgress", "max");
    revalidateTag("progress", "max");

    return {
      correct: result.correct,
      results: result.results,
    };
  } catch (error) {
    return handleServerActionError(error);
  }
}
