"use client";

import dynamic from "next/dynamic";

const HomeYourSelectionContent = dynamic(
  () =>
    import("@/components/home/home-your-selection-content").then(
      (mod) => mod.HomeYourSelectionContent,
    ),
  { ssr: false },
);

/** Bloc personnalisé (favoris + vu récemment) — client uniquement (stores localStorage). */
export function HomeYourSelectionSection() {
  return <HomeYourSelectionContent />;
}
