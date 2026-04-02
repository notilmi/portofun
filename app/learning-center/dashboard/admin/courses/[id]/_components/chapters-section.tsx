"use client";

import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CreateChapterForm, {
  type CreateChapterFormValues,
} from "./create-chapter-form";
import type { ChapterItem } from "../_common/course-management.types";
import ChapterDraggableList from "./chapter-draggable-list";

type ChaptersSectionProps = {
  chapters: ChapterItem[];
  courseId: string;
  busyChapterId?: string;
  isCreateChapterDialogOpen: boolean;
  onCreateChapterDialogOpenChange: (open: boolean) => void;
  onCreateChapterSubmit: (values: CreateChapterFormValues) => Promise<boolean>;
  onDeleteChapter: (chapterId: string) => Promise<void>;
  dnd: {
    dragOverChapterId?: string;
    isReordering: boolean;
    onDragStart: (event: React.DragEvent<HTMLDivElement>, chapterId: string) => void;
    onDragOver: (event: React.DragEvent<HTMLDivElement>, chapterId: string) => void;
    onDragLeave: (chapterId: string) => void;
    onDrop: (chapterId: string) => Promise<void>;
    onDragEnd: () => void;
  };
};

export default function ChaptersSection({
  chapters,
  courseId,
  busyChapterId,
  isCreateChapterDialogOpen,
  onCreateChapterDialogOpenChange,
  onCreateChapterSubmit,
  onDeleteChapter,
  dnd,
}: ChaptersSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>Chapters</CardTitle>
          <CardDescription>Manage chapter structure for this course.</CardDescription>
          <p className="text-xs text-muted-foreground">
            Drag and drop chapter cards to reorder.
          </p>
        </div>

        <Dialog
          open={isCreateChapterDialogOpen}
          onOpenChange={onCreateChapterDialogOpenChange}
        >
          <DialogTrigger asChild>
            <Button>
              <PlusIcon />
              Add Chapter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Chapter</DialogTitle>
              <DialogDescription>Add a new chapter to this course.</DialogDescription>
            </DialogHeader>
            <CreateChapterForm onSubmit={onCreateChapterSubmit} />
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {chapters.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No chapters yet. Start by creating the first chapter.
          </p>
        ) : (
          <ChapterDraggableList
            chapters={chapters}
            courseId={courseId}
            busyChapterId={busyChapterId}
            dragOverChapterId={dnd.dragOverChapterId}
            isReordering={dnd.isReordering}
            onDragStart={dnd.onDragStart}
            onDragOver={dnd.onDragOver}
            onDragLeave={dnd.onDragLeave}
            onDrop={dnd.onDrop}
            onDragEnd={dnd.onDragEnd}
            onDelete={onDeleteChapter}
          />
        )}
      </CardContent>
    </Card>
  );
}
