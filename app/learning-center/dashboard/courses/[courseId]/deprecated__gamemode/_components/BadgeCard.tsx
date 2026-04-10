'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { scaleInVariants } from '@/lib/animations/variants';

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  earned: boolean;
  earnedDate?: string;
}

interface BadgeCardProps {
  badge: BadgeData;
  onClick?: (badge: BadgeData) => void;
  className?: string;
}

const rarityColors: Record<string, { bg: string; text: string; border: string }> = {
  common: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-700 dark:text-gray-300',
    border: 'border-gray-300 dark:border-gray-600',
  },
  uncommon: {
    bg: 'bg-green-100 dark:bg-green-900',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-300 dark:border-green-600',
  },
  rare: {
    bg: 'bg-blue-100 dark:bg-blue-900',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-300 dark:border-blue-600',
  },
  epic: {
    bg: 'bg-purple-100 dark:bg-purple-900',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-300 dark:border-purple-600',
  },
  legendary: {
    bg: 'bg-amber-100 dark:bg-amber-900',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-600',
  },
};

export const BadgeCard: React.FC<BadgeCardProps> = ({
  badge,
  onClick,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const rarityStyle = rarityColors[badge.rarity];

  return (
    <motion.div
      variants={scaleInVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.95 }}
    >
      <Card
        className={cn(
          'relative overflow-hidden transition-all duration-300 cursor-pointer',
          'hover:shadow-lg',
          !badge.earned && 'opacity-60',
          className
        )}
        onClick={() => onClick?.(badge)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="button"
        tabIndex={0}
        aria-label={`Badge: ${badge.name}`}
        aria-pressed={badge.earned}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClick?.(badge);
          }
        }}
      >
      {/* Background gradient effect */}
      <div
        className={cn(
          'absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none',
          isHovered && 'opacity-10',
          `${rarityStyle.bg}`
        )}
      />

      <CardHeader className="pb-2 pt-4">
        {/* Badge Icon - Large and Centered */}
        <div
          className={cn(
            'flex justify-center mb-3 text-6xl transition-all duration-300',
            !badge.earned && 'grayscale',
            isHovered && !badge.earned && 'grayscale-0',
            isHovered && 'scale-110'
          )}
          aria-hidden="true"
        >
          {badge.icon}
        </div>

        {/* Name and Rarity Badge */}
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{badge.name}</CardTitle>
          <Badge
            variant="outline"
            className={cn(
              'ml-auto whitespace-nowrap',
              rarityStyle.text,
              rarityStyle.border,
              `border ${rarityStyle.border}`,
              rarityStyle.bg
            )}
          >
            {badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      {/* Description */}
      <CardContent className="pb-4">
        <CardDescription className="text-xs leading-relaxed">
          {badge.description}
        </CardDescription>
      </CardContent>

      {/* Status Footer */}
      <CardFooter className="border-t border-foreground/10 pt-3">
        <div className="w-full flex items-center justify-between text-xs">
          {badge.earned && badge.earnedDate ? (
            <div className="flex flex-col">
              <span className="font-medium text-foreground">✓ Earned</span>
              <span className="text-muted-foreground">{badge.earnedDate}</span>
            </div>
          ) : (
            <span className="text-muted-foreground font-medium">🔒 Locked</span>
          )}
        </div>
      </CardFooter>
    </Card>
    </motion.div>
  );
};
