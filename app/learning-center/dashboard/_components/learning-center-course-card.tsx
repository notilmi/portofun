import Link from "next/link";
import type { ReactNode } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function getInitials(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function CourseStatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: "success" | "warning" | "neutral";
}) {
  return (
    <span
      className={cn(
        "rounded-md border px-2 py-1 text-xs font-semibold uppercase",
        tone === "success" &&
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        tone === "warning" &&
          "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300",
        tone === "neutral" && "border-border bg-muted/30 text-muted-foreground",
      )}
    >
      {label}
    </span>
  );
}

function CourseCardHeader({
  title,
  description,
  badge,
}: {
  title: string;
  description?: string | null;
  badge?: { label: string; tone: "success" | "warning" | "neutral" };
}) {
  return (
    <>
      <div className="relative h-40 border-b bg-[radial-gradient(120%_120%_at_0%_0%,hsl(var(--primary)/0.18),transparent_50%),radial-gradient(140%_140%_at_100%_100%,hsl(var(--muted-foreground)/0.15),transparent_55%)]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/70" />
        {badge ? (
          <div className="absolute right-3 top-3">
            <CourseStatusBadge label={badge.label} tone={badge.tone} />
          </div>
        ) : null}

        <div className="absolute bottom-4 left-4">
          <Avatar className="size-16 border border-white/30 bg-background/70 ring-2 ring-background/70 backdrop-blur-sm">
            <AvatarFallback className="text-lg font-semibold text-foreground">
              {getInitials(title)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="space-y-2 p-4">
        <CardTitle className="line-clamp-2 text-lg">{title}</CardTitle>
        <span className="line-clamp-2 text-sm text-muted-foreground">
          {description}
        </span>
      </div>
    </>
  );
}

export default function LearningCenterCourseCard({
  title,
  description,
  href,
  badge,
  footer,
}: {
  title: string;
  description?: string | null;
  href?: string;
  badge?: { label: string; tone: "success" | "warning" | "neutral" };
  footer?: ReactNode;
}) {
  return (
    <Card className="gap-0 overflow-hidden py-0 transition-colors hover:bg-muted/30">
      <CardContent className="p-0">
        {href ? (
          <Link href={href} className="block">
            <CourseCardHeader title={title} description={description} badge={badge} />
          </Link>
        ) : (
          <div>
            <CourseCardHeader title={title} description={description} badge={badge} />
          </div>
        )}

        {footer ? <div className="flex flex-wrap gap-2 p-4 pt-0">{footer}</div> : null}
      </CardContent>
    </Card>
  );
}
