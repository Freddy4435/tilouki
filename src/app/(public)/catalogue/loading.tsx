import { ProductGridSkeleton } from "@/components/product/product-card-skeleton";

export default function CatalogueLoading() {
  return (
    <div className="container-tilouki section-tilouki">
      <div className="bg-muted mb-8 h-20 animate-pulse rounded-2xl" />
      <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
        <div className="bg-muted hidden h-64 animate-pulse rounded-2xl lg:block" />
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}
