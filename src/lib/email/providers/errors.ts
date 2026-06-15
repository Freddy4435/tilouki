import { redactSecrets } from "@/lib/security/log";

/** Message d'erreur fournisseur sans adresses e-mail ni secrets. */
export function sanitizeProviderErrorMessage(message: string): string {
  return redactSecrets(message);
}

export function formatResendHttpError(status: number, body: string): string {
  let detail = body.trim();

  try {
    const parsed = JSON.parse(body) as { message?: string };
    if (parsed.message) {
      detail = parsed.message;
    }
  } catch {
    // corps non JSON — on garde le texte brut (tronqué ci-dessous)
  }

  const safe = sanitizeProviderErrorMessage(detail).slice(0, 200);
  return `Échec envoi e-mail Resend (HTTP ${status})${safe ? ` : ${safe}` : ""}`;
}
