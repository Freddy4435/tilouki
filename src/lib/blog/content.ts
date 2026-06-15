/** Découpe le contenu éditorial en paragraphes (texte brut, sans HTML). */
export function splitBlogParagraphs(content: string): string[] {
  return content
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

/** Sommaire court dérivé des premiers paragraphes. */
export function buildArticleToc(content: string, maxItems = 4): Array<{ id: string; label: string }> {
  const paragraphs = splitBlogParagraphs(content).slice(0, maxItems);

  return paragraphs.map((paragraph, index) => {
    const label = paragraph.length > 80 ? `${paragraph.slice(0, 77)}…` : paragraph;
    return { id: `section-${index}`, label };
  });
}
