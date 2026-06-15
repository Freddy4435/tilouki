import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "next-env.d.ts",
    // Dépendances et hébergeur (jamais lintés)
    "node_modules/**",
    ".vercel/**",
    ".turbo/**",
    // Playwright : fixture `use()` déclenche react-hooks/rules-of-hooks à tort
    "e2e/**",
    "playwright/.cache/**",
    // Artefacts locaux (gitignorés — ne pas linter les rapports / exports)
    "playwright-report/**",
    "test-results/**",
    "blob-report/**",
    "coverage/**",
    "archives/**",
    ".email-preview/**",
    "supabase/.temp/**",
  ]),
]);

export default eslintConfig;
