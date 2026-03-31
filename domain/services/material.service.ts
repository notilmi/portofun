import prisma from "@/server/db/db";
import type { Material, Prisma, QuizQuestion } from "@/generated/prisma/client";
import { ServiceError } from "@/domain/errors/ServiceError";
import type {
  ArchiveMaterialInput,
  CreateMaterialInput,
  DeleteMaterialInput,
  GetMaterialByIdInput,
  ListMaterialsByChapterInput,
  MaterialType,
  ResequenceMaterialsInput,
  UpdateMaterialInput,
} from "@/domain/services/schema/material.schema";

/**
 * Thrown when a Material record cannot be found.
 */
export class MaterialNotFoundError extends ServiceError {
  constructor(message: string) {
    super(message, "MATERIAL_NOT_FOUND", 404);
    this.name = "MaterialNotFoundError";
  }
}

/**
 * Thrown when a Chapter record cannot be found (when creating/listing materials by chapter).
 */
export class MaterialChapterNotFoundError extends ServiceError {
  constructor(message: string) {
    super(message, "CHAPTER_NOT_FOUND", 404);
    this.name = "MaterialChapterNotFoundError";
  }
}

/**
 * Thrown when a database constraint is violated (e.g. unique constraint).
 */
export class MaterialConflictError extends ServiceError {
  constructor(message: string) {
    super(message, "MATERIAL_CONFLICT", 409);
    this.name = "MaterialConflictError";
  }
}

/**
 * Thrown when a persistence operation cannot be completed due to an unexpected DB error.
 */
export class MaterialPersistenceError extends ServiceError {
  constructor(message: string) {
    super(message, "MATERIAL_PERSISTENCE_ERROR", 500);
    this.name = "MaterialPersistenceError";
  }
}

/**
 * Material service encapsulating:
 * - CRUD operations
 * - sequenceOrder integrity within a chapter (contiguous 1..N)
 * - quiz question persistence (for quiz materials)
 *
 * IMPORTANT (per current project rules):
 * - Services accept schema-inferred inputs (validated upstream in server actions).
 * - Services do NOT perform input validation (polymorphic checks are assumed done upstream).
 * - No broad try/catch; only catch Prisma errors to map to standardized ServiceErrors.
 */
export class MaterialService {
  /**
   * Create a material within a chapter.
   *
   * Sequence management:
   * - If sequenceOrder omitted => append to end of chapter
   * - If provided => clamp to [1, N+1] and shift existing materials at/after the position
   *
   * Quiz handling:
   * - If type === "quiz" and quizQuestions are provided, they are created in the same transaction.
   * - If type !== "quiz", any provided quizQuestions are ignored.
   *
   * @throws MaterialChapterNotFoundError if chapter does not exist
   * @throws MaterialConflictError / MaterialPersistenceError for Prisma failures
   */
  static async createMaterial(
    input: CreateMaterialInput,
  ): Promise<Material & { quizQuestions: QuizQuestion[] }> {
    const {
      chapterId,
      title,
      type,
      content,
      videoUrl,
      sequenceOrder,
      quizQuestions,
    } = input;

    try {
      return await prisma.$transaction(async (tx) => {
        // Ensure chapter exists for a better domain error than FK violation.
        const chapterExists = await tx.chapter.findUnique({
          where: { id: chapterId },
          select: { id: true },
        });
        if (!chapterExists) {
          throw new MaterialChapterNotFoundError(
            `Chapter not found for id=${chapterId}`,
          );
        }

        // sequenceOrder management within chapter
        const count = await tx.material.count({ where: { chapterId } });
        const maxOrder = count;
        const normalized =
          sequenceOrder == null
            ? maxOrder + 1
            : this.clampToRange(sequenceOrder, 1, maxOrder + 1);

        if (normalized <= maxOrder) {
          await tx.material.updateMany({
            where: { chapterId, sequenceOrder: { gte: normalized } },
            data: { sequenceOrder: { increment: 1 } },
          });
        }

        const created = await tx.material.create({
          data: {
            title,
            type,
            content: content ?? null,
            videoUrl: videoUrl ?? null,
            chapter: { connect: { id: chapterId } },
            sequenceOrder: normalized,
          },
          include: { quizQuestions: true },
        });

        if (type === "quiz" && quizQuestions && quizQuestions.length > 0) {
          await tx.quizQuestion.createMany({
            data: quizQuestions.map((q) => ({
              materialId: created.id,
              question: q.question,
              answer: q.answer,
              correctAnswer: q.correctAnswer,
            })),
          });

          return await tx.material.findUniqueOrThrow({
            where: { id: created.id },
            include: { quizQuestions: true },
          });
        }

        return created;
      });
    } catch (err) {
      if (err instanceof ServiceError) throw err;
      throw this.mapPrismaError(err, "Failed to create material.");
    }
  }

  /**
   * Fetch a material by id.
   *
   * @throws MaterialNotFoundError
   */
  static async getMaterialById(
    input: GetMaterialByIdInput,
  ): Promise<Material & { quizQuestions?: QuizQuestion[] }> {
    const material = await prisma.material.findUnique({
      where: { id: input.id },
      include: input.includeQuizQuestions ? { quizQuestions: true } : undefined,
    });

    if (!material) {
      throw new MaterialNotFoundError(`Material not found for id=${input.id}`);
    }

    return material;
  }

  /**
   * List materials in a chapter ordered by sequenceOrder.
   *
   * @throws MaterialChapterNotFoundError if chapter does not exist
   */
  static async listMaterialsByChapter(
    input: ListMaterialsByChapterInput,
  ): Promise<Material[]> {
    // Optional existence check to return consistent domain error.
    const chapterExists = await prisma.chapter.findUnique({
      where: { id: input.chapterId },
      select: { id: true },
    });
    if (!chapterExists) {
      throw new MaterialChapterNotFoundError(
        `Chapter not found for id=${input.chapterId}`,
      );
    }

    return await prisma.material.findMany({
      where: {
        chapterId: input.chapterId,
        ...(input.includeArchived ? {} : { isArchived: false }),
      },
      orderBy: { sequenceOrder: "asc" },
    });
  }

  /**
   * Update a material (including optional reorder within its chapter).
   *
   * Reordering:
   * - If `sequenceOrder` is provided, material is moved within the chapter and
   *   other materials are shifted to keep contiguous ordering.
   *
   * Quiz handling:
   * - If resulting type is not quiz => quiz questions are deleted (domain clean-up).
   * - If resulting type is quiz and `quizQuestions` provided => replace the entire set.
   * - If resulting type is quiz and `quizQuestions` omitted => leave questions unchanged.
   *
   * NOTE: Polymorphic input validation (content/videoUrl/questions required) MUST be done upstream.
   *
   * @throws MaterialNotFoundError
   */
  static async updateMaterial(
    input: UpdateMaterialInput,
  ): Promise<Material & { quizQuestions: QuizQuestion[] }> {
    try {
      return await prisma.$transaction(async (tx) => {
        const existing = await tx.material.findUnique({
          where: { id: input.id },
          include: { quizQuestions: true },
        });
        if (!existing) {
          throw new MaterialNotFoundError(
            `Material not found for id=${input.id}`,
          );
        }

        const targetType: MaterialType = (input.type ??
          existing.type) as MaterialType;

        // Handle reorder if requested
        if (input.sequenceOrder != null) {
          await this.moveMaterialWithinChapter(tx, {
            materialId: existing.id,
            chapterId: existing.chapterId,
            from: existing.sequenceOrder,
            to: input.sequenceOrder,
          });
        }

        // Update core material fields
        await tx.material.update({
          where: { id: existing.id },
          data: {
            ...(input.title !== undefined ? { title: input.title } : {}),
            ...(input.type !== undefined ? { type: input.type } : {}),
            ...(input.content !== undefined ? { content: input.content } : {}),
            ...(input.videoUrl !== undefined
              ? { videoUrl: input.videoUrl }
              : {}),
            ...(input.isArchived !== undefined
              ? { isArchived: input.isArchived }
              : {}),
            // Do NOT set sequenceOrder here; reorder helper already did it safely
          },
        });

        // Handle quiz questions transitions
        if (targetType !== "quiz") {
          if (existing.quizQuestions.length > 0) {
            await tx.quizQuestion.deleteMany({
              where: { materialId: existing.id },
            });
          }
        } else {
          // targetType === "quiz"
          if (input.quizQuestions !== undefined) {
            await tx.quizQuestion.deleteMany({
              where: { materialId: existing.id },
            });

            if (input.quizQuestions.length > 0) {
              await tx.quizQuestion.createMany({
                data: input.quizQuestions.map((q) => ({
                  materialId: existing.id,
                  question: q.question,
                  answer: q.answer,
                  correctAnswer: q.correctAnswer,
                })),
              });
            }
          }
        }

        return await tx.material.findUniqueOrThrow({
          where: { id: existing.id },
          include: { quizQuestions: true },
        });
      });
    } catch (err) {
      if (err instanceof ServiceError) throw err;
      throw this.mapPrismaError(
        err,
        `Failed to update material id=${input.id}.`,
      );
    }
  }

  /**
   * Delete a material, then resequence remaining materials in its chapter.
   *
   * @throws MaterialNotFoundError
   */
  static async deleteMaterial(input: DeleteMaterialInput): Promise<Material> {
    try {
      return await prisma.$transaction(async (tx) => {
        const existing = await tx.material.findUnique({
          where: { id: input.id },
        });
        if (!existing) {
          throw new MaterialNotFoundError(
            `Material not found for id=${input.id}`,
          );
        }

        const deleted = await tx.material.delete({
          where: { id: existing.id },
        });

        // Close ordering gap
        await tx.material.updateMany({
          where: {
            chapterId: existing.chapterId,
            sequenceOrder: { gt: existing.sequenceOrder },
          },
          data: { sequenceOrder: { decrement: 1 } },
        });

        return deleted;
      });
    } catch (err) {
      if (err instanceof ServiceError) throw err;
      throw this.mapPrismaError(
        err,
        `Failed to delete material id=${input.id}.`,
      );
    }
  }

  /**
   * Archive a material (soft delete).
   *
   * @throws MaterialNotFoundError
   */
  static async archiveMaterial(input: ArchiveMaterialInput): Promise<Material> {
    // ensure consistent error
    const exists = await prisma.material.findUnique({
      where: { id: input.id },
      select: { id: true },
    });
    if (!exists) {
      throw new MaterialNotFoundError(`Material not found for id=${input.id}`);
    }

    try {
      return await prisma.material.update({
        where: { id: input.id },
        data: { isArchived: true },
      });
    } catch (err) {
      if (err instanceof ServiceError) throw err;
      throw this.mapPrismaError(
        err,
        `Failed to archive material id=${input.id}.`,
      );
    }
  }

  /**
   * Repair operation: resequence all materials in a chapter to 1..N ordering.
   */
  static async resequenceMaterials(
    input: ResequenceMaterialsInput,
  ): Promise<Material[]> {
    try {
      return await prisma.$transaction(async (tx) => {
        const materials = await tx.material.findMany({
          where: { chapterId: input.chapterId },
          orderBy: { sequenceOrder: "asc" },
          select: { id: true, sequenceOrder: true },
        });

        const updates: Prisma.PrismaPromise<unknown>[] = [];
        for (let i = 0; i < materials.length; i++) {
          const desired = i + 1;
          if (materials[i]!.sequenceOrder !== desired) {
            updates.push(
              tx.material.update({
                where: { id: materials[i]!.id },
                data: { sequenceOrder: desired },
              }),
            );
          }
        }

        if (updates.length > 0) await tx.$transaction(updates);

        return await tx.material.findMany({
          where: { chapterId: input.chapterId },
          orderBy: { sequenceOrder: "asc" },
        });
      });
    } catch (err) {
      if (err instanceof ServiceError) throw err;
      throw this.mapPrismaError(
        err,
        `Failed to resequence materials for chapterId=${input.chapterId}.`,
      );
    }
  }

  // -------------------------
  // Helpers
  // -------------------------

  private static clampToRange(value: number, min: number, max: number): number {
    if (!Number.isFinite(value)) return min;
    if (value < min) return min;
    if (value > max) return max;
    return Math.trunc(value);
  }

  /**
   * Reorders a material within the given chapter, keeping 1..N contiguous ordering.
   */
  private static async moveMaterialWithinChapter(
    tx: Prisma.TransactionClient,
    params: { materialId: string; chapterId: string; from: number; to: number },
  ): Promise<void> {
    const { materialId, chapterId, from, to } = params;

    const total = await tx.material.count({ where: { chapterId } });
    const newOrder = this.clampToRange(to, 1, total);

    if (newOrder === from) return;

    if (newOrder < from) {
      // moving up: increment others in [newOrder, from-1]
      await tx.material.updateMany({
        where: {
          chapterId,
          id: { not: materialId },
          sequenceOrder: { gte: newOrder, lt: from },
        },
        data: { sequenceOrder: { increment: 1 } },
      });
    } else {
      // moving down: decrement others in [from+1, newOrder]
      await tx.material.updateMany({
        where: {
          chapterId,
          id: { not: materialId },
          sequenceOrder: { gt: from, lte: newOrder },
        },
        data: { sequenceOrder: { decrement: 1 } },
      });
    }

    await tx.material.update({
      where: { id: materialId },
      data: { sequenceOrder: newOrder },
    });
  }

  /**
   * Minimal Prisma exception mapping to standardized ServiceErrors.
   *
   * We can't reliably import Prisma runtime error classes in this repo, so we map
   * by structure (`{ code: string; message: string }`) where possible.
   */
  private static mapPrismaError(
    err: unknown,
    fallbackMessage: string,
  ): ServiceError {
    if (err instanceof ServiceError) return err;

    const isKnownRequestError = (
      e: unknown,
    ): e is {
      code: string;
      message: string;
      meta?: unknown;
      clientVersion?: string;
      name?: string;
    } => {
      if (typeof e !== "object" || e === null) return false;
      const rec = e as Record<string, unknown>;
      return typeof rec.code === "string" && typeof rec.message === "string";
    };

    if (isKnownRequestError(err)) {
      if (err.code === "P2002")
        return new MaterialConflictError(fallbackMessage);
      if (err.code === "P2025")
        return new MaterialNotFoundError("Material not found.");
      return new MaterialPersistenceError(`${fallbackMessage} ${err.message}`);
    }

    const msg = err instanceof Error ? err.message : String(err);
    return new MaterialPersistenceError(`${fallbackMessage} ${msg}`);
  }
}

export default MaterialService;
