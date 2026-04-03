import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

function CourseCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="relative">
        <Skeleton className="h-40 w-full rounded-none" />
        <Skeleton className="absolute bottom-4 left-4 size-16 rounded-full" />
        <Skeleton className="absolute right-3 top-3 h-6 w-20 rounded-md" />
      </div>

      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>

      <div className="p-4 pt-0">
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>
    </div>
  );
}

function SectionSkeleton({ titleWidth }: { titleWidth: "w-24" | "w-28" }) {
  return (
    <section className="space-y-3">
      <Skeleton className={`h-5 ${titleWidth}`} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, idx) => (
          <CourseCardSkeleton key={idx} />
        ))}
      </div>
    </section>
  );
}

export default function MyLearningsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-4 w-14" />
      </div>

      <Separator />

      <div className="space-y-6">
        <SectionSkeleton titleWidth="w-24" />
        <SectionSkeleton titleWidth="w-28" />
      </div>
    </div>
  );
}
