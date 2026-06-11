import { describe, expect, it } from "vitest";

import { parseEuroToCents } from "@/lib/admin/euro-parse";
import { parseCsvContent, validateCsvHeaders } from "@/lib/admin/csv-parse";
import { importRowSchema } from "@/lib/validations/product-import";

describe("parseEuroToCents", () => {
  it("accepte la virgule française", () => {
    expect(parseEuroToCents("19,90")).toBe(1990);
    expect(parseEuroToCents("8,5")).toBe(850);
  });

  it("accepte le point décimal", () => {
    expect(parseEuroToCents("29.90")).toBe(2990);
  });
});

describe("parseCsvContent", () => {
  it("détecte le point-virgule", () => {
    const csv = `reference;category;name;description;material;season;made_in;gender;color;size_label;age_label;price_eur;cost_eur;stock_quantity;weight_grams;image_url
REF;Robes;Robe;Desc;coton;été;FR;fille;rose;4A;4 ans;19,90;8,00;2;120,`;
    const parsed = parseCsvContent(csv);
    expect(parsed.separator).toBe(";");
    expect(validateCsvHeaders(parsed.headers)).toBeNull();
  });
});

describe("importRowSchema", () => {
  it("convertit price_eur en price_cents", () => {
    const result = importRowSchema.safeParse({
      reference: "TSH-01",
      category: "T-shirts",
      name: "Tee-shirt",
      gender: "fille",
      price_eur: "19,90",
      cost_eur: "8,50",
      stock_quantity: "3",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price_cents).toBe(1990);
      expect(result.data.cost_cents).toBe(850);
    }
  });
});
