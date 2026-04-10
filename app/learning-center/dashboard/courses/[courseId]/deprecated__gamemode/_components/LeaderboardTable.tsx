'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronUp, ChevronDown, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  level: number;
  streak: number;
  isCurrentUser: boolean;
  userId?: string;
}

interface LeaderboardTableProps {
  data: LeaderboardEntry[];
  onUserClick?: (userId: string) => void;
  pageSize?: number;
  isLoading?: boolean;
  title?: string;
}

type SortField = 'rank' | 'points' | 'streak';
type SortDirection = 'asc' | 'desc';

export function LeaderboardTable({
  data,
  onUserClick,
  pageSize = 10,
  isLoading = false,
  title = 'Leaderboard',
}: LeaderboardTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Filter and sort data
  const processedData = useMemo(() => {
    const filtered = data.filter((entry) =>
      entry.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let compareValue = 0;

      switch (sortField) {
        case 'points':
          compareValue = a.points - b.points;
          break;
        case 'streak':
          compareValue = a.streak - b.streak;
          break;
        case 'rank':
        default:
          compareValue = a.rank - b.rank;
          break;
      }

      return sortDirection === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [data, searchTerm, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPageData = processedData.slice(startIndex, endIndex);

  // Find current user for highlighting
  const currentUserEntry = data.find((entry) => entry.isCurrentUser);
  const currentUserIndex =
    processedData.findIndex((entry) => entry.isCurrentUser) + 1;
  const currentUserPage = Math.ceil(currentUserIndex / pageSize);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const getRankMedal = (rank: number): string => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '';
    }
  };

  const handleRowClick = (userId?: string) => {
    if (userId && onUserClick) {
      onUserClick(userId);
    }
  };

  if (isLoading) {
    return (
      <motion.div
        className="w-full rounded-lg border border-border bg-card p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading leaderboard...</span>
        </div>
      </motion.div>
    );
  }

  if (data.length === 0) {
    return (
      <motion.div
        className="w-full rounded-lg border border-border bg-card p-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <h3 className="text-lg font-semibold text-foreground">No Data Available</h3>
          <p className="text-sm text-muted-foreground">
            The leaderboard is empty. Complete courses to appear here.
          </p>
        </div>
      </motion.div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      } as any,
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      } as any,
    },
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          {/* Table Header */}
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-foreground">
                <button
                  onClick={() => handleSort('rank')}
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  Rank
                  {sortField === 'rank' && (
                    sortDirection === 'asc' ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">
                Name
              </th>
              <th className="px-4 py-3 text-center font-semibold text-foreground">
                Level
              </th>
              <th className="px-4 py-3 text-right font-semibold text-foreground">
                <button
                  onClick={() => handleSort('points')}
                  className="ml-auto flex items-center gap-2 hover:text-primary transition-colors"
                >
                  Points
                  {sortField === 'points' && (
                    sortDirection === 'asc' ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-right font-semibold text-foreground">
                <button
                  onClick={() => handleSort('streak')}
                  className="ml-auto flex items-center gap-2 hover:text-primary transition-colors"
                >
                  Streak
                  {sortField === 'streak' && (
                    sortDirection === 'asc' ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )
                  )}
                </button>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <motion.tbody
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {currentPageData.map((entry, index) => (
              <motion.tr
                key={`${entry.rank}-${entry.name}-${index}`}
                onClick={() => handleRowClick(entry.userId)}
                custom={index}
                variants={rowVariants}
                className={cn(
                  'border-b border-border transition-colors',
                  entry.isCurrentUser
                    ? 'bg-primary/10 dark:bg-primary/5'
                    : 'hover:bg-muted/50',
                  onUserClick && entry.userId ? 'cursor-pointer' : ''
                )}
                whileHover={{ backgroundColor: 'var(--muted-background)' }}
              >
                {/* Rank */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getRankMedal(entry.rank)}</span>
                    <span className="font-semibold text-foreground">
                      #{entry.rank}
                    </span>
                  </div>
                </td>

                {/* Name */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'font-medium',
                        entry.isCurrentUser
                          ? 'text-primary font-semibold'
                          : 'text-foreground'
                      )}
                    >
                      {entry.name}
                    </span>
                    {entry.isCurrentUser && (
                      <Badge variant="secondary" className="text-xs">
                        You
                      </Badge>
                    )}
                  </div>
                </td>

                {/* Level */}
                <td className="px-4 py-3 text-center">
                  <Badge
                    variant="outline"
                    className="mx-auto inline-flex justify-center"
                  >
                    Lvl {entry.level}
                  </Badge>
                </td>

                {/* Points */}
                <td className="px-4 py-3 text-right">
                  <span className="font-bold text-foreground">
                    {entry.points.toLocaleString()}
                  </span>
                </td>

                {/* Streak */}
                <td className="px-4 py-3 text-right">
                  {entry.streak > 0 ? (
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-lg">🔥</span>
                      <span className="font-semibold text-orange-600 dark:text-orange-400">
                        {entry.streak}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>

      {/* Current User Info & Pagination */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Current User Info */}
        {currentUserEntry && currentUserPage !== currentPage && (
          <div
            onClick={() => setCurrentPage(currentUserPage)}
            className="cursor-pointer rounded-lg border border-primary bg-primary/5 p-3 transition-all hover:bg-primary/10"
          >
            <p className="text-sm text-foreground">
              <span className="font-semibold">Your Rank: #{currentUserEntry.rank}</span>
              {' '}
              {currentUserEntry.points.toLocaleString()} points
              {currentUserEntry.streak > 0 && (
                <>
                  {' '}
                  <span>🔥 {currentUserEntry.streak}</span>
                </>
              )}
            </p>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between gap-2 sm:ml-auto">
          <span className="text-xs text-muted-foreground sm:text-sm">
            Page {currentPage} of {totalPages || 1}
          </span>
          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <Button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      {searchTerm && (
        <p className="text-xs text-muted-foreground">
          Showing {currentPageData.length} of {processedData.length} results
        </p>
      )}
    </div>
  );
}
