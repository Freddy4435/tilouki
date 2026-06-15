import { LegalPageContent } from "@/components/legal/legal-page-content";
import { renderSafePublicLegalHtml } from "@/lib/legal/publication";
import { getDefaultLegalTemplate } from "@/lib/legal/templates";
import { getLegalPage } from "@/lib/supabase/queries/legal";
import { getShopSettings } from "@/lib/supabase/queries/shop";
import { logSecure } from "@/lib/security/log";

interface LegalPageProps {
  slug: string;
  fallbackTitle: string;
  fallbackMessage: string;
}

const LEGAL_UNAVAILABLE_MESSAGE =
  "Cette page est en cours de finalisation. Revenez prochainement ou contactez-nous via les coordonnées du site.";

export async function LegalPage({
  slug,
  fallbackTitle,
  fallbackMessage,
}: LegalPageProps) {
  const [page, settings] = await Promise.all([getLegalPage(slug), getShopSettings()]);
  const template = getDefaultLegalTemplate(slug);

  const title = page?.title ?? template?.title ?? fallbackTitle;
  const storedContent = page?.content ?? null;
  const html = renderSafePublicLegalHtml(slug, storedContent, settings);

  if (!html && process.env.NODE_ENV === "production") {
    logSecure("warn", "Page légale indisponible (placeholder ou rendu invalide)", {
      slug,
    });
  }

  return (
    <LegalPageContent
      title={title}
      html={html}
      fallbackMessage={
        process.env.NODE_ENV === "production"
          ? LEGAL_UNAVAILABLE_MESSAGE
          : fallbackMessage
      }
    />
  );
}
