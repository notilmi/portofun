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
    await getSessionThrowable(true);
    const parsedInput = validateInput(markMaterialCompletedSchema, input);

    await ProgressService.markMaterialCompleted(parsedInput);

    revalidateTag("courseProgress", "max");
    revalidateTag(parsedInput.userId, "max");
    revalidateTag(parsedInput.materialId, "max");
  } catch (error) {
    return handleServerActionError(error);
  }
}

export async function validateQuizAndComplete(
  input: ValidateQuizAndCompleteInput,
): Promise<ServerActionResponse<void>> {
  try {
    await getSessionThrowable(true);
    const parsedInput = validateInput(validateQuizAndCompleteSchema, input);

    await ProgressService.validateQuizAndComplete(parsedInput);

    revalidateTag("courseProgress", "max");
    revalidateTag(parsedInput.userId, "max");
    revalidateTag(parsedInput.materialId, "max");
  } catch (error) {
    return handleServerActionError(error);
  }
}
