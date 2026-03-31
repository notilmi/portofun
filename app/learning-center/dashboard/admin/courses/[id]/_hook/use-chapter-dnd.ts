"use client";

import { type DragEvent, useMemo, useState } from "react";

import { updateChapter } from "@/server/actions/learning-center/chapter.actions";
import { isActionError, type ChapterItem } from "../_common/course-management.types";

type UseChapterDndParams = {
  chapters: ChapterItem[];
  setChapters: React.Dispatch<React.SetStateAction<ChapterItem[]>>;
  setFeedback: React.Dispatch<React.SetStateAction<string | undefined>>;
};

export function useChapterDnd({
  chapters,
  setChapters,
  setFeedback,
}: UseChapterDndParams) {
  const [draggedChapterId, setDraggedChapterId] = useState<string>();
  const [dragOverChapterId, setDragOverChapterId] = useState<string>();
  const [isReordering, setIsReordering] = useState(false);

  const orderedChapters = useMemo(() => {
    return chapters.slice().sort((a, b) => a.sequenceOrder - b.sequenceOrder);
  }, [chapters]);

  const normalizeChapterOrder = (items: ChapterItem[]) => {
    return items.map((item, index) => ({ ...item, sequenceOrder: index + 1 }));
  };

  const reorderChapters = (
    items: ChapterItem[],
    sourceId: string,
    targetId: string,
  ) => {
    const sourceIndex = items.findIndex((item) => item.id === sourceId);
    const targetIndex = items.findIndex((item) => item.id === targetId);

    if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
      return null;
    }

    const next = items.slice();
    const [moved] = next.splice(sourceIndex, 1);
    if (!moved) {
      return null;
    }

    next.splice(targetIndex, 0, moved);
    return normalizeChapterOrder(next);
  };

  const handleDrop = async (targetChapterId: string) => {
    if (!draggedChapterId || draggedChapterId === targetChapterId || isReordering) {
      setDraggedChapterId(undefined);
      setDragOverChapterId(undefined);
      return;
    }

    const previous = orderedChapters;
    const reordered = reorderChapters(previous, draggedChapterId, targetChapterId);

    setDraggedChapterId(undefined);
    setDragOverChapterId(undefined);

    if (!reordered) {
      return;
    }

    const movedChapter = reordered.find((item) => item.id === draggedChapterId);
    if (!movedChapter) {
      return;
    }

    setFeedback(undefined);
    setIsReordering(true);
    setChapters(reordered);

    const response = await updateChapter({
      id: draggedChapterId,
      sequenceOrder: movedChapter.sequenceOrder,
    });

    if (isActionError(response)) {
      setFeedback(response.error);
      setChapters(previous);
      setIsReordering(false);
      return;
    }

    setIsReordering(false);
  };

  const handleDragStart = (event: DragEvent<HTMLDivElement>, chapterId: string) => {
    event.dataTransfer.effectAllowed = "move";
    setDraggedChapterId(chapterId);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>, chapterId: string) => {
    event.preventDefault();
    if (draggedChapterId && draggedChapterId !== chapterId) {
      setDragOverChapterId(chapterId);
    }
  };

  const handleDragLeave = (chapterId: string) => {
    if (dragOverChapterId === chapterId) {
      setDragOverChapterId(undefined);
    }
  };

  const handleDragEnd = () => {
    setDraggedChapterId(undefined);
    setDragOverChapterId(undefined);
  };

  return {
    orderedChapters,
    isReordering,
    dragOverChapterId,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDragEnd,
    handleDrop,
  };
}
