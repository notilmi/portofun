"use server";

import ChapterService from "@/domain/services/chapter.service";
import {
  createChapterSchema,
  deleteChapterSchema,
  getChapterByIdSchema,
  listChaptersByCourseSchema,
  resequenceChaptersSchema,
  updateChapterSchema,
  type CreateChapterInput,
  type DeleteChapterInput,
  type GetChapterByIdInput,
  type ListChaptersByCourseInput,
  type ResequenceChaptersInput,
  type UpdateChapterInput,
} from "@/domain/services/schema/chapter.schema";
import {
  handleServerActionError,
  type ServerActionResponse,
  validateInput,
} from "@/server/actions/_common";
import { getSessionThrowable } from "@/server/actions/auth";
import { updateTag } from "next/cache";
import { cacheLife } from "next/cache";
import { cacheTag } from "next/cache";

type CreatedChapterPayload = {
  id: string;
  courseId: string;
  title: string;
  sequenceOrder: number;
};

/**
 * Read Actions
 */

export async function getChapterById(input: GetChapterByIdInput) {
  "use cache";
  cacheTag("chapterById", input.id);
  cacheLife("hours");

  const parsedInput = validateInput(getChapterByIdSchema, input);
  return ChapterService.getChapterById(parsedInput);
}

export async function getChaptersByCourse(input: ListChaptersByCourseInput) {
  "use cache";
  cacheTag("chaptersByCourse", input.courseId);
  cacheLife("hours");

  const parsedInput = validateInput(listChaptersByCourseSchema, input);
  return ChapterService.listChaptersByCourse(parsedInput);
}

/**
 * Write Actions
 *
 * NOTE:
 * - These return `ServerActionResponse<void>` to standardize error handling.
 * - They also enforce auth where appropriate.
 */

export async function createChapter(
  input: CreateChapterInput,
): Promise<ServerActionResponse<CreatedChapterPayload>> {
  try {
    await getSessionThrowable(true);
    const parsedInput = validateInput(createChapterSchema, input);

    const created = await ChapterService.createChapter(parsedInput);

    updateTag("chaptersByCourse");
    updateTag("courseHierarchy");
    updateTag(parsedInput.courseId);
    return {
      id: created.id,
      courseId: created.courseId,
      title: created.title,
      sequenceOrder: created.sequenceOrder,
    };
  } catch (error) {
    return handleServerActionError(error);
  }
}

export async function updateChapter(
  input: UpdateChapterInput,
): Promise<ServerActionResponse<void>> {
  try {
    await getSessionThrowable(true);
    const parsedInput = validateInput(updateChapterSchema, input);

    const updated = await ChapterService.updateChapter(parsedInput);

    updateTag("chapterById");
    updateTag(parsedInput.id);
    updateTag("chaptersByCourse");
    updateTag("courseHierarchy");
    updateTag(updated.courseId);
  } catch (error) {
    return handleServerActionError(error);
  }
}

export async function deleteChapter(
  input: DeleteChapterInput,
): Promise<ServerActionResponse<void>> {
  try {
    await getSessionThrowable(true);
    const parsedInput = validateInput(deleteChapterSchema, input);

    const deleted = await ChapterService.deleteChapter(parsedInput);

    updateTag("chapterById");
    updateTag(parsedInput.id);
    updateTag("chaptersByCourse");
    updateTag("courseHierarchy");
    updateTag(deleted.courseId);
  } catch (error) {
    return handleServerActionError(error);
  }
}

export async function resequenceChapters(
  input: ResequenceChaptersInput,
): Promise<ServerActionResponse<void>> {
  try {
    await getSessionThrowable(true);
    const parsedInput = validateInput(resequenceChaptersSchema, input);

    await ChapterService.resequenceChapters(parsedInput);

    updateTag("chaptersByCourse");
    updateTag("courseHierarchy");
    updateTag(parsedInput.courseId);
  } catch (error) {
    return handleServerActionError(error);
  }
}
