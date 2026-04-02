"use server";

import EnrollmentService from "@/domain/services/enrollment.service";
import {
  deleteEnrollmentSchema,
  dropCourseSchema,
  enrollUserSchema,
  getEnrollmentByIdSchema,
  getEnrollmentSchema,
  listEnrollmentsByCourseSchema,
  listEnrollmentsByUserSchema,
  markAsCompletedSchema,
  updateEnrollmentStatusSchema,
  type DeleteEnrollmentInput,
  type DropCourseInput,
  type EnrollUserInput,
  type GetEnrollmentByIdInput,
  type GetEnrollmentInput,
  type ListEnrollmentsByCourseInput,
  type ListEnrollmentsByUserInput,
  type MarkAsCompletedInput,
  type UpdateEnrollmentStatusInput,
} from "@/domain/services/schema/enrollment.schema";
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

export async function getEnrollmentById(input: GetEnrollmentByIdInput) {
  "use cache";
  cacheTag("enrollmentById", input.id);
  cacheLife("hours");

  const parsedInput = validateInput(getEnrollmentByIdSchema, input);
  return EnrollmentService.getEnrollmentById(parsedInput);
}

export async function getEnrollment(input: GetEnrollmentInput) {
  "use cache";
  cacheTag("enrollment", input.userId, input.courseId);
  cacheLife("hours");

  const parsedInput = validateInput(getEnrollmentSchema, input);
  return EnrollmentService.getEnrollment(parsedInput);
}

export async function getEnrollmentsByCourse(
  input: ListEnrollmentsByCourseInput,
) {
  "use cache";
  cacheTag("enrollmentsByCourse", input.courseId);
  cacheLife("hours");

  const parsedInput = validateInput(listEnrollmentsByCourseSchema, input);
  return EnrollmentService.listEnrollmentsByCourse(parsedInput);
}

export async function getEnrollmentsByUser(input: ListEnrollmentsByUserInput) {
  "use cache";
  cacheTag("enrollmentsByUser", input.userId);
  cacheLife("hours");

  const parsedInput = validateInput(listEnrollmentsByUserSchema, input);
  return EnrollmentService.listEnrollmentsByUser(parsedInput);
}

/**
 * Write Actions
 *
 * NOTE:
 * - These return `ServerActionResponse<void>` to standardize error handling.
 * - They also enforce auth where appropriate.
 */

export async function enrollUser(
  input: EnrollUserInput,
): Promise<ServerActionResponse<void>> {
  try {
    await getSessionThrowable(true);
    const parsedInput = validateInput(enrollUserSchema, input);

    await EnrollmentService.enrollUser(parsedInput);

    revalidateTag("enrollmentsByCourse", "max");
    revalidateTag("enrollmentsByUser", "max");
    revalidateTag("enrollment", "max");
  } catch (error) {
    return handleServerActionError(error);
  }
}

export async function markEnrollmentAsCompleted(
  input: MarkAsCompletedInput,
): Promise<ServerActionResponse<void>> {
  try {
    await getSessionThrowable(true);
    const parsedInput = validateInput(markAsCompletedSchema, input);

    await EnrollmentService.markAsCompleted(parsedInput);

    revalidateTag("enrollmentsByCourse", "max");
    revalidateTag("enrollmentsByUser", "max");
    revalidateTag("enrollment", "max");
  } catch (error) {
    return handleServerActionError(error);
  }
}

export async function dropEnrollmentCourse(
  input: DropCourseInput,
): Promise<ServerActionResponse<void>> {
  try {
    await getSessionThrowable(true);
    const parsedInput = validateInput(dropCourseSchema, input);

    await EnrollmentService.dropCourse(parsedInput);

    revalidateTag("enrollmentsByCourse", "max");
    revalidateTag("enrollmentsByUser", "max");
    revalidateTag("enrollment", "max");
  } catch (error) {
    return handleServerActionError(error);
  }
}

export async function updateEnrollmentStatus(
  input: UpdateEnrollmentStatusInput,
): Promise<ServerActionResponse<void>> {
  try {
    await getSessionThrowable(true);
    const parsedInput = validateInput(updateEnrollmentStatusSchema, input);

    await EnrollmentService.updateEnrollmentStatus(parsedInput);

    revalidateTag("enrollmentById", "max");
    revalidateTag("enrollmentsByCourse", "max");
    revalidateTag("enrollmentsByUser", "max");
    revalidateTag("enrollment", "max");
  } catch (error) {
    return handleServerActionError(error);
  }
}

export async function deleteEnrollment(
  input: DeleteEnrollmentInput,
): Promise<ServerActionResponse<void>> {
  try {
    await getSessionThrowable(true);
    const parsedInput = validateInput(deleteEnrollmentSchema, input);

    await EnrollmentService.deleteEnrollment(parsedInput);

    revalidateTag("enrollmentById", "max");
    revalidateTag("enrollmentsByCourse", "max");
    revalidateTag("enrollmentsByUser", "max");
    revalidateTag("enrollment", "max");
  } catch (error) {
    return handleServerActionError(error);
  }
}
