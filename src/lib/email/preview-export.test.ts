import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { EMAIL_PREVIEW_TYPES, renderEmailPreview } from "@/lib/email/preview";

const shouldExport = process.env.PREVIEW_EMAILS === "1";

describe("export preview e-mails", () => {
  it.skipIf(!shouldExport)(
    "écrit les fichiers HTML/TXT dans .email-preview/",
    async () => {
      const outDir = join(process.cwd(), ".email-preview");
      await mkdir(outDir, { recursive: true });

      for (const entry of EMAIL_PREVIEW_TYPES) {
        const rendered = renderEmailPreview(entry.id);
        await writeFile(join(outDir, `${entry.id}.html`), rendered.html, "utf8");
        await writeFile(join(outDir, `${entry.id}.txt`), rendered.text, "utf8");
      }

      expect(EMAIL_PREVIEW_TYPES.length).toBeGreaterThan(0);
    },
  );
});
