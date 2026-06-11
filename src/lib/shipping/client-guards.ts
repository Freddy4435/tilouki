/** Gardes utilisables côté client (préfixes mock / widget). */

const DEV_MOCK_ID_PREFIXES = ["DEV-MR-", "DEV-CHR-"];
const WIDGET_PLACEHOLDER_PREFIX = "WIDGET-PLACEHOLDER-";

export function isClientRelayPointSelectable(relayPointId: string): boolean {
  const id = relayPointId.trim();
  if (!id) return false;

  if (process.env.NODE_ENV === "production") {
    if (DEV_MOCK_ID_PREFIXES.some((prefix) => id.startsWith(prefix))) return false;
    if (id.startsWith(WIDGET_PLACEHOLDER_PREFIX)) return false;
  }

  return true;
}

export function isDevMockRelayPointId(relayPointId: string): boolean {
  const id = relayPointId.trim();
  return DEV_MOCK_ID_PREFIXES.some((prefix) => id.startsWith(prefix));
}
