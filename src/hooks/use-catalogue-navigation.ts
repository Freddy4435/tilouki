"use client";

import { useRouter, useSearchParams } from "next/navigation";

import {
  CATALOGUE_PARAM_KEYS,
  readMultiParamFromSearchParams,
  setMultiParamOnSearchParams,
  toggleMultiParamValue,
} from "@/lib/catalog/catalogue-search-params";

export function useCatalogueNavigation(basePath: string, lockedCategorySlug?: string) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pushParams = (params: URLSearchParams) => {
    if (lockedCategorySlug) {
      params.delete(CATALOGUE_PARAM_KEYS.category);
    }
    params.delete(CATALOGUE_PARAM_KEYS.page);
    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  };

  const updateSingle = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) params.delete(key);
      else params.set(key, value);
    });
    pushParams(params);
  };

  const toggleFacetValue = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = readMultiParamFromSearchParams(params, key);
    setMultiParamOnSearchParams(params, key, toggleMultiParamValue(current, value));
    pushParams(params);
  };

  const removeFacetValue = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const next = readMultiParamFromSearchParams(params, key).filter(
      (item) => item !== value,
    );
    setMultiParamOnSearchParams(params, key, next);
    pushParams(params);
  };

  const reset = () => router.push(basePath);

  return {
    searchParams,
    updateSingle,
    toggleFacetValue,
    removeFacetValue,
    reset,
  };
}
