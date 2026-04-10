"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AchievementsPage() {
  const badges = [
    { id: "1", name: "First Steps", description: "Complete your first material", icon: "👣", earned: true, earnedDate: "2024-01-15" },
    { id: "2", name: "Quarter Way", description: "Complete 25% of the course", icon: "🌟", earned: false },
    { id: "3", name: "Halfway There", description: "Complete 50% of the course", icon: "⭐", earned: false },
    { id: "4", name: "Almost Done", description: "Complete 75% of the course", icon: "✨", earned: false },
    { id: "5", name: "Master", description: "Complete 100% of the course", icon: "👑", earned: false },
    { id: "6", name: "On Fire", description: "7-day learning streak", icon: "🔥", earned: false },
    { id: "7", name: "Legendary", description: "30-day learning streak", icon: "⚡", earned: false },
    { id: "8", name: "Quiz Ace", description: "Perfect score on a quiz", icon: "🎯", earned: false },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Badges & Achievements</CardTitle>
          <CardDescription>
            Collect badges by achieving milestones in your learning journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Badges Earned</span>
              <span className="font-semibold">
                {badges.filter((b) => b.earned).length} / {badges.length}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-400 to-purple-600"
                style={{
                  width: `${Math.round(
                    (badges.filter((b) => b.earned).length / badges.length) * 100
                  )}%`,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`group relative overflow-hidden rounded-lg border p-4 transition-all ${
              badge.earned
                ? "border-purple-300/50 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20"
                : "border-muted bg-muted/30 opacity-60"
            }`}
          >
            <div className="text-center space-y-2">
              <div className={`text-4xl ${badge.earned ? "" : "grayscale opacity-50"}`}>
                {badge.icon}
              </div>
              <div>
                <p className="font-semibold text-sm">{badge.name}</p>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              </div>

              {badge.earned && badge.earnedDate && (
                <div className="pt-2 border-t text-xs text-muted-foreground">
                  Earned {badge.earnedDate}
                </div>
              )}

              {!badge.earned && (
                <div className="pt-2 border-t">
                  <div className="inline-block px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 rounded text-xs font-medium text-yellow-700 dark:text-yellow-300">
                    Locked
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
