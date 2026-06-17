import "server-only";

import { z } from "zod";

import type { CreateShipmentLabelInput, ShipmentParty } from "@/lib/shipping/types";
import {
  CHRONOPOST_SHIPPING_ENDPOINT,
  CHRONOPOST_SHIPPING_NAMESPACE,
  escapeXml,
  postChronopostSoapEnvelope,
} from "@/lib/shipping/providers/chronopost/soap";
import { extractTagValue } from "@/lib/shipping/providers/chronopost/xml";

/** Chrono Relais — livraison en point Pickup. */
export const CHRONOPOST_PRODUCT_CHRONO_RELAIS = "86";

const SOAP_ENV_NS = "http://schemas.xmlsoap.org/soap/envelope/";

const countryNames: Record<string, string> = {
  FR: "FRANCE",
  BE: "BELGIQUE",
  LU: "LUXEMBOURG",
  CH: "SUISSE",
  ES: "ESPAGNE",
  IT: "ITALIE",
  DE: "ALLEMAGNE",
};

export const createChronopostLabelInputSchema = z.object({
  orderId: z.string().min(1),
  orderNumber: z
    .string()
    .trim()
    .min(1, "Référence commande requise.")
    .max(35, "Référence commande trop longue."),
  sender: z.object({
    name: z.string().trim().min(2).max(100),
    street: z.string().trim().min(2).max(38),
    zip: z.string().trim().min(4).max(9),
    city: z.string().trim().min(2).max(50),
    country: z.string().trim().length(2),
    phone: z.string().trim().max(17).optional().nullable(),
    email: z.string().trim().email().max(80).optional().nullable(),
  }),
  recipient: z.object({
    name: z.string().trim().min(2).max(100),
    street: z.string().trim().min(2).max(38),
    zip: z.string().trim().min(4).max(9),
    city: z.string().trim().min(2).max(50),
    country: z.string().trim().length(2),
    phone: z.string().trim().max(17).optional().nullable(),
    email: z.string().trim().email().max(80).optional().nullable(),
  }),
  relayPointId: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9]{1,20}$/, "Identifiant de point relais invalide."),
  relayPointCountry: z.string().trim().length(2),
  weightGrams: z
    .number()
    .int()
    .min(15, "Poids minimal : 15 g.")
    .max(30_000, "Poids maximal Chronopost : 30 kg."),
});

function toChronopostText(value: string, maxLen: number): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-zA-Z0-9\s.,'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen);
}

function toChronopostPhone(phone?: string | null): string {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length >= 9) return digits.slice(0, 17);
  return "0600000000";
}

function splitName(full: string): { line1: string; line2: string } {
  const normalized = toChronopostText(full, 100);
  const parts = normalized.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { line1: parts[0] ?? "Client", line2: "" };
  }
  return { line1: parts[0]!, line2: parts.slice(1).join(" ").slice(0, 100) };
}

function countryLabel(code: string): string {
  const upper = code.toUpperCase();
  return countryNames[upper] ?? upper;
}

function el(tag: string, value: string): string {
  return `<${tag}>${escapeXml(value)}</${tag}>`;
}

function partyBlock(
  prefix: "shipper" | "customer" | "recipient",
  party: ShipmentParty,
  options?: { preAlert?: string; recipientType?: string; shipperType?: string },
): string {
  const { line1, line2 } = splitName(party.name);
  const country = party.country.toUpperCase();
  const phone = toChronopostPhone(party.phone);
  const email = party.email?.trim() ?? "";

  if (prefix === "shipper") {
    return `<shipperValue>
${el("shipperAdress1", toChronopostText(party.street, 38))}
${el("shipperAdress2", "")}
${el("shipperCity", toChronopostText(party.city, 50))}
${el("shipperCivility", "M")}
${el("shipperContactName", toChronopostText(party.name, 100))}
${el("shipperCountry", country)}
${el("shipperCountryName", countryLabel(country))}
${el("shipperEmail", email || "contact@tilouki.fr")}
${el("shipperMobilePhone", phone)}
${el("shipperName", line1)}
${el("shipperName2", line2)}
${el("shipperPhone", phone)}
${el("shipperPreAlert", "0")}
${el("shipperZipCode", party.zip.replace(/\s/g, "").slice(0, 9))}
${el("shipperType", options?.shipperType ?? "1")}
</shipperValue>`;
  }

  if (prefix === "customer") {
    return `<customerValue>
${el("customerAdress1", toChronopostText(party.street, 38))}
${el("customerAdress2", "")}
${el("customerCity", toChronopostText(party.city, 50))}
${el("customerCivility", "M")}
${el("customerContactName", toChronopostText(party.name, 100))}
${el("customerCountry", country)}
${el("customerCountryName", countryLabel(country))}
${el("customerEmail", email || "client@tilouki.fr")}
${el("customerMobilePhone", phone)}
${el("customerName", line1)}
${el("customerName2", line2)}
${el("customerPhone", phone)}
${el("customerPreAlert", "0")}
${el("customerZipCode", party.zip.replace(/\s/g, "").slice(0, 9))}
${el("printAsSender", "N")}
</customerValue>`;
  }

  return `<recipientValue>
${el("recipientAdress1", toChronopostText(party.street, 38))}
${el("recipientAdress2", "")}
${el("recipientCity", toChronopostText(party.city, 50))}
${el("recipientContactName", toChronopostText(party.name, 100))}
${el("recipientCountry", country)}
${el("recipientCountryName", countryLabel(country))}
${el("recipientEmail", email || "client@tilouki.fr")}
${el("recipientMobilePhone", phone)}
${el("recipientName", line1)}
${el("recipientName2", line2)}
${el("recipientPhone", phone)}
${el("recipientPreAlert", options?.preAlert ?? "22")}
${el("recipientZipCode", party.zip.replace(/\s/g, "").slice(0, 9))}
${el("recipientType", options?.recipientType ?? "2")}
</recipientValue>`;
}

export function buildShippingV6Envelope(
  input: z.infer<typeof createChronopostLabelInputSchema> & {
    accountNumber: string;
    password: string;
  },
): string {
  const now = new Date();
  const shipDate = now.toISOString();
  const shipHour = String(now.getHours());
  const weightKg = Math.max(input.weightGrams / 1000, 0.015).toFixed(3);
  const relayRef = input.relayPointId.trim().toUpperCase();
  const shipperRef = toChronopostText(input.orderNumber, 35);

  const inner = `<headerValue>
${el("accountNumber", input.accountNumber)}
${el("idEmit", "CHRFR")}
${el("identWebPro", "")}
${el("subAccount", "")}
</headerValue>
${partyBlock("shipper", input.sender, { shipperType: "1" })}
${partyBlock("customer", input.recipient)}
${partyBlock("recipient", input.recipient, { preAlert: "22", recipientType: "2" })}
<refValue>
${el("customerSkybillNumber", "")}
${el("recipientRef", relayRef)}
${el("shipperRef", shipperRef)}
</refValue>
<skybillValue>
${el("evtCode", "DC")}
${el("productCode", CHRONOPOST_PRODUCT_CHRONO_RELAIS)}
${el("shipDate", shipDate)}
${el("shipHour", shipHour)}
${el("weight", weightKg)}
${el("weightUnit", "KGM")}
${el("service", "0")}
${el("objectType", "MAR")}
${el("bulkNumber", "1")}
${el("codCurrency", "EUR")}
${el("codValue", "0")}
</skybillValue>
<skybillParamsValue>
${el("mode", "PDF")}
${el("duplicata", "N")}
${el("withReservation", "2")}
</skybillParamsValue>
${el("password", input.password)}
${el("version", "2.0")}`;

  return `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="${SOAP_ENV_NS}" xmlns:cxf="${CHRONOPOST_SHIPPING_NAMESPACE}">
  <soapenv:Header/>
  <soapenv:Body>
    <cxf:shippingV6>${inner}</cxf:shippingV6>
  </soapenv:Body>
</soapenv:Envelope>`;
}

export interface ShippingV6Result {
  errorCode: string;
  errorMessage: string | null;
  skybillNumber: string | null;
  pdfBase64: string | null;
}

export function parseShippingV6Response(xml: string): ShippingV6Result {
  const returnBlock =
    extractTagValue(xml, "return") ??
    extractBlocks(xml, "return")[0] ??
    xml;

  return {
    errorCode: extractTagValue(returnBlock, "errorCode") ?? "",
    errorMessage: extractTagValue(returnBlock, "errorMessage"),
    skybillNumber: extractTagValue(returnBlock, "skybillNumber"),
    pdfBase64: extractTagValue(returnBlock, "pdfEtiquette"),
  };
}

function extractBlocks(xml: string, tag: string): string[] {
  const blocks: string[] = [];
  const regex = new RegExp(
    `<(?:\\w+:)?${tag}[^>]*>([\\s\\S]*?)</(?:\\w+:)?${tag}>`,
    "gi",
  );
  let match: RegExpExecArray | null;
  while ((match = regex.exec(xml)) !== null) {
    blocks.push(match[1] ?? "");
  }
  return blocks;
}

export function pdfBase64ToDataUrl(base64: string): string {
  const trimmed = base64.replace(/\s/g, "");
  return `data:application/pdf;base64,${trimmed}`;
}

export async function callShippingV6(
  envelope: string,
  credentials: Record<string, string>,
): Promise<string> {
  return postChronopostSoapEnvelope({
    endpoint: CHRONOPOST_SHIPPING_ENDPOINT,
    operation: "shippingV6",
    envelope,
    sensitiveFields: credentials,
  });
}

export function validateChronopostLabelInput(input: CreateShipmentLabelInput) {
  return createChronopostLabelInputSchema.safeParse(input);
}
