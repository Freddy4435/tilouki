import { buildCatalogueHref } from "@/lib/navigation/catalog-href";

export interface PersonalizationSignals {
  favoriteCount: number;
  recentCount: number;
  consultedSizeCount: number;
}

export function hasPersonalHomeContent(signals: PersonalizationSignals): boolean {
  return (
    signals.favoriteCount > 0 ||
    signals.recentCount > 0 ||
    signals.consultedSizeCount > 0
  );
}

/** Sous-titre court pour la section accueil — ton marchand. */
export function buildPersonalizationSubtitle(signals: PersonalizationSignals): string {
  const parts: string[] = [];

  if (signals.favoriteCount > 0) {
    parts.push(
      signals.favoriteCount === 1 ? "1 favori" : `${signals.favoriteCount} favoris`,
    );
  }
  if (signals.recentCount > 0) {
    parts.push("articles consultés");
  }
  if (signals.consultedSizeCount > 0) {
    parts.push("tailles repérées");
  }

  if (parts.length === 0) {
    return "Vos repères enregistrés sur cet appareil.";
  }

  return `${parts.join(" · ")} — reprenez là où vous en étiez.`;
}

export function buildConsultedSizeHref(label: string): string {
  return buildCatalogueHref({ sizes: [label] });
}
