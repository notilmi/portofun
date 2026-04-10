'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ProgressBar } from './ProgressBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BadgeData {
  id: string;
  earned: boolean;
  rarity?: string;
  type?: string;
}

interface CategoryBreakdown {
  name: string;
  earned: number;
  total: number;
  icon: string;
  color: string;
}

interface BadgeProgressProps {
  badges: BadgeData[];
  categoryBreakdown?: CategoryBreakdown[];
  motivationalTexts?: string[];
  className?: string;
  showBreakdown?: boolean;
}

const defaultMotivationalTexts = [
  '🚀 You\'re on a roll!',
  '💪 Keep going, you\'re doing great!',
  '✨ Almost there!',
  '🎯 One step closer to mastery!',
  '⭐ You\'re unstoppable!',
  '🔥 On fire!',
  '🏆 Champion in the making!',
  '🌟 Shining bright!',
];

export const BadgeProgress: React.FC<BadgeProgressProps> = ({
  badges,
  categoryBreakdown = [],
  motivationalTexts = defaultMotivationalTexts,
  className = '',
  showBreakdown = true,
}) => {
  const earnedCount = useMemo(
    () => badges.filter((b) => b.earned).length,
    [badges]
  );

  const totalCount = badges.length;
  const percentage = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  // Select motivational text based on percentage
  const motivationalText = useMemo(() => {
    if (percentage === 100) return '🏆 LEGENDARY! All badges unlocked!';
    if (percentage >= 75) return motivationalTexts[6] || motivationalTexts[0];
    if (percentage >= 50) return motivationalTexts[1] || motivationalTexts[0];
    if (percentage >= 25) return motivationalTexts[3] || motivationalTexts[0];
    return motivationalTexts[4] || motivationalTexts[0];
  }, [percentage, motivationalTexts]);

  // Generate category breakdown from badges if not provided
  const categories = useMemo(() => {
    if (categoryBreakdown.length > 0) return categoryBreakdown;

    const rarityMap = new Map<string, { earned: number; total: number }>();
    const rarityIcons: Record<string, string> = {
      common: '⚪',
      uncommon: '🟢',
      rare: '🔵',
      epic: '🟣',
      legendary: '🟡',
    };
    const rarityColors: Record<string, string> = {
      common: 'bg-gray-500',
      uncommon: 'bg-green-500',
      rare: 'bg-blue-500',
      epic: 'bg-purple-500',
      legendary: 'bg-amber-500',
    };

    badges.forEach((badge) => {
      const rarity = badge.rarity || 'common';
      const current = rarityMap.get(rarity) || { earned: 0, total: 0 };
      current.total += 1;
      if (badge.earned) current.earned += 1;
      rarityMap.set(rarity, current);
    });

    return Array.from(rarityMap.entries()).map(([rarity, counts]) => ({
      name: rarity.charAt(0).toUpperCase() + rarity.slice(1),
      earned: counts.earned,
      total: counts.total,
      icon: rarityIcons[rarity] || '🏅',
      color: rarityColors[rarity] || 'bg-gray-500',
    }));
  }, [badges, categoryBreakdown]);

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Main Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle>Badge Collection Progress</CardTitle>
          <CardDescription>Your journey to badge mastery</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <ProgressBar
            current={earnedCount}
            total={totalCount}
            label="Badges Collected"
            showPercentage={true}
            barColor="bg-gradient-to-r from-blue-500 to-purple-500"
            height="md"
          />

          {/* Percentage Display */}
          <div className="flex items-center justify-between rounded-lg bg-muted p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completion</p>
              <p className="text-3xl font-bold">{percentage}%</p>
            </div>
            <div className="text-right">
              <p className="text-4xl">{earnedCount}</p>
              <p className="text-xs text-muted-foreground">of {totalCount}</p>
            </div>
          </div>

          {/* Motivational Text */}
          <div
            className="rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-4 text-center"
            role="status"
            aria-live="polite"
          >
            <p className="text-lg font-semibold text-foreground">
              {motivationalText}
            </p>
          </div>

          {/* Category Breakdown */}
          {showBreakdown && categories.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">By Rarity</h3>
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{category.icon}</span>
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {category.earned} / {category.total}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          'h-full transition-all duration-500 ease-out',
                          category.color
                        )}
                        style={{
                          width: `${category.total > 0 ? (category.earned / category.total) * 100 : 0}%`,
                        }}
                        role="progressbar"
                        aria-valuenow={category.earned}
                        aria-valuemin={0}
                        aria-valuemax={category.total}
                        aria-label={`${category.name} progress`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {earnedCount}
              </p>
              <p className="text-xs text-muted-foreground">Earned</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {totalCount - earnedCount}
              </p>
              <p className="text-xs text-muted-foreground">Locked</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {percentage}%
              </p>
              <p className="text-xs text-muted-foreground">Complete</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
