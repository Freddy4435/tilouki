import { ProductGridSkeleton } from "@/components/product/product-card-skeleton";

export default function CategoryLoading() {
  return (
    <div className="container-tilouki section-tilouki">
      <div className="bg-muted mb-8 h-24 animate-pulse rounded-2xl" />
      <ProductGridSkeleton count={8} />
    </div>
  );
}
