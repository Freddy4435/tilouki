import type { EmailProviderAdapter, ProviderSendInput, ProviderSendResult } from "@/lib/email/providers/types";

export function createResendProvider(apiKey: string): EmailProviderAdapter {
  return {
    async send(input: ProviderSendInput): Promise<ProviderSendResult> {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: input.from,
          to: input.to,
          subject: input.subject,
          html: input.html,
          text: input.text,
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Échec envoi e-mail Resend (${response.status}) : ${body}`);
      }

      const data = (await response.json()) as { id?: string };
      return { id: data.id ?? "unknown" };
    },
  };
}
