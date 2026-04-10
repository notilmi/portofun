'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { Lock } from 'lucide-react';
import {
  chapterSectionVariants,
  chapterBadgeVariants,
  connectorLineVariants,
  chapterLessonsContainerVariants,
  chapterLessonItemVariants,
} from '@/lib/animations/variants';

export interface Lesson {
  id: string;
  title: string;
  icon: string;
  status: 'completed' | 'in-progress' | 'locked';
  completionPercent?: number;
}

interface ChapterSectionProps {
  chapterNumber: number;
  title: string;
  description?: string;
  lessons: Lesson[];
  isLocked?: boolean;
  onLessonClick?: (lessonId: string) => void;
  className?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300';
    case 'in-progress':
      return 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300';
    case 'locked':
      return 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400';
    default:
      return 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return '✓';
    case 'in-progress':
      return '◐';
    case 'locked':
      return '🔒';
    default:
      return '•';
  }
};

export const ChapterSection: React.FC<ChapterSectionProps> = ({
  chapterNumber,
  title,
  description,
  lessons,
  isLocked = false,
  onLessonClick,
  className = '',
}) => {
  const [hoveredLessonId, setHoveredLessonId] = useState<string | null>(null);

  const handleLessonClick = (lessonId: string) => {
    if (!isLocked && onLessonClick) {
      onLessonClick(lessonId);
    }
  };

  const sortedLessons = [...lessons].sort((a, b) => {
    const statusOrder = { 'completed': 0, 'in-progress': 1, 'locked': 2 };
    return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
  });

  return (
    <motion.div
      className={cn(
        'relative rounded-lg border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 shadow-md overflow-hidden transition-all duration-300',
        isLocked ? 'opacity-60 pointer-events-none' : '',
        className
      )}
      variants={chapterSectionVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <div className="relative p-3 sm:p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
            {/* Chapter Number Badge */}
            <motion.div
              className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 dark:from-blue-500 dark:to-purple-600 flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-md min-h-[44px] min-w-[44px]"
              variants={chapterBadgeVariants}
              initial="hidden"
              animate="visible"
            >
              {chapterNumber}
            </motion.div>

            {/* Title and Description */}
            <motion.div
              className="flex-1 min-w-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
            >
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 line-clamp-2">
                {title}
              </h3>
              {description && (
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {description}
                </p>
              )}
            </motion.div>
          </div>

          {/* Lock Icon */}
          {isLocked && (
            <motion.div
              className="flex-shrink-0"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 dark:text-gray-500" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Lessons Timeline Section */}
      <div className="p-3 sm:p-4 md:p-6 relative">
        {/* Vertical Connector Line */}
        {sortedLessons.length > 1 && (
          <motion.div
            className="absolute left-5 sm:left-8 top-12 bottom-0 w-0.5 bg-gradient-to-b from-gray-300 via-gray-300 to-gray-200 dark:from-gray-600 dark:via-gray-600 dark:to-gray-700 rounded-full"
            variants={connectorLineVariants}
            initial="hidden"
            animate="visible"
          />
        )}

        {/* Lessons Container */}
        <div className="space-y-3 sm:space-y-4 relative">
          {sortedLessons.map((lesson, index) => {
            const statusColors = getStatusColor(lesson.status);
            const statusIndicator = getStatusIcon(lesson.status);
            const isClickable = !isLocked && lesson.status !== 'locked';

            return (
              <motion.div
                key={lesson.id}
                className="flex items-start gap-3 sm:gap-4 cursor-pointer group"
                custom={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
                onClick={() => handleLessonClick(lesson.id)}
                onMouseEnter={() => setHoveredLessonId(lesson.id)}
                onMouseLeave={() => setHoveredLessonId(null)}
              >
                {/* Node Circle */}
                <motion.div
                  className={cn(
                    'flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 flex items-center justify-center font-semibold text-xl sm:text-2xl shadow-md transition-all duration-300',
                    'min-h-[44px] min-w-[44px]',
                    statusColors,
                    isClickable && 'group-hover:scale-110 group-hover:shadow-lg',
                    hoveredLessonId === lesson.id && isClickable && 'ring-4 ring-blue-400 dark:ring-blue-500'
                  )}
                  whileHover={
                    isClickable
                      ? {
                          scale: 1.1,
                        }
                      : {}
                  }
                >
                  <span>{lesson.icon}</span>
                </motion.div>

                {/* Lesson Content */}
                <motion.div
                  className="flex-1 py-1 cursor-pointer min-w-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 + 0.1, duration: 0.3 }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-1">
                    <h4
                      className={cn(
                        'font-semibold text-sm sm:text-base transition-colors duration-200 truncate',
                        isClickable
                          ? 'text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                          : 'text-gray-500 dark:text-gray-400'
                      )}
                    >
                      {lesson.title}
                    </h4>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex-shrink-0">
                      {statusIndicator}
                    </span>
                  </div>

                  {/* Completion Progress */}
                  {lesson.completionPercent !== undefined && lesson.status !== 'locked' && (
                    <motion.div
                      className="mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 + 0.15, duration: 0.3 }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-blue-400 to-purple-500 dark:from-blue-500 dark:to-purple-600 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${lesson.completionPercent}%` }}
                            transition={{ delay: 0.3 + index * 0.1 + 0.2, duration: 0.5 }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">
                          {lesson.completionPercent}%
                        </span>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {sortedLessons.length === 0 && (
          <motion.div
            className="py-8 text-center text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <p className="text-sm">No lessons available</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
