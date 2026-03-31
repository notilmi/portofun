import prisma from "@/server/db/db";
import type { Enrollment } from "@/generated/prisma/client";
import { ServiceError } from "@/domain/errors/ServiceError";
import type {
  DeleteEnrollmentInput,
  DropCourseInput,
  EnrollUserInput,
  GetEnrollmentByIdInput,
  GetEnrollmentInput,
  ListEnrollmentsByCourseInput,
  ListEnrollmentsByUserInput,
  MarkAsCompletedInput,
  UpdateEnrollmentStatusInput,
} from "@/domain/services/schema/enrollment.schema";

/**
 * Thrown when an Enrollment record cannot be found.
 */
export class EnrollmentNotFoundError extends ServiceError {
  constructor(message: string) {
    super(message, "ENROLLMENT_NOT_FOUND", 404);
    this.name = "EnrollmentNotFoundError";
  }
}

/**
 * Thrown when attempting to enroll a user that is already enrolled
 * (status ACTIVE or COMPLETED).
 */
export class EnrollmentAlreadyEnrolledError extends ServiceError {
  constructor(message: string) {
    super(message, "ENROLLMENT_ALREADY_ENROLLED", 409);
    this.name = "EnrollmentAlreadyEnrolledError";
  }
}

/**
 * Thrown when a database constraint is violated (e.g. unique index).
 */
export class EnrollmentConflictError extends ServiceError {
  constructor(message: string) {
    super(message, "ENROLLMENT_CONFLICT", 409);
    this.name = "EnrollmentConflictError";
  }
}

/**
 * Thrown when a persistence operation fails unexpectedly.
 */
export class EnrollmentPersistenceError extends ServiceError {
  constructor(message: string) {
    super(message, "ENROLLMENT_PERSISTENCE_ERROR", 500);
    this.name = "EnrollmentPersistenceError";
  }
}

/**
 * Enrollment service encapsulating all enrollment-related business rules.
 *
 * IMPORTANT:
 * - This service accepts schema-inferred inputs (validated upstream in server actions).
 * - Do NOT perform input validation here.
 * - Do NOT use broad try/catch; only catch Prisma exceptions to map to standardized ServiceErrors.
 *
 * Business rules:
 * - Idempotent registration under `@@unique([userId, courseId])`:
 *   - if enrollment exists and status is ACTIVE/COMPLETED => throw EnrollmentAlreadyEnrolledError
 *   - if enrollment exists and status is DROPPED => set back to ACTIVE
 *   - if no enrollment exists => create ACTIVE
 *
 * - Explicit status transitions:
 *   - markAsCompleted => COMPLETED
 *   - dropCourse      => DROPPED
 */
export class EnrollmentService {
  /**
   * Enroll a user into a course (idempotent).
   *
   * @throws EnrollmentAlreadyEnrolledError
   */
  static async enrollUser(input: EnrollUserInput): Promise<Enrollment> {
    const { userId, courseId } = input;

    // We use a transaction to make the read/act sequence consistent.
    try {
      return await prisma.$transaction(async (tx) => {
        const existing = await tx.enrollment.findUnique({
          where: { userId_courseId: { userId, courseId } },
        });

        if (existing) {
          if (existing.status === "ACTIVE" || existing.status === "COMPLETED") {
            throw new EnrollmentAlreadyEnrolledError(
              `Already enrolled for userId=${userId} courseId=${courseId}`,
            );
          }

          if (existing.status === "DROPPED") {
            return await tx.enrollment.update({
              where: { id: existing.id },
              data: { status: "ACTIVE" },
            });
          }

          // Defensive (enum may expand).
          throw new EnrollmentPersistenceError(
            `Unexpected enrollment status=${existing.status} for userId=${userId} courseId=${courseId}`,
          );
        }

        // Create new enrollment
        return await tx.enrollment.create({
          data: {
            status: "ACTIVE",
            user: { connect: { id: userId } },
            course: { connect: { id: courseId } },
          },
        });
      });
    } catch (err) {
      if (err instanceof ServiceError) throw err;
      throw this.mapPrismaError(
        err,
        `Failed to enroll userId=${userId} courseId=${courseId}.`,
      );
    }
  }

  /**
   * Get enrollment by id.
   * @throws EnrollmentNotFoundError
   */
  static async getEnrollmentById(
    input: GetEnrollmentByIdInput,
  ): Promise<Enrollment> {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: input.id },
    });

    if (!enrollment) {
      throw new EnrollmentNotFoundError(
        `Enrollment not found for id=${input.id}`,
      );
    }

    return enrollment;
  }

  /**
   * Get enrollment by the unique composite (userId, courseId).
   */
  static async getEnrollment(
    input: GetEnrollmentInput,
  ): Promise<Enrollment | null> {
    return await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId: input.userId, courseId: input.courseId },
      },
    });
  }

  /**
   * List enrollments for a course with optional status + pagination.
   */
  static async listEnrollmentsByCourse(
    input: ListEnrollmentsByCourseInput,
  ): Promise<Enrollment[]> {
    return await prisma.enrollment.findMany({
      where: {
        courseId: input.courseId,
        ...(input.status ? { status: input.status } : {}),
      },
      orderBy: { createdAt: "desc" },
      skip: input.skip,
      take: input.take,
    });
  }

  /**
   * List enrollments for a user with optional status + pagination.
   */
  static async listEnrollmentsByUser(
    input: ListEnrollmentsByUserInput,
  ) {
    return await prisma.enrollment.findMany({
      where: {
        userId: input.userId,
        ...(input.status ? { status: input.status } : {}),
      },
      include: {course: true},
      orderBy: { createdAt: "desc" },
      skip: input.skip,
      take: input.take,
    });
  }

  /**
   * Mark enrollment as completed for (userId, courseId).
   * @throws EnrollmentNotFoundError
   */
  static async markAsCompleted(
    input: MarkAsCompletedInput,
  ): Promise<Enrollment> {
    const existing = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId: input.userId, courseId: input.courseId },
      },
    });

    if (!existing) {
      throw new EnrollmentNotFoundError(
        `Enrollment not found for userId=${input.userId} courseId=${input.courseId}`,
      );
    }

    if (existing.status === "COMPLETED") return existing;

    try {
      return await prisma.enrollment.update({
        where: { id: existing.id },
        data: { status: "COMPLETED" },
      });
    } catch (err) {
      if (err instanceof ServiceError) throw err;
      throw this.mapPrismaError(
        err,
        `Failed to mark enrollment completed for userId=${input.userId} courseId=${input.courseId}.`,
      );
    }
  }

  /**
   * Drop course for (userId, courseId) (sets status DROPPED).
   * @throws EnrollmentNotFoundError
   */
  static async dropCourse(input: DropCourseInput): Promise<Enrollment> {
    const existing = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId: input.userId, courseId: input.courseId },
      },
    });

    if (!existing) {
      throw new EnrollmentNotFoundError(
        `Enrollment not found for userId=${input.userId} courseId=${input.courseId}`,
      );
    }

    if (existing.status === "DROPPED") return existing;

    try {
      return await prisma.enrollment.update({
        where: { id: existing.id },
        data: { status: "DROPPED" },
      });
    } catch (err) {
      if (err instanceof ServiceError) throw err;
      throw this.mapPrismaError(
        err,
        `Failed to drop course for userId=${input.userId} courseId=${input.courseId}.`,
      );
    }
  }

  /**
   * Update enrollment status explicitly (prefer markAsCompleted/dropCourse for intent).
   * @throws EnrollmentNotFoundError
   */
  static async updateEnrollmentStatus(
    input: UpdateEnrollmentStatusInput,
  ): Promise<Enrollment> {
    // Ensure existence for consistent domain error
    const existing = await prisma.enrollment.findUnique({
      where: { id: input.enrollmentId },
      select: { id: true },
    });

    if (!existing) {
      throw new EnrollmentNotFoundError(
        `Enrollment not found for id=${input.enrollmentId}`,
      );
    }

    try {
      return await prisma.enrollment.update({
        where: { id: input.enrollmentId },
        data: { status: input.status },
      });
    } catch (err) {
      if (err instanceof ServiceError) throw err;
      throw this.mapPrismaError(
        err,
        `Failed to update enrollment status for id=${input.enrollmentId}.`,
      );
    }
  }

  /**
   * Delete enrollment (hard delete).
   * @throws EnrollmentNotFoundError
   */
  static async deleteEnrollment(
    input: DeleteEnrollmentInput,
  ): Promise<Enrollment> {
    // Ensure existence for consistent domain error
    const existing = await prisma.enrollment.findUnique({
      where: { id: input.enrollmentId },
      select: { id: true },
    });

    if (!existing) {
      throw new EnrollmentNotFoundError(
        `Enrollment not found for id=${input.enrollmentId}`,
      );
    }

    try {
      return await prisma.enrollment.delete({
        where: { id: input.enrollmentId },
      });
    } catch (err) {
      if (err instanceof ServiceError) throw err;
      throw this.mapPrismaError(
        err,
        `Failed to delete enrollment id=${input.enrollmentId}.`,
      );
    }
  }

  /**
   * Minimal Prisma exception mapping to standardized ServiceErrors.
   *
   * We can't reliably import Prisma runtime error classes here, so we map
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
        return new EnrollmentConflictError(fallbackMessage);
      if (err.code === "P2025")
        return new EnrollmentNotFoundError("Enrollment not found.");
      return new EnrollmentPersistenceError(
        `${fallbackMessage} ${err.message}`,
      );
    }

    const msg = err instanceof Error ? err.message : String(err);
    return new EnrollmentPersistenceError(`${fallbackMessage} ${msg}`);
  }
}

export default EnrollmentService;
