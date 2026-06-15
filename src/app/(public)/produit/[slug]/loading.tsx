import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <div className="container-tilouki section-tilouki">
      <Skeleton className="mb-6 h-4 w-48" />
      <div className="grid gap-8 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-20 w-full" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-16 rounded-full" />
            ))}
          </div>
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}
