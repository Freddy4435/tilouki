import "server-only";

import { logSecure } from "@/lib/security/log";

const SOAP_ENV_NS = "http://schemas.xmlsoap.org/soap/envelope/";

/** Namespace WSDL PointRelaisServiceWS (recherche points Pickup). */
export const CHRONOPOST_RELAY_NAMESPACE = "http://cxf.rechercheBt.soap.chronopost.fr/";

/** Endpoint SOAP document/literal — pas de suffixe d'opération dans l'URL. */
export const CHRONOPOST_RELAY_ENDPOINT =
  "https://ws.chronopost.fr/recherchebt-ws-cxf/PointRelaisServiceWS";

/** Namespace WSDL QuickcostServiceWS. */
export const CHRONOPOST_QUICKCOST_NAMESPACE =
  "http://cxf.quickcost.soap.chronopost.fr/";

export const CHRONOPOST_QUICKCOST_ENDPOINT =
  "https://ws.chronopost.fr/quickcost-cxf/QuickcostServiceWS";

/** Namespace WSDL ShippingServiceWS (génération d'étiquettes). */
export const CHRONOPOST_SHIPPING_NAMESPACE =
  "http://cxf.shipping.soap.chronopost.fr/";

export const CHRONOPOST_SHIPPING_ENDPOINT =
  "https://ws.chronopost.fr/shipping-cxf/ShippingServiceWS";

export const CHRONOPOST_SOAP_TIMEOUT_MS = 8_000;

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Enveloppe SOAP 1.1 document/literal (style Chronopost CXF). */
export function buildSoapEnvelope(
  namespace: string,
  operation: string,
  fields: Record<string, string>,
): string {
  const inner = Object.entries(fields)
    .map(([key, value]) => `<${key}>${escapeXml(value)}</${key}>`)
    .join("");

  return `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="${SOAP_ENV_NS}" xmlns:chr="${namespace}">
  <soapenv:Header/>
  <soapenv:Body>
    <chr:${operation}>${inner}</chr:${operation}>
  </soapenv:Body>
</soapenv:Envelope>`;
}

export class ChronopostSoapError extends Error {
  constructor(
    message: string,
    readonly operation: string,
    readonly httpStatus?: number,
  ) {
    super(message);
    this.name = "ChronopostSoapError";
  }
}

/** Retire identifiants et valeurs sensibles d'un message d'erreur externe. */
export function sanitizeChronopostErrorMessage(
  message: string,
  sensitiveFields?: Record<string, string>,
): string {
  let sanitized = message;

  if (sensitiveFields) {
    for (const value of Object.values(sensitiveFields)) {
      if (value.length > 0) {
        sanitized = sanitized.split(value).join("[redacted]");
      }
    }
  }

  sanitized = sanitized.replace(
    /accountNumber=[^&\s"'<>]+/gi,
    "accountNumber=[redacted]",
  );
  sanitized = sanitized.replace(/password=[^&\s"'<>]+/gi, "password=[redacted]");

  return sanitized;
}

export interface ChronopostSoapRequestOptions {
  endpoint: string;
  namespace: string;
  operation: string;
  fields: Record<string, string>;
  timeoutMs?: number;
}

/**
 * Appel SOAP Chronopost — credentials dans le corps XML uniquement.
 * SOAPAction vide (WSDL CXF document/literal).
 */
async function postSoapEnvelope(
  endpoint: string,
  operation: string,
  envelope: string,
  timeoutMs: number,
  sensitiveFields?: Record<string, string>,
): Promise<string> {
  const doFetch = async (): Promise<string> => {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: '""',
      },
      body: envelope,
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new ChronopostSoapError(
        `Réponse HTTP ${response.status} du service Chronopost.`,
        operation,
        response.status,
      );
    }

    return response.text();
  };

  try {
    return await doFetch();
  } catch (firstError) {
    logSecure("warn", "chronopost-soap: échec réseau, nouvelle tentative", {
      operation,
      httpStatus:
        firstError instanceof ChronopostSoapError ? firstError.httpStatus : undefined,
      error:
        firstError instanceof Error
          ? sanitizeChronopostErrorMessage(firstError.message, sensitiveFields)
          : "erreur réseau",
    });
    return doFetch();
  }
}

export async function postChronopostSoap(
  options: ChronopostSoapRequestOptions,
): Promise<string> {
  const {
    endpoint,
    namespace,
    operation,
    fields,
    timeoutMs = CHRONOPOST_SOAP_TIMEOUT_MS,
  } = options;
  const envelope = buildSoapEnvelope(namespace, operation, fields);
  return postSoapEnvelope(endpoint, operation, envelope, timeoutMs, fields);
}

/** Enveloppe SOAP pré-construite (structures imbriquées, ex. shippingV6). */
export async function postChronopostSoapEnvelope(
  options: {
    endpoint: string;
    operation: string;
    envelope: string;
    timeoutMs?: number;
    sensitiveFields?: Record<string, string>;
  },
): Promise<string> {
  const { endpoint, operation, envelope, timeoutMs = CHRONOPOST_SOAP_TIMEOUT_MS, sensitiveFields } =
    options;
  return postSoapEnvelope(endpoint, operation, envelope, timeoutMs, sensitiveFields);
}
