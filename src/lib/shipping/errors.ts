/** Catégorie d'erreur lors de la création d'étiquette transporteur. */
export type ShipmentLabelErrorCategory =
  | "validation"
  | "configuration"
  | "unavailable";

/** Erreur typée de création d'étiquette — message affichable côté admin. */
export class ShipmentLabelError extends Error {
  constructor(
    message: string,
    readonly category: ShipmentLabelErrorCategory,
  ) {
    super(message);
    this.name = "ShipmentLabelError";
  }
}
