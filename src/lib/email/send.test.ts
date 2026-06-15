import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/email/config", () => ({
  getEmailConfig: vi.fn(),
}));

vi.mock("@/lib/email/providers/resend", () => ({
  createResendProvider: vi.fn(),
}));

import { getEmailConfig } from "@/lib/email/config";
import { createResendProvider } from "@/lib/email/providers/resend";
import { sendEmail } from "@/lib/email/send";

const mocks = {
  getEmailConfig: vi.mocked(getEmailConfig),
  createResendProvider: vi.mocked(createResendProvider),
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("sendEmail", () => {
  it("redirige tous les destinataires en dev si EMAIL_DEV_REDIRECT est défini", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("EMAIL_DEV_REDIRECT", "dev-inbox@example.com");

    const send = vi.fn().mockResolvedValue({ id: "msg-1" });
    mocks.createResendProvider.mockReturnValue({ send });
    mocks.getEmailConfig.mockReturnValue({
      provider: "resend",
      from: "Tilouki <commandes@tilouki.fr>",
      adminEmail: "admin@tilouki.fr",
      shopName: "Tilouki",
      siteUrl: "https://tilouki.fr",
      resendApiKey: "re_test",
      smtp: null,
    });

    const result = await sendEmail({
      to: "client@example.com",
      subject: "Test",
      html: "<p>Hi</p>",
      text: "Hi",
    });

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ to: "dev-inbox@example.com" }),
    );
    expect(result.devRedirected).toBe(true);
  });

  it("ignore sans fournisseur en dev et ne lève pas", async () => {
    vi.stubEnv("NODE_ENV", "development");

    mocks.getEmailConfig.mockReturnValue({
      provider: "none",
      from: "Tilouki <commandes@tilouki.fr>",
      adminEmail: null,
      shopName: "Tilouki",
      siteUrl: "https://tilouki.fr",
      resendApiKey: null,
      smtp: null,
    });

    const result = await sendEmail({
      to: "client@example.com",
      subject: "Test",
      html: "<p>Hi</p>",
      text: "Hi",
    });

    expect(result.skipped).toBe(true);
  });
});
