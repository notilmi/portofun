"use client";

import { useRouter } from "next/navigation";
import { ArchiveIcon, ArchiveRestoreIcon, Trash2Icon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import type { AdminCourseItem } from "./course-list";

type CourseCardProps = {
  course: AdminCourseItem;
  isBusy: boolean;
  onArchive: (courseId: string) => Promise<void>;
  onUnarchive: (courseId: string) => Promise<void>;
};

function getInitials(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default function CourseCard({
  course,
  isBusy,
  onArchive,
  onUnarchive,
}: CourseCardProps) {
  const router = useRouter();

  const handleNavigate = () => {
    router.push(`/learning-center/dashboard/admin/courses/${course.id}`);
  };

  return (
    <Card
      className="gap-0 overflow-hidden py-0 cursor-pointer transition-colors hover:bg-muted/30"
      role="button"
      tabIndex={0}
      onClick={handleNavigate}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleNavigate();
        }
      }}
    >
      <CardContent className="p-0">
        <div className="relative h-40 border-b bg-[radial-gradient(120%_120%_at_0%_0%,hsl(var(--primary)/0.18),transparent_50%),radial-gradient(140%_140%_at_100%_100%,hsl(var(--muted-foreground)/0.15),transparent_55%)]">
          {/* TODO: Add course image upload and persist thumbnail URL in course data. */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/70" />
          <div className="absolute right-3 top-3">
            <span
              className={[
                "rounded-md border px-2 py-1 text-xs font-semibold uppercase",
                course.isArchived
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-700"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
              ].join(" ")}
            >
              {course.isArchived ? "Archived" : "Active"}
            </span>
          </div>

          <div className="absolute bottom-4 left-4">
            <Avatar className="size-16 border border-white/30 bg-background/70 ring-2 ring-background/70 backdrop-blur-sm">
              <AvatarFallback className="text-lg font-semibold text-foreground">
                {getInitials(course.title)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="space-y-2 p-4">
          <CardTitle className="line-clamp-2 text-lg">{course.title}</CardTitle>
          <span className="line-clamp-2 text-sm text-muted-foreground">
            {course.description}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 p-4 pt-0">
          {course.isArchived ? (
            <Button
              size="sm"
              variant="secondary"
              disabled={isBusy}
              onClick={(event) => {
                event.stopPropagation();
                void onUnarchive(course.id);
              }}
            >
              <ArchiveRestoreIcon />
              Unarchive
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              disabled={isBusy}
              onClick={(event) => {
                event.stopPropagation();
                void onArchive(course.id);
              }}
            >
              <ArchiveIcon />
              Archive
            </Button>
          )}

        </div>
      </CardContent>
    </Card>
  );
}