import Link from "next/link";
import { ArrowRightIcon, TerminalSquareIcon } from "lucide-react";

import {
  EnrollmentStatus,
  type Course,
  type Enrollment,
} from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type CourseEnrollmentCardProps = {
  course: Course;
  enrollment: Enrollment;
  ctaHref: string;
  ctaLabel?: string;
  className?: string;
};

const ENROLLMENT_STATUS_LABELS: Record<EnrollmentStatus, string> = {
  ACTIVE: "Status: Aktif",
  COMPLETED: "Status: Selesai",
  DROPPED: "Status: Berhenti",
};

export function CourseEnrollmentCard({
  course,
  enrollment,
  ctaHref,
  ctaLabel = "Lanjutkan Pelajaran",
  className,
}: CourseEnrollmentCardProps) {
  return (
    <Card
      className={cn(
        "w-full max-w-sm gap-0 border-white/10 bg-gradient-to-b from-zinc-900 to-zinc-950 p-0 text-zinc-100",
        className,
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 px-6 pt-6">
        <div className="rounded-lg border border-violet-300/10 bg-violet-500/10 p-2.5 text-violet-300">
          <TerminalSquareIcon className="size-5" />
        </div>

        <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[0.72rem] font-semibold tracking-wide text-zinc-300 uppercase">
          {ENROLLMENT_STATUS_LABELS[enrollment.status]}
        </span>
      </CardHeader>

      <CardContent className="space-y-3 px-6 pt-5 pb-6">
        <CardTitle className="line-clamp-2 text-3xl leading-tight font-semibold">
          {course.title}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-base text-zinc-400">
          {course.description}
        </CardDescription>
      </CardContent>

      <CardFooter className="px-6 pb-6">
        <Button
          asChild
          variant="secondary"
          className="h-12 w-full justify-center rounded-lg border border-white/10 bg-white/5 text-base font-semibold text-zinc-100 hover:bg-white/10"
        >
          <Link href={ctaHref}>
            {ctaLabel}
            <ArrowRightIcon className="ml-1.5 size-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
