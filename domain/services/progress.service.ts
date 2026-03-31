import prisma from "@/server/db/db";
import type {
  Enrollment,
  Material,
  Prisma,
  UserProgress,
} from "@/generated/prisma/client";
import { ServiceError } from "@/domain/errors/ServiceError";
import type {
  GetProgressInput,
  ListCourseProgressInput,
  MarkMaterialCompletedInput,
  ValidateQuizAndCompleteInput,
} from "@/domain/services/schema/progress.schema";

/**
 * Thrown when a Material record cannot be found.
 */
export class ProgressMaterialNotFoundError extends ServiceError {
  constructor(message: string) {
    super(message, "MATERIAL_NOT_FOUND", 404);
    this.name = "ProgressMaterialNotFoundError";
  }
}

/**
 * Thrown when attempting to complete an archived material.
 */
export class ProgressArchivedMaterialError extends ServiceError {
  constructor(message: string) {
    super(message, "MATERIAL_ARCHIVED", 409);
    this.name = "ProgressArchivedMaterialError";
  }
}

/**
 * Thrown when a material is not a quiz but quiz validation is attempted.
 */
export class ProgressMaterialNotQuizError extends ServiceError {
  constructor(message: string) {
    super(message, "MATERIAL_NOT_QUIZ", 409);
    this.name = "ProgressMaterialNotQuizError";
  }
}

/**
 * Thrown when quiz grading fails (incorrect answers).
 *
 * Note: This is a business-rule failure, not an input validation failure.
 * Input shape validation is expected upstream (server action).
 */
export class ProgressQuizIncorrectError extends ServiceError {
  constructor(message: string) {
    super(message, "QUIZ_INCORRECT", 422);
    this.name = "ProgressQuizIncorrectError";
  }
}

/**
 * Thrown when quiz material has no configured questions.
 */
export class ProgressQuizNotConfiguredError extends ServiceError {
  constructor(message: string) {
    super(message, "QUIZ_NOT_CONFIGURED", 409);
    this.name = "ProgressQuizNotConfiguredError";
  }
}

/**
 * Thrown when a persistence operation fails unexpectedly.
 */
export class ProgressPersistenceError extends ServiceError {
  constructor(message: string) {
    super(message, "PROGRESS_PERSISTENCE_ERROR", 500);
    this.name = "ProgressPersistenceError";
  }
}

/**
 * Progress & Quiz service encapsulating:
 * - idempotent material completion
 * - quiz answer validation against `QuizQuestion.correctAnswer`
 * - auto-completion of Enrollment when all course materials are completed
 *
 * IMPORTANT:
 * - This service accepts schema-inferred inputs (validated upstream in server actions).
 * - Do NOT perform input validation here.
 * - Do NOT use broad try/catch; only catch Prisma exceptions to map to standardized ServiceErrors.
 */
export class ProgressService {
  /**
   * Marks a material as completed for a user (idempotent).
   *
   * Idempotency rules:
   * - If a `UserProgress` row exists WITH `completedAt`, return it as-is.
   * - If a `UserProgress` row exists WITHOUT `completedAt`, set `completedAt` and return.
   * - If no row exists, create it with `completedAt` and return.
   *
   * Side-effect:
   * - After marking complete, checks whether all materials in the course are completed for the user;
   *   if yes, updates the corresponding `Enrollment` to `COMPLETED` in the same transaction.
   *
   * Domain exclusions:
   * - Archived materials are not allowed to be completed (and do not block course completion checks).
   *
   * @throws ProgressMaterialNotFoundError
   * @throws ProgressArchivedMaterialError
   */
  static async markMaterialCompleted(
    input: MarkMaterialCompletedInput,
  ): Promise<UserProgress> {
    const { userId, materialId } = input;

    try {
      return await prisma.$transaction(async (tx) => {
        const material = await tx.material.findUnique({
          where: { id: materialId },
          select: {
            id: true,
            isArchived: true,
            chapter: { select: { courseId: true } },
          },
        });

        if (!material) {
          throw new ProgressMaterialNotFoundError(
            `Material not found for id=${materialId}`,
          );
        }

        if (material.isArchived) {
          throw new ProgressArchivedMaterialError(
            `Cannot complete archived material id=${materialId}. Unarchive it first.`,
          );
        }

        const existing = await tx.userProgress.findFirst({
          where: { userId, materialId },
        });

        if (existing?.completedAt) {
          // Idempotent return. Still run auto-completion check.
          await this.autoCompleteEnrollmentIfEligible(tx, {
            userId,
            courseId: material.chapter.courseId,
          });
          return existing;
        }

        const now = new Date();

        const progress =
          existing != null
            ? await tx.userProgress.update({
                where: { id: existing.id },
                data: { completedAt: now },
              })
            : await tx.userProgress.create({
                data: {
                  user: { connect: { id: userId } },
                  material: { connect: { id: materialId } },
                  completedAt: now,
                },
              });

        await this.autoCompleteEnrollmentIfEligible(tx, {
          userId,
          courseId: material.chapter.courseId,
        });

        return progress;
      });
    } catch (err) {
      if (err instanceof ServiceError) throw err;
      throw this.mapPrismaError(
        err,
        `Failed to mark material completed userId=${userId} materialId=${materialId}.`,
      );
    }
  }

  /**
   * Validate quiz answers for a quiz material, then mark the material completed.
   *
   * Rules:
   * - Material must have `type === "quiz"`.
   * - Answers are validated against `QuizQuestion.correctAnswer`.
   * - If all correct, material is marked completed (idempotent).
   *
   * @throws ProgressMaterialNotFoundError
   * @throws ProgressArchivedMaterialError
   * @throws ProgressMaterialNotQuizError
   * @throws ProgressQuizNotConfiguredError
   * @throws ProgressQuizIncorrectError
   */
  static async validateQuizAndComplete(
    input: ValidateQuizAndCompleteInput,
  ): Promise<{
    progress: UserProgress;
    correct: boolean;
    results: Array<{
      questionId: string;
      correct: boolean;
      expected: string;
      received: string;
    }>;
  }> {
    const { userId, materialId, answers } = input;

    try {
      return await prisma.$transaction(async (tx) => {
        const material = await tx.material.findUnique({
          where: { id: materialId },
          select: {
            id: true,
            type: true,
            isArchived: true,
            chapter: { select: { courseId: true } },
          },
        });

        if (!material) {
          throw new ProgressMaterialNotFoundError(
            `Material not found for id=${materialId}`,
          );
        }

        if (material.isArchived) {
          throw new ProgressArchivedMaterialError(
            `Cannot complete archived material id=${materialId}. Unarchive it first.`,
          );
        }

        if (material.type.trim().toLowerCase() !== "quiz") {
          throw new ProgressMaterialNotQuizError(
            `Material id=${materialId} is not a quiz (type=${material.type}).`,
          );
        }

        const questions = await tx.quizQuestion.findMany({
          where: { materialId },
          select: { id: true, correctAnswer: true },
          orderBy: { createdAt: "asc" },
        });

        if (questions.length === 0) {
          throw new ProgressQuizNotConfiguredError(
            `Quiz material id=${materialId} has no quiz questions configured.`,
          );
        }

        const answerById = new Map<string, string>();
        for (const a of answers) {
          answerById.set(a.questionId, a.answer);
        }

        const results: Array<{
          questionId: string;
          correct: boolean;
          expected: string;
          received: string;
        }> = [];

        for (const q of questions) {
          const received = answerById.get(q.id) ?? "";
          const expectedNorm = this.normalizeAnswer(q.correctAnswer);
          const receivedNorm = this.normalizeAnswer(received);

          const isCorrect = expectedNorm === receivedNorm;

          results.push({
            questionId: q.id,
            correct: isCorrect,
            expected: q.correctAnswer,
            received,
          });
        }

        const allCorrect = results.every((r) => r.correct);
        if (!allCorrect) {
          throw new ProgressQuizIncorrectError("Incorrect quiz answers.");
        }

        const progress = await this.markMaterialCompletedWithinTransaction(tx, {
          userId,
          materialId,
          courseId: material.chapter.courseId,
        });

        return { progress, correct: true, results };
      });
    } catch (err) {
      if (err instanceof ServiceError) throw err;
      throw this.mapPrismaError(
        err,
        `Failed to validate quiz and complete userId=${userId} materialId=${materialId}.`,
      );
    }
  }

  /**
   * Returns the UserProgress record for a given user/material, if exists.
   */
  static async getProgress(
    input: GetProgressInput,
  ): Promise<UserProgress | null> {
    const { userId, materialId } = input;
    try {
      return await prisma.userProgress.findFirst({
        where: { userId, materialId },
      });
    } catch (err) {
      if (err instanceof ServiceError) throw err;
      throw this.mapPrismaError(
        err,
        `Failed to fetch progress userId=${userId} materialId=${materialId}.`,
      );
    }
  }

  /**
   * Lists all progress records for a user in a course (non-archived materials only).
   *
   * Useful for rendering a course progress dashboard.
   */
  static async listCourseProgress(input: ListCourseProgressInput): Promise<
    Array<
      UserProgress & {
        material: Pick<Material, "id" | "title" | "type" | "sequenceOrder"> & {
          chapter: { id: string; sequenceOrder: number };
        };
      }
    >
  > {
    const { userId, courseId } = input;

    try {
      return await prisma.userProgress.findMany({
        where: {
          userId,
          material: {
            isArchived: false,
            chapter: { courseId },
          },
        },
        include: {
          material: {
            select: {
              id: true,
              title: true,
              type: true,
              sequenceOrder: true,
              chapter: { select: { id: true, sequenceOrder: true } },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      });
    } catch (err) {
      if (err instanceof ServiceError) throw err;
      throw this.mapPrismaError(
        err,
        `Failed to list course progress userId=${userId} courseId=${courseId}.`,
      );
    }
  }

  // -----------------------------------
  // Internal helpers
  // -----------------------------------

  /**
   * Transaction-safe idempotent completion used by `validateQuizAndComplete`.
   */
  private static async markMaterialCompletedWithinTransaction(
    tx: Prisma.TransactionClient,
    params: { userId: string; materialId: string; courseId: string },
  ): Promise<UserProgress> {
    const { userId, materialId, courseId } = params;

    const existing = await tx.userProgress.findFirst({
      where: { userId, materialId },
    });

    if (existing?.completedAt) {
      await this.autoCompleteEnrollmentIfEligible(tx, { userId, courseId });
      return existing;
    }

    const now = new Date();

    const progress =
      existing != null
        ? await tx.userProgress.update({
            where: { id: existing.id },
            data: { completedAt: now },
          })
        : await tx.userProgress.create({
            data: {
              user: { connect: { id: userId } },
              material: { connect: { id: materialId } },
              completedAt: now,
            },
          });

    await this.autoCompleteEnrollmentIfEligible(tx, { userId, courseId });
    return progress;
  }

  /**
   * Checks whether the user has completed ALL non-archived materials for the course.
   * If yes, updates Enrollment status to COMPLETED.
   *
   * Important:
   * - If total materials is 0, do not auto-complete.
   * - If enrollment is DROPPED, keep it DROPPED (explicit user action).
   */
  private static async autoCompleteEnrollmentIfEligible(
    tx: Prisma.TransactionClient,
    params: { userId: string; courseId: string },
  ): Promise<Enrollment | null> {
    const { userId, courseId } = params;

    const totalMaterials = await tx.material.count({
      where: {
        isArchived: false,
        chapter: { courseId },
      },
    });

    if (totalMaterials === 0) return null;

    const completedCount = await tx.userProgress.count({
      where: {
        userId,
        completedAt: { not: null },
        material: {
          isArchived: false,
          chapter: { courseId },
        },
      },
    });

    if (completedCount < totalMaterials) return null;

    const enrollment = await tx.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (!enrollment) return null;
    if (enrollment.status === "COMPLETED") return enrollment;
    if (enrollment.status === "DROPPED") return enrollment;

    return await tx.enrollment.update({
      where: { id: enrollment.id },
      data: { status: "COMPLETED" },
    });
  }

  /**
   * Normalizes answers for comparison.
   *
   * Current behavior:
   * - trim whitespace
   * - lowercase
   *
   * If you later add multiple-choice IDs or more complex grading,
   * update this function (and tests) accordingly.
   */
  private static normalizeAnswer(value: string): string {
    return value.trim().toLowerCase();
  }

  /**
   * Minimal Prisma exception mapping to standardized ServiceErrors.
   *
   * We can't reliably import Prisma runtime error classes, so we map
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
      // Record not found for update/delete
      if (err.code === "P2025")
        return new ProgressMaterialNotFoundError("Record not found.");

      return new ProgressPersistenceError(`${fallbackMessage} ${err.message}`);
    }

    const msg = err instanceof Error ? err.message : String(err);
    return new ProgressPersistenceError(`${fallbackMessage} ${msg}`);
  }
}

export default ProgressService;
