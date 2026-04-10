'use client';

import React from 'react';
import {
  IconVideo,
  IconCircleCheck,
  IconWeight,
  IconFlame,
  IconBook,
} from '@tabler/icons-react';

type LessonType = 'video' | 'quiz' | 'practice' | 'challenge' | 'reading';
type IconSize = 'sm' | 'md' | 'lg';

interface LessonIconProps {
  type: LessonType;
  size?: IconSize;
}

const sizeMap: Record<IconSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
};

const sizeClass: Record<IconSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

type IconComponent = React.ComponentType<{ size: number; className?: string }>;

const iconMap: Record<LessonType, IconComponent> = {
  video: IconVideo,
  quiz: IconCircleCheck,
  practice: IconWeight,
  challenge: IconFlame,
  reading: IconBook,
};

const emojiMap: Record<LessonType, string> = {
  video: '🎥',
  quiz: '❓',
  practice: '💪',
  challenge: '🔥',
  reading: '📖',
};

export const LessonIcon: React.FC<LessonIconProps> = ({ type, size = 'md' }) => {
  const iconSize = sizeMap[size];
  const Icon = iconMap[type];

  if (!Icon) {
    return <span className={sizeClass[size]}>{emojiMap[type]}</span>;
  }

  return (
    <Icon
      size={iconSize}
      className={`${sizeClass[size]} text-blue-600 dark:text-blue-400`}
      aria-label={`${type} lesson`}
    />
  );
};

export default LessonIcon;
