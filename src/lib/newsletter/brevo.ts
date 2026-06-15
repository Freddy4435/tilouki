import "server-only";

import { logSecure } from "@/lib/security/log";

export interface BrevoConfig {
  apiKey: string;
  listId: number;
}

export function getBrevoConfig(): BrevoConfig | null {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const listIdRaw = process.env.BREVO_LIST_ID?.trim();
  if (!apiKey || !listIdRaw) return null;

  const listId = Number.parseInt(listIdRaw, 10);
  if (!Number.isFinite(listId) || listId <= 0) return null;

  return { apiKey, listId };
}

export async function syncContactToBrevo(email: string): Promise<void> {
  const config = getBrevoConfig();
  if (!config) return;

  try {
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": config.apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        email,
        listIds: [config.listId],
        updateEnabled: true,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      logSecure("warn", "Échec synchronisation Brevo", {
        status: response.status,
        body: body.slice(0, 200),
      });
      return;
    }

    logSecure("info", "Contact newsletter synchronisé vers Brevo", {
      email: "[email]",
    });
  } catch (error) {
    logSecure("warn", "Erreur réseau Brevo", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
