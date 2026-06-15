import { isPlaceholderLegalContent } from "@/lib/legal/render";
import {
  getAllDefaultLegalTemplates,
  getDefaultLegalTemplate,
  LEGAL_PAGE_LABELS,
  LEGAL_PAGE_SLUGS,
  type LegalPageSlug,
} from "@/lib/legal/templates";

export function isLegalPageManuallyEdited(
  content: string,
  slug: LegalPageSlug,
): boolean {
  const trimmed = content.trim();
  if (!trimmed || isPlaceholderLegalContent(trimmed)) return false;

  const template = getDefaultLegalTemplate(slug);
  if (!template) return false;

  return trimmed !== template.content.trim();
}

export function listLegalPagesRequiringOverwriteConfirmation(
  pages: Array<{ slug: string; content: string }>,
): LegalPageSlug[] {
  return LEGAL_PAGE_SLUGS.filter((slug) => {
    const page = pages.find((item) => item.slug === slug);
    if (!page) return false;
    return isLegalPageManuallyEdited(page.content, slug);
  });
}

export function getLegalPageOverwriteLabels(slugs: LegalPageSlug[]): string[] {
  return slugs.map((slug) => LEGAL_PAGE_LABELS[slug]);
}

export function getAllLegalTemplatesForGeneration(): {
  slug: LegalPageSlug;
  title: string;
  content: string;
}[] {
  return getAllDefaultLegalTemplates();
}
