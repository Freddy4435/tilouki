import { ProductGridSkeleton } from "@/components/product/product-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function PublicLoading() {
  return (
    <div className="container-tilouki section-tilouki space-y-10">
      <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
        <div className="space-y-4">
          <Skeleton className="h-6 w-40 rounded-full" />
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-16 w-full max-w-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-11 w-36 rounded-xl" />
            <Skeleton className="h-11 w-32 rounded-xl" />
          </div>
        </div>
        <Skeleton className="aspect-[4/3] w-full rounded-2xl lg:aspect-square" />
      </div>
      <ProductGridSkeleton count={4} />
    </div>
  );
}
