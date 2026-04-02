"use client";

import { Loader2Icon, TriangleAlertIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteMaterial } from "@/server/actions/learning-center/material.actions";

type DeleteMaterialDialogProps = {
  material: {
    id: string;
    title: string;
  };
  courseId: string;
  chapterId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteSuccess?: (deletedId: string) => void;
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

export default function DeleteMaterialDialog({
  material,
  courseId,
  chapterId,
  open,
  onOpenChange,
  onDeleteSuccess,
}: DeleteMaterialDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(undefined);

    try {
      const response = await deleteMaterial({ id: material.id });

      // Check for errors
      if (isActionError(response)) {
        setError(response.error);
        setIsDeleting(false);
        return;
      }

      // Success - close dialog and refresh
      onOpenChange(false);
      onDeleteSuccess?.(material.id);
      router.refresh();
      
      // Small delay to allow dialog animation to complete
      setTimeout(() => {
        setIsDeleting(false);
      }, 300);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-destructive/10 p-2">
              <TriangleAlertIcon className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1">
              <DialogTitle>Delete Material</DialogTitle>
              <DialogDescription className="mt-2">
                Are you sure you want to delete <strong>{material.title}</strong>?
                This action cannot be undone and will permanently remove the material
                from this chapter.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isDeleting}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2Icon className="animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Material"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
