"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { markMaterialCompleted } from "@/server/actions/learning-center/progress.actions";

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

export default function CompleteMaterialButton({
  userId,
  materialId,
  disabled,
}: {
  userId: string;
  materialId: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleClick = async () => {
    setIsPending(true);
    try {
      const res = await markMaterialCompleted({ userId, materialId });
      if (isActionError(res)) {
        toast.error(res.error);
        return;
      }

      toast.success("Sudah ditandai selesai");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={disabled || isPending}
      variant="default"
    >
      {isPending ? "Menyimpan..." : "Tandai sebagai selesai"}
    </Button>
  );
}
