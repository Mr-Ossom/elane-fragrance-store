import { Skeleton } from "@/components/ui/skeleton";

export function ShopSkeleton() {
  return (
    <div className="container-site py-6 sm:py-8">
      <Skeleton className="h-4 w-56" />
      <div className="mt-8 flex h-12 w-full max-w-lg items-center gap-3">
        <Skeleton className="h-10 w-44" />
        <Skeleton className="ml-auto h-9 w-36 lg:hidden" />
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="space-y-5">
            <Skeleton className="h-4 w-20" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-28" />
              </div>
            ))}
          </div>
        </aside>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="mt-3 h-3 w-16" />
              <Skeleton className="mt-2 h-5 w-28" />
              <Skeleton className="mt-2 h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}