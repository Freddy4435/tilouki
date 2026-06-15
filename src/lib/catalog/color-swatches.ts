export interface ColorSwatchStyle {
  background: string;
  isNeutral: boolean;
  label: string;
}

const COLOR_HEX: Readonly<Record<string, string>> = {
  blanc: "#f8f8f6",
  ecru: "#f3ece0",
  naturel: "#e8dcc8",
  beige: "#d9c9a8",
  camel: "#c4a574",
  marron: "#7a5c42",
  noir: "#1f1f1f",
  gris: "#9ca3af",
  "gris clair": "#d1d5db",
  argent: "#c0c0c0",
  bleu: "#5b8fd9",
  "bleu ciel": "#9ec5eb",
  "bleu marine": "#1e3a5f",
  marine: "#1e3a5f",
  turquoise: "#4ecdc4",
  vert: "#5a9e6f",
  "vert menthe": "#98d4bb",
  kaki: "#8b8b5a",
  jaune: "#f4d35e",
  moutarde: "#d4a72c",
  orange: "#e67e22",
  corail: "#f08060",
  rouge: "#c0392b",
  bordeaux: "#6b1f2a",
  rose: "#e8a0b4",
  "rose pale": "#f5d0dc",
  fuchsia: "#d946a0",
  violet: "#8e6bb8",
  mauve: "#b08cba",
  lilas: "#c9b8e8",
  multicolore: "conic-gradient(#e8a0b4, #5b8fd9, #f4d35e, #5a9e6f, #e8a0b4)",
};

function normalizeColorKey(value: string): string {
  return value.trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
}

export function resolveColorSwatch(colorName: string): ColorSwatchStyle {
  const label = colorName.trim();
  const normalized = normalizeColorKey(label);

  if (!normalized) {
    return { background: "var(--muted)", isNeutral: true, label: "Couleur" };
  }

  const sortedKeys = Object.keys(COLOR_HEX).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (normalized.includes(key)) {
      return { background: COLOR_HEX[key]!, isNeutral: false, label };
    }
  }

  return { background: "var(--muted)", isNeutral: true, label };
}
