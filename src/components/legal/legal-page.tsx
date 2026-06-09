import { LegalPageContent } from "@/components/legal/legal-page-content";
import { getLegalRenderContext } from "@/lib/legal/context";
import { resolveLegalPageHtml } from "@/lib/legal/render";
import { getDefaultLegalTemplate } from "@/lib/legal/templates";
import { getLegalPage } from "@/lib/supabase/queries/legal";

interface LegalPageProps {
  slug: string;
  fallbackTitle: string;
  fallbackMessage: string;
}

export async function LegalPage({ slug, fallbackTitle, fallbackMessage }: LegalPageProps) {
  const [page, ctx] = await Promise.all([getLegalPage(slug), getLegalRenderContext()]);
  const template = getDefaultLegalTemplate(slug);

  const title = page?.title ?? template?.title ?? fallbackTitle;
  const html = page
    ? resolveLegalPageHtml(slug, page.content, ctx)
    : template
      ? resolveLegalPageHtml(slug, template.content, ctx)
      : null;

  return (
    <LegalPageContent
      title={title}
      html={html}
      fallbackMessage={fallbackMessage}
    />
  );
}
