#!/usr/bin/env node
/**
 * Smoke test manuel Chronopost Pickup — JAMAIS en CI.
 *
 * Valide l'intégration SOAP (recherchePointChronopost) avec de vrais identifiants.
 *
 * Usage :
 *   CHRONOPOST_ACCOUNT_NUMBER=12345678 CHRONOPOST_PASSWORD=xxxxxx node scripts/smoke-chronopost.mjs
 *   CHRONOPOST_ACCOUNT_NUMBER=... CHRONOPOST_PASSWORD=... node scripts/smoke-chronopost.mjs 69001 Lyon
 *
 * Variables : CHRONOPOST_ACCOUNT_NUMBER (8 chiffres), CHRONOPOST_PASSWORD
 */

const RELAY_ENDPOINT =
  "https://ws.chronopost.fr/recherchebt-ws-cxf/PointRelaisServiceWS";
const RELAY_NAMESPACE = "http://cxf.rechercheBt.soap.chronopost.fr/";

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSoapEnvelope(operation, fields) {
  const inner = Object.entries(fields)
    .map(([key, value]) => `<${key}>${escapeXml(value)}</${key}>`)
    .join("");

  return `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:chr="${RELAY_NAMESPACE}">
  <soapenv:Header/>
  <soapenv:Body>
    <chr:${operation}>${inner}</chr:${operation}>
  </soapenv:Body>
</soapenv:Envelope>`;
}

function extractTag(xml, tag) {
  const match = new RegExp(
    `<(?:\\w+:)?${tag}[^>]*>([\\s\\S]*?)</(?:\\w+:)?${tag}>`,
    "i",
  ).exec(xml);
  return match?.[1]?.trim() ?? null;
}

function extractBlocks(xml, tag) {
  const blocks = [];
  const regex = new RegExp(
    `<(?:\\w+:)?${tag}[^>]*>([\\s\\S]*?)</(?:\\w+:)?${tag}>`,
    "gi",
  );
  let match;
  while ((match = regex.exec(xml)) !== null) {
    blocks.push(match[1] ?? "");
  }
  return blocks;
}

function formatShippingDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

async function main() {
  const account = process.env.CHRONOPOST_ACCOUNT_NUMBER?.trim();
  const password = process.env.CHRONOPOST_PASSWORD?.trim();
  const zip = (process.argv[2] ?? "75001").replace(/\s/g, "");
  const city = process.argv[3] ?? "Paris";

  if (!account || !password) {
    console.error(
      "\n  ✗ CHRONOPOST_ACCOUNT_NUMBER et CHRONOPOST_PASSWORD sont requis.\n",
    );
    process.exit(1);
  }

  if (!/^\d{5}$/.test(zip)) {
    console.error(`\n  ✗ Code postal invalide : ${zip}\n`);
    process.exit(1);
  }

  console.log("\nTilouki — smoke test Chronopost Pickup (manuel)\n");
  console.log(`  CP test : ${zip} — ${city}\n`);

  const fields = {
    accountNumber: account,
    password,
    address: "",
    zipCode: zip,
    city,
    countryCode: "FR",
    type: "P",
    service: "L",
    weight: "1000",
    shippingDate: formatShippingDate(new Date()),
    maxPointChronopost: "5",
    maxDistanceSearch: "20",
    holidayTolerant: "1",
  };

  const envelope = buildSoapEnvelope("recherchePointChronopost", fields);

  let response;
  try {
    response = await fetch(RELAY_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: '""',
      },
      body: envelope,
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    console.error(
      "  ✗ Appel réseau en échec :",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }

  if (!response.ok) {
    console.error(
      `  ✗ HTTP ${response.status} — vérifiez vos identifiants Chronopost.\n`,
    );
    process.exit(1);
  }

  const xml = await response.text();
  const returnBlock = extractBlocks(xml, "return")[0] ?? xml;
  const errorCode = extractTag(returnBlock, "errorCode") ?? "700";
  const errorMessage = extractTag(returnBlock, "errorMessage");

  if (errorCode === "1500") {
    console.error("  ✗ Identifiants invalides (code 1500).\n");
    process.exit(1);
  }

  if (errorCode === "601") {
    console.log(
      "  ⚠ Aucun point trouvé (code 601) — intégration OK, zone sans relais.\n",
    );
    process.exit(0);
  }

  if (errorCode !== "0") {
    console.error(
      `  ✗ Erreur Chronopost ${errorCode}${errorMessage ? ` — ${errorMessage}` : ""}\n`,
    );
    process.exit(1);
  }

  const points = extractBlocks(returnBlock, "listePointRelais").map((block) => ({
    id: extractTag(block, "identifiant"),
    name: extractTag(block, "nom"),
    zip: extractTag(block, "codePostal"),
    city: extractTag(block, "localite"),
  }));

  console.log(`  ✓ ${points.length} point(s) trouvé(s)`);
  const first = points[0];
  if (first?.id) {
    console.log(`  Premier : ${first.id} — ${first.name} (${first.zip} ${first.city})`);
  }
  console.log(
    "\n  Intégration SOAP validée. Vous pouvez activer le barème Chronopost dans l'admin.\n",
  );
}

main();
