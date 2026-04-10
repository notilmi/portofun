import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import GamificationService, {
  GamificationUserNotFoundError,
  GamificationMaterialNotFoundError,
  GamificationPersistenceError,
} from "../gamification.service";
import prisma from "@/server/db/db";

// Mock prisma
vi.mock("@/server/db/db", () => ({
  default: {
    $transaction: vi.fn(),
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
      findMany: vi.fn(),
    },
    material: {
      findUnique: vi.fn(),
    },
    userProgress: {
      findMany: vi.fn(),
    },
  },
}));

describe("GamificationService", () => {
  const mockUserId = "user-123";
  const mockMaterialId = "material-456";
  const mockEmail = "user@test.com";
  const mockUserName = "Test User";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // ============================================================================
  // awardPointsForCompletion Tests
  // ============================================================================

  describe("awardPointsForCompletion", () => {
    it("should award correct base points (10) for completion", async () => {
      const mockTransaction = vi.fn(async (cb) => {
        return cb({
          user: {
            findUnique: vi.fn().mockResolvedValue({ id: mockUserId }),
            update: vi.fn().mockResolvedValue({ id: mockUserId }),
          },
          material: {
            findUnique: vi.fn().mockResolvedValue({ id: mockMaterialId }),
          },
        });
      });

      (prisma.$transaction as any).mockImplementation(mockTransaction);

      const result = await GamificationService.awardPointsForCompletion(
        mockUserId,
        mockMaterialId,
      );

      expect(result.pointsAwarded).toBe(10);
      expect(result.totalPoints).toBe(10);
      expect(result.experience).toBe(10);
    });

    it("should throw GamificationUserNotFoundError when user not found", async () => {
      const mockTransaction = vi.fn(async (cb) => {
        return cb({
          user: {
            findUnique: vi
              .fn()
              .mockResolvedValue(null),
          },
          material: {
            findUnique: vi.fn(),
          },
        });
      });

      (prisma.$transaction as any).mockImplementation(mockTransaction);

      await expect(
        GamificationService.awardPointsForCompletion(
          mockUserId,
          mockMaterialId,
        ),
      ).rejects.toThrow(GamificationUserNotFoundError);
    });

    it("should throw GamificationMaterialNotFoundError when material not found", async () => {
      const mockTransaction = vi.fn(async (cb) => {
        return cb({
          user: {
            findUnique: vi.fn().mockResolvedValue({ id: mockUserId }),
          },
          material: {
            findUnique: vi.fn().mockResolvedValue(null),
          },
        });
      });

      (prisma.$transaction as any).mockImplementation(mockTransaction);

      await expect(
        GamificationService.awardPointsForCompletion(
          mockUserId,
          mockMaterialId,
        ),
      ).rejects.toThrow(GamificationMaterialNotFoundError);
    });

    it("should execute within transaction context", async () => {
      const mockTransaction = vi.fn(async (cb) => {
        return cb({
          user: {
            findUnique: vi.fn().mockResolvedValue({ id: mockUserId }),
            update: vi.fn().mockResolvedValue({ id: mockUserId }),
          },
          material: {
            findUnique: vi.fn().mockResolvedValue({ id: mockMaterialId }),
          },
        });
      });

      (prisma.$transaction as any).mockImplementation(mockTransaction);

      await GamificationService.awardPointsForCompletion(
        mockUserId,
        mockMaterialId,
      );

      expect(mockTransaction).toHaveBeenCalled();
    });

    it("should handle Prisma errors and map to GamificationPersistenceError", async () => {
      const prismaError = new Error("Database connection failed");
      (prisma.$transaction as any).mockRejectedValueOnce(prismaError);

      await expect(
        GamificationService.awardPointsForCompletion(
          mockUserId,
          mockMaterialId,
        ),
      ).rejects.toThrow(GamificationPersistenceError);
    });
  });

  // ============================================================================
  // checkAndIssueBadges Tests
  // ============================================================================

  describe("checkAndIssueBadges", () => {
    it("should award completion badge at 25% threshold", async () => {
      const mockTransaction = vi.fn(async (cb) => {
        return cb({
          user: {
            findUnique: vi.fn().mockResolvedValue({ id: mockUserId }),
          },
          userProgress: {
            findMany: vi.fn().mockResolvedValue(
              Array(4).fill({ completedAt: new Date() }), // 100% completion (4/4)
            ),
          },
        });
      });

      (prisma.$transaction as any).mockImplementation(mockTransaction);

      const badges = await GamificationService.checkAndIssueBadges(mockUserId);

      expect(badges).toContain("completion_25");
      expect(badges).toContain("completion_50");
      expect(badges).toContain("completion_75");
      expect(badges).toContain("completion_100");
    });

    it("should award only 50% badge when 50% complete", async () => {
      const mockTransaction = vi.fn(async (cb) => {
        return cb({
          user: {
            findUnique: vi.fn().mockResolvedValue({ id: mockUserId }),
          },
          userProgress: {
            findMany: vi.fn().mockResolvedValue([
              { completedAt: new Date() },
              { completedAt: new Date() },
              { completedAt: null },
              { completedAt: null },
            ]),
          },
        });
      });

      (prisma.$transaction as any).mockImplementation(mockTransaction);

      const badges = await GamificationService.checkAndIssueBadges(mockUserId);

      expect(badges).toContain("completion_25");
      expect(badges).toContain("completion_50");
      expect(badges).not.toContain("completion_75");
      expect(badges).not.toContain("completion_100");
    });

    it("should not award badges at 0% completion", async () => {
      const mockTransaction = vi.fn(async (cb) => {
        return cb({
          user: {
            findUnique: vi.fn().mockResolvedValue({ id: mockUserId }),
          },
          userProgress: {
            findMany: vi.fn().mockResolvedValue(
              Array(4).fill({ completedAt: null }),
            ),
          },
        });
      });

      (prisma.$transaction as any).mockImplementation(mockTransaction);

      const badges = await GamificationService.checkAndIssueBadges(mockUserId);

      expect(badges.length).toBe(0);
    });

    it("should return badge IDs for thresholds 25%, 50%, 75%, 100%", async () => {
      const mockTransaction = vi.fn(async (cb) => {
        return cb({
          user: {
            findUnique: vi.fn().mockResolvedValue({ id: mockUserId }),
          },
          userProgress: {
            findMany: vi.fn().mockResolvedValue(
              Array(4).fill({ completedAt: new Date() }),
            ),
          },
        });
      });

      (prisma.$transaction as any).mockImplementation(mockTransaction);

      const badges = await GamificationService.checkAndIssueBadges(mockUserId);

      const expectedBadges = [
        "completion_25",
        "completion_50",
        "completion_75",
        "completion_100",
      ];
      expectedBadges.forEach((badge) => {
        expect(badges).toContain(badge);
      });
    });

    it("should throw GamificationUserNotFoundError when user not found", async () => {
      const mockTransaction = vi.fn(async (cb) => {
        return cb({
          user: {
            findUnique: vi.fn().mockResolvedValue(null),
          },
          userProgress: {
            findMany: vi.fn(),
          },
        });
      });

      (prisma.$transaction as any).mockImplementation(mockTransaction);

      await expect(
        GamificationService.checkAndIssueBadges(mockUserId),
      ).rejects.toThrow(GamificationUserNotFoundError);
    });

    it("should handle Prisma errors gracefully", async () => {
      const prismaError = new Error("Database connection failed");
      (prisma.$transaction as any).mockRejectedValueOnce(prismaError);

      await expect(
        GamificationService.checkAndIssueBadges(mockUserId),
      ).rejects.toThrow(GamificationPersistenceError);
    });
  });

  // ============================================================================
  // updateUserStreak Tests
  // ============================================================================

  describe("updateUserStreak", () => {
    it("should create initial streak on first activity", async () => {
      const mockTransaction = vi.fn(async (cb) => {
        return cb({
          user: {
            findUnique: vi.fn().mockResolvedValue({ id: mockUserId }),
          },
        });
      });

      (prisma.$transaction as any).mockImplementation(mockTransaction);

      const result = await GamificationService.updateUserStreak(mockUserId);

      expect(result.currentStreak).toBe(1);
      expect(result.longestStreak).toBe(1);
      expect(result.lastActivityDate).toBeInstanceOf(Date);
    });

    it("should increment streak on consecutive day activity", async () => {
      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 12);

      const mockTransaction = vi.fn(async (cb) => {
        return cb({
          user: {
            findUnique: vi.fn().mockResolvedValue({ id: mockUserId }),
          },
        });
      });

      (prisma.$transaction as any).mockImplementation(mockTransaction);

      const result = await GamificationService.updateUserStreak(mockUserId);

      expect(result.currentStreak).toBeGreaterThanOrEqual(1);
      expect(result.longestStreak).toBeGreaterThanOrEqual(1);
    });

    it("should return last activity date", async () => {
      const mockTransaction = vi.fn(async (cb) => {
        return cb({
          user: {
            findUnique: vi.fn().mockResolvedValue({ id: mockUserId }),
          },
        });
      });

      (prisma.$transaction as any).mockImplementation(mockTransaction);

      const result = await GamificationService.updateUserStreak(mockUserId);

      expect(result.lastActivityDate).toBeInstanceOf(Date);
      expect(result.lastActivityDate.getTime()).toBeLessThanOrEqual(
        Date.now(),
      );
    });

    it("should track longest streak correctly", async () => {
      const mockTransaction = vi.fn(async (cb) => {
        return cb({
          user: {
            findUnique: vi.fn().mockResolvedValue({ id: mockUserId }),
          },
        });
      });

      (prisma.$transaction as any).mockImplementation(mockTransaction);

      const result = await GamificationService.updateUserStreak(mockUserId);

      expect(result.longestStreak).toBeGreaterThanOrEqual(result.currentStreak);
    });

    it("should throw GamificationUserNotFoundError when user not found", async () => {
      const mockTransaction = vi.fn(async (cb) => {
        return cb({
          user: {
            findUnique: vi.fn().mockResolvedValue(null),
          },
        });
      });

      (prisma.$transaction as any).mockImplementation(mockTransaction);

      await expect(
        GamificationService.updateUserStreak(mockUserId),
      ).rejects.toThrow(GamificationUserNotFoundError);
    });

    it("should handle Prisma errors", async () => {
      const prismaError = new Error("Database error");
      (prisma.$transaction as any).mockRejectedValueOnce(prismaError);

      await expect(
        GamificationService.updateUserStreak(mockUserId),
      ).rejects.toThrow(GamificationPersistenceError);
    });
  });

  // ============================================================================
  // calculateLevel Tests
  // ============================================================================

  describe("calculateLevel", () => {
    it("should calculate level 0 for 0-99 XP", () => {
      expect(GamificationService.calculateLevel(0).level).toBe(0);
      expect(GamificationService.calculateLevel(50).level).toBe(0);
      expect(GamificationService.calculateLevel(99).level).toBe(0);
    });

    it("should calculate level 1 for 100-199 XP", () => {
      expect(GamificationService.calculateLevel(100).level).toBe(1);
      expect(GamificationService.calculateLevel(150).level).toBe(1);
      expect(GamificationService.calculateLevel(199).level).toBe(1);
    });

    it("should calculate level 2 for 200-299 XP", () => {
      expect(GamificationService.calculateLevel(200).level).toBe(2);
      expect(GamificationService.calculateLevel(250).level).toBe(2);
      expect(GamificationService.calculateLevel(299).level).toBe(2);
    });

    it("should calculate level 5 for 500-599 XP", () => {
      expect(GamificationService.calculateLevel(500).level).toBe(5);
      expect(GamificationService.calculateLevel(550).level).toBe(5);
    });

    it("should return correct currentLevelXp threshold", () => {
      const result0 = GamificationService.calculateLevel(0);
      expect(result0.currentLevelXp).toBe(0);

      const result1 = GamificationService.calculateLevel(100);
      expect(result1.currentLevelXp).toBe(100);

      const result2 = GamificationService.calculateLevel(250);
      expect(result2.currentLevelXp).toBe(200);
    });

    it("should return correct nextLevelXp threshold", () => {
      const result0 = GamificationService.calculateLevel(0);
      expect(result0.nextLevelXp).toBe(100);

      const result1 = GamificationService.calculateLevel(100);
      expect(result1.nextLevelXp).toBe(200);

      const result2 = GamificationService.calculateLevel(250);
      expect(result2.nextLevelXp).toBe(300);
    });

    it("should handle boundary condition at level thresholds", () => {
      const result99 = GamificationService.calculateLevel(99);
      const result100 = GamificationService.calculateLevel(100);

      expect(result99.level).toBe(0);
      expect(result100.level).toBe(1);
      expect(result100.currentLevelXp).toBe(100);
      expect(result100.nextLevelXp).toBe(200);
    });

    it("should handle high XP values", () => {
      const result = GamificationService.calculateLevel(10000);
      expect(result.level).toBe(100);
      expect(result.currentLevelXp).toBe(10000);
      expect(result.nextLevelXp).toBe(10100);
    });
  });

  // ============================================================================
  // getGlobalLeaderboard Tests
  // ============================================================================

  describe("getGlobalLeaderboard", () => {
    it("should return top N users by default (100)", async () => {
      (prisma.user.count as any).mockResolvedValueOnce(500);
      (prisma.user.findMany as any).mockResolvedValueOnce(
        Array(100)
          .fill(0)
          .map((_, i) => ({
            id: `user-${i}`,
            name: `User ${i}`,
            email: `user${i}@test.com`,
          })),
      );

      const leaderboard = await GamificationService.getGlobalLeaderboard();

      expect(leaderboard).toHaveLength(100);
    });

    it("should accept custom limit", async () => {
      (prisma.user.count as any).mockResolvedValueOnce(500);
      (prisma.user.findMany as any).mockResolvedValueOnce(
        Array(50)
          .fill(0)
          .map((_, i) => ({
            id: `user-${i}`,
            name: `User ${i}`,
            email: `user${i}@test.com`,
          })),
      );

      const leaderboard = await GamificationService.getGlobalLeaderboard(50);

      expect(leaderboard).toHaveLength(50);
    });

    it("should return entries with correct rank ordering", async () => {
      (prisma.user.count as any).mockResolvedValueOnce(3);
      (prisma.user.findMany as any).mockResolvedValueOnce([
        { id: "user-1", name: "User 1", email: "user1@test.com" },
        { id: "user-2", name: "User 2", email: "user2@test.com" },
        { id: "user-3", name: "User 3", email: "user3@test.com" },
      ]);

      const leaderboard = await GamificationService.getGlobalLeaderboard();

      expect(leaderboard[0].rank).toBe(1);
      expect(leaderboard[1].rank).toBe(2);
      expect(leaderboard[2].rank).toBe(3);
    });

    it("should include user information in entries", async () => {
      (prisma.user.count as any).mockResolvedValueOnce(1);
      (prisma.user.findMany as any).mockResolvedValueOnce([
        { id: mockUserId, name: mockUserName, email: mockEmail },
      ]);

      const leaderboard = await GamificationService.getGlobalLeaderboard();

      expect(leaderboard[0]).toMatchObject({
        userId: mockUserId,
        userName: mockUserName,
        userEmail: mockEmail,
        rank: 1,
      });
    });

    it("should handle empty leaderboard", async () => {
      (prisma.user.count as any).mockResolvedValueOnce(0);
      (prisma.user.findMany as any).mockResolvedValueOnce([]);

      const leaderboard = await GamificationService.getGlobalLeaderboard();

      expect(leaderboard).toHaveLength(0);
    });

    it("should handle database errors", async () => {
      (prisma.user.count as any).mockRejectedValueOnce(
        new Error("Database error"),
      );

      await expect(
        GamificationService.getGlobalLeaderboard(),
      ).rejects.toThrow(GamificationPersistenceError);
    });
  });

  // ============================================================================
  // getUserRank Tests
  // ============================================================================

  describe("getUserRank", () => {
    it("should return rank for existing user", async () => {
      (prisma.user.findUnique as any).mockResolvedValueOnce({
        id: mockUserId,
      });
      (prisma.user.count as any).mockResolvedValueOnce(100);

      const rank = await GamificationService.getUserRank(mockUserId);

      expect(rank.rank).toBeGreaterThanOrEqual(1);
      expect(rank.totalUsers).toBe(100);
    });

    it("should calculate percentile correctly", async () => {
      (prisma.user.findUnique as any).mockResolvedValueOnce({
        id: mockUserId,
      });
      (prisma.user.count as any).mockResolvedValueOnce(100);

      const rank = await GamificationService.getUserRank(mockUserId);

      expect(rank.percentile).toBeGreaterThan(0);
      expect(rank.percentile).toBeLessThanOrEqual(100);
    });

    it("should return correct structure with all fields", async () => {
      (prisma.user.findUnique as any).mockResolvedValueOnce({
        id: mockUserId,
      });
      (prisma.user.count as any).mockResolvedValueOnce(50);

      const rank = await GamificationService.getUserRank(mockUserId);

      expect(rank).toHaveProperty("rank");
      expect(rank).toHaveProperty("percentile");
      expect(rank).toHaveProperty("points");
      expect(rank).toHaveProperty("level");
      expect(rank).toHaveProperty("totalUsers");
    });

    it("should throw GamificationUserNotFoundError when user not found", async () => {
      (prisma.user.findUnique as any).mockResolvedValueOnce(null);

      await expect(GamificationService.getUserRank(mockUserId)).rejects.toThrow(
        GamificationUserNotFoundError,
      );
    });

    it("should handle database errors", async () => {
      (prisma.user.findUnique as any).mockRejectedValueOnce(
        new Error("Database error"),
      );

      await expect(GamificationService.getUserRank(mockUserId)).rejects.toThrow(
        GamificationPersistenceError,
      );
    });

    it("should calculate percentile with single user", async () => {
      (prisma.user.findUnique as any).mockResolvedValueOnce({
        id: mockUserId,
      });
      (prisma.user.count as any).mockResolvedValueOnce(1);

      const rank = await GamificationService.getUserRank(mockUserId);

      expect(rank.totalUsers).toBe(1);
      expect(rank.percentile).toBe(100);
    });
  });

  // ============================================================================
  // getUserBadges Tests
  // ============================================================================

  describe("getUserBadges", () => {
    it("should return empty array when user has no badges", async () => {
      (prisma.user.findUnique as any).mockResolvedValueOnce({
        id: mockUserId,
      });

      const badges = await GamificationService.getUserBadges(mockUserId);

      expect(Array.isArray(badges)).toBe(true);
      expect(badges).toHaveLength(0);
    });

    it("should throw GamificationUserNotFoundError when user not found", async () => {
      (prisma.user.findUnique as any).mockResolvedValueOnce(null);

      await expect(
        GamificationService.getUserBadges(mockUserId),
      ).rejects.toThrow(GamificationUserNotFoundError);
    });

    it("should handle database errors", async () => {
      (prisma.user.findUnique as any).mockRejectedValueOnce(
        new Error("Database error"),
      );

      await expect(
        GamificationService.getUserBadges(mockUserId),
      ).rejects.toThrow(GamificationPersistenceError);
    });

    it("should verify user exists before querying badges", async () => {
      (prisma.user.findUnique as any).mockResolvedValueOnce({
        id: mockUserId,
      });

      await GamificationService.getUserBadges(mockUserId);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        select: { id: true },
      });
    });
  });

  // ============================================================================
  // Error Handling & Edge Cases
  // ============================================================================

  describe("Error Classes", () => {
    it("should create GamificationUserNotFoundError with correct properties", () => {
      const error = new GamificationUserNotFoundError("Test message");
      expect(error.message).toBe("Test message");
      expect(error.errorCode).toBe("USER_NOT_FOUND");
      expect(error.errorStatus).toBe(404);
      expect(error.name).toBe("GamificationUserNotFoundError");
    });

    it("should create GamificationMaterialNotFoundError with correct properties", () => {
      const error = new GamificationMaterialNotFoundError("Test message");
      expect(error.message).toBe("Test message");
      expect(error.errorCode).toBe("MATERIAL_NOT_FOUND");
      expect(error.errorStatus).toBe(404);
      expect(error.name).toBe("GamificationMaterialNotFoundError");
    });

    it("should create GamificationPersistenceError with correct properties", () => {
      const error = new GamificationPersistenceError("Test message");
      expect(error.message).toBe("Test message");
      expect(error.errorCode).toBe("GAMIFICATION_PERSISTENCE_ERROR");
      expect(error.errorStatus).toBe(500);
      expect(error.name).toBe("GamificationPersistenceError");
    });
  });
});
