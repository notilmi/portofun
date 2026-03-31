"use client";

import { Edit3Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import EditCourseForm, { type EditCourseFormValues } from "./edit-course-form";
import type { CourseDetail } from "../_common/course-management.types";

type CourseHeaderProps = {
  course: CourseDetail;
  isEditDialogOpen: boolean;
  onEditDialogOpenChange: (open: boolean) => void;
  onEditCourseSubmit: (values: EditCourseFormValues) => Promise<boolean>;
};

export default function CourseHeader({
  course,
  isEditDialogOpen,
  onEditDialogOpenChange,
  onEditCourseSubmit,
}: CourseHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold">{course.title}</h1>
        <p className="text-sm text-muted-foreground">{course.description}</p>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={onEditDialogOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Edit3Icon />
            Edit Course
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Update the course identity and summary for your team.
            </DialogDescription>
          </DialogHeader>
          <EditCourseForm
            initialValues={{
              title: course.title,
              description: course.description,
            }}
            onSubmit={onEditCourseSubmit}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
