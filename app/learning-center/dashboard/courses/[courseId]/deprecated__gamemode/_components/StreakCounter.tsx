'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StreakCounterProps {
  currentStreak: number;
  lastActivityDate?: Date;
}

const pulseVariants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    } as any,
  },
};

const scaleVariants = {
  initial: { scale: 1 },
  update: {
    scale: [1, 1.15, 0.95, 1],
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    } as any,
  },
};

export function StreakCounter({ currentStreak, lastActivityDate }: StreakCounterProps) {
  const [prevStreak, setPrevStreak] = useState(currentStreak);
  const [hasUpdated, setHasUpdated] = useState(false);

  useEffect(() => {
    if (currentStreak !== prevStreak) {
      setHasUpdated(true);
      setPrevStreak(currentStreak);
      const timer = setTimeout(() => setHasUpdated(false), 600);
      return () => clearTimeout(timer);
    }
  }, [currentStreak, prevStreak]);

  const getStreakColor = (streak: number): string => {
    if (streak === 0) return 'text-red-500';
    if (streak >= 1 && streak <= 3) return 'text-orange-500';
    if (streak >= 4 && streak <= 6) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStreakBgColor = (streak: number): string => {
    if (streak === 0) return 'bg-red-100 dark:bg-red-950';
    if (streak >= 1 && streak <= 3) return 'bg-orange-100 dark:bg-orange-950';
    if (streak >= 4 && streak <= 6) return 'bg-yellow-100 dark:bg-yellow-950';
    return 'bg-green-100 dark:bg-green-950';
  };

  const formatLastActivityDate = (date: Date | undefined): string => {
    if (!date) return 'No activity yet';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 cursor-pointer transition-all ${getStreakBgColor(currentStreak)}`}
            animate="animate"
            variants={pulseVariants}
          >
            <div className="relative flex items-center justify-center">
              <motion.div
                className={`text-6xl font-bold ${getStreakColor(currentStreak)}`}
                initial="initial"
                animate={hasUpdated ? "update" : "initial"}
                variants={scaleVariants}
              >
                {currentStreak}
              </motion.div>
              {hasUpdated && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  initial={{ opacity: 1, scale: 0.5 }}
                  animate={{ opacity: 0, scale: 1.5 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="text-4xl">🔥</div>
                </motion.div>
              )}
            </div>
            <p className={`mt-2 text-sm font-medium ${getStreakColor(currentStreak)}`}>
              day{currentStreak !== 1 ? 's' : ''} streak
            </p>
            {hasUpdated && (
              <motion.div
                className="mt-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <motion.span
                  className="text-2xl inline-block"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                >
                  🔥
                </motion.span>
              </motion.div>
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">Last activity: {formatLastActivityDate(lastActivityDate)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
