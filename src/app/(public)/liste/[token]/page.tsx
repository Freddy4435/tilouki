import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FavoritesProductList } from "@/components/favorites/favorites-product-list";
import { decodeFavoritesListToken } from "@/lib/favorites/share-list";
import { getProductsBySlugs } from "@/lib/supabase/queries/products";

export const metadata: Metadata = {
  title: "Liste cadeau",
  description: "Liste de souhaits Tilouki partagée.",
  robots: { index: false, follow: false },
};

interface SharedListPageProps {
  params: Promise<{ token: string }>;
}

export default async function SharedFavoritesListPage({ params }: SharedListPageProps) {
  const { token } = await params;
  const slugs = decodeFavoritesListToken(token);
  if (slugs.length === 0) notFound();

  const products = await getProductsBySlugs(slugs);
  if (products.length === 0) notFound();

  return (
    <div className="container-tilouki section-tilouki space-y-6">
      <header className="max-w-2xl space-y-2">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Liste cadeau Tilouki</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Sélection partagée — choisissez une pièce en stock et commandez en point relais.
        </p>
      </header>
      <FavoritesProductList products={products} />
    </div>
  );
}
