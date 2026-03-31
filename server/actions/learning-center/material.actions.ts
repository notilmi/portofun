"use server";

import MaterialService from "@/domain/services/material.service";
import {
  archiveMaterialSchema,
  createMaterialSchema,
  deleteMaterialSchema,
  getMaterialByIdSchema,
  listMaterialsByChapterSchema,
  resequenceMaterialsSchema,
  updateMaterialSchema,
  type ArchiveMaterialInput,
  type CreateMaterialInput,
  type DeleteMaterialInput,
  type GetMaterialByIdInput,
  type ListMaterialsByChapterInput,
  type ResequenceMaterialsInput,
  type UpdateMaterialInput,
} from "@/domain/services/schema/material.schema";
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

export async function getMaterialById(input: GetMaterialByIdInput) {
  "use cache";
  cacheTag("materialById", input.id);
  cacheLife("hours");

  const parsedInput = validateInput(getMaterialByIdSchema, input);
  return MaterialService.getMaterialById(parsedInput);
}

export async function getMaterialsByChapter(
  input: ListMaterialsByChapterInput,
) {
  "use cache";
  cacheTag("materialsByChapter", input.chapterId);
  cacheLife("hours");

  const parsedInput = validateInput(listMaterialsByChapterSchema, input);
  return MaterialService.listMaterialsByChapter(parsedInput);
}

/**
 * Write Actions
 *
 * NOTE:
 * - These return `ServerActionResponse<void>` to standardize error handling.
 * - They also enforce auth where appropriate.
 */

export async function createMaterial(
  input: CreateMaterialInput,
): Promise<ServerActionResponse<void>> {
  try {
    await getSessionThrowable(true);
    const parsedInput = validateInput(createMaterialSchema, input);

    await MaterialService.createMaterial(parsedInput);

    revalidateTag("materialsByChapter", "max");
    revalidateTag(parsedInput.chapterId, "max");
  } catch (error) {
    return handleServerActionError(error);
  }
}

export async function updateMaterial(
  input: UpdateMaterialInput,
): Promise<ServerActionResponse<void>> {
  try {
    await getSessionThrowable(true);
    const parsedInput = validateInput(updateMaterialSchema, input);

    await MaterialService.updateMaterial(parsedInput);

    revalidateTag("materialById", "max");
    revalidateTag(parsedInput.id, "max");
    revalidateTag("materialsByChapter", "max");
  } catch (error) {
    return handleServerActionError(error);
  }
}

export async function archiveMaterial(
  input: ArchiveMaterialInput,
): Promise<ServerActionResponse<void>> {
  try {
    await getSessionThrowable(true);
    const parsedInput = validateInput(archiveMaterialSchema, input);

    await MaterialService.archiveMaterial(parsedInput);

    revalidateTag("materialById", "max");
    revalidateTag(parsedInput.id, "max");
    revalidateTag("materialsByChapter", "max");
  } catch (error) {
    return handleServerActionError(error);
  }
}

export async function deleteMaterial(
  input: DeleteMaterialInput,
): Promise<ServerActionResponse<void>> {
  try {
    await getSessionThrowable(true);
    const parsedInput = validateInput(deleteMaterialSchema, input);

    await MaterialService.deleteMaterial(parsedInput);

    revalidateTag("materialById", "max");
    revalidateTag(parsedInput.id, "max");
    revalidateTag("materialsByChapter", "max");
  } catch (error) {
    return handleServerActionError(error);
  }
}

export async function resequenceMaterials(
  input: ResequenceMaterialsInput,
): Promise<ServerActionResponse<void>> {
  try {
    await getSessionThrowable(true);
    const parsedInput = validateInput(resequenceMaterialsSchema, input);

    await MaterialService.resequenceMaterials(parsedInput);

    revalidateTag("materialsByChapter", "max");
    revalidateTag(parsedInput.chapterId, "max");
  } catch (error) {
    return handleServerActionError(error);
  }
}
