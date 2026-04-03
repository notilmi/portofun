import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";

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
import { getMaterialById } from "@/server/actions/learning-center/material.actions";
import { getCourseProgress } from "@/server/actions/learning-center/progress.actions";
import CourseOutline, {
  type CourseOutlineData,
} from "@/app/learning-center/dashboard/courses/_components/course-outline";
import YouTubePlayer from "@/app/learning-center/dashboard/_components/youtube-player";
import LessonContent from "./_components/lesson-content";
import CompleteMaterialButton from "./_components/complete-material-button";
import QuizClientPage from "./_components/client.page";
import { materialTypeLabel } from "@/lib/learning-center/material-type";

type PageProps = {
  params: Promise<{ courseId: string; chapterId: string; materialId: string }>;
};

async function MaterialContent({ params }: PageProps) {
  const { courseId, chapterId, materialId } = await params;

  const user = await getSession(false);
  if (!user) {
    notFound();
  }

  const [course, progressRows, material] = await Promise.all([
    getCourseHierarchy({ courseId }),
    getCourseProgress({ userId: user.id, courseId }),
    getMaterialById({ id: materialId, includeQuizQuestions: true }),
  ]);

  if (!material || material.chapterId !== chapterId) {
    notFound();
  }

  const normalizedType = material.type.trim().toLowerCase();

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
        current: m.id === materialId,
      })),
    })),
  };

  const flat = course.chapters.flatMap((ch) =>
    ch.materials.map((m) => ({ chapterId: ch.id, id: m.id })),
  );
  const currentIndex = flat.findIndex((x) => x.id === materialId);
  const prev = currentIndex > 0 ? flat[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < flat.length - 1
      ? flat[currentIndex + 1]
      : null;

  const isCompleted = completedMaterialIds.has(materialId);

  return (
    <div className="space-y-4">
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
            <Link
              href={`/learning-center/dashboard/courses/${courseId}`}
              className="hover:underline"
            >
              {course.title}
            </Link>
            <span className="px-2">/</span>
            <span className="font-medium text-foreground">
              {material.title}
            </span>
          </p>
          <h1 className="truncate text-lg font-semibold">{material.title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" disabled={!prev}>
            <Link
              href={
                prev
                  ? `/learning-center/dashboard/courses/${courseId}/${prev.chapterId}/material/${prev.id}`
                  : "#"
              }
            >
              Previous
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" disabled={!next}>
            <Link
              href={
                next
                  ? `/learning-center/dashboard/courses/${courseId}/${next.chapterId}/material/${next.id}`
                  : "#"
              }
            >
              Next
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-3">
                <span>Content</span>
                {normalizedType !== "quiz" ? (
                  <CompleteMaterialButton
                    userId={user.id}
                    materialId={material.id}
                    disabled={isCompleted}
                  />
                ) : null}
              </CardTitle>
              <CardDescription>
                {materialTypeLabel(normalizedType)}
                {isCompleted ? " • Completed" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {normalizedType === "quiz" ? (
                <QuizClientPage
                  userId={user.id}
                  material={{
                    id: material.id,
                    title: material.title,
                    quizQuestions: material.quizQuestions ?? [],
                  }}
                />
              ) : material.videoUrl ? (
                <div className="space-y-3">
                  <YouTubePlayer
                    video={material.videoUrl}
                    title={material.title}
                  />
                  {material.content ? (
                    <LessonContent content={material.content} />
                  ) : null}
                </div>
              ) : (
                <LessonContent content={material.content ?? ""} />
              )}
            </CardContent>
          </Card>

          <Separator />

          <Card>
            <CardHeader>
              <CardTitle>Course progress</CardTitle>
              <CardDescription>
                {completedCount}/{totalCount} completed ({percent}%)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-[width]"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4">
          <CourseOutline data={outlineData} className="sticky top-4" />
        </div>
      </div>
    </div>
  );
}

export default function MaterialPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={<div className="text-sm text-muted-foreground">Loading...</div>}
    >
      <MaterialContent params={params} />
    </Suspense>
  );
}
