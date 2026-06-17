"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import type { ProductListItem } from "@/types/catalog";

function HomeVestiaireAssistantSkeleton() {
  return (
    <section
      id="home-vestiaire"
      className="retail-section border-tilouki-border/80 maison-surface maison-surface-jade scroll-mt-20 border-y"
      aria-busy="true"
      aria-label="Assistant vestiaire en chargement"
    >
      <div className="container-tilouki section-tilouki py-10 md:py-12">
        <div className="bg-muted/40 mb-6 h-8 max-w-xs animate-pulse rounded-full" />
        <div className="bg-muted/30 mb-4 h-10 max-w-md animate-pulse rounded-lg" />
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="bg-muted/25 h-10 w-24 shrink-0 animate-pulse rounded-full"
            />
          ))}
        </div>
        <div className="mt-6 flex gap-3 overflow-hidden">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="bg-muted/20 h-52 w-[10.5rem] shrink-0 animate-pulse rounded-[var(--radius-card)]"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

const HomeVestiaireAssistant = dynamic(
  () =>
    import("@/components/home/home-vestiaire-assistant").then(
      (mod) => mod.HomeVestiaireAssistant,
    ),
  { loading: () => <HomeVestiaireAssistantSkeleton /> },
);

interface HomeVestiaireAssistantDeferredProps {
  products: ProductListItem[];
}

/** Charge l'assistant vestiaire (JS lourd) après le hero — améliore TBT / LCP mobile. */
export function HomeVestiaireAssistantDeferred({
  products,
}: HomeVestiaireAssistantDeferredProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const schedule = () => setReady(true);
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const id = window.requestIdleCallback(schedule, { timeout: 1800 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = setTimeout(schedule, 600);
    return () => clearTimeout(timer);
  }, []);

  if (!ready) {
    return <HomeVestiaireAssistantSkeleton />;
  }

  return <HomeVestiaireAssistant products={products} />;
}
