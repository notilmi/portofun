"use client";

import type { DragEvent } from "react";
import { GripVerticalIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ChapterItem } from "../_common/course-management.types";

type ChapterRowProps = {
  chapter: ChapterItem;
  isBusy: boolean;
  isReordering: boolean;
  isDropTarget: boolean;
  onDragStart: (event: DragEvent<HTMLDivElement>, chapterId: string) => void;
  onDragOver: (event: DragEvent<HTMLDivElement>, chapterId: string) => void;
  onDragLeave: (chapterId: string) => void;
  onDrop: (chapterId: string) => Promise<void>;
  onDragEnd: () => void;
  onDelete: (chapterId: string) => Promise<void>;
};

export default function ChapterRow({
  chapter,
  isBusy,
  isReordering,
  isDropTarget,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onDelete,
}: ChapterRowProps) {
  return (
    <div
      draggable={!isReordering}
      onDragStart={(event) => onDragStart(event, chapter.id)}
      onDragOver={(event) => onDragOver(event, chapter.id)}
      onDragLeave={() => onDragLeave(chapter.id)}
      onDragEnd={onDragEnd}
      onDrop={(event) => {
        event.preventDefault();
        void onDrop(chapter.id);
      }}
      className={[
        "flex cursor-move flex-wrap items-center justify-between gap-3 rounded-lg border p-3 transition-colors",
        isDropTarget ? "border-primary bg-primary/5" : "",
        isReordering ? "opacity-70" : "",
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        <GripVerticalIcon className="size-4 text-muted-foreground" />
        <div>
          <p className="text-sm text-muted-foreground">Chapter {chapter.sequenceOrder}</p>
          <p className="font-medium">{chapter.title}</p>
        </div>
      </div>
      <Button
        size="sm"
        variant="destructive"
        disabled={isBusy || isReordering}
        onClick={() => void onDelete(chapter.id)}
      >
        <Trash2Icon />
        Delete
      </Button>
    </div>
  );
}
