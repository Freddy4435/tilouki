"use client";

import dynamic from "next/dynamic";

const CategoryMenu = dynamic(
  () => import("@/components/layout/category-menu").then((mod) => mod.CategoryMenu),
  { ssr: false, loading: () => null },
);

/** Menu catégories desktop — chargé après l'hydratation (perf mobile). */
export function CategoryMenuDeferred() {
  return <CategoryMenu />;
}
