/** Parse CSV avec support virgule/point-virgule, guillemets et BOM UTF-8. */

export type CsvSeparator = "," | ";";

export const CSV_IMPORT_HEADERS = [
  "reference",
  "category",
  "name",
  "description",
  "material",
  "season",
  "made_in",
  "gender",
  "color",
  "size_label",
  "age_label",
  "price_eur",
  "cost_eur",
  "stock_quantity",
  "weight_grams",
  "image_url",
] as const;

const EXPECTED_HEADERS = CSV_IMPORT_HEADERS;

export function stripBom(text: string): string {
  return text.replace(/^\uFEFF/, "");
}

export function detectSeparator(headerLine: string): CsvSeparator {
  const commas = (headerLine.match(/,/g) ?? []).length;
  const semicolons = (headerLine.match(/;/g) ?? []).length;
  return semicolons > commas ? ";" : ",";
}

function parseCsvRow(line: string, separator: CsvSeparator): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === separator) {
      fields.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  fields.push(current.trim());
  return fields;
}

/** Découpe le contenu en lignes en respectant les retours à la ligne dans les champs quotés. */
function splitCsvLines(content: string): string[] {
  const lines: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    const next = content[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '""';
        i += 1;
      } else {
        inQuotes = !inQuotes;
        current += char;
      }
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      if (current.trim()) lines.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  if (current.trim()) lines.push(current);
  return lines;
}

export interface ParsedCsv {
  headers: string[];
  rows: Record<string, string>[];
  separator: CsvSeparator;
}

export function parseCsvContent(content: string): ParsedCsv {
  const normalized = stripBom(content).trim();
  if (!normalized) {
    return { headers: [], rows: [], separator: "," };
  }

  const rawLines = splitCsvLines(normalized);
  const separator = detectSeparator(rawLines[0] ?? "");
  const headerFields = parseCsvRow(rawLines[0] ?? "", separator).map((h) =>
    h.toLowerCase().trim(),
  );

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < rawLines.length; i += 1) {
    const fields = parseCsvRow(rawLines[i], separator);
    if (fields.every((f) => !f)) continue;

    const record: Record<string, string> = {};
    headerFields.forEach((header, index) => {
      record[header] = fields[index] ?? "";
    });
    rows.push(record);
  }

  return { headers: headerFields, rows, separator };
}

export function validateCsvHeaders(headers: string[]): string | null {
  const missing = EXPECTED_HEADERS.filter((h) => !headers.includes(h));
  if (missing.length > 0) {
    return `Colonnes manquantes : ${missing.join(", ")}`;
  }
  return null;
}

export const CSV_IMPORT_TEMPLATE = `reference,category,name,description,material,season,made_in,gender,color,size_label,age_label,price_eur,cost_eur,stock_quantity,weight_grams,image_url
TSH-LICORNE,T-shirts,Tee-shirt licorne rose,"Tee-shirt coton imprimé licorne, doux et confortable",100% coton,toute-saison,Portugal,fille,Rose,3A,3 ans,"19,90","8,50",5,120,https://example.com/tshirt-rose.jpg
TSH-LICORNE,T-shirts,Tee-shirt licorne rose,"Tee-shirt coton imprimé licorne, doux et confortable",100% coton,toute-saison,Portugal,fille,Rose,4A,4 ans,"19,90","8,50",8,125,
TSH-LICORNE,T-shirts,Tee-shirt licorne rose,"Tee-shirt coton imprimé licorne, doux et confortable",100% coton,toute-saison,Portugal,fille,Rose,5A,5 ans,"19,90","8,50",3,130,
ROBE-FLEUR,Robes,Robe fleurie été,Robe légère en coton bio pour l'été,coton bio,printemps-été,France,fille,Imprimé,S,4 ans,"29,90","12,00",2,180,https://example.com/robe.jpg
ROBE-FLEUR,Robes,Robe fleurie été,Robe légère en coton bio pour l'été,coton bio,printemps-été,France,fille,Imprimé,M,6 ans,"29,90","12,00",4,195,`;
