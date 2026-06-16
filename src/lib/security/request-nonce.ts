import "server-only";

import { headers } from "next/headers";

/**
 * Nonce CSP de la requête courante (injecté par le proxy → middleware).
 * À utiliser uniquement pour les scripts inline qui en ont besoin (JSON-LD, widget MR).
 *
 * Appeler cette fonction opte la route en rendu dynamique (nonce unique par requête).
 * Ne pas l'appeler dans le root layout : le proxy suffit pour les scripts Next.js.
 */
export async function getRequestCspNonce(): Promise<string | undefined> {
  return (await headers()).get("x-nonce") ?? undefined;
}
