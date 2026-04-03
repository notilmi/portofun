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
          <h1 className="text-2xl font-bold">Dasbor</h1>
          <p className="text-sm text-muted-foreground">
            Ikhtisar belajar dan akses cepat Anda.
          </p>
        </div>

        <div className="flex gap-3 text-sm">
          <Link className="underline" href="/learning-center/dashboard/catalog">
            Katalog
          </Link>
          <Link className="underline" href="/learning-center/dashboard/my-learnings">
            Pembelajaran Saya
          </Link>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{insights.activeCount}</div>
            <p className="mt-1 text-sm text-muted-foreground">Pendaftaran</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Selesai
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{insights.completedCount}</div>
            <p className="mt-1 text-sm text-muted-foreground">Pendaftaran</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Dihentikan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{insights.droppedCount}</div>
            <p className="mt-1 text-sm text-muted-foreground">Pendaftaran</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Materi selesai
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{insights.completedMaterialsCount}</div>
            <p className="mt-1 text-sm text-muted-foreground">Semua kursus</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="text-base">Jelajahi Katalog</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Temukan kursus yang Anda minati dan daftarkan diri.
            <div className="mt-3">
              <Link className="underline" href="/learning-center/dashboard/catalog">
                Buka katalog
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="text-base">Lanjutkan belajar</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Kembali ke kursus aktif Anda.
            <div className="mt-3">
              <Link className="underline" href="/learning-center/dashboard/my-learnings">
                Buka pembelajaran saya
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
