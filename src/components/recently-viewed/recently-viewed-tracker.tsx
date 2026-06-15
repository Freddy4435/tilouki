"use client";

import { useEffect } from "react";

import { useRecentlyViewedStore } from "@/lib/recently-viewed/store";

interface RecentlyViewedTrackerProps {
  slug: string;
}

/** Enregistre une consultation produit en localStorage (strictement fonctionnel). */
export function RecentlyViewedTracker({ slug }: RecentlyViewedTrackerProps) {
  const trackView = useRecentlyViewedStore((state) => state.trackView);

  useEffect(() => {
    if (slug) trackView(slug);
  }, [slug, trackView]);

  return null;
}
