import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getSession } from "@/server/actions/auth";

type PageProps = {
  params: Promise<{ courseId: string }>;
};

async function StatsPageInner({ params }: PageProps) {
  const user = await getSession(false);
  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Points Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">510</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              +45 this week
            </p>
          </CardContent>
        </Card>

        {/* Current Level Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">2</p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full w-1/3 rounded-full bg-blue-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">33/100 XP to Level 3</p>
          </CardContent>
        </Card>

        {/* Current Streak Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">5 🔥</p>
            <p className="text-xs text-muted-foreground mt-1">5 consecutive days</p>
          </CardContent>
        </Card>

        {/* Global Rank Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Global Rank
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">#7</p>
            <p className="text-xs text-muted-foreground mt-1">Top 7% of learners</p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Streak Details */}
      <Card>
        <CardHeader>
          <CardTitle>Streak History</CardTitle>
          <CardDescription>Your learning consistency over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Current Streak</span>
                <span className="text-sm font-semibold">5 days</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Keep the momentum going! Complete materials daily to maintain your streak.
              </p>
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Longest Streak</span>
                <span className="text-sm font-semibold">12 days</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Achieved from April 5-16. Keep pushing to beat this!
              </p>
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Total Active Days</span>
                <span className="text-sm font-semibold">34 days</span>
              </div>
              <p className="text-xs text-muted-foreground">
                You've been learning on 34 unique days. Great commitment!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Activity</CardTitle>
          <CardDescription>Materials completed this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 grid-cols-7">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => (
              <div key={day} className="text-center">
                <p className="text-xs font-medium text-muted-foreground mb-2">{day}</p>
                <div
                  className={`aspect-square rounded-lg border-2 flex items-center justify-center text-xs font-bold ${
                    [1, 3, 4, 5, 6].includes(idx)
                      ? "border-emerald-400/50 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                      : "border-muted bg-muted/30 text-muted-foreground"
                  }`}
                >
                  {[1, 3, 4, 5, 6].includes(idx) ? "✓" : "—"}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Achievements Summary</CardTitle>
          <CardDescription>Your progress towards badges and milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏆</span>
                <div>
                  <p className="font-medium text-sm">Badges Earned</p>
                  <p className="text-xs text-muted-foreground">1 of 8 badges</p>
                </div>
              </div>
              <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-1/8 rounded-full bg-purple-500" />
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📈</span>
                <div>
                  <p className="font-medium text-sm">Course Completion</p>
                  <p className="text-xs text-muted-foreground">23% of materials completed</p>
                </div>
              </div>
              <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[23%] rounded-full bg-blue-500" />
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <p className="font-medium text-sm">Participation Level</p>
                  <p className="text-xs text-muted-foreground">Highly Active</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                Excellent
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function StatsPage(props: PageProps) {
  return (
    <Suspense fallback={<div className="py-8 text-center">Loading stats...</div>}>
      <StatsPageInner {...props} />
    </Suspense>
  );
}
