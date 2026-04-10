/**
 * Framer Motion animation variants for gamified progression UI
 * Centralized animation patterns for consistency and reusability
 */

import { Variants } from 'motion/react';

// Accessibility: Check for prefers-reduced-motion
export const shouldReduceMotion = () => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return false;
};

// Safe transition that respects accessibility preferences
export const safeTransition = (
  duration: number = 0.3,
  delay: number = 0
) => ({
  duration: shouldReduceMotion() ? 0 : duration,
  delay,
  ease: 'easeInOut' as const,
});

// ============================================================================
// LESSON NODE ANIMATIONS
// ============================================================================

export const lessonNodeVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 },
  },
};

// Stagger effect for multiple lesson nodes (50ms delay per item)
export const lessonNodeContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

// Current state pulse animation (0.5s cycle)
export const currentStatePulseVariants: Variants = {
  animate: {
    scale: [1, 1.08, 1],
    opacity: [1, 1, 1],
    transition: {
      duration: 0.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Status change fade transition
export const statusChangeVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeInOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

// ============================================================================
// CHAPTER SECTION ANIMATIONS
// ============================================================================

export const chapterSectionVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

export const chapterBadgeVariants: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      delay: 0.1,
      duration: 0.3,
      type: 'spring',
      stiffness: 200,
      damping: 15,
    },
  },
};

export const connectorLineVariants: Variants = {
  hidden: {
    height: 0,
    opacity: 0,
  },
  visible: {
    height: '100%',
    opacity: 1,
    transition: {
      delay: 0.3,
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

// Stagger children animation for chapter lessons
export const chapterLessonsContainerVariants: Variants = {
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

export const chapterLessonItemVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: (index: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: index * 0.1,
      duration: 0.3,
      ease: 'easeOut',
    },
  }),
  hover: {
    x: 5,
    transition: { duration: 0.2 },
  },
};

// ============================================================================
// DAILY QUEST CARD ANIMATIONS
// ============================================================================

export const dailyQuestCardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.25,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
  hover: {
    y: -4,
    transition: { duration: 0.2 },
  },
};

export const progressBarVariants: Variants = {
  hidden: {
    width: '0%',
  },
  visible: (width: number) => ({
    width: `${width}%`,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  }),
};

export const questRewardVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      delay: 0.2,
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

// ============================================================================
// ELITE RANKS CARD ANIMATIONS
// ============================================================================

export const eliteRanksCardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
  hover: {
    y: -4,
    transition: { duration: 0.2 },
  },
};

// Badge bounce in with celebratory effect
export const eliteRanksBadgeVariants: Variants = {
  hidden: {
    scale: 0,
    rotate: -180,
  },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      delay: 0.2,
      duration: 0.5,
      type: 'spring',
      stiffness: 150,
      damping: 12,
    },
  },
};

// Floating animation for the badge
export const eliteRanksFloatingVariants: Variants = {
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 3,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
};

// Icon rotation on entry (celebratory)
export const eliteRanksIconRotateVariants: Variants = {
  hidden: {
    rotate: 0,
  },
  visible: {
    rotate: 360,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
      delay: 0.3,
    },
  },
};

// ============================================================================
// CHAPTER HEADER ANIMATIONS
// ============================================================================

export const chapterHeaderVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

// Guidebook button hover
export const guidebookButtonVariants: Variants = {
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 },
  },
};

// Favorite star animation
export const favoriteStarVariants: Variants = {
  inactive: {
    rotate: 0,
    scale: 1,
  },
  active: {
    rotate: 360,
    scale: 1.2,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  pulse: {
    scale: [1, 1.2, 1],
    transition: {
      duration: 0.6,
      ease: 'easeInOut',
    },
  },
};

// ============================================================================
// PROGRESSION PAGE ANIMATIONS
// ============================================================================

export const pageEntryVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

// Floating card animation
export const floatingCardVariants: Variants = {
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 4,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
};

// Vertical line draw animation (for progression timelines)
export const lineDrawVariants: Variants = {
  hidden: {
    height: 0,
    opacity: 0,
  },
  visible: {
    height: '100%',
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
    },
  },
};

// ============================================================================
// STATUS BADGE ANIMATIONS
// ============================================================================

export const statusBadgeVariants: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.3,
      type: 'spring',
      stiffness: 200,
      damping: 15,
    },
  },
};

// Checkmark SVG draw animation
export const checkmarkDrawVariants: Variants = {
  hidden: {
    pathLength: 0,
    opacity: 0,
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
      delay: 0.2,
    },
  },
};

// ============================================================================
// GENERIC ANIMATIONS
// ============================================================================

// Fade in/out
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

// Slide from left with fade
export const slideInLeftVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

// Slide from right with fade
export const slideInRightVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

// Slide from bottom with fade
export const slideInBottomVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

// Scale and fade in
export const scaleInVariants: Variants = {
  hidden: {
    scale: 0.8,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

// Shimmer effect for loading/completion
export const shimmerVariants: Variants = {
  animate: {
    x: ['0%', '100%'],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Bounce animation
export const bounceVariants: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
};

// ============================================================================
// CONTAINER STAGGER ANIMATIONS
// ============================================================================

export const containerStaggerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const itemStaggerVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};
