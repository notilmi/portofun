"use client";

import Link from "next/link";
import { useMemo } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { materialTypeLabel } from "@/lib/learning-center/material-type";

export type CourseOutlineData = {
  courseTitle: string;
  courseDescription?: string | null;
  progress: {
    completedCount: number;
    totalCount: number;
    percent: number;
  };
  chapters: Array<{
    id: string;
    title: string;
    sequenceOrder: number;
    items: Array<{
      id: string;
      title: string;
      type: string;
      href: string;
      completed: boolean;
      current?: boolean;
    }>;
  }>;
};

export default function CourseOutline({
  data,
  className,
}: {
  data: CourseOutlineData;
  className?: string;
}) {
  const defaultOpenChapterId = useMemo(() => {
    const current = data.chapters.find((c) => c.items.some((i) => i.current));
    return current?.id ?? data.chapters[0]?.id;
  }, [data.chapters]);

  return (
    <div className={cn("rounded-xl border bg-card", className)}>
      <div className="space-y-2 border-b p-4">
        <p className="text-sm font-semibold">{data.courseTitle}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              {data.progress.completedCount}/{data.progress.totalCount} completed
            </span>
            <span>{data.progress.percent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${data.progress.percent}%` }}
            />
          </div>
        </div>
      </div>

      <ScrollArea className="h-[calc(100dvh-220px)]">
        <div className="p-3">
          <div className="space-y-2">
            {data.chapters.map((chapter) => (
              <Collapsible
                key={chapter.id}
                defaultOpen={chapter.id === defaultOpenChapterId}
                className="rounded-lg border bg-background"
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {chapter.sequenceOrder}. {chapter.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {chapter.items.length} item{chapter.items.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">▾</span>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="space-y-1 pb-2">
                    {chapter.items.map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        className={cn(
                          "flex items-start gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted/50",
                          item.current && "bg-muted",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full border text-[10px]",
                            item.completed
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                              : "border-border bg-background text-muted-foreground",
                          )}
                          aria-hidden
                        >
                          {item.completed ? "✓" : "•"}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{materialTypeLabel(item.type)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
