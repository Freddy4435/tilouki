import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { LegalPlaceholder } from "@/components/legal/legal-placeholder";
import { sanitizeLegalHtml } from "@/lib/security/sanitize-html";

interface LegalPageContentProps {
  title: string;
  html: string | null;
  fallbackMessage: string;
}

export function LegalPageContent({
  title,
  html,
  fallbackMessage,
}: LegalPageContentProps) {
  return (
    <LegalPageShell title={title}>
      {html ? (
        <div dangerouslySetInnerHTML={{ __html: sanitizeLegalHtml(html) }} />
      ) : (
        <LegalPlaceholder message={fallbackMessage} />
      )}
    </LegalPageShell>
  );
}
