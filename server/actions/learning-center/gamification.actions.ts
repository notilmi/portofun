"use server";

import GamificationService from "@/domain/services/gamification.service";
import {
  awardPointsSchema,
  checkBadgesSchema,
  updateStreakSchema,
  getLeaderboardSchema,
  getUserRankSchema,
  getUserBadgesSchema,
  type AwardPointsInput,
  type CheckBadgesInput,
  type UpdateStreakInput,
  type GetLeaderboardInput,
  type GetUserRankInput,
  type GetUserBadgesInput,
} from "@/domain/services/schema/gamification.schema";
import {
  handleServerActionError,
  ServerActionError,
  type ServerActionResponse,
  validateInput,
} from "@/server/actions/_common";
import { getSessionThrowable } from "@/server/actions/auth";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";

/**
 * Read Actions
 */

export async function getGlobalLeaderboard(input: GetLeaderboardInput) {
  "use cache";
  cacheTag("globalLeaderboard");
  cacheLife("hours");

  const parsedInput = validateInput(getLeaderboardSchema, input);
  return GamificationService.getGlobalLeaderboard(parsedInput.limit);
}

export async function getUserRank(input: GetUserRankInput) {
  "use cache";
  cacheTag("userRank", input.userId);
  cacheLife("hours");

  const parsedInput = validateInput(getUserRankSchema, input);
  return GamificationService.getUserRank(parsedInput.userId);
}

export async function getUserBadges(input: GetUserBadgesInput) {
  "use cache";
  cacheTag("userBadges", input.userId);
  cacheLife("hours");

  const parsedInput = validateInput(getUserBadgesSchema, input);
  return GamificationService.getUserBadges(parsedInput.userId);
}

/**
 * Write Actions
 */

export async function awardPointsForCompletion(
  input: AwardPointsInput,
): Promise<ServerActionResponse<{ pointsAwarded: number; totalPoints: number }>> {
  try {
    const session = await getSessionThrowable(false);
    const parsedInput = validateInput(awardPointsSchema, input);

    if (parsedInput.userId !== session.id) {
      throw new ServerActionError("Forbidden", "FORBIDDEN");
    }

    const result = await GamificationService.awardPointsForCompletion(
      parsedInput.userId,
      parsedInput.materialId,
    );

    // Revalidate related cache tags
    revalidateTag("userRank", "max");
    revalidateTag("globalLeaderboard", "max");

    return {
      pointsAwarded: result.pointsAwarded,
      totalPoints: result.totalPoints,
    };
  } catch (error) {
    return handleServerActionError(error);
  }
}

export async function checkAndIssueBadges(
  input: CheckBadgesInput,
): Promise<ServerActionResponse<{ badgeIds: string[] }>> {
  try {
    const session = await getSessionThrowable(false);
    const parsedInput = validateInput(checkBadgesSchema, input);

    if (parsedInput.userId !== session.id) {
      throw new ServerActionError("Forbidden", "FORBIDDEN");
    }

    const badgeIds = await GamificationService.checkAndIssueBadges(
      parsedInput.userId,
    );

    // Revalidate badges cache tag
    revalidateTag("userBadges", "max");

    return { badgeIds };
  } catch (error) {
    return handleServerActionError(error);
  }
}

export async function updateUserStreak(
  input: UpdateStreakInput,
): Promise<
  ServerActionResponse<{
    currentStreak: number;
    longestStreak: number;
  }>
> {
  try {
    const session = await getSessionThrowable(false);
    const parsedInput = validateInput(updateStreakSchema, input);

    if (parsedInput.userId !== session.id) {
      throw new ServerActionError("Forbidden", "FORBIDDEN");
    }

    const result = await GamificationService.updateUserStreak(
      parsedInput.userId,
    );

    return {
      currentStreak: result.currentStreak,
      longestStreak: result.longestStreak,
    };
  } catch (error) {
    return handleServerActionError(error);
  }
}

