import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

function OutlineSkeleton() {
  return (
    <div className="rounded-xl border bg-card">
      <div className="space-y-3 border-b p-4">
        <Skeleton className="h-4 w-2/3" />
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-10" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>

      <div className="space-y-2 p-3">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="rounded-lg border bg-background px-3 py-3">
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="mt-2 h-3 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MaterialPageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3">
        <div className="min-w-0 space-y-2">
          <Skeleton className="h-3 w-72" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <div className="rounded-xl border bg-card">
            <div className="flex items-center justify-between gap-3 border-b p-4">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-9 w-40 rounded-md" />
            </div>
            <div className="space-y-3 p-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>

          <Separator />

          <div className="rounded-xl border bg-card">
            <div className="space-y-2 border-b p-4">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-52" />
            </div>
            <div className="p-4">
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <OutlineSkeleton />
        </div>
      </div>
    </div>
  );
}
