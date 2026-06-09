import { describe, expect, it } from "vitest";

import { sanitizeLegalHtml } from "@/lib/security/sanitize-html";

describe("sanitizeLegalHtml", () => {
  it("retire les balises script", () => {
    const html = '<p>OK</p><script>alert("x")</script>';
    expect(sanitizeLegalHtml(html)).toBe("<p>OK</p>");
  });

  it("retire les attributs on* inline", () => {
    const html = '<p onclick="evil()">Texte</p>';
    expect(sanitizeLegalHtml(html)).toBe("<p>Texte</p>");
  });
});
