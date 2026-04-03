import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export default function StatusPill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs",
        tone === "success" &&
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        tone === "warning" &&
          "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300",
        tone === "neutral" && "border-border bg-muted/30 text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}
