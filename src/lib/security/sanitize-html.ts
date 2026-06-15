import sanitizeHtml from "sanitize-html";

/**
 * Allowlist HTML pages légales (admin → public).
 * `table` / `tr` / `td` / `th` : tableau finalités RGPD dans la politique de confidentialité.
 */
export const LEGAL_HTML_ALLOWED_TAGS = [
  "p",
  "strong",
  "em",
  "ul",
  "ol",
  "li",
  "h2",
  "h3",
  "a",
  "br",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
] as const;

const EXTERNAL_HREF_RE = /^https?:\/\//i;

function transformAnchorTag(
  tagName: string,
  attribs: sanitizeHtml.Attributes,
): sanitizeHtml.Tag {
  const href = attribs.href?.trim();

  if (href && EXTERNAL_HREF_RE.test(href)) {
    const relParts = new Set((attribs.rel ?? "").split(/\s+/).filter(Boolean));
    relParts.add("noopener");
    relParts.add("noreferrer");

    return {
      tagName,
      attribs: {
        ...attribs,
        rel: [...relParts].join(" "),
      },
    };
  }

  return { tagName, attribs };
}

/** Assainit le HTML édité en admin avant affichage public (dangerouslySetInnerHTML). */
export function sanitizeLegalHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [...LEGAL_HTML_ALLOWED_TAGS],
    allowedAttributes: {
      a: ["href", "rel", "target"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false,
    disallowedTagsMode: "discard",
    transformTags: {
      a: transformAnchorTag,
    },
  });
}
