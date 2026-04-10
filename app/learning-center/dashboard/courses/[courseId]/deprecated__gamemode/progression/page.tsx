'use client';

import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { ChapterSection } from '../_components/ChapterSection';
import { DailyQuestCard } from '../_components/DailyQuestCard';
import { EliteRanksCard } from '../_components/EliteRanksCard';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import type { DailyQuest } from '@/types/progression';

type PageProps = {
  params: Promise<{ courseId: string }>;
};

// Placeholder data for now - will be replaced in Phase 6 with real data
const PLACEHOLDER_DAILY_QUEST = {
  id: 'dq-001',
  userId: 'user-1',
  questType: 'lessons' as const,
  title: 'Complete Chapter 1',
  description: 'Master the basics of stock trading',
  current: 2,
  goal: 4,
  xpReward: 500,
  isCompleted: false,
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
}

const PLACEHOLDER_CHAPTERS = [
  {
    id: 'ch1',
    number: 1,
    title: 'Dasar Saham',
    description: 'Pelajari dasar-dasar saham dan investasi',
    lessons: [
      { id: 'l1', title: 'Basics', icon: '🎓', status: 'completed' as const, completionPercent: 100 },
      { id: 'l2', title: 'Greetings', icon: '👋', status: 'completed' as const, completionPercent: 100 },
      { id: 'l3', title: 'Daily Quest', icon: '⭐', status: 'in-progress' as const, completionPercent: 60 },
      { id: 'l4', title: 'Practice', icon: '💪', status: 'locked' as const },
    ],
    isLocked: false,
  },
  {
    id: 'ch2',
    number: 2,
    title: 'Analisis Pasar',
    description: 'Memahami analisis teknikal dan fundamental',
    lessons: [
      { id: 'l5', title: 'Chart Basics', icon: '📊', status: 'locked' as const },
      { id: 'l6', title: 'Indicators', icon: '📈', status: 'locked' as const },
    ],
    isLocked: true,
  },
  {
    id: 'ch3',
    number: 3,
    title: 'Portfolio Management',
    description: 'Kelola portfolio investasi Anda dengan bijak',
    lessons: [
      { id: 'l7', title: 'Diversification', icon: '🎯', status: 'locked' as const },
      { id: 'l8', title: 'Risk Management', icon: '🛡️', status: 'locked' as const },
    ],
    isLocked: true,
  },
];

// Memoized chapter section renderer
const MemoizedChapterSection = ({ chapter, onLessonClick }: any) => (
  <motion.div
    key={chapter.id}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    viewport={{ once: true, margin: '-50px' }}
  >
    <ChapterSection
      chapterNumber={chapter.number}
      title={chapter.title}
      description={chapter.description}
      lessons={chapter.lessons}
      isLocked={chapter.isLocked}
      onLessonClick={onLessonClick}
      className="mb-3 sm:mb-4 md:mb-6"
    />
  </motion.div>
);

// Skeleton loader for chapters
const ChapterSkeleton = () => (
  <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 p-3 sm:p-4 md:p-6 border rounded-lg bg-card">
    <Skeleton className="h-5 sm:h-6 w-1/3" />
    <Skeleton className="h-3 sm:h-4 w-2/3" />
    <div className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-16 sm:h-20 w-full" />
      ))}
    </div>
  </div>
);

export default function ProgressionPage({ params }: PageProps) {
  const [loadedChaptersCount, setLoadedChaptersCount] = useState(1);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [dismissedQuests, setDismissedQuests] = useState(false);
  const [dismissedRanks, setDismissedRanks] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const chapters = useMemo(() => PLACEHOLDER_CHAPTERS, []);

  const visibleChapters = useMemo(
    () => chapters.slice(0, loadedChaptersCount),
    [chapters, loadedChaptersCount]
  );

  const handleLessonClick = useCallback((lessonId: string) => {
    console.log('Lesson clicked:', lessonId);
    // Navigate to lesson or show completion modal
  }, []);

  const handleFavoriteToggle = useCallback((chapterId: string, isFavorite: boolean) => {
    setFavorites((prev) => {
      const newSet = new Set(prev);
      if (isFavorite) {
        newSet.add(chapterId);
      } else {
        newSet.delete(chapterId);
      }
      return newSet;
    });
  }, []);

  const handleStartQuest = useCallback(() => {
    console.log('Starting daily quest');
    // Navigate to lessons or start quest flow
  }, []);

  const handleViewLeague = useCallback(() => {
    console.log('Viewing league');
    // Navigate to leaderboard
  }, []);

  // Intersection Observer for lazy loading
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && loadedChaptersCount < chapters.length) {
          setLoadedChaptersCount((prev) => Math.min(prev + 1, chapters.length));
        }
      });
    },
    [loadedChaptersCount, chapters]
  );

  // Setup intersection observer
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: '100px',
      threshold: 0.1,
    });

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    observerRef.current = observer;

    return () => {
      observer.disconnect();
    };
  }, [handleIntersection]);

  return (
    <div className="relative px-2 sm:px-4 md:px-6">
      {/* Main content with two-column layout on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {/* Left: Progression path (takes 2 columns on desktop) */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4 md:space-y-6">
          {/* Loading chapters */}
          {visibleChapters.map((chapter) => (
            <MemoizedChapterSection
              key={chapter.id}
              chapter={chapter}
              onLessonClick={handleLessonClick}
            />
          ))}

          {/* Skeleton loaders for remaining chapters */}
          {loadedChaptersCount < chapters.length && (
            <div ref={loadMoreRef}>
              {[...Array(2)].map((_, i) => (
                <div key={`skeleton-${i}`} className="mb-3 sm:mb-4 md:mb-6">
                  <ChapterSkeleton />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {chapters.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-8 sm:py-12 text-center"
            >
              <p className="text-muted-foreground text-sm sm:text-base">No chapters available yet.</p>
            </motion.div>
          )}
        </div>

        {/* Right: Floating cards (sticky on desktop) */}
        <div className="space-y-3 sm:space-y-4">
          {/* Desktop floating cards container */}
          <div className="hidden lg:block sticky top-20 space-y-3 sm:space-y-4">
            <AnimatePresence>
              {!dismissedQuests && (
                <motion.div
                  key="daily-quest-card"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-card rounded-lg border shadow-md">
                    <DailyQuestCard
                      quest={PLACEHOLDER_DAILY_QUEST}
                      onStart={handleStartQuest}
                      onDismiss={() => setDismissedQuests(true)}
                      position="fixed"
                    />
                  </div>
                </motion.div>
              )}

              {!dismissedRanks && (
                <motion.div
                  key="elite-ranks-card"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <EliteRanksCard
                    rankName="Gold League"
                    currentRank={42}
                    totalParticipants={5000}
                    percentile={10}
                    badgeColor="gold"
                    onViewLeague={handleViewLeague}
                    icon="👑"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile cards inline */}
          <div className="lg:hidden space-y-3 sm:space-y-4">
            <AnimatePresence>
              {!dismissedQuests && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-card rounded-lg border shadow-md"
                >
                  <DailyQuestCard
                    quest={PLACEHOLDER_DAILY_QUEST}
                    onStart={handleStartQuest}
                    onDismiss={() => setDismissedQuests(true)}
                    position="fixed"
                  />
                </motion.div>
              )}

              {!dismissedRanks && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <EliteRanksCard
                    rankName="Gold League"
                    currentRank={42}
                    totalParticipants={5000}
                    percentile={10}
                    badgeColor="gold"
                    onViewLeague={handleViewLeague}
                    icon="👑"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Scroll behavior */}
      <style>{`
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}
