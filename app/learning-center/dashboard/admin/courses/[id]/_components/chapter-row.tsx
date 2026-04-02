"use client";

import type { DragEvent } from "react";
import { GripVerticalIcon, Trash2Icon, PencilIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { ChapterItem } from "../_common/course-management.types";

type ChapterRowProps = {
  chapter: ChapterItem;
  courseId: string;
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
  courseId,
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
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={isBusy || isReordering}
          asChild
        >
          <Link href={`/learning-center/dashboard/admin/courses/${courseId}/${chapter.id}`}>
            <PencilIcon />
            Edit
          </Link>
        </Button>
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
    </div>
  );
}
