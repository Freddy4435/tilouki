import "server-only";

import { logSecure } from "@/lib/security/log";
import {
  getChronopostAccountNumber,
  getChronopostPassword,
  isChronopostQuickCostEnabled,
} from "@/lib/shipping/env";
import {
  CHRONOPOST_QUICKCOST_ENDPOINT,
  CHRONOPOST_QUICKCOST_NAMESPACE,
  postChronopostSoap,
} from "@/lib/shipping/providers/chronopost/soap";
import { extractTagValue } from "@/lib/shipping/providers/chronopost/xml";

/**
 * Cotation Chronopost via QuickcostServiceWS — SOAP 1.1 POST (WSDL officiel).
 * Opération `quickCost` : depCode, arrCode, weight (kg), productCode 86 (Chrono Relais), type M.
 */
/** Code produit Chronopost « Chrono Relais » (livraison en point Pickup). */
const CHRONO_RELAIS_PRODUCT_CODE = "86";

/** Cache mémoire 10 minutes par couple (code postal, tranche de poids). */
const QUICKCOST_CACHE_TTL_MS = 10 * 60 * 1000;

/** Granularité de la tranche de poids pour la clé de cache (250 g). */
const WEIGHT_BUCKET_GRAMS = 250;

interface QuickCostCacheEntry {
  priceCents: number;
  expiresAt: number;
}

const quickCostCache = new Map<string, QuickCostCacheEntry>();

function buildCacheKey(zip: string, weightGrams: number): string {
  const bucket = Math.ceil(Math.max(weightGrams, 1) / WEIGHT_BUCKET_GRAMS);
  return `${zip}:${bucket}`;
}

/** Réinitialise le cache (tests). */
export function resetQuickCostCache(): void {
  quickCostCache.clear();
}

/** Montant TTC en euros → centimes, arrondi au centime. */
function parseAmountToCents(value: string | null): number | null {
  if (!value) return null;
  const amount = Number.parseFloat(value.replace(",", "."));
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return Math.round(amount * 100);
}

/** Code postal de départ (boutique) — surchargé via CHRONOPOST_DEPARTURE_ZIP. */
function getDepartureZip(): string {
  const zip = process.env.CHRONOPOST_DEPARTURE_ZIP?.replace(/\s/g, "") ?? "";
  return /^\d{5}$/.test(zip) ? zip : "75001";
}

/**
 * Cotation QuickCost pour une livraison Chrono Relais France → France.
 * Retourne null si le flag est inactif, en cas d'erreur API ou de réponse
 * inexploitable — l'appelant retombe alors sur le barème DB.
 */
export async function getQuickCostPriceCents(
  destinationZip: string,
  weightGrams: number,
): Promise<number | null> {
  if (!isChronopostQuickCostEnabled()) return null;

  const account = getChronopostAccountNumber();
  const password = getChronopostPassword();
  if (!account || !password) return null;

  const zip = destinationZip.replace(/\s/g, "");
  if (!/^\d{5}$/.test(zip)) return null;

  const cacheKey = buildCacheKey(zip, weightGrams);
  const cached = quickCostCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.priceCents;
  }

  const fields: Record<string, string> = {
    accountNumber: account,
    password,
    depCode: getDepartureZip(),
    arrCode: zip,
    weight: (Math.max(weightGrams, 1) / 1000).toFixed(3),
    productCode: CHRONO_RELAIS_PRODUCT_CODE,
    type: "M",
  };

  try {
    const xml = await postChronopostSoap({
      endpoint: CHRONOPOST_QUICKCOST_ENDPOINT,
      namespace: CHRONOPOST_QUICKCOST_NAMESPACE,
      operation: "quickCost",
      fields,
    });

    const errorCode = extractTagValue(xml, "errorCode");

    if (errorCode !== "0") {
      logSecure("warn", "chronopost-quickcost: erreur API, fallback barème DB", {
        operation: "quickCost",
        errorCode: errorCode ?? "absent",
        errorMessage: extractTagValue(xml, "errorMessage") ?? undefined,
      });
      return null;
    }

    const priceCents =
      parseAmountToCents(extractTagValue(xml, "amountTTC")) ??
      parseAmountToCents(extractTagValue(xml, "amount"));

    if (priceCents === null) {
      logSecure("warn", "chronopost-quickcost: montant absent, fallback barème DB", {
        operation: "quickCost",
      });
      return null;
    }

    quickCostCache.set(cacheKey, {
      priceCents,
      expiresAt: Date.now() + QUICKCOST_CACHE_TTL_MS,
    });

    return priceCents;
  } catch (error) {
    logSecure("warn", "chronopost-quickcost: appel en échec, fallback barème DB", {
      operation: "quickCost",
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}
