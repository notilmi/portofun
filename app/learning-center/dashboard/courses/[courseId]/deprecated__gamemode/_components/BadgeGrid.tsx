'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { BadgeCard } from './BadgeCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  earned: boolean;
  earnedDate?: string;
  type?: string;
}

type SortOption = 'earned-first' | 'date-newest' | 'date-oldest' | 'name' | 'rarity';

interface BadgeGridProps {
  badges: BadgeData[];
  onBadgeClick?: (badge: BadgeData) => void;
  itemsPerPage?: number;
  className?: string;
  showHeader?: boolean;
  showSort?: boolean;
  showPagination?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    } as any,
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    } as any,
  },
};

export const BadgeGrid: React.FC<BadgeGridProps> = ({
  badges,
  onBadgeClick,
  itemsPerPage = 12,
  className = '',
  showHeader = true,
  showSort = true,
  showPagination = true,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('earned-first');
  const [currentPage, setCurrentPage] = useState(1);

  // Sort badges based on selected option
  const sortedBadges = useMemo(() => {
    const sorted = [...badges];

    switch (sortBy) {
      case 'earned-first':
        return sorted.sort((a, b) => {
          if (a.earned === b.earned) return a.name.localeCompare(b.name);
          return a.earned ? -1 : 1;
        });
      case 'date-newest':
        return sorted.sort((a, b) => {
          if (!a.earnedDate || !b.earnedDate) return 0;
          return new Date(b.earnedDate).getTime() - new Date(a.earnedDate).getTime();
        });
      case 'date-oldest':
        return sorted.sort((a, b) => {
          if (!a.earnedDate || !b.earnedDate) return 0;
          return new Date(a.earnedDate).getTime() - new Date(b.earnedDate).getTime();
        });
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'rarity': {
        const rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
        return sorted.sort(
          (a, b) =>
            rarityOrder[a.rarity as keyof typeof rarityOrder] -
            rarityOrder[b.rarity as keyof typeof rarityOrder]
        );
      }
      default:
        return sorted;
    }
  }, [badges, sortBy]);

  // Calculate pagination
  const totalPages = Math.ceil(sortedBadges.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBadges = sortedBadges.slice(startIndex, endIndex);

  // Reset to first page when sorting changes
  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const earnedCount = badges.filter((b) => b.earned).length;
  const totalCount = badges.length;

  return (
    <div className={cn('w-full', className)}>
      {/* Header with controls */}
      {showHeader && (
        <motion.div
          className="mb-6 space-y-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Badges</h2>
              <p className="text-sm text-muted-foreground">
                {earnedCount} of {totalCount} badges earned
              </p>
            </div>

            {showSort && (
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="earned-first">Earned First</SelectItem>
                  <SelectItem value="date-newest">Recently Earned</SelectItem>
                  <SelectItem value="date-oldest">Oldest Earned</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="rarity">Rarity</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {badges.length === 0 && (
        <motion.div
          className="flex flex-col items-center justify-center py-12 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-5xl mb-4">🏅</div>
          <h3 className="text-lg font-semibold mb-2">No badges yet</h3>
          <p className="text-sm text-muted-foreground">
            Start earning badges by completing challenges and activities.
          </p>
        </motion.div>
      )}

      {/* Badge Grid */}
      {badges.length > 0 && (
        <>
          <motion.div
            className={cn(
              'grid gap-4',
              'grid-cols-1',
              'sm:grid-cols-2',
              'lg:grid-cols-4'
            )}
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {paginatedBadges.map((badge) => (
              <motion.div key={badge.id} variants={itemVariants}>
                <BadgeCard
                  badge={badge}
                  onClick={onBadgeClick}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination */}
          {showPagination && totalPages > 1 && (
            <motion.div
              className="mt-8 flex items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                ← Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    aria-current={currentPage === page ? 'page' : undefined}
                    aria-label={`Go to page ${page}`}
                    className="min-w-10"
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                Next →
              </Button>
            </motion.div>
          )}

          {/* Info text */}
          {showPagination && totalPages > 1 && (
            <motion.p
              className="mt-4 text-center text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Page {currentPage} of {totalPages} ({paginatedBadges.length} of {sortedBadges.length} badges)
            </motion.p>
          )}
        </>
      )}
    </div>
  );
};
