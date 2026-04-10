/**
 * Progression System Type Definitions
 * Single source of truth for type safety across the gamification system
 */

/**
 * Represents a single lesson within a chapter
 * Lessons are the atomic units of course progression
 */
export interface Lesson {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  status: 'locked' | 'in_progress' | 'completed';
  completionPercent: number; // 0-100
  materialId: string; // Reference to actual course material
  order: number; // Sequence in chapter
  estimatedTime?: number; // Minutes
}

/**
 * Represents a chapter containing multiple lessons
 * Chapters are logical groupings of lessons
 */
export interface Chapter {
  id: string;
  number: number; // 1, 2, 3...
  title: string;
  description?: string;
  readonly lessons: ReadonlyArray<Lesson>;
  isLocked: boolean;
  totalLessons: number;
  completedLessons: number;
}

/**
 * Represents the complete progression state for a user in a course
 * Tracks overall progress, current position, and all chapters
 */
export interface ProgressionState {
  userId: string;
  courseId: string;
  readonly chapters: ReadonlyArray<Chapter>;
  totalChapters: number;
  completedChapters: number;
  overallProgress: number; // 0-100
  currentChapterId?: string;
  currentLessonId?: string;
  updatedAt: Date;
}

/**
 * Represents a daily quest that users can complete for rewards
 * Quests provide time-limited objectives and XP rewards
 */
export interface DailyQuest {
  id: string;
  userId: string;
  questType: 'xp' | 'lessons' | 'streak';
  title: string;
  description: string;
  current: number; // Progress towards goal
  goal: number; // Target to achieve
  xpReward: number;
  isCompleted: boolean;
  completedAt?: Date;
  expiresAt: Date;
}

/**
 * Represents a user's rank in the leaderboard system
 * Tracks league membership, points, and ranking position
 */
export interface UserRank {
  userId: string;
  rank: number;
  totalPoints: number;
  level: number;
  percentile: number; // 0-100
  leagueName: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  leaguePosition: number; // Position within the league
  updatedAt: Date;
}

/**
 * Statistics snapshot for user progression
 */
export interface ProgressionStats {
  readonly totalPoints: number;
  readonly currentLevel: number;
  readonly currentStreak: number;
  readonly longestStreak: number;
  readonly courseCompletion: number; // 0-100
}

/**
 * Combined progression page response
 * Returns all data needed to render the progression dashboard
 */
export interface ProgressionPageData {
  readonly progression: ProgressionState;
  readonly dailyQuest: DailyQuest;
  readonly userRank: UserRank;
  readonly stats: ProgressionStats;
}
