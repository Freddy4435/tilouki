import { CheckoutShell } from "@/components/checkout/checkout-shell";
import { CheckoutSteps } from "@/components/checkout/checkout-steps";
import { Skeleton } from "@/components/ui/skeleton";

export function CheckoutFlowSkeleton() {
  return (
    <CheckoutShell>
      <CheckoutSteps currentStep={1} />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full rounded-xl" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-11 rounded-xl" />
            <Skeleton className="h-11 rounded-xl" />
            <Skeleton className="h-11 rounded-xl sm:col-span-2" />
            <Skeleton className="h-11 rounded-xl sm:col-span-2" />
          </div>
          <Skeleton className="h-11 w-40 rounded-full" />
        </div>
        <aside className="hidden lg:block">
          <Skeleton className="h-64 rounded-2xl" />
        </aside>
      </div>
    </CheckoutShell>
  );
}
