'use client';

import React from 'react';
import { ProgressBar } from './ProgressBar';

interface AchievementsSummaryProps {
  badgesCollected: number;
  totalBadges: number;
  courseProgressPercent: number;
  participationLevel?: 'Excellent' | 'Good' | 'Active' | 'Beginner';
  averageParticipation?: number;
  className?: string;
}

export const AchievementsSummary: React.FC<AchievementsSummaryProps> = ({
  badgesCollected,
  totalBadges,
  courseProgressPercent,
  participationLevel = 'Active',
  averageParticipation = 65,
  className = '',
}) => {
  const getParticipationColor = (level: string) => {
    switch (level) {
      case 'Excellent':
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950';
      case 'Good':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950';
      case 'Active':
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950';
      case 'Beginner':
        return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950';
      default:
        return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950';
    }
  };

  const isAboveAverage = courseProgressPercent > (averageParticipation ?? 65);

  return (
    <div
      className={`
        bg-white
        dark:bg-slate-950
        rounded-lg
        p-6
        shadow-sm
        border
        border-slate-200
        dark:border-slate-800
        ${className}
      `}
    >
      {/* Header */}
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-6">
        Achievements Summary
      </h2>

      {/* Content Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Badges Section */}
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {badgesCollected}
            </span>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              / {totalBadges} badges
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            Badges Collected
          </p>
          
          {/* Badge visual representation */}
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: totalBadges }).map((_, i) => (
              <div
                key={i}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
                  transition-all duration-300
                  ${
                    i < badgesCollected
                      ? 'bg-yellow-400 text-yellow-900 shadow-md'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                  }
                `}
              >
                {i < badgesCollected ? '★' : '☆'}
              </div>
            ))}
          </div>
        </div>

        {/* Participation Section */}
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2 mb-3">
            <span
              className={`text-sm font-semibold px-3 py-1 rounded-full ${getParticipationColor(
                participationLevel
              )}`}
            >
              {participationLevel}
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            Participation Level
          </p>
          
          {/* Comparison to average */}
          <div className="flex items-center gap-2">
            {isAboveAverage ? (
              <>
                <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                  ↑ Above average
                </span>
              </>
            ) : (
              <>
                <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                  ↓ Below average
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Course Progress */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
        <ProgressBar
          current={courseProgressPercent}
          total={100}
          label="Overall Course Progress"
          barColor="bg-gradient-to-r from-purple-500 to-pink-500"
          height="md"
          showPercentage={true}
          animated={true}
        />
      </div>

      {/* Stats Footer */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
            Your Progress
          </p>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {courseProgressPercent}%
          </p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
            Class Average
          </p>
          <p className="text-xl font-bold text-slate-600 dark:text-slate-400">
            {averageParticipation}%
          </p>
        </div>
      </div>
    </div>
  );
};
