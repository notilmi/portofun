import prisma from "@/server/db/db";
import type { Course, Material, Prisma } from "@/generated/prisma/client";
import { ServiceError } from "@/domain/errors/ServiceError";
import type {
  ArchiveCourseInput,
  CreateCourseInput,
  DeleteCourseInput,
  GetCourseByIdInput,
  GetCourseHierarchyInput,
  ListCoursesInput,
  UnarchiveCourseInput,
  UpdateCourseInput,
} from "@/domain/services/schema/course.schema";

/**
 * Thrown when a Course record cannot be found.
 */
export class CourseNotFoundError extends ServiceError {
  constructor(message: string) {
    super(message, "COURSE_NOT_FOUND", 404);
    this.name = "CourseNotFoundError";
  }
}

/**
 * Thrown when a database constraint is violated (e.g. unique constraint).
 */
export class CourseConflictError extends ServiceError {
  constructor(message: string) {
    super(message, "COURSE_CONFLICT", 409);
    this.name = "CourseConflictError";
  }
}

/**
 * Thrown when a persistence operation cannot be completed due to an unexpected DB error.
 */
export class CoursePersistenceError extends ServiceError {
  constructor(message: string) {
    super(message, "COURSE_PERSISTENCE_ERROR", 500);
    this.name = "CoursePersistenceError";
  }
}

/**
 * Service-layer operations for Courses.
 *
 * Architecture rules (per your guidelines):
 * - Services accept schema-inferred inputs (validated upstream).
 * - No broad try/catch; only catch Prisma exceptions to map to standardized ServiceErrors.
 * - Throw only standardized ServiceErrors (custom where appropriate, generic otherwise).
 */
export class CourseService {
  /**
   * Create a new Course.
   *
   * Accepts a domain input (validated upstream) and maps it to Prisma create fields.
   */
  static async createCourse(input: CreateCourseInput): Promise<Course> {
    try {
      return await prisma.course.create({
        data: {
          title: input.title,
          description: input.description,
        },
      });
    } catch (err) {
      throw this.mapPrismaError(err, "Failed to create course.");
    }
  }

  /**
   * Get a Course by id.
   * @throws CourseNotFoundError
   */
  static async getCourseById(input: GetCourseByIdInput): Promise<Course> {
    const course = await prisma.course.findUnique({ where: { id: input.id } });
    if (!course)
      throw new CourseNotFoundError(`Course not found for id=${input.id}`);
    return course;
  }

  /**
   * List courses with optional filtering, ordering, and pagination.
   */
  static async listCourses(input?: ListCoursesInput): Promise<Course[]> {
    const where: Prisma.CourseWhereInput | undefined =
      input?.isArchived === undefined
        ? undefined
        : { isArchived: input.isArchived };

    const orderByField = input?.orderBy ?? "createdAt";
    const orderDirection = input?.orderDirection ?? "desc";

    const orderBy: Prisma.CourseOrderByWithRelationInput =
      orderByField === "title"
        ? { title: orderDirection }
        : orderByField === "updatedAt"
          ? { updatedAt: orderDirection }
          : { createdAt: orderDirection };

    return await prisma.course.findMany({
      where,
      orderBy,
      skip: input?.skip,
      take: input?.take,
    });
  }

  /**
   * Update a Course by id.
   * @throws CourseNotFoundError
   */
  static async updateCourse(input: UpdateCourseInput): Promise<Course> {
    // Ensure record exists for consistent error semantics
    await this.assertCourseExists(input.id);

    try {
      return await prisma.course.update({
        where: { id: input.id },
        data: {
          ...(input.title !== undefined ? { title: input.title } : {}),
          ...(input.description !== undefined
            ? { description: input.description }
            : {}),
          ...(input.isArchived !== undefined
            ? { isArchived: input.isArchived }
            : {}),
        },
      });
    } catch (err) {
      throw this.mapPrismaError(err, `Failed to update course id=${input.id}.`);
    }
  }

  /**
   * Hard-delete a Course (physical delete).
   *
   * Prefer `archiveCourse` for soft deletion.
   * @throws CourseNotFoundError
   */
  static async deleteCourse(input: DeleteCourseInput): Promise<Course> {
    await this.assertCourseExists(input.id);

    try {
      return await prisma.course.delete({ where: { id: input.id } });
    } catch (err) {
      throw this.mapPrismaError(err, `Failed to delete course id=${input.id}.`);
    }
  }

  /**
   * Soft-delete a Course by setting `isArchived=true`.
   * @throws CourseNotFoundError
   */
  static async archiveCourse(input: ArchiveCourseInput): Promise<Course> {
    await this.assertCourseExists(input.id);

    try {
      return await prisma.course.update({
        where: { id: input.id },
        data: { isArchived: true },
      });
    } catch (err) {
      throw this.mapPrismaError(
        err,
        `Failed to archive course id=${input.id}.`,
      );
    }
  }

  /**
   * Restore a previously archived Course (`isArchived=false`).
   * @throws CourseNotFoundError
   */
  static async unarchiveCourse(input: UnarchiveCourseInput): Promise<Course> {
    await this.assertCourseExists(input.id);

    try {
      return await prisma.course.update({
        where: { id: input.id },
        data: { isArchived: false },
      });
    } catch (err) {
      throw this.mapPrismaError(
        err,
        `Failed to unarchive course id=${input.id}.`,
      );
    }
  }

  /**
   * Fetch a complete Course hierarchy:
   * - Course
   * - Chapters ordered by `sequenceOrder` (ascending)
   * - For each Chapter: only non-archived Materials ordered by `sequenceOrder`
   *
   * @throws CourseNotFoundError
   */
  static async getCourseHierarchy(input: GetCourseHierarchyInput): Promise<
    Course & {
      chapters: Array<
        Prisma.ChapterGetPayload<{
          include: { materials: true };
        }> & { materials: Material[] }
      >;
    }
  > {
    const course = await prisma.course.findUnique({
      where: { id: input.courseId },
      include: {
        chapters: {
          orderBy: { sequenceOrder: "asc" },
          include: {
            materials: {
              where: { isArchived: false },
              orderBy: { sequenceOrder: "asc" },
            },
          },
        },
      },
    });

    if (!course) {
      throw new CourseNotFoundError(
        `Course not found for id=${input.courseId}`,
      );
    }

    return course as unknown as Course & {
      chapters: Array<
        Prisma.ChapterGetPayload<{
          include: { materials: true };
        }> & { materials: Material[] }
      >;
    };
  }

  /**
   * Ensures a course exists.
   * @throws CourseNotFoundError
   */
  private static async assertCourseExists(courseId: string): Promise<void> {
    const exists = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    });

    if (!exists)
      throw new CourseNotFoundError(`Course not found for id=${courseId}`);
  }

  /**
   * Minimal Prisma exception mapping to standardized ServiceErrors.
   *
   * We can't rely on importing Prisma runtime error classes in this repo, so we map
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
      // Unique constraint violation
      if (err.code === "P2002") return new CourseConflictError(fallbackMessage);

      // Record not found for update/delete
      if (err.code === "P2025")
        return new CourseNotFoundError("Course not found.");

      return new CoursePersistenceError(`${fallbackMessage} ${err.message}`);
    }

    const msg = err instanceof Error ? err.message : String(err);
    return new CoursePersistenceError(`${fallbackMessage} ${msg}`);
  }
}

export default CourseService;
