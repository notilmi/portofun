import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getSession } from "@/server/actions/auth";
import { getCourseHierarchy } from "@/server/actions/learning-center/course.actions";
import { getCourseProgress } from "@/server/actions/learning-center/progress.actions";
import CourseOutline, {
  type CourseOutlineData,
} from "../_components/course-outline";
import { materialTypeLabel } from "@/lib/learning-center/material-type";

type PageProps = {
  params: Promise<{ courseId: string }>;
};

async function StudentCourseOverviewInner({ params }: PageProps) {
  const { courseId } = await params;

  const user = await getSession(false);
  if (!user) {
    notFound();
  }

  let course;
  try {
    course = await getCourseHierarchy({ courseId });
  } catch {
    notFound();
  }

  const progressRows = await getCourseProgress({ userId: user.id, courseId });
  const completedMaterialIds = new Set(
    progressRows.filter((p) => p.completedAt != null).map((p) => p.materialId),
  );

  const allMaterials = course.chapters.flatMap((c) => c.materials);
  const totalCount = allMaterials.length;
  const completedCount = Array.from(completedMaterialIds).filter((id) =>
    allMaterials.some((m) => m.id === id),
  ).length;
  const percent =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const outlineData: CourseOutlineData = {
    courseTitle: course.title,
    courseDescription: course.description,
    progress: { completedCount, totalCount, percent },
    chapters: course.chapters.map((ch) => ({
      id: ch.id,
      title: ch.title,
      sequenceOrder: ch.sequenceOrder,
      items: ch.materials.map((m) => ({
        id: m.id,
        title: m.title,
        type: m.type,
        href: `/learning-center/dashboard/courses/${courseId}/${ch.id}/material/${m.id}`,
        completed: completedMaterialIds.has(m.id),
      })),
    })),
  };

  const firstIncomplete = course.chapters
    .flatMap((ch) => ch.materials.map((m) => ({ chapterId: ch.id, id: m.id })))
    .find((x) => !completedMaterialIds.has(x.id));

  const resumeHref = firstIncomplete
    ? `/learning-center/dashboard/courses/${courseId}/${firstIncomplete.chapterId}/material/${firstIncomplete.id}`
    : course.chapters[0]?.materials[0]
      ? `/learning-center/dashboard/courses/${courseId}/${course.chapters[0].id}/material/${course.chapters[0].materials[0].id}`
      : null;

  return (
    <div className="space-y-4">
      {/* Header / breadcrumb-ish */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">
            <Link
              href="/learning-center/dashboard/my-learnings"
              className="hover:underline"
            >
              My Learnings
            </Link>
            <span className="px-2">/</span>
            <span className="font-medium text-foreground">{course.title}</span>
          </p>
          <h1 className="truncate text-lg font-semibold">{course.title}</h1>
        </div>

        <div className="flex items-center gap-2">
          {resumeHref ? (
            <Button asChild>
              <Link href={resumeHref}>
                {percent === 100 ? "Review" : "Resume"}
              </Link>
            </Button>
          ) : null}

          <Button asChild variant="outline">
            <Link href="/learning-center/dashboard/catalog">
              Browse catalog
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Main content */}
        <div className="space-y-4 lg:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>{course.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{percent}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-[width]"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">
                    {completedCount}/{totalCount} materials completed
                  </p>
                  {resumeHref ? (
                    <Button asChild size="sm">
                      <Link href={resumeHref}>
                        {percent === 100 ? "Review" : "Resume"}
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          <div className="space-y-4">
            {course.chapters.map((chapter) => (
              <Card key={chapter.id}>
                <CardHeader>
                  <CardTitle>
                    {chapter.sequenceOrder}. {chapter.title}
                  </CardTitle>
                  <CardDescription>
                    {chapter.materials.length} material
                    {chapter.materials.length === 1 ? "" : "s"}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {chapter.materials.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No materials yet.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {chapter.materials.map((m) => {
                        const completed = completedMaterialIds.has(m.id);
                        return (
                          <li
                            key={m.id}
                            className="flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className={
                                    completed
                                      ? "text-emerald-600"
                                      : "text-muted-foreground"
                                  }
                                >
                                  {completed ? "✓" : "•"}
                                </span>
                                <p className="truncate text-sm font-medium">
                                  {m.title}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {materialTypeLabel(m.type)}
                              </p>
                            </div>
                            <Button asChild variant="outline" size="sm">
                              <Link
                                href={`/learning-center/dashboard/courses/${courseId}/${chapter.id}/material/${m.id}`}
                              >
                                Open
                              </Link>
                            </Button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right outline panel */}
        <div className="lg:col-span-4">
          <CourseOutline data={outlineData} className="sticky top-4" />
        </div>
      </div>
    </div>
  );
}

export default function StudentCourseOverviewPage(props: PageProps) {
  return (
    <Suspense
      fallback={<p className="text-sm text-muted-foreground">Loading…</p>}
    >
      <StudentCourseOverviewInner {...props} />
    </Suspense>
  );
}
