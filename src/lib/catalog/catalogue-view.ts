export const CATALOGUE_VIEW_PARAM = "vue" as const;

export const CATALOGUE_VIEWS = ["produits", "capsules", "rayons"] as const;

export type CatalogueView = (typeof CATALOGUE_VIEWS)[number];

export const DEFAULT_CATALOGUE_VIEW: CatalogueView = "produits";

export const CATALOGUE_VIEW_LABELS: Record<CatalogueView, string> = {
  produits: "Produits",
  capsules: "Capsules",
  rayons: "Rayons",
};

export function isCatalogueView(value: string | undefined): value is CatalogueView {
  return CATALOGUE_VIEWS.includes(value as CatalogueView);
}

export function parseCatalogueView(
  params: Record<string, string | string[] | undefined>,
): CatalogueView {
  const raw = params[CATALOGUE_VIEW_PARAM];
  const value = Array.isArray(raw) ? raw[0] : raw;
  const trimmed = value?.trim();
  return isCatalogueView(trimmed) ? trimmed : DEFAULT_CATALOGUE_VIEW;
}

export function serializeCatalogueViewParam(view: CatalogueView): string | null {
  return view === DEFAULT_CATALOGUE_VIEW ? null : view;
}

/** Conserve les filtres catalogue et change la vue. */
export function buildCatalogueViewSearchParams(
  current: URLSearchParams,
  view: CatalogueView,
): URLSearchParams {
  const params = new URLSearchParams(current.toString());
  const serialized = serializeCatalogueViewParam(view);
  if (serialized) params.set(CATALOGUE_VIEW_PARAM, serialized);
  else params.delete(CATALOGUE_VIEW_PARAM);
  params.delete("page");
  return params;
}

export function buildPathWithSearchParams(
  basePath: string,
  params: URLSearchParams,
): string {
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}
