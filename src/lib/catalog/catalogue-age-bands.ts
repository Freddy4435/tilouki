export type CatalogueAgeBand = "bebe" | "1-3-ans" | "4-8-ans";

export const CATALOGUE_AGE_BANDS: ReadonlyArray<{
  value: CatalogueAgeBand;
  label: string;
  hint: string;
}> = [
  { value: "bebe", label: "Bébé", hint: "0–12 mois" },
  { value: "1-3-ans", label: "1–3 ans", hint: "Tout-petit" },
  { value: "4-8-ans", label: "4–8 ans", hint: "École" },
];

const AGE_BAND_SET = new Set<string>(CATALOGUE_AGE_BANDS.map((band) => band.value));

function normalizeAgeToken(value: string): string {
  return value.trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
}

export function isCatalogueAgeBand(
  value: string | null | undefined,
): value is CatalogueAgeBand {
  return Boolean(value && AGE_BAND_SET.has(value));
}

export function getAgeBandLabel(band: string | null | undefined): string {
  return CATALOGUE_AGE_BANDS.find((item) => item.value === band)?.label ?? "Âge";
}

export function variantMatchesAgeBand(
  ageLabel: string | null | undefined,
  sizeLabel: string | null | undefined,
  band: CatalogueAgeBand,
): boolean {
  const combined = normalizeAgeToken([ageLabel, sizeLabel].filter(Boolean).join(" "));
  if (!combined) return false;

  switch (band) {
    case "bebe":
      return (
        /(\d+\s*m\b|mois|naissance|0-3|3-6|6-12|12-18\s*mois|bebe)/i.test(combined) ||
        /^(9|6|3|12|18|24)m$/.test(combined.replace(/\s/g, ""))
      );
    case "1-3-ans":
      return /(1\s*an|2\s*ans|3\s*ans|1-3|3-4|18-24|12-18|24m|2a|3a)/i.test(combined);
    case "4-8-ans":
      return /(4\s*ans|5\s*ans|6\s*ans|7\s*ans|8\s*ans|4-8|4a|5a|6a|7a|8a)/i.test(
        combined,
      );
  }
}
