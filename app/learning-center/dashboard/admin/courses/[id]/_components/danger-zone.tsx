"use client";

import Link from "next/link";
import { Trash2Icon } from "lucide-react";

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
import { Input } from "@/components/ui/input";

type DangerZoneProps = {
  isDeleteCourseDialogOpen: boolean;
  onDeleteCourseDialogOpenChange: (open: boolean) => void;
  deleteConfirmInput: string;
  onDeleteConfirmInputChange: (value: string) => void;
  onDeleteCourse: () => Promise<void>;
};

export default function DangerZone({
  isDeleteCourseDialogOpen,
  onDeleteCourseDialogOpenChange,
  deleteConfirmInput,
  onDeleteConfirmInputChange,
  onDeleteCourse,
}: DangerZoneProps) {
  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          This action permanently removes this course and all associated chapters.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2">
        <Dialog
          open={isDeleteCourseDialogOpen}
          onOpenChange={onDeleteCourseDialogOpenChange}
        >
          <DialogTrigger asChild>
            <Button variant="destructive">
              <Trash2Icon />
              Delete Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Course</DialogTitle>
              <DialogDescription>
                Type DELETE to confirm permanent deletion of this course.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Input
                value={deleteConfirmInput}
                onChange={(event) => onDeleteConfirmInputChange(event.target.value)}
                placeholder="Type DELETE"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    onDeleteCourseDialogOpenChange(false);
                    onDeleteConfirmInputChange("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  disabled={deleteConfirmInput !== "DELETE"}
                  onClick={() => void onDeleteCourse()}
                >
                  Confirm Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="ghost" asChild>
          <Link href="/learning-center/dashboard/admin/courses">Back to Courses</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
