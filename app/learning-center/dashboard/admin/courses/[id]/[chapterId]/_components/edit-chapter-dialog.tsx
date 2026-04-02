"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateChapter } from "@/server/actions/learning-center/chapter.actions";
import EditChapterForm from "./edit-chapter-form";
import type { EditChapterFormValues } from "./edit-chapter-form-schema";

type EditChapterDialogProps = {
  chapter: {
    id: string;
    title: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export default function EditChapterDialog({
  chapter,
  open,
  onOpenChange,
}: EditChapterDialogProps) {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>(undefined);

  const handleSubmit = async (
    values: EditChapterFormValues,
  ): Promise<boolean> => {
    setError(undefined);

    try {
      const response = await updateChapter({
        id: chapter.id,
        title: values.title,
      });

      // Check for errors
      if (isActionError(response)) {
        setError(response.error);
        return false;
      }

      // Success - close dialog and refresh
      onOpenChange(false);
      router.refresh();
      return true;
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      return false;
    }
  };

  const handleCancel = () => {
    setError(undefined);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Chapter</DialogTitle>
          <DialogDescription>
            Update the chapter title. Changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <EditChapterForm
          initialValues={{ title: chapter.title }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
