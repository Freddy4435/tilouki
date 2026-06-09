/**
 * Assainit le HTML édité en admin (pages légales).
 * Retire scripts, iframes et attributs d'événements inline.
 */
export function sanitizeLegalHtml(html: string): string {
  let safe = html;

  safe = safe.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  safe = safe.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");
  safe = safe.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "");
  safe = safe.replace(/<embed\b[^>]*>/gi, "");
  safe = safe.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  safe = safe.replace(/javascript:/gi, "");

  return safe;
}
