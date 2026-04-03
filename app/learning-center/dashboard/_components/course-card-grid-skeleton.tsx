import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function CourseCardGridSkeleton({
  count = 4,
}: {
  count?: number;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-start">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>

        <div className="flex w-full flex-col gap-2 md:w-auto md:items-end">
          <Skeleton className="h-9 w-full md:w-72" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-xl border">
            <div className="relative">
              <Skeleton className="h-40 w-full rounded-none" />
              <Skeleton className="absolute bottom-4 left-4 size-16 rounded-full" />
            </div>

            <div className="space-y-3 p-4">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />

              <div className="flex justify-end pt-2">
                <Skeleton className="h-9 w-28" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
