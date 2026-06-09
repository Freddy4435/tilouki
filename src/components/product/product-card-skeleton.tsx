import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ProductCardSkeletonProps {
  className?: string;
}

export function ProductCardSkeleton({ className }: ProductCardSkeletonProps) {
  return (
    <article className={cn("flex flex-col gap-3", className)} aria-hidden>
      <Skeleton className="product-image-frame w-full rounded-[var(--radius-product)]" />
      <div className="space-y-2 px-0.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <div className="flex gap-1.5 pt-1">
          <Skeleton className="h-7 w-10 rounded-md" />
          <Skeleton className="h-7 w-10 rounded-md" />
          <Skeleton className="h-7 w-10 rounded-md" />
        </div>
      </div>
    </article>
  );
}

interface ProductGridSkeletonProps {
  count?: number;
  className?: string;
}

export function ProductGridSkeleton({ count = 8, className }: ProductGridSkeletonProps) {
  return (
    <div
      className={cn("grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4", className)}
    >
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
