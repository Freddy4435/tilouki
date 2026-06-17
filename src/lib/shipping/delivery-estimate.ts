import type { CarrierName } from "@/lib/shipping/types";
import { getCarrierEstimatedDelay } from "@/lib/shipping/delivery-copy";

/** Jours ouvrés de préparation avant expédition (commande avant 14 h). */
export const ORDER_PREPARATION_BUSINESS_DAYS = 2;

const FRENCH_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
};

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/** Ajoute des jours ouvrés (lun–ven) à une date. */
export function addBusinessDays(from: Date, businessDays: number): Date {
  const result = new Date(from);
  let added = 0;
  while (added < businessDays) {
    result.setDate(result.getDate() + 1);
    if (!isWeekend(result)) added += 1;
  }
  return result;
}

export function parseTransitBusinessDays(estimatedDelay: string): {
  minDays: number;
  maxDays: number;
} {
  const match = estimatedDelay.match(/(\d+)\s*à\s*(\d+)/);
  if (match) {
    return {
      minDays: Number.parseInt(match[1] ?? "3", 10),
      maxDays: Number.parseInt(match[2] ?? "5", 10),
    };
  }
  const single = estimatedDelay.match(/(\d+)/);
  const days = single ? Number.parseInt(single[1] ?? "3", 10) : 3;
  return { minDays: days, maxDays: days };
}

export interface DeliveryArrivalEstimate {
  preparationBusinessDays: number;
  transitMinDays: number;
  transitMaxDays: number;
  shipDateMin: Date;
  shipDateMax: Date;
  arrivalDateMin: Date;
  arrivalDateMax: Date;
  arrivalLabel: string;
  transitLabel: string;
}

function formatFrenchDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", FRENCH_DATE_FORMAT);
}

export function estimateDeliveryArrival(
  carrier: CarrierName = "mondial_relay",
  fromDate: Date = new Date(),
): DeliveryArrivalEstimate {
  const transitLabel = getCarrierEstimatedDelay(carrier);
  const { minDays, maxDays } = parseTransitBusinessDays(transitLabel);

  const shipDateMin = addBusinessDays(fromDate, ORDER_PREPARATION_BUSINESS_DAYS);
  const shipDateMax = addBusinessDays(fromDate, ORDER_PREPARATION_BUSINESS_DAYS);
  const arrivalDateMin = addBusinessDays(shipDateMin, minDays);
  const arrivalDateMax = addBusinessDays(shipDateMax, maxDays);

  const arrivalLabel =
    minDays === maxDays
      ? `vers le ${formatFrenchDate(arrivalDateMin)}`
      : `entre le ${formatFrenchDate(arrivalDateMin)} et le ${formatFrenchDate(arrivalDateMax)}`;

  return {
    preparationBusinessDays: ORDER_PREPARATION_BUSINESS_DAYS,
    transitMinDays: minDays,
    transitMaxDays: maxDays,
    shipDateMin,
    shipDateMax,
    arrivalDateMin,
    arrivalDateMax,
    arrivalLabel,
    transitLabel,
  };
}

export function formatDeliveryArrivalSummary(
  carrier: CarrierName = "mondial_relay",
  fromDate?: Date,
): string {
  const estimate = estimateDeliveryArrival(carrier, fromDate);
  return `Réception estimée ${estimate.arrivalLabel} (expédition sous ${estimate.preparationBusinessDays} jours ouvrés, puis ${estimate.transitLabel}).`;
}
