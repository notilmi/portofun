import Link from "next/link";
import { Suspense } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import DashboardHomeSkeleton from "@/app/learning-center/dashboard/_components/dashboard-home-skeleton";
import { getDashboardInsights } from "@/server/actions/learning-center/dashboard.actions";

async function DashboardInner() {
  const insights = await getDashboardInsights();

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-end">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Your learning overview and quick access.
          </p>
        </div>

        <div className="flex gap-3 text-sm">
          <Link className="underline" href="/learning-center/dashboard/catalog">
            Catalog
          </Link>
          <Link className="underline" href="/learning-center/dashboard/my-learnings">
            My Learnings
          </Link>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{insights.activeCount}</div>
            <p className="mt-1 text-sm text-muted-foreground">Enrollments</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{insights.completedCount}</div>
            <p className="mt-1 text-sm text-muted-foreground">Enrollments</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Dropped
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{insights.droppedCount}</div>
            <p className="mt-1 text-sm text-muted-foreground">Enrollments</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Materials completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{insights.completedMaterialsCount}</div>
            <p className="mt-1 text-sm text-muted-foreground">All courses</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="text-base">Browse Catalog</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Find courses you’re interested in and enroll.
            <div className="mt-3">
              <Link className="underline" href="/learning-center/dashboard/catalog">
                Open catalog
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="text-base">Continue learning</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Jump back into your active courses.
            <div className="mt-3">
              <Link className="underline" href="/learning-center/dashboard/my-learnings">
                Open my learnings
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardHomeSkeleton />}>
      <DashboardInner />
    </Suspense>
  );
}
