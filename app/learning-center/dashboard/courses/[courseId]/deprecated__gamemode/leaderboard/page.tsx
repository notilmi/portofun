import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/server/actions/auth";

type PageProps = {
  params: Promise<{ courseId: string }>;
};

async function LeaderboardPageInner({ params }: PageProps) {
  const user = await getSession(false);
  if (!user) {
    notFound();
  }

  // Mock leaderboard data
  const leaderboard = [
    { rank: 1, name: "Alice Chen", points: 1250, level: 5, streak: 12 },
    { rank: 2, name: "Bob Smith", points: 980, level: 4, streak: 8 },
    { rank: 3, name: "Carol Davis", points: 845, level: 4, streak: 6 },
    { rank: 4, name: "David Lee", points: 720, level: 3, streak: 3 },
    { rank: 5, name: "Eve Johnson", points: 650, level: 3, streak: 5 },
    { rank: 6, name: "Frank Wilson", points: 580, level: 3, streak: 2 },
    { rank: 7, name: "Grace Martinez", points: 510, level: 2, streak: 1 },
    { rank: 8, name: "Henry Brown", points: 420, level: 2, streak: 0 },
    { rank: 9, name: "Ivy Thompson", points: 350, level: 2, streak: 4 },
    { rank: 10, name: "Jack White", points: 280, level: 1, streak: 1 },
  ];

  const userRank = 7; // Assuming current user is at rank 7
  const userPoints = 510;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Global Leaderboard</CardTitle>
          <CardDescription>
            Top learners across all courses worldwide
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Your Rank Card */}
          <div className="mb-6 rounded-lg border-2 border-primary/50 bg-primary/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Your Current Rank</p>
                <p className="text-lg font-bold">#{userRank}</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-xs text-muted-foreground">Points: {userPoints}</p>
                <p className="text-xs text-muted-foreground">Level: 2</p>
              </div>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2 text-left font-semibold">#</th>
                  <th className="px-4 py-2 text-left font-semibold">Name</th>
                  <th className="px-4 py-2 text-right font-semibold">Level</th>
                  <th className="px-4 py-2 text-right font-semibold">Points</th>
                  <th className="px-4 py-2 text-right font-semibold">Streak</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => (
                  <tr
                    key={entry.rank}
                    className={`border-b transition-colors hover:bg-muted/50 ${
                      entry.rank === userRank ? "bg-primary/10" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-semibold">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted">
                        {entry.rank === 1 && "🥇"}
                        {entry.rank === 2 && "🥈"}
                        {entry.rank === 3 && "🥉"}
                        {entry.rank > 3 && entry.rank}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{entry.name}</div>
                      {entry.rank === userRank && (
                        <div className="text-xs text-primary font-semibold">You</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                        Level {entry.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{entry.points}</td>
                    <td className="px-4 py-3 text-right">
                      {entry.streak > 0 ? (
                        <span className="inline-flex items-center gap-1">
                          <span>🔥</span>
                          <span className="font-semibold text-orange-600 dark:text-orange-400">
                            {entry.streak}
                          </span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination placeholder */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <button className="px-3 py-1 rounded border text-sm hover:bg-muted">← Prev</button>
            <button className="px-3 py-1 rounded border text-sm bg-primary text-primary-foreground">1</button>
            <button className="px-3 py-1 rounded border text-sm hover:bg-muted">2</button>
            <button className="px-3 py-1 rounded border text-sm hover:bg-muted">Next →</button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LeaderboardPage(props: PageProps) {
  return (
    <Suspense fallback={<div className="py-8 text-center">Loading leaderboard...</div>}>
      <LeaderboardPageInner {...props} />
    </Suspense>
  );
}
