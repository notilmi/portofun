'use client';

import React, { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { IconLock, IconCheck } from '@tabler/icons-react';
import {
  lessonNodeVariants,
  statusChangeVariants,
} from '@/lib/animations/variants';

interface LessonNodeProps {
  title: string;
  icon: string | ReactNode;
  status: 'completed' | 'current' | 'locked';
  onClick?: () => void;
  completionPercent?: number;
  index?: number;
}

const pulseVariants = {
  animate: {
    scale: [1, 1.08, 1],
    transition: {
      duration: 0.5,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
};

export function LessonNode({
  title,
  icon,
  status,
  onClick,
  completionPercent = 0,
  index = 0,
}: LessonNodeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isClickable = status !== 'locked' && onClick;

  const getStatusColors = () => {
    switch (status) {
      case 'completed':
        return {
          circle: 'bg-amber-400 dark:bg-amber-500',
          shadow: 'shadow-amber-400/50',
          indicator: 'text-white',
        };
      case 'current':
        return {
          circle: 'bg-emerald-500 dark:bg-emerald-600',
          shadow: 'shadow-emerald-500/50',
          indicator: 'text-white',
        };
      case 'locked':
        return {
          circle: 'bg-gray-300 dark:bg-gray-600',
          shadow: 'shadow-gray-300/50',
          indicator: 'text-gray-600 dark:text-gray-400',
        };
    }
  };

  const colors = getStatusColors();

  const renderIcon = () => {
    if (typeof icon === 'string') {
      return <div className="text-4xl">{icon}</div>;
    }
    return icon;
  };

  const renderStatusIndicator = () => {
    if (status === 'completed') {
      return (
        <motion.div
          className="absolute bottom-0 right-0 bg-white dark:bg-gray-900 rounded-full p-1 shadow-lg"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <IconCheck className="w-5 h-5 text-emerald-500" />
        </motion.div>
      );
    }

    if (status === 'locked') {
      return (
        <motion.div
          className="absolute bottom-0 right-0 bg-white dark:bg-gray-900 rounded-full p-1 shadow-lg"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <IconLock className="w-5 h-5 text-gray-500" />
        </motion.div>
      );
    }

    return null;
  };

  return (
    <motion.div
      className="flex flex-col items-center gap-2 sm:gap-3"
      variants={lessonNodeVariants}
      initial="hidden"
      animate="visible"
      transition={{
        ...(typeof lessonNodeVariants.visible !== 'string' && 
            'transition' in lessonNodeVariants.visible 
          ? (lessonNodeVariants.visible.transition as Record<string, unknown>)
          : {}),
        delay: index * 0.05,
      }}
    >
      {/* Main Circle Node */}
      <motion.div
        onClick={() => isClickable && onClick?.()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role={isClickable ? 'button' : 'presentation'}
        tabIndex={isClickable ? 0 : -1}
        aria-label={`${title} - ${status}`}
        aria-disabled={status === 'locked'}
        onKeyDown={(e) => {
          if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick?.();
          }
        }}
        whileHover={isClickable ? { scale: 1.05 } : {}}
        whileTap={isClickable ? { scale: 0.95 } : {}}
        animate={status === 'current' ? 'animate' : undefined}
        variants={status === 'current' ? pulseVariants : undefined}
        transition={isClickable ? { type: 'spring', stiffness: 300, damping: 20 } : undefined}
        className={cn(
          'relative w-[70px] h-[70px] sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center',
          'min-h-[44px] min-w-[44px]',
          colors.circle,
          'shadow-lg transition-all duration-300',
          isClickable && 'cursor-pointer hover:shadow-xl active:scale-95',
          !isClickable && 'cursor-not-allowed opacity-75',
          status === 'locked' && 'border-2 border-dashed border-gray-400 dark:border-gray-500'
        )}
      >
        {/* Progress ring for current state */}
        {status === 'current' && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-white border-r-white"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            style={{ borderColor: 'transparent transparent white white' }}
          />
        )}

        {/* Completion ring */}
        {completionPercent > 0 && status === 'current' && (
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-white/20"
            />
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${Math.PI * 96}`}
              strokeDashoffset={`${Math.PI * 96 * (1 - completionPercent / 100)}`}
              className="text-white"
              style={{ strokeLinecap: 'round' }}
            />
          </svg>
        )}

        {/* Icon */}
        <motion.div
          className="relative z-10 flex items-center justify-center text-white drop-shadow-lg text-2xl sm:text-3xl md:text-4xl"
          animate={isHovered && isClickable ? { scale: 1.1 } : { scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {renderIcon()}
        </motion.div>

        {/* Status Indicator */}
        {renderStatusIndicator()}

        {/* Grayscale overlay for locked state */}
        {status === 'locked' && (
          <div className="absolute inset-0 rounded-full bg-black/20" />
        )}
      </motion.div>

      {/* Title */}
      <motion.div
        className="text-center w-full px-1"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 + 0.1, duration: 0.3 }}
      >
        <h3 className="text-xs sm:text-sm font-semibold text-foreground truncate max-w-[100px] sm:max-w-[140px]">
          {title}
        </h3>
        <AnimatePresence mode="wait">
          {status === 'locked' && (
            <motion.p
              key="locked"
              className="text-xs text-muted-foreground mt-0.5"
              variants={statusChangeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              Locked
            </motion.p>
          )}
          {status === 'completed' && (
            <motion.p
              key="completed"
              className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-0.5"
              variants={statusChangeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              Completed
            </motion.p>
          )}
          {status === 'current' && (
            <motion.p
              key="current"
              className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5"
              variants={statusChangeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              Current
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
