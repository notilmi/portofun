"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { enrollSelf } from "@/server/actions/learning-center/enrollment.actions";

type ActionError = { error: string; code: string };

function isActionError(value: unknown): value is ActionError {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as { error?: unknown }).error === "string" &&
    "code" in value &&
    typeof (value as { code?: unknown }).code === "string"
  );
}

type CourseEnrollButtonProps = {
  courseId: string;
  label: string;
  disabled?: boolean;
  variant?: React.ComponentProps<typeof Button>["variant"];
};

export default function CourseEnrollButton({
  courseId,
  label,
  disabled,
  variant = "default",
}: CourseEnrollButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleClick = async () => {
    setIsPending(true);
    try {
      const res = await enrollSelf({ courseId });

      if (isActionError(res)) {
        if (res.code === "ENROLLMENT_ALREADY_ENROLLED") {
          router.push(`/learning-center/dashboard/courses/${courseId}`);
          return;
        }

        toast.error(res.error);
        return;
      }

      router.push(`/learning-center/dashboard/courses/${courseId}`);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={disabled || isPending}
      variant={variant}
    >
      {isPending ? "Working..." : label}
    </Button>
  );
}
