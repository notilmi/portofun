"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  createChapter,
  deleteChapter,
} from "@/server/actions/learning-center/chapter.actions";
import {
  deleteCourse,
  updateCourse,
} from "@/server/actions/learning-center/course.actions";
import type { CreateChapterFormValues } from "../_components/create-chapter-form";
import type { EditCourseFormValues } from "../_components/edit-course-form";
import {
  isActionError,
  type ChapterItem,
  type CourseDetail,
} from "../_common/course-management.types";

type UseCourseManagementParams = {
  initialCourse: CourseDetail;
  initialChapters: ChapterItem[];
};

export function useCourseManagement({
  initialCourse,
  initialChapters,
}: UseCourseManagementParams) {
  const router = useRouter();
  const [course, setCourse] = useState(initialCourse);
  const [chapters, setChapters] = useState(initialChapters);
  const [feedback, setFeedback] = useState<string>();
  const [busyChapterId, setBusyChapterId] = useState<string>();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateChapterDialogOpen, setIsCreateChapterDialogOpen] = useState(false);
  const [isDeleteCourseDialogOpen, setIsDeleteCourseDialogOpen] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");

  useEffect(() => {
    setCourse(initialCourse);
  }, [initialCourse]);

  useEffect(() => {
    setChapters(initialChapters);
  }, [initialChapters]);

  const handleUpdateCourse = async (
    values: EditCourseFormValues,
  ): Promise<boolean> => {
    setFeedback(undefined);

    const response = await updateCourse({
      id: course.id,
      title: values.title,
      description: values.description,
    });

    if (isActionError(response)) {
      setFeedback(response.error);
      return false;
    }

    setCourse((current) => ({
      ...current,
      title: values.title,
      description: values.description,
    }));
    setIsEditDialogOpen(false);
    return true;
  };

  const handleCreateChapter = async (
    values: CreateChapterFormValues,
  ): Promise<boolean> => {
    setFeedback(undefined);

    const response = await createChapter({
      courseId: course.id,
      title: values.title,
      sequenceOrder: values.sequenceOrder,
    });

    if (isActionError(response)) {
      setFeedback(response.error);
      return false;
    }

    setChapters((current) => {
      const next = current.filter((chapter) => chapter.id !== response.id);
      next.push({
        id: response.id,
        title: response.title,
        sequenceOrder: response.sequenceOrder,
      });
      return next;
    });
    setIsCreateChapterDialogOpen(false);
    return true;
  };

  const handleDeleteChapter = async (chapterId: string) => {
    setFeedback(undefined);
    setBusyChapterId(chapterId);

    const response = await deleteChapter({ id: chapterId });
    if (isActionError(response)) {
      setFeedback(response.error);
      setBusyChapterId(undefined);
      return;
    }

    setChapters((current) => current.filter((item) => item.id !== chapterId));
    setBusyChapterId(undefined);
  };

  const handleDeleteCourse = async () => {
    setFeedback(undefined);

    const response = await deleteCourse({ id: course.id });
    if (isActionError(response)) {
      setFeedback(response.error);
      return;
    }

    setIsDeleteCourseDialogOpen(false);
    router.push("/learning-center/dashboard/admin/courses");
  };

  return {
    course,
    chapters,
    setChapters,
    feedback,
    setFeedback,
    busyChapterId,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isCreateChapterDialogOpen,
    setIsCreateChapterDialogOpen,
    isDeleteCourseDialogOpen,
    setIsDeleteCourseDialogOpen,
    deleteConfirmInput,
    setDeleteConfirmInput,
    handleUpdateCourse,
    handleCreateChapter,
    handleDeleteChapter,
    handleDeleteCourse,
  };
}
