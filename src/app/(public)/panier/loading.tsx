import { Skeleton } from "@/components/ui/skeleton";

export default function CartPageLoading() {
  return (
    <div className="container-tilouki section-tilouki">
      <Skeleton className="mb-8 h-24 rounded-2xl" />
      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="hidden h-64 rounded-2xl lg:block" />
      </div>
    </div>
  );
}
