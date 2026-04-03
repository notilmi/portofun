import { notFound } from "next/navigation";
import { Suspense } from "react";

import CatalogCourseGrid from "@/app/learning-center/dashboard/_components/catalog-course-grid";
import CourseCardGridSkeleton from "@/app/learning-center/dashboard/_components/course-card-grid-skeleton";
import { getSession } from "@/server/actions/auth";
import { getCourses } from "@/server/actions/learning-center/course.actions";
import { getMyEnrollments } from "@/server/actions/learning-center/enrollment.actions";

async function CatalogInner() {
  const user = await getSession(false);
  if (!user) {
    notFound();
  }

  const [courses, enrollments] = await Promise.all([
    getCourses({ isArchived: false, orderBy: "title", orderDirection: "asc" }),
    getMyEnrollments(),
  ]);

  return (
    <CatalogCourseGrid
      courses={courses.map((course) => ({
        id: course.id,
        title: course.title,
        description: course.description,
      }))}
      enrollments={enrollments.map((enrollment) => ({
        courseId: enrollment.courseId,
        status: enrollment.status,
      }))}
    />
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<CourseCardGridSkeleton />}>
      <CatalogInner />
    </Suspense>
  );
}
