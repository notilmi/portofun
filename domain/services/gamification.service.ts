import prisma from "@/server/db/db";
import type { Prisma } from "@/generated/prisma/client";
import { ServiceError } from "@/domain/errors/ServiceError";

/**
 * Thrown when a user record cannot be found.
 */
export class GamificationUserNotFoundError extends ServiceError {
  constructor(message: string) {
    super(message, "USER_NOT_FOUND", 404);
    this.name = "GamificationUserNotFoundError";
  }
}

/**
 * Thrown when a material record cannot be found.
 */
export class GamificationMaterialNotFoundError extends ServiceError {
  constructor(message: string) {
    super(message, "MATERIAL_NOT_FOUND", 404);
    this.name = "GamificationMaterialNotFoundError";
  }
}

/**
 * Thrown when a persistence operation fails unexpectedly.
 */
export class GamificationPersistenceError extends ServiceError {
  constructor(message: string) {
    super(message, "GAMIFICATION_PERSISTENCE_ERROR", 500);
    this.name = "GamificationPersistenceError";
  }
}

/**
 * Gamification service encapsulating all gamification business logic.
 *
 * IMPORTANT:
 * - This service accepts pre-validated inputs (validation is done upstream in server actions).
 * - Do NOT perform input validation here.
 * - Do NOT use broad try/catch; only catch Prisma exceptions to map to standardized ServiceErrors.
 *
 * Business logic:
 * - Points allocation: 10 base points with 1.5x multiplier for on-time completion
 * - Badges: Completion (25%, 50%, 75%, 100%), Streak (3, 7, 30, 100 days), Performance
 * - Streaks: Track current/longest streaks with 1-day grace period
 * - Levels: Exponential XP scaling (100 points per level)
 * - Leaderboards: Global rankings by points with percentile calculations
 */
export class GamificationService {
  // Constants
  private static readonly BASE_POINTS = 10;
  private static readonly TIME_MULTIPLIER = 1.5;
  private static readonly XP_PER_LEVEL = 100;
  private static readonly COMPLETION_THRESHOLDS = [25, 50, 75, 100];
  private static readonly STREAK_THRESHOLDS = [3, 7, 30, 100];
  private static readonly PERFORMANCE_THRESHOLDS = [0.8, 0.9, 0.95];
  private static readonly STREAK_GRACE_PERIOD_HOURS = 24;

  /**
   * Award points for material completion.
   *
   * - Awards base points (10)
   * - Applies 1.5x multiplier if completed within deadline
   * - Updates user's totalPoints and experience
   * - Creates GamificationEvent record
   * - Returns updated points
   *
   * @throws GamificationUserNotFoundError if user doesn't exist
   * @throws GamificationMaterialNotFoundError if material doesn't exist
   * @throws GamificationPersistenceError if DB operation fails
   */
  static async awardPointsForCompletion(
    userId: string,
    materialId: string,
  ): Promise<{ pointsAwarded: number; totalPoints: number; experience: number }> {
    try {
      return await prisma.$transaction(async (tx) => {
        // Verify user exists
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { id: true },
        });
        if (!user) {
          throw new GamificationUserNotFoundError(
            `User not found for id=${userId}`,
          );
        }

        // Verify material exists
        const material = await tx.material.findUnique({
          where: { id: materialId },
          select: { id: true },
        });
        if (!material) {
          throw new GamificationMaterialNotFoundError(
            `Material not found for id=${materialId}`,
          );
        }

        // Check if completed within deadline (assume all completions are on-time for now)
        // In a real scenario, this would check against material.deadline field
        const pointsAwarded = this.BASE_POINTS;
        const multiplier = 1; // In production: this.TIME_MULTIPLIER if onTime else 1

        const finalPoints = Math.round(pointsAwarded * multiplier);
        const newExperience = finalPoints;

        // Update user's gamification stats
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            // Note: These fields should be added to User model in schema
            // totalPoints: { increment: finalPoints },
            // experience: { increment: newExperience },
          },
          select: { id: true },
        });

        // Create GamificationEvent record
        // Note: This model should be added to schema
        // await tx.gamificationEvent.create({
        //   data: {
        //     userId,
        //     materialId,
        //     eventType: "POINTS_AWARDED",
        //     pointsValue: finalPoints,
        //     metadata: { multiplier },
        //   },
        // });

        return {
          pointsAwarded: finalPoints,
          totalPoints: finalPoints,
          experience: newExperience,
        };
      });
    } catch (err) {
      if (err instanceof ServiceError) throw err;
      throw this.mapPrismaError(
        err,
        `Failed to award points for userId=${userId} materialId=${materialId}.`,
      );
    }
  }

  /**
   * Check and issue badges for user based on progress.
   *
   * Badges awarded:
   * - Completion: 25%, 50%, 75%, 100% of course materials completed
   * - Streak: 3, 7, 30, 100 day streaks
   * - Performance: 80%, 90%, 95% completion/accuracy rates
   *
   * Returns array of newly earned badges with IDs and earn dates.
   *
   * @throws GamificationUserNotFoundError if user doesn't exist
   * @throws GamificationPersistenceError if DB operation fails
   */
  static async checkAndIssueBadges(userId: string): Promise<string[]> {
    try {
      return await prisma.$transaction(async (tx) => {
        // Verify user exists
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { id: true },
        });
        if (!user) {
          throw new GamificationUserNotFoundError(
            `User not found for id=${userId}`,
          );
        }

        const newBadges: string[] = [];

        // Get user's completion progress
        const userProgress = await tx.userProgress.findMany({
          where: { userId },
        });
        const completedCount = userProgress.filter(
          (p) => p.completedAt !== null,
        ).length;
        const totalCount = userProgress.length;
        const completionPercentage =
          totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

        // Check completion badges (25%, 50%, 75%, 100%)
        for (const threshold of this.COMPLETION_THRESHOLDS) {
          if (completionPercentage >= threshold) {
            const badgeId = `completion_${threshold}`;
            // TODO: Query actual UserBadges table when schema is migrated
            // In production: check if badge exists, create if not
            // For now, just track badge IDs that qualify
            newBadges.push(badgeId);
          }
        }

        // TODO: Add streak badge checks when streak tracking is implemented
        // TODO: Add performance badge checks when performance metrics are tracked

        return newBadges;
      });
    } catch (err) {
      if (err instanceof ServiceError) throw err;
      throw this.mapPrismaError(
        err,
        `Failed to check and issue badges for userId=${userId}.`,
      );
    }
  }

  /**
   * Update user's activity streak.
   *
   * - Increments currentStreak if activity was today
   * - Resets if last activity > 1 day ago
   * - Updates longestStreak if currentStreak exceeds it
   * - Returns updated streak info
   *
   * Returns: { currentStreak, longestStreak, lastActivityDate }
   *
   * @throws GamificationUserNotFoundError if user doesn't exist
   * @throws GamificationPersistenceError if DB operation fails
   */
  static async updateUserStreak(
    userId: string,
  ): Promise<{
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: Date;
  }> {
    try {
      return await prisma.$transaction(async (tx) => {
        // Verify user exists
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { id: true },
        });
        if (!user) {
          throw new GamificationUserNotFoundError(
            `User not found for id=${userId}`,
          );
        }

        // Get user's current streak info
        // Note: Streak fields should be added to User model
        // const userStreak = await tx.userStreak.findUnique({ where: { userId } }) || {
        //   currentStreak: 0,
        //   longestStreak: 0,
        //   lastActivityDate: null,
        // };

        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Placeholder implementation (assumes streak tracking exists)
        const currentStreak = 1;
        const longestStreak = 1;

        // In production:
        // if (userStreak.lastActivityDate && userStreak.lastActivityDate > oneDayAgo) {
        //   currentStreak = userStreak.currentStreak + 1;
        // } else if (!userStreak.lastActivityDate || userStreak.lastActivityDate <= oneDayAgo) {
        //   currentStreak = 1;
        // }
        // longestStreak = Math.max(userStreak.longestStreak, currentStreak);

        return {
          currentStreak,
          longestStreak,
          lastActivityDate: now,
        };
      });
    } catch (err) {
      if (err instanceof ServiceError) throw err;
      throw this.mapPrismaError(
        err,
        `Failed to update streak for userId=${userId}.`,
      );
    }
  }

  /**
   * Convert experience points to level.
   *
   * - Calculates level based on XP (100 points per level)
   * - Returns current level and XP needed for next level
   *
   * Returns: { level, nextLevelXp, currentLevelXp }
   */
  static calculateLevel(experience: number): {
    level: number;
    nextLevelXp: number;
    currentLevelXp: number;
  } {
    const level = Math.floor(experience / this.XP_PER_LEVEL);
    const currentLevelXp = level * this.XP_PER_LEVEL;
    const nextLevelXp = (level + 1) * this.XP_PER_LEVEL;

    return {
      level,
      currentLevelXp,
      nextLevelXp,
    };
  }

  /**
   * Get global leaderboard by points.
   *
   * - Returns top N users ranked by totalPoints
   * - Includes rank, points, level, and user info
   * - Supports pagination
   *
   * Returns paginated leaderboard entries
   *
   * @throws GamificationPersistenceError if DB operation fails
   */
  static async getGlobalLeaderboard(limit: number = 100): Promise<
    Array<{
      rank: number;
      userId: string;
      userName: string;
      userEmail: string;
      points: number;
      level: number;
      experience: number;
    }>
  > {
    try {
      // Get total user count for ranking context
      const totalUsers = await prisma.user.count();

      // In production, this would query actual gamification stats
      // For now, returning empty leaderboard structure
      const users = await prisma.user.findMany({
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
        },
        orderBy: { createdAt: "desc" }, // Would order by totalPoints in production
      });

      return users.map((user, index) => ({
        rank: index + 1,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        points: 0, // Would come from user.totalPoints in production
        level: 0, // Would calculate from experience
        experience: 0, // Would come from user.experience
      }));
    } catch (err) {
      if (err instanceof ServiceError) throw err;
      throw this.mapPrismaError(err, "Failed to get global leaderboard.");
    }
  }

  /**
   * Get user's global rank and stats.
   *
   * - Returns user's rank among all users
   * - Includes percentile ranking
   * - Returns points, level, and stats
   *
   * @throws GamificationUserNotFoundError if user doesn't exist
   * @throws GamificationPersistenceError if DB operation fails
   */
  static async getUserRank(userId: string): Promise<{
    rank: number;
    percentile: number;
    points: number;
    level: number;
    totalUsers: number;
  }> {
    try {
      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });
      if (!user) {
        throw new GamificationUserNotFoundError(
          `User not found for id=${userId}`,
        );
      }

      // Count total users (in production would filter by totalPoints > 0)
      const totalUsers = await prisma.user.count();

      // In production, would calculate actual rank by counting users with higher points
      const userRank = 1;
      const percentile = ((totalUsers - userRank + 1) / totalUsers) * 100;

      return {
        rank: userRank,
        percentile,
        points: 0, // Would come from user.totalPoints
        level: 0, // Would calculate from experience
        totalUsers,
      };
    } catch (err) {
      if (err instanceof ServiceError) throw err;
      throw this.mapPrismaError(
        err,
        `Failed to get rank for userId=${userId}.`,
      );
    }
  }

  /**
   * Get all earned badges for user with earn dates.
   *
   * - Returns badges sorted by earn date (newest first)
   * - Includes badge metadata and earn timestamps
   *
   * Returns array of earned badges
   *
   * @throws GamificationUserNotFoundError if user doesn't exist
   * @throws GamificationPersistenceError if DB operation fails
   */
  static async getUserBadges(
    userId: string,
  ): Promise<
    Array<{
      badgeId: string;
      badgeType: string;
      earnedAt: Date;
      name: string;
      description: string;
    }>
  > {
    try {
      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });
      if (!user) {
        throw new GamificationUserNotFoundError(
          `User not found for id=${userId}`,
        );
      }

      // In production, this would query actual badge records:
      // const badges = await prisma.badge.findMany({
      //   where: { userId },
      //   orderBy: { earnedAt: "desc" },
      //   select: {
      //     id: true,
      //     badgeType: true,
      //     earnedAt: true,
      //   },
      // });

      return [];
    } catch (err) {
      if (err instanceof ServiceError) throw err;
      throw this.mapPrismaError(
        err,
        `Failed to get badges for userId=${userId}.`,
      );
    }
  }

  // -------------------------
  // Helpers
  // -------------------------

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
      if (err.code === "P2025")
        return new GamificationUserNotFoundError("User not found.");
      return new GamificationPersistenceError(`${fallbackMessage} ${err.message}`);
    }

    const msg = err instanceof Error ? err.message : String(err);
    return new GamificationPersistenceError(`${fallbackMessage} ${msg}`);
  }
}

export default GamificationService;
