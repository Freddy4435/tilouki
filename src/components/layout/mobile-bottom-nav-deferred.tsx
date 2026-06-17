"use client";

import dynamic from "next/dynamic";

const MobileBottomNav = dynamic(
  () =>
    import("@/components/layout/mobile-bottom-nav").then((mod) => mod.MobileBottomNav),
  { ssr: false, loading: () => null },
);

export function MobileBottomNavDeferred() {
  return <MobileBottomNav />;
}
