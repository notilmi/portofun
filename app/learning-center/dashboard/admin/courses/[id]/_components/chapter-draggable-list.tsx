"use client";

import type { ChapterItem } from "../_common/course-management.types";
import ChapterRow from "./chapter-row";

type ChapterDraggableListProps = {
  chapters: ChapterItem[];
  courseId: string;
  busyChapterId?: string;
  dragOverChapterId?: string;
  isReordering: boolean;
  onDragStart: (event: React.DragEvent<HTMLDivElement>, chapterId: string) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>, chapterId: string) => void;
  onDragLeave: (chapterId: string) => void;
  onDrop: (chapterId: string) => Promise<void>;
  onDragEnd: () => void;
  onDelete: (chapterId: string) => Promise<void>;
};

export default function ChapterDraggableList({
  chapters,
  courseId,
  busyChapterId,
  dragOverChapterId,
  isReordering,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onDelete,
}: ChapterDraggableListProps) {
  return (
    <div className="space-y-3">
      {chapters.map((chapter) => (
        <ChapterRow
          key={chapter.id}
          chapter={chapter}
          courseId={courseId}
          isBusy={busyChapterId === chapter.id}
          isReordering={isReordering}
          isDropTarget={dragOverChapterId === chapter.id}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onDragEnd={onDragEnd}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
