import { z } from "zod";

/**
 * Gamification input schemas & inferred types for the service layer.
 *
 * IMPORTANT:
 * - These schemas are intended to be used by the Server Action / Controller layer.
 * - Services should accept the inferred types WITHOUT re-validating.
 *
 * Domain notes:
 * - Points are awarded to users for specific material interactions.
 * - Badges are achievements with criteria and rarity levels.
 * - Streaks track consecutive days of user activity.
 * - Leaderboard is a ranked view of user scores.
 */

export const uuidSchema = z.string().uuid();

export const badgeRaritySchema = z.enum([
  "common",
  "uncommon",
  "rare",
  "epic",
  "legendary",
]);
export type BadgeRarity = z.infer<typeof badgeRaritySchema>;

export const badgeCategorySchema = z.enum([
  "achievement",
  "milestone",
  "social",
  "learning",
  "challenge",
]);
export type BadgeCategory = z.infer<typeof badgeCategorySchema>;

/**
 * Award Points schema.
 *
 * Validates input for awarding gamification points to a user for completing
 * an action (e.g., completing a material, quiz submission).
 *
 * Fields:
 * - userId: UUID of the user receiving points
 * - materialId: UUID of the material associated with the points
 */
export const awardPointsSchema = z.object({
  userId: uuidSchema,
  materialId: uuidSchema,
});

export type AwardPointsInput = z.infer<typeof awardPointsSchema>;

/**
 * Check Badges schema.
 *
 * Validates input for checking if a user has earned new badges based on
 * their current progress and criteria.
 *
 * Fields:
 * - userId: UUID of the user to check for badge eligibility
 */
export const checkBadgesSchema = z.object({
  userId: uuidSchema,
});

export type CheckBadgesInput = z.infer<typeof checkBadgesSchema>;

/**
 * Update Streak schema.
 *
 * Validates input for updating a user's learning streak. Increments streak
 * on consecutive activity days, resets if a day is missed.
 *
 * Fields:
 * - userId: UUID of the user whose streak should be updated
 */
export const updateStreakSchema = z.object({
  userId: uuidSchema,
});

export type UpdateStreakInput = z.infer<typeof updateStreakSchema>;

/**
 * Get Leaderboard schema.
 *
 * Validates input for fetching the global leaderboard of top users by points.
 * Supports pagination with optional limit and offset.
 *
 * Fields:
 * - limit: Maximum number of results to return (optional, default: 10, max: 100)
 * - offset: Number of results to skip (optional, default: 0)
 */
export const getLeaderboardSchema = z.object({
  limit: z.number().int().min(1).max(100).optional().default(10),
  offset: z.number().int().min(0).optional().default(0),
});

export type GetLeaderboardInput = z.infer<typeof getLeaderboardSchema>;

/**
 * Get User Rank schema.
 *
 * Validates input for fetching a user's rank and position on the leaderboard.
 *
 * Fields:
 * - userId: UUID of the user whose rank should be retrieved
 */
export const getUserRankSchema = z.object({
  userId: uuidSchema,
});

export type GetUserRankInput = z.infer<typeof getUserRankSchema>;

/**
 * Get User Badges schema.
 *
 * Validates input for fetching all badges earned by a specific user.
 *
 * Fields:
 * - userId: UUID of the user whose badges should be retrieved
 */
export const getUserBadgesSchema = z.object({
  userId: uuidSchema,
});

export type GetUserBadgesInput = z.infer<typeof getUserBadgesSchema>;

/**
 * Create Badge schema.
 *
 * Validates input for creating a new badge definition in the system.
 * Badges are templates that users can earn based on criteria.
 *
 * Fields:
 * - name: Display name of the badge (required, non-empty)
 * - description: Detailed description of the badge (required, non-empty)
 * - category: Category/type of the badge (achievement, milestone, social, learning, challenge)
 * - criteria: JSON criteria object describing how to earn the badge (required, non-empty)
 * - icon: URL or path to the badge icon image (required, valid URL)
 * - rarity: Rarity level affecting badge prominence (common, uncommon, rare, epic, legendary)
 */
export const createBadgeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Badge name is required")
    .max(100, "Badge name must not exceed 100 characters"),
  description: z
    .string()
    .trim()
    .min(1, "Badge description is required")
    .max(500, "Badge description must not exceed 500 characters"),
  category: badgeCategorySchema,
  criteria: z
    .record(z.string(), z.any())
    .refine(
      (val) => Object.keys(val).length > 0,
      "Badge criteria must contain at least one condition",
    ),
  icon: z
    .string()
    .url("Badge icon must be a valid URL")
    .max(500, "Icon URL must not exceed 500 characters"),
  rarity: badgeRaritySchema,
});

export type CreateBadgeInput = z.infer<typeof createBadgeSchema>;
