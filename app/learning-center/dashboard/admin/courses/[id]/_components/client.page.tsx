"use client";

import ChaptersSection from "./chapters-section";
import CourseHeader from "./course-header";
import DangerZone from "./danger-zone";
import type { ChapterItem, CourseDetail } from "../_common/course-management.types";
import { useChapterDnd } from "../_hook/use-chapter-dnd";
import { useCourseManagement } from "../_hook/use-course-management";

type ClientPageProps = {
  initialCourse: CourseDetail;
  initialChapters: ChapterItem[];
};

export default function ClientPage({
  initialCourse,
  initialChapters,
}: ClientPageProps) {
  const {
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
  } = useCourseManagement({ initialCourse, initialChapters });

  const {
    orderedChapters,
    dragOverChapterId,
    isReordering,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDragEnd,
    handleDrop,
  } = useChapterDnd({ chapters, setChapters, setFeedback });

  return (
    <div className="space-y-6">
      <CourseHeader
        course={course}
        isEditDialogOpen={isEditDialogOpen}
        onEditDialogOpenChange={setIsEditDialogOpen}
        onEditCourseSubmit={handleUpdateCourse}
      />

      {feedback ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {feedback}
        </p>
      ) : null}

      <ChaptersSection
        chapters={orderedChapters}
        busyChapterId={busyChapterId}
        isCreateChapterDialogOpen={isCreateChapterDialogOpen}
        onCreateChapterDialogOpenChange={setIsCreateChapterDialogOpen}
        onCreateChapterSubmit={handleCreateChapter}
        onDeleteChapter={handleDeleteChapter}
        dnd={{
          dragOverChapterId,
          isReordering,
          onDragStart: handleDragStart,
          onDragOver: handleDragOver,
          onDragLeave: handleDragLeave,
          onDrop: handleDrop,
          onDragEnd: handleDragEnd,
        }}
      />

      <DangerZone
        isDeleteCourseDialogOpen={isDeleteCourseDialogOpen}
        onDeleteCourseDialogOpenChange={setIsDeleteCourseDialogOpen}
        deleteConfirmInput={deleteConfirmInput}
        onDeleteConfirmInputChange={setDeleteConfirmInput}
        onDeleteCourse={handleDeleteCourse}
      />
    </div>
  );
}
