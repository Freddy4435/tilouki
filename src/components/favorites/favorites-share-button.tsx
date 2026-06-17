"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { buildSharedFavoritesPath } from "@/lib/favorites/share-list";
import { useFavoritesStore } from "@/lib/favorites/store";

export function FavoritesShareButton() {
  const slugs = useFavoritesStore((state) => state.slugs);
  const [copied, setCopied] = useState(false);

  if (slugs.length === 0) return null;

  const handleShare = async () => {
    const path = buildSharedFavoritesPath(slugs);
    if (!path) return;

    const url = `${window.location.origin}${path}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Ma liste Tilouki",
          text: "Liste de souhaits vêtements enfants",
          url,
        });
        return;
      }
    } catch {
      // fallback copie
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button type="button" variant="outline" size="sm" onClick={() => void handleShare()}>
      {copied ? (
        <Check className="size-4" aria-hidden />
      ) : (
        <Link2 className="size-4" aria-hidden />
      )}
      {copied ? "Lien copié" : "Partager ma liste"}
    </Button>
  );
}
