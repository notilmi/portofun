"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import LearningCenterCourseCard from "@/app/learning-center/dashboard/_components/learning-center-course-card";
import CourseEnrollButton from "@/app/learning-center/dashboard/catalog/_components/course-enroll-button";

export type CatalogCourse = {
  id: string;
  title: string;
  description?: string | null;
};

export type CatalogEnrollment = {
  courseId: string;
  status?: string | null;
};

function getBadge(status: string | null | undefined) {
  if (!status) return undefined;

  return {
    label: status,
    tone:
      status === "COMPLETED"
        ? ("success" as const)
        : status === "DROPPED"
          ? ("warning" as const)
          : ("neutral" as const),
  };
}

export default function CatalogCourseGrid({
  courses,
  enrollments,
}: {
  courses: CatalogCourse[];
  enrollments: CatalogEnrollment[];
}) {
  const [query, setQuery] = useState("");

  const enrollmentByCourseId = useMemo(() => {
    return new Map(enrollments.map((e) => [e.courseId, e] as const));
  }, [enrollments]);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredCourses = useMemo(() => {
    if (!normalizedQuery) return courses;

    return courses.filter((course) => {
      const haystack = `${course.title}\n${course.description ?? ""}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [courses, normalizedQuery]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-start">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Catalog</h1>
          <p className="text-sm text-muted-foreground">
            Browse courses and enroll to start learning.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 md:w-auto md:items-end">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses..."
            aria-label="Search courses"
            className="w-full md:w-72"
          />
          <Link
            href="/learning-center/dashboard/my-learnings"
            className="text-sm underline"
          >
            My Learnings
          </Link>
        </div>
      </div>

      <Separator />

      {courses.length === 0 ? (
        <p className="text-sm text-muted-foreground">No courses available.</p>
      ) : filteredCourses.length === 0 ? (
        <p className="text-sm text-muted-foreground">No courses match your search.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredCourses.map((course) => {
            const enrollment = enrollmentByCourseId.get(course.id);
            const status = enrollment?.status ?? undefined;
            const badge = getBadge(status);

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
                        <Link href={`/learning-center/dashboard/courses/${course.id}`}>
                          Continue
                        </Link>
                      </Button>
                    ) : status === "COMPLETED" ? (
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/learning-center/dashboard/courses/${course.id}`}>
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
