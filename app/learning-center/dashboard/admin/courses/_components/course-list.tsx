"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CourseCard from "./course-card";

export type AdminCourseItem = {
  id: string;
  title: string;
  description: string;
  isArchived: boolean;
};

type CourseListProps = {
  courses: AdminCourseItem[];
  busyCourseId?: string;
  onArchive: (courseId: string) => Promise<void>;
  onUnarchive: (courseId: string) => Promise<void>;
};

export default function CourseList({
  courses,
  busyCourseId,
  onArchive,
  onUnarchive,
}: CourseListProps) {
  if (courses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Belum ada kursus</CardTitle>
          <CardDescription>
            Buat kursus pertama Anda dari formulir di atas.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => {
        const isBusy = busyCourseId === course.id;

        return (
          <CourseCard
            key={course.id}
            course={course}
            isBusy={isBusy}
            onArchive={onArchive}
            onUnarchive={onUnarchive}
          />
        );
      })}
    </div>
  );
}
