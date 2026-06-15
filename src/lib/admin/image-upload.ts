/** Limites alignées sur supabase/migrations/20250609100300_storage.sql */

export const IMAGE_UPLOAD_LIMITS = {
  maxBytes: 10_485_760,
  maxSizeLabel: "10 Mo",
  mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"] as const,
  acceptAttribute: "image/jpeg,image/png,image/webp,image/gif",
  formatsLabel: "JPEG, PNG, WebP ou GIF",
} as const;

export type ImageUploadProfileKind = "product" | "hero";

export interface ImageUploadProfile {
  kind: ImageUploadProfileKind;
  minWidth: number;
  minHeight: number;
  recommendedRatioLabel: string;
  /** Largeur / hauteur — bornes inclusives pour un ratio acceptable sans avertissement. */
  ratioMin: number;
  ratioMax: number;
  guidance: string;
}

export const PRODUCT_IMAGE_PROFILE: ImageUploadProfile = {
  kind: "product",
  minWidth: 800,
  minHeight: 1000,
  recommendedRatioLabel: "portrait (4:5)",
  ratioMin: 0.72,
  ratioMax: 0.85,
  guidance:
    "Photo commerciale réelle uniquement — format portrait 4:5 (ex. 1200×1500 px), minimum 800×1000 px. JPEG, PNG ou WebP — pas de SVG ni visuel généré.",
};

export const HERO_IMAGE_PROFILE: ImageUploadProfile = {
  kind: "hero",
  minWidth: 800,
  minHeight: 1000,
  recommendedRatioLabel: "portrait (4:5)",
  ratioMin: 0.72,
  ratioMax: 0.85,
  guidance:
    "Format portrait recommandé (4:5), minimum 800×1000 px. Formats acceptés : JPEG, PNG, WebP ou GIF — 10 Mo max.",
};

export function getImageUploadProfile(
  kind: ImageUploadProfileKind,
): ImageUploadProfile {
  return kind === "hero" ? HERO_IMAGE_PROFILE : PRODUCT_IMAGE_PROFILE;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1_024 * 1_024) {
    return `${Math.ceil(bytes / 1024)} Ko`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".0", "")} Mo`;
}

/** Validation synchrone — type MIME et poids (avant lecture des dimensions). */
export function validateImageFileBasics(
  file: Pick<File, "type" | "size" | "name">,
): string | null {
  const mime = file.type.trim().toLowerCase();
  if (
    !mime ||
    !IMAGE_UPLOAD_LIMITS.mimeTypes.includes(
      mime as (typeof IMAGE_UPLOAD_LIMITS.mimeTypes)[number],
    )
  ) {
    return `« ${file.name} » : format non supporté. Utilisez ${IMAGE_UPLOAD_LIMITS.formatsLabel}.`;
  }

  if (file.size > IMAGE_UPLOAD_LIMITS.maxBytes) {
    return `« ${file.name} » : fichier trop lourd (${formatFileSize(file.size)}). Maximum : ${IMAGE_UPLOAD_LIMITS.maxSizeLabel}.`;
  }

  if (file.size === 0) {
    return `« ${file.name} » : fichier vide.`;
  }

  return null;
}

export interface ImageDimensionValidation {
  error?: string;
  warning?: string;
}

/** Validation des dimensions et du ratio (après chargement côté client). */
export function validateImageDimensions(
  width: number,
  height: number,
  profile: ImageUploadProfile,
): ImageDimensionValidation {
  if (width < profile.minWidth || height < profile.minHeight) {
    return {
      error: `Image trop petite (${width}×${height} px). Minimum : ${profile.minWidth}×${profile.minHeight} px.`,
    };
  }

  const ratio = width / height;
  if (ratio < profile.ratioMin || ratio > profile.ratioMax) {
    return {
      warning: `Ratio ${width}×${height} px — format ${profile.recommendedRatioLabel} recommandé pour un rendu optimal sur le site.`,
    };
  }

  return {};
}

/** Lit les dimensions d'un fichier image dans le navigateur. */
export function readImageFileDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Impossible de lire « ${file.name} ».`));
    };

    image.src = url;
  });
}

export interface ClientImageUploadValidationResult {
  ok: boolean;
  error?: string;
  warning?: string;
  width?: number;
  height?: number;
}

/** Validation complète côté client avant envoi au bucket. */
export async function validateImageFileForUpload(
  file: File,
  profile: ImageUploadProfile,
): Promise<ClientImageUploadValidationResult> {
  const basicError = validateImageFileBasics(file);
  if (basicError) {
    return { ok: false, error: basicError };
  }

  try {
    const { width, height } = await readImageFileDimensions(file);
    const dimensionCheck = validateImageDimensions(width, height, profile);

    if (dimensionCheck.error) {
      return {
        ok: false,
        error: `« ${file.name} » : ${dimensionCheck.error}`,
        width,
        height,
      };
    }

    return {
      ok: true,
      warning: dimensionCheck.warning
        ? `« ${file.name} » : ${dimensionCheck.warning}`
        : undefined,
      width,
      height,
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : `« ${file.name} » : fichier illisible.`,
    };
  }
}
