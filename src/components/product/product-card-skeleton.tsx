import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ProductCardSkeletonProps {
  className?: string;
}

export function ProductCardSkeleton({ className }: ProductCardSkeletonProps) {
  return (
    <article
      className={cn(
        "bg-card flex h-full flex-col overflow-hidden rounded-[var(--radius-product)] ring-1 ring-black/[0.04]",
        className,
      )}
      aria-hidden
    >
      <Skeleton className="product-image-frame w-full shrink-0 rounded-b-none" />
      <div className="flex flex-1 flex-col gap-2 p-3">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-6 w-1/2" />
        <div className="mt-auto flex gap-1.5 pt-1">
          <Skeleton className="h-6 w-9 rounded-md" />
          <Skeleton className="h-6 w-9 rounded-md" />
        </div>
        <Skeleton className="h-9 w-full rounded-[var(--radius-button)]" />
      </div>
    </article>
  );
}

interface ProductGridSkeletonProps {
  count?: number;
  className?: string;
}

export function ProductGridSkeleton({
  count = 8,
  className,
}: ProductGridSkeletonProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4",
        className,
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
