import prisma from "@/server/db/db";
import type { Chapter, Prisma } from "@/generated/prisma/client";
import { ServiceError } from "@/domain/errors/ServiceError";
import type {
  CreateChapterInput,
  DeleteChapterInput,
  GetChapterByIdInput,
  ListChaptersByCourseInput,
  ResequenceChaptersInput,
  UpdateChapterInput,
} from "@/domain/services/schema/chapter.schema";

/**
 * Thrown when a Chapter record cannot be found.
 */
export class ChapterNotFoundError extends ServiceError {
  constructor(message: string) {
    super(message, "CHAPTER_NOT_FOUND", 404);
    this.name = "ChapterNotFoundError";
  }
}

/**
 * Thrown when caller input violates Chapter domain rules.
 */
export class ChapterValidationError extends ServiceError {
  constructor(message: string) {
    super(message, "CHAPTER_VALIDATION_ERROR", 400);
    this.name = "ChapterValidationError";
  }
}

/**
 * Thrown when a database constraint is violated (e.g. unique constraint).
 */
export class ChapterConflictError extends ServiceError {
  constructor(message: string) {
    super(message, "CHAPTER_CONFLICT", 409);
    this.name = "ChapterConflictError";
  }
}

/**
 * Thrown when a persistence operation cannot be completed due to an unexpected DB error.
 */
export class ChapterPersistenceError extends ServiceError {
  constructor(message: string) {
    super(message, "CHAPTER_PERSISTENCE_ERROR", 500);
    this.name = "ChapterPersistenceError";
  }
}

/**
 * Service-layer operations for Chapters.
 *
 * Business rules:
 * - `sequenceOrder` is a contiguous 1..N ordering *within a course*.
 * - Create:
 *   - if `sequenceOrder` is omitted -> append to end
 *   - if provided -> clamp to [1, N+1] and shift existing chapters to make room
 * - Delete:
 *   - close ordering gap by decrementing chapters after the deleted `sequenceOrder`
 * - Update:
 *   - if `sequenceOrder` changes -> shift affected range to keep contiguous ordering
 *
 * Error handling guidelines (per project rules):
 * - No broad try/catch in services.
 * - Only catch Prisma exceptions when mapping to standardized service errors.
 */
export class ChapterService {
  /**
   * Create a chapter within a course with sequence management.
   *
   * @param input - Must include `course: { connect: { id } }`.
   * @throws ChapterValidationError
   * @throws ChapterConflictError (Prisma P2002)
   * @throws ChapterPersistenceError (other Prisma errors)
   */
  static async createChapter(input: CreateChapterInput): Promise<Chapter> {
    const { courseId, title, sequenceOrder } = input;

    try {
      return await prisma.$transaction(async (tx) => {
        const count = await tx.chapter.count({ where: { courseId } });
        const maxOrder = count; // expected contiguous 1..count
        const normalized =
          sequenceOrder == null
            ? maxOrder + 1
            : this.clampToRange(sequenceOrder, 1, maxOrder + 1);

        // Make room if inserting not at end.
        if (normalized <= maxOrder) {
          await tx.chapter.updateMany({
            where: { courseId, sequenceOrder: { gte: normalized } },
            data: { sequenceOrder: { increment: 1 } },
          });
        }

        return await tx.chapter.create({
          data: {
            title,
            course: { connect: { id: courseId } },
            sequenceOrder: normalized,
          },
        });
      });
    } catch (err) {
      throw this.mapPrismaError(err, "Failed to create chapter.");
    }
  }

  /**
   * Get a chapter by id.
   * @throws ChapterNotFoundError
   */
  static async getChapterById(input: GetChapterByIdInput): Promise<Chapter> {
    const { id } = input;

    const chapter = await prisma.chapter.findUnique({ where: { id } });
    if (!chapter)
      throw new ChapterNotFoundError(`Chapter not found for id=${id}`);
    return chapter;
  }

  /**
   * List chapters for a course ordered by `sequenceOrder`.
   */
  static async listChaptersByCourse(
    input: ListChaptersByCourseInput,
  ): Promise<Chapter[]> {
    const { courseId } = input;

    return await prisma.chapter.findMany({
      where: { courseId },
      orderBy: { sequenceOrder: "asc" },
    });
  }

  /**
   * Update chapter fields.
   *
   * Reordering:
   * - If `sequenceOrder` is present in `data`, the chapter is moved inside its course
   *   and other chapters are shifted accordingly.
   *
   * @throws ChapterNotFoundError
   * @throws ChapterValidationError
   * @throws ChapterConflictError (Prisma P2002)
   * @throws ChapterPersistenceError / ChapterNotFoundError (Prisma P2025)
   */
  static async updateChapter(input: UpdateChapterInput): Promise<Chapter> {
    const { id, title, sequenceOrder } = input;

    const desired = sequenceOrder ?? null;

    try {
      return await prisma.$transaction(async (tx) => {
        const current = await tx.chapter.findUnique({ where: { id } });
        if (!current)
          throw new ChapterNotFoundError(`Chapter not found for id=${id}`);

        // If no reorder requested, do a normal update.
        if (desired == null) {
          return await tx.chapter.update({
            where: { id },
            data: {
              ...(title !== undefined ? { title } : {}),
            },
          });
        }

        // Determine valid range within course.
        const total = await tx.chapter.count({
          where: { courseId: current.courseId },
        });
        const maxOrder = total; // current included
        const newOrder = this.clampToRange(desired, 1, maxOrder);

        if (newOrder === current.sequenceOrder) {
          // Order unchanged; update only other fields.
          return await tx.chapter.update({
            where: { id },
            data: {
              ...(title !== undefined ? { title } : {}),
            },
          });
        }

        if (newOrder < current.sequenceOrder) {
          // Moving up: increment chapters in [newOrder, currentOrder-1]
          await tx.chapter.updateMany({
            where: {
              courseId: current.courseId,
              id: { not: id },
              sequenceOrder: { gte: newOrder, lt: current.sequenceOrder },
            },
            data: { sequenceOrder: { increment: 1 } },
          });
        } else {
          // Moving down: decrement chapters in [currentOrder+1, newOrder]
          await tx.chapter.updateMany({
            where: {
              courseId: current.courseId,
              id: { not: id },
              sequenceOrder: { gt: current.sequenceOrder, lte: newOrder },
            },
            data: { sequenceOrder: { decrement: 1 } },
          });
        }

        return await tx.chapter.update({
          where: { id },
          data: {
            ...(title !== undefined ? { title } : {}),
            sequenceOrder: newOrder,
          },
        });
      });
    } catch (err) {
      if (err instanceof ChapterNotFoundError) throw err;
      throw this.mapPrismaError(err, `Failed to update chapter id=${id}.`);
    }
  }

  /**
   * Delete a chapter, then resequence remaining chapters in the course to remove gaps.
   *
   * @throws ChapterNotFoundError
   * @throws ChapterPersistenceError / ChapterNotFoundError (Prisma P2025)
   */
  static async deleteChapter(input: DeleteChapterInput): Promise<Chapter> {
    const { id } = input;

    try {
      return await prisma.$transaction(async (tx) => {
        const existing = await tx.chapter.findUnique({ where: { id } });
        if (!existing)
          throw new ChapterNotFoundError(`Chapter not found for id=${id}`);

        const deleted = await tx.chapter.delete({ where: { id } });

        // Close gap: decrement any chapters after the deleted one.
        await tx.chapter.updateMany({
          where: {
            courseId: existing.courseId,
            sequenceOrder: { gt: existing.sequenceOrder },
          },
          data: { sequenceOrder: { decrement: 1 } },
        });

        return deleted;
      });
    } catch (err) {
      if (err instanceof ChapterNotFoundError) throw err;
      throw this.mapPrismaError(err, `Failed to delete chapter id=${id}.`);
    }
  }

  /**
   * Repair operation: resequence all chapters in a course to 1..N in current order.
   *
   * @throws ChapterPersistenceError
   */
  static async resequenceChapters(
    input: ResequenceChaptersInput,
  ): Promise<Chapter[]> {
    const { courseId } = input;

    try {
      return await prisma.$transaction(async (tx) => {
        const chapters = await tx.chapter.findMany({
          where: { courseId },
          orderBy: { sequenceOrder: "asc" },
          select: { id: true, sequenceOrder: true },
        });

        const updates: Prisma.PrismaPromise<unknown>[] = [];
        for (let i = 0; i < chapters.length; i++) {
          const desired = i + 1;
          if (chapters[i]!.sequenceOrder !== desired) {
            updates.push(
              tx.chapter.update({
                where: { id: chapters[i]!.id },
                data: { sequenceOrder: desired },
              }),
            );
          }
        }

        if (updates.length > 0) await tx.$transaction(updates);

        return await tx.chapter.findMany({
          where: { courseId },
          orderBy: { sequenceOrder: "asc" },
        });
      });
    } catch (err) {
      throw this.mapPrismaError(
        err,
        `Failed to resequence chapters for courseId=${courseId}.`,
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
   * Minimal Prisma exception mapping to standardized ServiceErrors.
   *
   * We only catch Prisma exceptions in this service (per project guidelines).
   */
  private static mapPrismaError(
    err: unknown,
    fallbackMessage: string,
  ): ServiceError {
    // Domain errors are already standardized.
    if (err instanceof ServiceError) return err;

    /**
     * We can't import `PrismaClientKnownRequestError` from `@prisma/client/runtime/library`
     * in this repo, so we narrow by structure instead.
     */
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
      // Unique constraint violation
      if (err.code === "P2002") {
        return new ChapterConflictError(fallbackMessage);
      }

      // "Record not found" for update/delete
      if (err.code === "P2025") {
        return new ChapterNotFoundError("Chapter not found.");
      }

      return new ChapterPersistenceError(`${fallbackMessage} ${err.message}`);
    }

    // Unknown errors: preserve message but standardize type.
    const msg = err instanceof Error ? err.message : String(err);
    return new ChapterPersistenceError(`${fallbackMessage} ${msg}`);
  }
}

export default ChapterService;
