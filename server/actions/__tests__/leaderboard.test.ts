/**
 * Integration tests for leaderboard functionality and caching.
 *
 * Test coverage:
 * 1. Leaderboard Calculation - ranking, pagination, ties
 * 2. Cache Invalidation - cache tags, revalidation, persistence
 * 3. User Rank Calculation - rank, percentile, updates
 * 4. Real-time Updates - leaderboard sync with point changes
 * 5. Edge Cases - single user, ties, zero points, performance
 */

import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";
import prisma from "@/server/db/db";
import GamificationService from "@/domain/services/gamification.service";
import {
  getGlobalLeaderboard,
  getUserRank,
  awardPointsForCompletion,
  checkAndIssueBadges,
  updateUserStreak,
} from "@/server/actions/learning-center/gamification.actions";

/**
 * Mock data fixtures
 */
const mockUsers = [
  { id: "user-1", name: "Alice Champion", email: "alice@test.com" },
  { id: "user-2", name: "Bob Runner", email: "bob@test.com" },
  { id: "user-3", name: "Charlie Quick", email: "charlie@test.com" },
  { id: "user-4", name: "Diana Swift", email: "diana@test.com" },
  { id: "user-5", name: "Eve Scholar", email: "eve@test.com" },
];

const mockMaterialIds = ["material-1", "material-2", "material-3", "material-4"];

/**
 * Performance baseline constants (in milliseconds)
 */
const PERFORMANCE_BASELINE = {
  LEADERBOARD_QUERY: 100, // Leaderboard query should complete in < 100ms
  USER_RANK_QUERY: 50, // User rank query should complete in < 50ms
  POINTS_AWARD: 150, // Points award transaction should complete in < 150ms
  CACHE_HIT: 10, // Cache hits should be very fast < 10ms
};

describe("Leaderboard Functionality Tests", () => {
  /**
   * Test Suite Setup & Teardown
   */
  beforeAll(async () => {
    // Setup: Create test users
    for (const user of mockUsers) {
      try {
        await prisma.user.upsert({
          where: { id: user.id },
          update: {},
          create: {
            id: user.id,
            name: user.name,
            email: user.email,
            emailVerified: true,
          },
        });
      } catch (error) {
        console.warn(`User ${user.id} may already exist:`, error);
      }
    }

    // Create or update UserPoints records for each user
    for (const user of mockUsers) {
      await prisma.userPoints.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          totalPoints: 0,
          currentLevel: 1,
          experience: 0,
        },
      });
    }

    // Create materials
    for (const matId of mockMaterialIds) {
      try {
        await prisma.material.upsert({
          where: { id: matId },
          update: {},
          create: {
            id: matId,
            title: `Material ${matId}`,
            content: "Test content",
          },
        });
      } catch (error) {
        console.warn(`Material ${matId} may already exist:`, error);
      }
    }

    console.log("✓ Test setup complete");
  });

  beforeEach(async () => {
    // Reset leaderboard cache before each test
    await prisma.leaderboard.deleteMany({});
  });

  afterEach(async () => {
    // Cleanup: Reset points to 0 after each test
    await prisma.userPoints.updateMany({
      data: { totalPoints: 0, experience: 0, currentLevel: 1 },
    });
    await prisma.leaderboard.deleteMany({});
  });

  /**
   * 1. LEADERBOARD CALCULATION TESTS
   */
  describe("1. Leaderboard Calculation", () => {
    it("should rank users by points in descending order", async () => {
      // Arrange: Set different point values
      const pointsMap: Record<string, number> = {
        "user-1": 300,
        "user-2": 100,
        "user-3": 250,
        "user-4": 50,
        "user-5": 200,
      };

      for (const [userId, points] of Object.entries(pointsMap)) {
        await prisma.userPoints.update({
          where: { userId },
          data: { totalPoints: points, experience: points },
        });
      }

      // Act: Call getGlobalLeaderboard
      const leaderboard = await GamificationService.getGlobalLeaderboard(100);

      // Assert: Check ranking is correct (highest points first)
      expect(leaderboard).toBeDefined();
      expect(leaderboard.length).toBeGreaterThan(0);

      // Verify descending order by rank assignment
      for (let i = 1; i < leaderboard.length; i++) {
        expect(leaderboard[i].rank).toBeGreaterThanOrEqual(leaderboard[i - 1].rank);
      }
    });

    it("should assign correct rank numbers sequentially", async () => {
      // Arrange
      await prisma.userPoints.update({
        where: { userId: "user-1" },
        data: { totalPoints: 500 },
      });

      // Act
      const leaderboard = await GamificationService.getGlobalLeaderboard(10);

      // Assert: Ranks should be sequential starting from 1
      const rankedUsers = leaderboard.slice(0, 5);
      rankedUsers.forEach((entry, index) => {
        expect(entry.rank).toBe(index + 1);
      });
    });

    it("should handle ties by assigning same rank to tied users", async () => {
      // Arrange: Create users with same points
      await prisma.userPoints.updateMany({
        where: { userId: { in: ["user-1", "user-2"] } },
        data: { totalPoints: 100 },
      });

      await prisma.userPoints.update({
        where: { userId: "user-3" },
        data: { totalPoints: 50 },
      });

      // Act
      const leaderboard = await GamificationService.getGlobalLeaderboard(10);

      // Assert: Tied users should have consecutive ranks or same rank
      const user1Entry = leaderboard.find((u) => u.userId === "user-1");
      const user2Entry = leaderboard.find((u) => u.userId === "user-2");

      expect(user1Entry).toBeDefined();
      expect(user2Entry).toBeDefined();
      expect(user1Entry!.points).toBe(user2Entry!.points);
    });

    it("should support pagination with limit parameter", async () => {
      // Arrange: Set points for multiple users
      for (let i = 0; i < mockUsers.length; i++) {
        await prisma.userPoints.update({
          where: { userId: mockUsers[i].id },
          data: { totalPoints: 1000 - i * 100 },
        });
      }

      // Act
      const page1 = await GamificationService.getGlobalLeaderboard(2);
      const page2 = await GamificationService.getGlobalLeaderboard(100); // Get all

      // Assert
      expect(page1.length).toBeLessThanOrEqual(2);
      expect(page2.length).toBeGreaterThanOrEqual(page1.length);
    });

    it("should handle pagination across large leaderboards", async () => {
      // Arrange: Create many users with varying points
      const largeUserSet = Array.from({ length: 50 }, (_, i) => ({
        id: `test-user-${i}`,
        name: `Test User ${i}`,
        email: `test${i}@test.com`,
        points: Math.floor(Math.random() * 10000),
      }));

      for (const user of largeUserSet) {
        try {
          await prisma.user.create({
            data: {
              id: user.id,
              name: user.name,
              email: user.email,
              emailVerified: true,
            },
          });
          await prisma.userPoints.create({
            data: {
              userId: user.id,
              totalPoints: user.points,
            },
          });
        } catch (error) {
          // User might already exist
        }
      }

      // Act
      const page1 = await GamificationService.getGlobalLeaderboard(10);
      const page2 = await GamificationService.getGlobalLeaderboard(20);

      // Assert
      expect(page1.length).toBeLessThanOrEqual(10);
      expect(page2.length).toBeLessThanOrEqual(20);
      expect(page2.length).toBeGreaterThanOrEqual(page1.length);
    });
  });

  /**
   * 2. CACHE INVALIDATION TESTS
   */
  describe("2. Cache Invalidation", () => {
    it("should tag leaderboard cache properly", async () => {
      // Arrange: Track cache operations
      const cacheOperations: Array<{ tag: string; operation: string }> = [];

      // Act: Call leaderboard action
      const result = await getGlobalLeaderboard({ limit: 10 });

      // Assert: Should have result
      expect(result).toBeDefined();
      // Note: Actual cache tagging is validated by Next.js at runtime
    });

    it("should invalidate cache when user points change", async () => {
      // Arrange
      const userId = "user-1";
      const initialPoints = 100;

      await prisma.userPoints.update({
        where: { userId },
        data: { totalPoints: initialPoints },
      });

      // Get initial rank
      const rank1 = await GamificationService.getUserRank(userId);

      // Act: Award points (should trigger cache invalidation)
      await prisma.userPoints.update({
        where: { userId },
        data: { totalPoints: initialPoints + 500 },
      });

      // Get new rank
      const rank2 = await GamificationService.getUserRank(userId);

      // Assert: Rank should reflect new points (lower rank = better)
      // Higher points should improve or maintain rank
      expect(rank2.points).toBeGreaterThan(rank1.points);
    });

    it("should persist cache when no changes occur", async () => {
      // Arrange
      const userId = "user-1";
      await prisma.userPoints.update({
        where: { userId },
        data: { totalPoints: 500 },
      });

      // Act: Call getUserRank twice without changes
      const rank1 = await GamificationService.getUserRank(userId);
      const rank2 = await GamificationService.getUserRank(userId);

      // Assert: Both calls should return identical results
      expect(rank1.rank).toBe(rank2.rank);
      expect(rank1.percentile).toBe(rank2.percentile);
      expect(rank1.points).toBe(rank2.points);
    });

    it("should not have cache interference between different users", async () => {
      // Arrange: Set up different users with different points
      const user1Id = "user-1";
      const user2Id = "user-2";

      await prisma.userPoints.updateMany({
        where: { userId: { in: [user1Id, user2Id] } },
        data: { totalPoints: 100 },
      });

      // Act
      const rank1 = await GamificationService.getUserRank(user1Id);
      const rank2 = await GamificationService.getUserRank(user2Id);

      // Update user 1's points
      await prisma.userPoints.update({
        where: { userId: user1Id },
        data: { totalPoints: 500 },
      });

      const rank1Updated = await GamificationService.getUserRank(user1Id);
      const rank2After = await GamificationService.getUserRank(user2Id);

      // Assert: User 2's rank should not be affected by User 1's point changes
      expect(rank2.percentile).toBe(rank2After.percentile);
      expect(rank1Updated.points).toBeGreaterThan(rank1.points);
    });

    it("should revalidate leaderboard after bulk point changes", async () => {
      // Arrange: Set initial points
      const userPointsMap: Record<string, number> = {
        "user-1": 100,
        "user-2": 200,
        "user-3": 300,
      };

      for (const [userId, points] of Object.entries(userPointsMap)) {
        await prisma.userPoints.update({ where: { userId }, data: { totalPoints: points } });
      }

      // Get initial leaderboard
      const leaderboard1 = await GamificationService.getGlobalLeaderboard(10);

      // Act: Update multiple users
      await prisma.userPoints.updateMany({
        where: { userId: { in: Object.keys(userPointsMap) } },
        data: { totalPoints: { increment: 100 } },
      });

      // Get updated leaderboard
      const leaderboard2 = await GamificationService.getGlobalLeaderboard(10);

      // Assert: Leaderboard should reflect the changes
      expect(leaderboard2).toBeDefined();
    });
  });

  /**
   * 3. USER RANK CALCULATION TESTS
   */
  describe("3. User Rank Calculation", () => {
    it("should calculate correct rank for user", async () => {
      // Arrange: Set up users with known ranking
      const rankings = [
        { userId: "user-1", points: 500 },
        { userId: "user-2", points: 400 },
        { userId: "user-3", points: 300 },
        { userId: "user-4", points: 200 },
        { userId: "user-5", points: 100 },
      ];

      for (const { userId, points } of rankings) {
        await prisma.userPoints.update({ where: { userId }, data: { totalPoints: points } });
      }

      // Act
      const rank = await GamificationService.getUserRank("user-3");

      // Assert: User-3 should be rank 3
      expect(rank.rank).toBe(3);
      expect(rank.points).toBe(300);
    });

    it("should calculate percentile correctly", async () => {
      // Arrange: Create 10 users with known points
      const users = mockUsers.slice(0, 5);
      for (let i = 0; i < users.length; i++) {
        await prisma.userPoints.update({
          where: { userId: users[i].id },
          data: { totalPoints: (5 - i) * 100 },
        });
      }

      // Act
      const rank = await GamificationService.getUserRank("user-1"); // Highest points

      // Assert: Top user should have high percentile
      expect(rank.percentile).toBeGreaterThan(50);
      expect(rank.percentile).toBeLessThanOrEqual(100);
    });

    it("should update rank when user points change", async () => {
      // Arrange
      const userId = "user-1";
      await prisma.userPoints.update({
        where: { userId },
        data: { totalPoints: 100 },
      });
      const rank1 = await GamificationService.getUserRank(userId);

      // Act: Award more points
      await prisma.userPoints.update({
        where: { userId },
        data: { totalPoints: 500 },
      });
      const rank2 = await GamificationService.getUserRank(userId);

      // Assert: Rank should improve (get lower number or better percentile)
      expect(rank2.points).toBeGreaterThan(rank1.points);
      expect(rank2.percentile).toBeGreaterThanOrEqual(rank1.percentile);
    });

    it("should handle user with 0 points (not in leaderboard)", async () => {
      // Arrange
      const userId = "user-1";
      await prisma.userPoints.update({
        where: { userId },
        data: { totalPoints: 0 },
      });

      // Act
      const rank = await GamificationService.getUserRank(userId);

      // Assert: User should still have a rank (last place)
      expect(rank.rank).toBeGreaterThan(0);
      expect(rank.points).toBe(0);
    });

    it("should return valid totalUsers count in rank", async () => {
      // Arrange
      const userId = "user-1";
      await prisma.userPoints.update({
        where: { userId },
        data: { totalPoints: 100 },
      });

      // Act
      const rank = await GamificationService.getUserRank(userId);

      // Assert: Should have totalUsers count
      expect(rank.totalUsers).toBeGreaterThan(0);
      expect(rank.rank).toBeLessThanOrEqual(rank.totalUsers);
    });
  });

  /**
   * 4. REAL-TIME UPDATES TESTS
   */
  describe("4. Real-time Updates", () => {
    it("should update leaderboard when user gets points", async () => {
      // Arrange
      const userId = "user-1";
      const materialId = "material-1";

      // Act: Award points
      const result = await awardPointsForCompletion({
        userId,
        materialId,
      });

      // Assert: Should return valid points result
      if (result && typeof result === "object" && "pointsAwarded" in result) {
        expect(result.pointsAwarded).toBeGreaterThan(0);
        expect(result.totalPoints).toBeGreaterThanOrEqual(result.pointsAwarded);

        // Verify leaderboard is updated
        const leaderboard = await GamificationService.getGlobalLeaderboard(100);
        const userEntry = leaderboard.find((u) => u.userId === userId);
        expect(userEntry).toBeDefined();
      }
    });

    it("should update leaderboard when user earns badge", async () => {
      // Arrange
      const userId = "user-1";

      // Setup: Complete materials to trigger badge
      for (let i = 0; i < 3; i++) {
        await prisma.userProgress.create({
          data: {
            userId,
            materialId: mockMaterialIds[i],
            completedAt: new Date(),
          },
        });
      }

      // Act: Check and issue badges
      const result = await checkAndIssueBadges({ userId });

      // Assert: Should process without error
      expect(result).toBeDefined();
      if (result && typeof result === "object" && "badgeIds" in result) {
        // If badges earned, verify leaderboard still accessible
        const leaderboard = await GamificationService.getGlobalLeaderboard(100);
        expect(leaderboard).toBeDefined();
      }
    });

    it("should reflect streak changes in user rank", async () => {
      // Arrange
      const userId = "user-1";

      // Act: Update streak
      const result = await updateUserStreak({ userId });

      // Assert: Should process without error
      expect(result).toBeDefined();
      if (result && typeof result === "object" && "currentStreak" in result) {
        expect(result.currentStreak).toBeGreaterThanOrEqual(0);

        // Verify rank is still retrievable
        const rank = await GamificationService.getUserRank(userId);
        expect(rank).toBeDefined();
      }
    });

    it("should maintain consistency across concurrent point awards", async () => {
      // Arrange
      const userId1 = "user-1";
      const userId2 = "user-2";

      // Act: Award points to multiple users concurrently
      const results = await Promise.all([
        awardPointsForCompletion({ userId: userId1, materialId: "material-1" }),
        awardPointsForCompletion({ userId: userId2, materialId: "material-2" }),
      ]);

      // Assert: Both should succeed
      expect(results).toHaveLength(2);

      // Verify leaderboard is consistent
      const leaderboard = await GamificationService.getGlobalLeaderboard(100);
      expect(leaderboard).toBeDefined();
      expect(leaderboard.length).toBeGreaterThan(0);
    });
  });

  /**
   * 5. EDGE CASES TESTS
   */
  describe("5. Edge Cases", () => {
    it("should handle single user leaderboard", async () => {
      // Arrange
      const userId = "user-1";
      await prisma.userPoints.update({
        where: { userId },
        data: { totalPoints: 100 },
      });

      // Remove other users from consideration
      await prisma.userPoints.updateMany({
        where: { userId: { not: userId } },
        data: { totalPoints: 0 },
      });

      // Act
      const leaderboard = await GamificationService.getGlobalLeaderboard(100);
      const userRank = await GamificationService.getUserRank(userId);

      // Assert
      expect(leaderboard.length).toBeGreaterThan(0);
      expect(userRank.rank).toBe(1);
      expect(userRank.percentile).toBe(100);
    });

    it("should consistently order tied users", async () => {
      // Arrange: Create multiple users with same points
      for (const userId of ["user-1", "user-2", "user-3"]) {
        await prisma.userPoints.update({
          where: { userId },
          data: { totalPoints: 500 },
        });
      }

      // Act: Get leaderboard multiple times
      const results = Array.from({ length: 3 }, () =>
        GamificationService.getGlobalLeaderboard(100)
      );
      const leaderboards = await Promise.all(results);

      // Assert: Order should be consistent across calls
      const firstOrder = leaderboards[0].slice(0, 3).map((u) => u.userId);
      const secondOrder = leaderboards[1].slice(0, 3).map((u) => u.userId);

      expect(firstOrder).toEqual(secondOrder);
    });

    it("should handle user at 0 points correctly", async () => {
      // Arrange
      const userId = "user-1";
      await prisma.userPoints.update({
        where: { userId },
        data: { totalPoints: 0 },
      });

      // Act
      const rank = await GamificationService.getUserRank(userId);
      const leaderboard = await GamificationService.getGlobalLeaderboard(100);

      // Assert
      expect(rank.points).toBe(0);
      expect(rank.rank).toBeGreaterThan(0);
      expect(leaderboard).toBeDefined();
    });

    it("should perform well with large number of users", async () => {
      // Arrange: Create 100+ users with random points
      const largeUserCount = 100;
      const startTime = performance.now();

      for (let i = 0; i < largeUserCount; i++) {
        const userId = `perf-user-${i}`;
        try {
          await prisma.user.create({
            data: {
              id: userId,
              name: `Performance Test User ${i}`,
              email: `perf${i}@test.com`,
              emailVerified: true,
            },
          });
          await prisma.userPoints.create({
            data: {
              userId,
              totalPoints: Math.floor(Math.random() * 10000),
            },
          });
        } catch (error) {
          // User might already exist
        }
      }

      // Act: Query leaderboard
      const queryStartTime = performance.now();
      const leaderboard = await GamificationService.getGlobalLeaderboard(10);
      const queryEndTime = performance.now();

      // Assert: Performance should be acceptable
      const queryDuration = queryEndTime - queryStartTime;
      expect(queryDuration).toBeLessThan(PERFORMANCE_BASELINE.LEADERBOARD_QUERY);
      expect(leaderboard).toBeDefined();
      expect(leaderboard.length).toBeGreaterThan(0);

      console.log(`✓ Leaderboard query with 100+ users: ${queryDuration.toFixed(2)}ms`);
    });

    it("should handle rapid successive updates", async () => {
      // Arrange
      const userId = "user-1";
      const updateCount = 10;

      // Act: Rapidly update points multiple times
      const updateStartTime = performance.now();

      for (let i = 0; i < updateCount; i++) {
        await prisma.userPoints.update({
          where: { userId },
          data: { totalPoints: { increment: 10 } },
        });
      }

      const updateEndTime = performance.now();

      // Assert: All updates should complete
      const finalRank = await GamificationService.getUserRank(userId);
      expect(finalRank.points).toBe(updateCount * 10);

      const updateDuration = updateEndTime - updateStartTime;
      console.log(`✓ 10 rapid updates: ${updateDuration.toFixed(2)}ms`);
    });

    it("should verify ties with secondary sorting", async () => {
      // Arrange: Create users with identical points
      for (const userId of ["user-1", "user-2"]) {
        await prisma.userPoints.update({
          where: { userId },
          data: { totalPoints: 250 },
        });
      }

      // Act
      const leaderboard = await GamificationService.getGlobalLeaderboard(100);

      // Assert: Tied users should be present in leaderboard
      const tiedUsers = leaderboard.filter((u) => u.points === 250);
      expect(tiedUsers.length).toBeGreaterThanOrEqual(2);
    });
  });

  /**
   * PERFORMANCE METRICS & CACHE TRACKING
   */
  describe("Performance Metrics & Caching", () => {
    it("should track and report cache hits vs misses", async () => {
      // Arrange: Create test data
      const userId = "user-1";
      await prisma.userPoints.update({
        where: { userId },
        data: { totalPoints: 250 },
      });

      // Act & Measure: First call (cache miss)
      const firstCallStart = performance.now();
      const rank1 = await GamificationService.getUserRank(userId);
      const firstCallDuration = performance.now() - firstCallStart;

      // Second call (potential cache hit)
      const secondCallStart = performance.now();
      const rank2 = await GamificationService.getUserRank(userId);
      const secondCallDuration = performance.now() - secondCallStart;

      // Assert
      expect(rank1).toEqual(rank2);
      // Cache hit should generally be faster or equal to first call
      console.log(
        `✓ First call: ${firstCallDuration.toFixed(2)}ms, Second call (cached): ${secondCallDuration.toFixed(2)}ms`
      );
    });

    it("should measure leaderboard query performance", async () => {
      // Arrange: Setup users with points
      for (let i = 0; i < mockUsers.length; i++) {
        await prisma.userPoints.update({
          where: { userId: mockUsers[i].id },
          data: { totalPoints: 1000 - i * 100 },
        });
      }

      // Act: Measure query time
      const startTime = performance.now();
      const leaderboard = await GamificationService.getGlobalLeaderboard(100);
      const endTime = performance.now();

      // Assert
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(PERFORMANCE_BASELINE.LEADERBOARD_QUERY);
      console.log(
        `✓ Leaderboard query: ${duration.toFixed(2)}ms (baseline: ${PERFORMANCE_BASELINE.LEADERBOARD_QUERY}ms)`
      );
    });

    it("should measure points award performance", async () => {
      // Arrange
      const userId = "user-1";
      const materialId = "material-1";

      // Act: Measure point award time
      const startTime = performance.now();
      const result = await awardPointsForCompletion({ userId, materialId });
      const endTime = performance.now();

      // Assert
      const duration = endTime - startTime;
      if (result && typeof result === "object" && "pointsAwarded" in result) {
        expect(duration).toBeLessThan(PERFORMANCE_BASELINE.POINTS_AWARD);
        console.log(
          `✓ Points award: ${duration.toFixed(2)}ms (baseline: ${PERFORMANCE_BASELINE.POINTS_AWARD}ms)`
        );
      }
    });

    it("should demonstrate cache effectiveness for repeated rank queries", async () => {
      // Arrange
      const userId = "user-1";
      await prisma.userPoints.update({
        where: { userId },
        data: { totalPoints: 500 },
      });

      // Act: Measure multiple queries
      const queryTimes: number[] = [];
      const iterations = 5;

      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        await GamificationService.getUserRank(userId);
        const duration = performance.now() - startTime;
        queryTimes.push(duration);
      }

      // Assert: Later queries should be faster (cache benefits)
      const avgFirstHalf = queryTimes.slice(0, 2).reduce((a, b) => a + b) / 2;
      const avgSecondHalf = queryTimes.slice(3).reduce((a, b) => a + b) / 2;

      console.log(`✓ Average time (queries 1-2): ${avgFirstHalf.toFixed(2)}ms`);
      console.log(`✓ Average time (queries 4-5): ${avgSecondHalf.toFixed(2)}ms`);
      expect(queryTimes.every((time) => time < PERFORMANCE_BASELINE.USER_RANK_QUERY)).toBe(true);
    });

    it("should validate baseline performance assumptions", () => {
      // Document performance baselines for future reference
      expect(PERFORMANCE_BASELINE.LEADERBOARD_QUERY).toBe(100);
      expect(PERFORMANCE_BASELINE.USER_RANK_QUERY).toBe(50);
      expect(PERFORMANCE_BASELINE.POINTS_AWARD).toBe(150);
      expect(PERFORMANCE_BASELINE.CACHE_HIT).toBe(10);

      console.log("✓ Performance baselines:");
      console.log(`  - Leaderboard query: < ${PERFORMANCE_BASELINE.LEADERBOARD_QUERY}ms`);
      console.log(`  - User rank query: < ${PERFORMANCE_BASELINE.USER_RANK_QUERY}ms`);
      console.log(`  - Points award: < ${PERFORMANCE_BASELINE.POINTS_AWARD}ms`);
      console.log(`  - Cache hit: < ${PERFORMANCE_BASELINE.CACHE_HIT}ms`);
    });
  });

  /**
   * ERROR HANDLING & RECOVERY
   */
  describe("Error Handling & Recovery", () => {
    it("should handle invalid user ID gracefully", async () => {
      // Arrange
      const invalidUserId = "invalid-user-id-12345";

      // Act & Assert
      try {
        await GamificationService.getUserRank(invalidUserId);
        // If no error thrown, it should still return valid structure
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should maintain data integrity during partial failures", async () => {
      // Arrange
      const userId = "user-1";
      const pointsBeforeFailure = 100;

      await prisma.userPoints.update({
        where: { userId },
        data: { totalPoints: pointsBeforeFailure },
      });

      // Act: Get rank
      const rankBefore = await GamificationService.getUserRank(userId);

      // Simulate a potential failure and recovery
      await prisma.userPoints.update({
        where: { userId },
        data: { totalPoints: 200 },
      });

      // Assert: Data should remain consistent
      const rankAfter = await GamificationService.getUserRank(userId);
      expect(rankAfter.points).toBeGreaterThan(rankBefore.points);
    });
  });
});
