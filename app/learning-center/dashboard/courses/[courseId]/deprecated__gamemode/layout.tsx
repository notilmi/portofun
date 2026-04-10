"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

type LayoutProps = {
  params: Promise<{ courseId: string }>;
  children: React.ReactNode;
};

export default function GamemodeLayout({ params, children }: LayoutProps) {
  // Static layout - no async data fetching
  // Title and navigation are hardcoded for now
  
  return (
    <div className="space-y-4">
      {/* Header / breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">
            <Link
              href="/learning-center/dashboard/my-learnings"
              className="hover:underline"
            >
              Pembelajaran Saya
            </Link>
            <span className="px-2">/</span>
            <span>Course</span>
            <span className="px-2">/</span>
            <span className="font-medium text-foreground">Play Mode</span>
          </p>
          <h1 className="truncate text-lg font-semibold">
            🎮 Gamification Mode
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/learning-center/dashboard/my-learnings">
              Back
            </Link>
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="rounded-xl border bg-card">
        <div className="flex border-b">
          <Link
            href="/learning-center/dashboard/courses/1/gamemode/progression"
            className="flex-1 border-b-2 border-transparent px-4 py-3 text-center text-sm font-medium hover:bg-muted hover:border-primary"
          >
            📈 Progression
          </Link>
          <Link
            href="/learning-center/dashboard/courses/1/gamemode/achievements"
            className="flex-1 border-b-2 border-transparent px-4 py-3 text-center text-sm font-medium hover:bg-muted hover:border-primary"
          >
            🏆 Achievements
          </Link>
          <Link
            href="/learning-center/dashboard/courses/1/gamemode/leaderboard"
            className="flex-1 border-b-2 border-transparent px-4 py-3 text-center text-sm font-medium hover:bg-muted hover:border-primary"
          >
            🥇 Leaderboard
          </Link>
          <Link
            href="/learning-center/dashboard/courses/1/gamemode/stats"
            className="flex-1 border-b-2 border-transparent px-4 py-3 text-center text-sm font-medium hover:bg-muted hover:border-primary"
          >
            📊 Stats
          </Link>
        </div>

        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
