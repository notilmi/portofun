import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import LearningCenterCourseCard from "@/app/learning-center/dashboard/_components/learning-center-course-card";
import MyLearningsSkeleton from "../_components/my-learnings-skeleton";
import { Separator } from "@/components/ui/separator";
import { getSession } from "@/server/actions/auth";
import { getMyEnrollments } from "@/server/actions/learning-center/enrollment.actions";

async function MyLearningsInner() {
  const user = await getSession(false);
  if (!user) {
    notFound();
  }

  const enrollments = await getMyEnrollments();

  const active = enrollments.filter((e) => e.status === "ACTIVE");
  const completed = enrollments.filter((e) => e.status === "COMPLETED");
  const dropped = enrollments.filter((e) => e.status === "DROPPED");

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Pembelajaran Saya</h1>
          <p className="text-sm text-muted-foreground">
            Kursus yang Anda ikuti.
          </p>
        </div>
        <Link
          href="/learning-center/dashboard/catalog"
          className="text-sm underline"
        >
          Katalog
        </Link>
      </div>

      <Separator />

      {enrollments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Anda belum mendaftar ke kursus apa pun.
        </p>
      ) : (
        <div className="space-y-6">
          {active.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Aktif</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {active.map((e) => (
                  <LearningCenterCourseCard
                    key={e.id}
                    title={e.course.title}
                    description={e.course.description}
                    href={`/learning-center/dashboard/courses/${e.courseId}`}
                    badge={{ label: "Aktif", tone: "neutral" }}
                    footer={
                      <Button asChild size="sm" variant="outline">
                        <Link
                          href={`/learning-center/dashboard/courses/${e.courseId}`}
                        >
                          Lanjutkan
                        </Link>
                      </Button>
                    }
                  />
                ))}
              </div>
            </section>
          ) : null}

          {completed.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Selesai</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {completed.map((e) => (
                  <LearningCenterCourseCard
                    key={e.id}
                    title={e.course.title}
                    description={e.course.description}
                    href={`/learning-center/dashboard/courses/${e.courseId}`}
                    badge={{ label: "Selesai", tone: "success" }}
                    footer={
                      <Button asChild size="sm" variant="outline">
                        <Link
                          href={`/learning-center/dashboard/courses/${e.courseId}`}
                        >
                          Tinjau
                        </Link>
                      </Button>
                    }
                  />
                ))}
              </div>
            </section>
          ) : null}

          {dropped.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Dihentikan</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {dropped.map((e) => (
                  <LearningCenterCourseCard
                    key={e.id}
                    title={e.course.title}
                    description={e.course.description}
                    badge={{ label: "Dihentikan", tone: "warning" }}
                    footer={
                      <Button asChild size="sm" variant="outline">
                        <Link href="/learning-center/dashboard/catalog">
                          Daftar ulang
                        </Link>
                      </Button>
                    }
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default function MyLearningsPage() {
  return (
    <Suspense fallback={<MyLearningsSkeleton />}>
      <MyLearningsInner />
    </Suspense>
  );
}
