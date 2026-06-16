import { getRequestCspNonce } from "@/lib/security/request-nonce";

interface JsonLdScriptProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Scripts JSON-LD (composant serveur) avec le nonce CSP de la requête.
 * Les blocs application/ld+json ne sont pas exécutables, mais le nonce les
 * couvre explicitement sous script-src à nonce (et évite tout signalement).
 */
export async function JsonLdScript({ data }: JsonLdScriptProps) {
  const nonce = await getRequestCspNonce();
  const payload = Array.isArray(data) ? data : [data];

  return (
    <>
      {payload.map((entry, index) => (
        // suppressHydrationWarning : le navigateur vide l'attribut nonce dans
        // le DOM (spec HTML) → faux positif de mismatch à l'hydratation.
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(entry) }}
          key={index}
          nonce={nonce}
          suppressHydrationWarning
          type="application/ld+json"
        />
      ))}
    </>
  );
}
