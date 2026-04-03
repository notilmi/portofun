import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import LearningCenterCourseCard from "@/app/learning-center/dashboard/_components/learning-center-course-card";
import { Separator } from "@/components/ui/separator";
import { getSession } from "@/server/actions/auth";
import { getCourses } from "@/server/actions/learning-center/course.actions";
import { getMyEnrollments } from "@/server/actions/learning-center/enrollment.actions";
import CourseEnrollButton from "./_components/course-enroll-button";
import StatusPill from "./_components/status-pill";

async function CatalogInner() {
  const user = await getSession(false);
  if (!user) {
    notFound();
  }

  const [courses, enrollments] = await Promise.all([
    getCourses({ isArchived: false, orderBy: "title", orderDirection: "asc" }),
    getMyEnrollments(),
  ]);

  const enrollmentByCourseId = new Map(enrollments.map((e) => [e.courseId, e]));

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Catalog</h1>
          <p className="text-sm text-muted-foreground">
            Browse courses and enroll to start learning.
          </p>
        </div>
        <Link
          href="/learning-center/dashboard/my-learnings"
          className="text-sm underline"
        >
          My Learnings
        </Link>
      </div>

      <Separator />

      {courses.length === 0 ? (
        <p className="text-sm text-muted-foreground">No courses available.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {courses.map((course) => {
            const enrollment = enrollmentByCourseId.get(course.id);
            const status = enrollment?.status;

            const badge = status
              ? {
                  label: status,
                  tone:
                    status === "COMPLETED"
                      ? ("success" as const)
                      : status === "DROPPED"
                        ? ("warning" as const)
                        : ("neutral" as const),
                }
              : undefined;

            const href = status
              ? `/learning-center/dashboard/courses/${course.id}`
              : undefined;

            return (
              <LearningCenterCourseCard
                key={course.id}
                title={course.title}
                description={course.description}
                href={href}
                badge={badge}
                footer={
                  <div className="flex w-full items-center justify-end gap-2">
                    {status === "ACTIVE" ? (
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={`/learning-center/dashboard/courses/${course.id}`}
                        >
                          Continue
                        </Link>
                      </Button>
                    ) : status === "COMPLETED" ? (
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={`/learning-center/dashboard/courses/${course.id}`}
                        >
                          Review
                        </Link>
                      </Button>
                    ) : (
                      <CourseEnrollButton
                        courseId={course.id}
                        label={status === "DROPPED" ? "Re-enroll" : "Enroll"}
                        variant="default"
                      />
                    )}
                  </div>
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-muted-foreground">Loading catalog…</p>
      }
    >
      <CatalogInner />
    </Suspense>
  );
}
