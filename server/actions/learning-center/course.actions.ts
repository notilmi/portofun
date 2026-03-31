"use server";

import CourseService from "@/domain/services/course.service";
import {
  archiveCourseSchema,
  createCourseSchema,
  deleteCourseSchema,
  getCourseByIdSchema,
  getCourseHierarchySchema,
  listCoursesSchema,
  unarchiveCourseSchema,
  updateCourseSchema,
  type ArchiveCourseInput,
  type CreateCourseInput,
  type DeleteCourseInput,
  type GetCourseByIdInput,
  type GetCourseHierarchyInput,
  type ListCoursesInput,
  type UnarchiveCourseInput,
  type UpdateCourseInput,
} from "@/domain/services/schema/course.schema";
import {
  handleServerActionError,
  type ServerActionResponse,
  validateInput,
} from "@/server/actions/_common";
import { getSessionThrowable } from "@/server/actions/auth";
import { updateTag } from "next/cache";
import { cacheLife } from "next/cache";
import { cacheTag } from "next/cache";

type CreatedCoursePayload = {
  id: string;
  title: string;
  description: string;
  isArchived: boolean;
};

/**
 * Read Actions
 */

export async function getCourses(input?: ListCoursesInput) {
  "use cache";
  cacheTag("courses");
  cacheLife("hours");

  const parsedInput = validateInput(listCoursesSchema, input);
  return CourseService.listCourses(parsedInput);
}

export async function getCourseById(input: GetCourseByIdInput) {
  "use cache";
  cacheTag("courseById", input.id);
  cacheLife("hours");
  
  const parsedInput = validateInput(getCourseByIdSchema, input);
  return CourseService.getCourseById(parsedInput);
}

export async function getCourseHierarchy(input: GetCourseHierarchyInput) {
  "use cache";
  cacheTag("courseHierarchy", input.courseId);
  cacheLife("hours");

  const parsedInput = validateInput(getCourseHierarchySchema, input);
  return CourseService.getCourseHierarchy(parsedInput);
}

/**
 * Write Actions
 *
 * NOTE:
 * - These return `ServerActionResponse<void>` to standardize error handling.
 * - They also enforce auth where appropriate.
 */

export async function createCourse(
  input: CreateCourseInput,
): Promise<ServerActionResponse<CreatedCoursePayload>> {
  try {
    await getSessionThrowable(true);
    const parsedInput = validateInput(createCourseSchema, input);

    const created = await CourseService.createCourse(parsedInput);

    updateTag("courses");
    return {
      id: created.id,
      title: created.title,
      description: created.description ?? "",
      isArchived: created.isArchived,
    };
  } catch (error) {
    return handleServerActionError(error);
  }
}

export async function updateCourse(
  input: UpdateCourseInput,
): Promise<ServerActionResponse<void>> {
  try {
    await getSessionThrowable(true);
    const parsedInput = validateInput(updateCourseSchema, input);

    await CourseService.updateCourse(parsedInput);

    updateTag("courses");
    updateTag("courseById");
    updateTag("courseHierarchy");
    updateTag(parsedInput.id);
  } catch (error) {
    return handleServerActionError(error);
  }
}

export async function archiveCourse(
  input: ArchiveCourseInput,
): Promise<ServerActionResponse<void>> {
  try {
    await getSessionThrowable(true);
    const parsedInput = validateInput(archiveCourseSchema, input);

    await CourseService.archiveCourse(parsedInput);

    updateTag("courses");
    updateTag("courseById");
    updateTag("courseHierarchy");
    updateTag(parsedInput.id);
  } catch (error) {
    return handleServerActionError(error);
  }
}

export async function unarchiveCourse(
  input: UnarchiveCourseInput,
): Promise<ServerActionResponse<void>> {
  try {
    await getSessionThrowable(true);
    const parsedInput = validateInput(unarchiveCourseSchema, input);

    await CourseService.unarchiveCourse(parsedInput);

    updateTag("courses");
    updateTag("courseById");
    updateTag("courseHierarchy");
    updateTag(parsedInput.id);
  } catch (error) {
    return handleServerActionError(error);
  }
}

export async function deleteCourse(
  input: DeleteCourseInput,
): Promise<ServerActionResponse<void>> {
  try {
    await getSessionThrowable(true);
    const parsedInput = validateInput(deleteCourseSchema, input);

    await CourseService.deleteCourse(parsedInput);

    updateTag("courses");
    updateTag("courseById");
    updateTag("courseHierarchy");
    updateTag(parsedInput.id);
  } catch (error) {
    return handleServerActionError(error);
  }
}
