'use client';

import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StreakHistoryProps {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  lastActivityDate?: Date;
}

export function StreakHistory({
  currentStreak,
  longestStreak,
  totalActiveDays,
  lastActivityDate,
}: StreakHistoryProps) {
  const getMotivationalMessage = (streak: number): string => {
    if (streak === 0) return '🚀 Time to start your streak!';
    if (streak < 3) return '💪 Keep it up! You\'re building momentum.';
    if (streak < 7) return '🌟 Great work! You\'re on a roll.';
    if (streak < 14) return '🎯 Amazing dedication! Week strong!';
    if (streak < 30) return '🏆 Incredible! You\'re a learning machine!';
    return '👑 Legendary status! Keep dominating!';
  };

  const getStreakTier = (streak: number): string => {
    if (streak === 0) return 'Beginner';
    if (streak < 3) return 'Starter';
    if (streak < 7) return 'Regular';
    if (streak < 14) return 'Committed';
    if (streak < 30) return 'Dedicated';
    return 'Legendary';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Streak History</CardTitle>
        <CardDescription>{getMotivationalMessage(currentStreak)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Streak</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{currentStreak}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Tier: {getStreakTier(currentStreak)}</p>
          </div>

          <div className="border rounded-lg p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Longest Streak</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">{longestStreak}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Personal record</p>
          </div>

          <div className="border rounded-lg p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Active Days</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{totalActiveDays}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Days in learning center</p>
          </div>

          <div className="border rounded-lg p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Activity</p>
            <p className="text-lg font-semibold text-amber-600 dark:text-amber-400 mt-1">
              {lastActivityDate
                ? formatDistanceToNow(new Date(lastActivityDate), { addSuffix: true })
                : 'Never'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {lastActivityDate
                ? new Date(lastActivityDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'No activity'}
            </p>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Progress to next tier</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {currentStreak} / {Math.ceil(currentStreak / 5) * 5}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (currentStreak / (Math.ceil(currentStreak / 5) * 5)) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
