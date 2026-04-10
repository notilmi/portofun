"use server";

import ProgressService from "@/domain/services/progress.service";
import GamificationService from "@/domain/services/gamification.service";
import {
  getProgressSchema,
  listCourseProgressSchema,
  markMaterialCompletedSchema,
  validateQuizAndCompleteSchema,
  type GetProgressInput,
  type ListCourseProgressInput,
  type MarkMaterialCompletedInput,
  type ValidateQuizAndCompleteInput,
} from "@/domain/services/schema/progress.schema";
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

export async function getProgress(input: GetProgressInput) {
  "use cache";
  cacheTag("progress", input.userId, input.materialId);
  cacheLife("hours");

  const parsedInput = validateInput(getProgressSchema, input);
  return ProgressService.getProgress(parsedInput);
}

export async function getCourseProgress(input: ListCourseProgressInput) {
  "use cache";
  cacheTag("courseProgress", input.userId, input.courseId);
  cacheLife("hours");

  const parsedInput = validateInput(listCourseProgressSchema, input);
  return ProgressService.listCourseProgress(parsedInput);
}

/**
 * Write Actions
 *
 * NOTE:
 * - These return `ServerActionResponse<void>` to standardize error handling.
 * - They also enforce auth where appropriate.
 */

export type MarkMaterialCompletedResult = {
  gamification?: {
    pointsAwarded: number;
    totalPoints: number;
    badgeIds: string[];
    currentStreak: number;
    longestStreak: number;
  };
};

export async function markMaterialCompleted(
  input: MarkMaterialCompletedInput,
): Promise<ServerActionResponse<MarkMaterialCompletedResult>> {
  try {
    // Any logged-in user can complete materials, but only for themselves.
    const session = await getSessionThrowable(false);
    const parsedInput = validateInput(markMaterialCompletedSchema, input);

    if (parsedInput.userId !== session.id) {
      throw new ServerActionError("Forbidden", "FORBIDDEN");
    }

    await ProgressService.markMaterialCompleted(parsedInput);

    // Trigger gamification flow
    const gamificationResult = await triggerGamificationFlow(
      parsedInput.userId,
      parsedInput.materialId,
    );

    // Only use supported cacheLife profiles here.
    revalidateTag("courseProgress", "max");
    revalidateTag("progress", "max");
    revalidateTag("userRank", "max");
    revalidateTag("globalLeaderboard", "max");
    revalidateTag("userBadges", "max");

    return {
      gamification: gamificationResult,
    };
  } catch (error) {
    return handleServerActionError(error);
  }
}

/**
 * Helper function to trigger all gamification updates for material completion.
 * 
 * Gracefully handles gamification failures - logs errors but doesn't block completion.
 * This ensures the material completion always succeeds even if gamification fails.
 */
async function triggerGamificationFlow(
  userId: string,
  materialId: string,
): Promise<{
  pointsAwarded: number;
  totalPoints: number;
  badgeIds: string[];
  currentStreak: number;
  longestStreak: number;
}> {
  try {
    // Award points for completion
    const pointsResult = await GamificationService.awardPointsForCompletion(
      userId,
      materialId,
    );

    // Check and issue badges
    const badgeIds = await GamificationService.checkAndIssueBadges(userId);

    // Update user streak
    const streakResult = await GamificationService.updateUserStreak(userId);

    return {
      pointsAwarded: pointsResult.pointsAwarded,
      totalPoints: pointsResult.totalPoints,
      badgeIds,
      currentStreak: streakResult.currentStreak,
      longestStreak: streakResult.longestStreak,
    };
  } catch (error) {
    // Log gamification error but don't fail material completion
    console.error(
      `Gamification flow error for userId=${userId}, materialId=${materialId}:`,
      error instanceof Error ? error.message : String(error),
    );

    // Return empty gamification result to client
    // This allows completion to succeed while gamification features gracefully degrade
    return {
      pointsAwarded: 0,
      totalPoints: 0,
      badgeIds: [],
      currentStreak: 0,
      longestStreak: 0,
    };
  }
}

export type ValidateQuizAndCompleteResult = {
  correct: boolean;
  results: Array<{
    questionId: string;
    correct: boolean;
    expected: string;
    received: string;
  }>;
  gamification?: {
    pointsAwarded: number;
    totalPoints: number;
    badgeIds: string[];
    currentStreak: number;
    longestStreak: number;
  };
};

export async function validateQuizAndComplete(
  input: ValidateQuizAndCompleteInput,
): Promise<ServerActionResponse<ValidateQuizAndCompleteResult>> {
  try {
    // Any logged-in user can take quizzes, but only for themselves.
    const session = await getSessionThrowable(false);
    const parsedInput = validateInput(validateQuizAndCompleteSchema, input);

    if (parsedInput.userId !== session.id) {
      throw new ServerActionError("Forbidden", "FORBIDDEN");
    }

    const result = await ProgressService.validateQuizAndComplete(parsedInput);

    // Trigger gamification flow for passed quizzes
    let gamificationData: ValidateQuizAndCompleteResult["gamification"];
    if (result.correct) {
      gamificationData = await triggerGamificationFlow(
        parsedInput.userId,
        parsedInput.materialId,
      );
    }

    // Refresh progress caches.
    revalidateTag("courseProgress", "max");
    revalidateTag("progress", "max");
    revalidateTag("userRank", "max");
    revalidateTag("globalLeaderboard", "max");
    revalidateTag("userBadges", "max");

    return {
      correct: result.correct,
      results: result.results,
      gamification: gamificationData,
    };
  } catch (error) {
    return handleServerActionError(error);
  }
}
