'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { motion } from 'motion/react';
import {
  chapterHeaderVariants,
  guidebookButtonVariants,
  favoriteStarVariants,
} from '@/lib/animations/variants';

interface ChapterHeaderProps {
  chapterNumber: number;
  title: string;
  description?: string;
  onGuideClick?: () => void;
  isFavorite?: boolean;
  onFavoriteToggle?: (favorite: boolean) => void;
  className?: string;
}

export const ChapterHeader: React.FC<ChapterHeaderProps> = ({
  chapterNumber,
  title,
  description,
  onGuideClick,
  isFavorite = false,
  onFavoriteToggle,
  className = '',
}) => {
  const [isStarHovered, setIsStarHovered] = useState(false);
  const [isFavored, setIsFavored] = useState(isFavorite);

  const handleFavoriteToggle = () => {
    const newState = !isFavored;
    setIsFavored(newState);
    onFavoriteToggle?.(newState);
  };

  return (
    <motion.div
      className={cn(
        'bg-gradient-to-r from-teal-600 to-teal-700 dark:from-teal-700 dark:to-teal-800',
        'rounded-lg',
        'p-3 sm:p-4 md:p-6',
        'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6',
        'shadow-md',
        'hover:shadow-lg',
        'transition-all duration-300',
        'border border-teal-500 dark:border-teal-600',
        'min-h-[60px] sm:min-h-[80px]',
        className
      )}
      variants={chapterHeaderVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Left Section: Chapter Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 sm:gap-3 mb-1 sm:mb-2">
          <span className="text-xs sm:text-sm font-bold tracking-wider text-teal-100 dark:text-teal-200 truncate">
            CHAPTER {chapterNumber}
          </span>
          <button
            onClick={handleFavoriteToggle}
            onMouseEnter={() => setIsStarHovered(true)}
            onMouseLeave={() => setIsStarHovered(false)}
            className="ml-1 sm:ml-2 transition-all duration-200 focus:outline-none active:scale-95 flex-shrink-0"
            aria-label={isFavored ? 'Remove from favorites' : 'Add to favorites'}
          >
            <motion.div
              variants={favoriteStarVariants}
              initial={isFavored ? 'active' : 'inactive'}
              animate={isFavored ? 'active' : isStarHovered ? 'pulse' : 'inactive'}
              whileHover="pulse"
            >
              <Star
                size={18}
                className={cn(
                  'sm:w-5 sm:h-5 w-4.5 h-4.5 transition-all duration-300',
                  isFavored || isStarHovered
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-teal-100 dark:text-teal-200'
                )}
              />
            </motion.div>
          </button>
        </div>

        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white dark:text-white mb-1 sm:mb-2 line-clamp-2">
          {title}
        </h2>

        {description && (
          <p className="text-xs sm:text-sm text-teal-100 dark:text-teal-200 line-clamp-2">
            {description}
          </p>
        )}
      </div>

      {/* Right Section: Guidebook Button */}
      <div className="flex-shrink-0 w-full sm:w-auto">
        <motion.div
          variants={guidebookButtonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <Button
            variant="outline"
            onClick={onGuideClick}
            className={cn(
              'border-white dark:border-teal-300',
              'text-white dark:text-teal-50',
              'bg-transparent hover:bg-white/10 dark:hover:bg-teal-600/40',
              'font-semibold text-xs sm:text-sm',
              'px-4 sm:px-6 py-2 sm:py-2.5',
              'transition-all duration-300',
              'hover:shadow-md',
              'whitespace-nowrap',
              'w-full sm:w-auto',
              'min-h-[44px] sm:min-h-auto'
            )}
          >
            GUIDEBOOK
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};
