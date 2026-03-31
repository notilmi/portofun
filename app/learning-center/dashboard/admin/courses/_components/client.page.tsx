"use client";

import { useEffect, useMemo, useState } from "react";
import { PlusIcon } from "lucide-react";

import {
  archiveCourse,
  createCourse,
  deleteCourse,
  unarchiveCourse,
} from "@/server/actions/learning-center/course.actions";
import CreateCourseForm, {
  type CreateCourseFormValues,
} from "./create-course-form";
import CourseList, { type AdminCourseItem } from "./course-list";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ClientPageProps = {
  initialCourses: AdminCourseItem[];
};

type ActionError = {
  code: string;
  error: string;
};

function isActionError(value: unknown): value is ActionError {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    "error" in value
  );
}

export default function ClientPage({ initialCourses }: ClientPageProps) {
  const [courses, setCourses] = useState(initialCourses);
  const [busyCourseId, setBusyCourseId] = useState<string>();
  const [feedback, setFeedback] = useState<string>();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    setCourses(initialCourses);
  }, [initialCourses]);

  const sortedCourses = useMemo(() => {
    return [...courses].sort((a, b) => Number(a.isArchived) - Number(b.isArchived));
  }, [courses]);

  const handleCreateCourse = async (values: CreateCourseFormValues): Promise<boolean> => {
    setFeedback(undefined);

    const response = await createCourse(values);
    if (isActionError(response)) {
      setFeedback(response.error);
      return false;
    }

    setCourses((current) => [
      {
        id: response.id,
        title: response.title,
        description: response.description,
        isArchived: response.isArchived,
      },
      ...current,
    ]);
    setIsCreateDialogOpen(false);
    return true;
  };

  const handleArchive = async (courseId: string) => {
    setBusyCourseId(courseId);
    setFeedback(undefined);

    const response = await archiveCourse({ id: courseId });
    if (isActionError(response)) {
      setFeedback(response.error);
      setBusyCourseId(undefined);
      return;
    }

    setCourses((current) =>
      current.map((course) =>
        course.id === courseId ? { ...course, isArchived: true } : course,
      ),
    );
    setBusyCourseId(undefined);
  };

  const handleUnarchive = async (courseId: string) => {
    setBusyCourseId(courseId);
    setFeedback(undefined);

    const response = await unarchiveCourse({ id: courseId });
    if (isActionError(response)) {
      setFeedback(response.error);
      setBusyCourseId(undefined);
      return;
    }

    setCourses((current) =>
      current.map((course) =>
        course.id === courseId ? { ...course, isArchived: false } : course,
      ),
    );
    setBusyCourseId(undefined);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Course Management</h1>
          <p className="text-sm text-muted-foreground">
            Create, archive, restore, and delete courses for the learning center.
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon />
              Create Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
              <DialogDescription>
                Add a new course to your learning center catalog.
              </DialogDescription>
            </DialogHeader>
            <CreateCourseForm onSubmit={handleCreateCourse} />
          </DialogContent>
        </Dialog>
      </div>

      {feedback ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {feedback}
        </p>
      ) : null}

      <div className="rounded-xl border bg-card p-4">
        <h2 className="mb-3 text-lg font-semibold">All Courses</h2>
        <CourseList
          courses={sortedCourses}
          busyCourseId={busyCourseId}
          onArchive={handleArchive}
          onUnarchive={handleUnarchive}
        />
      </div>
    </div>
  );
}
