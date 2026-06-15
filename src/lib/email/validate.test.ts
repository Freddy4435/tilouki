import { describe, expect, it } from "vitest";

import type { EmailConfig } from "@/lib/email/config";
import { validateEmailEnvironment } from "@/lib/email/validate";

const baseConfig: EmailConfig = {
  provider: "resend",
  from: "Tilouki <commandes@tilouki.fr>",
  adminEmail: "admin@tilouki.fr",
  shopName: "Tilouki",
  siteUrl: "https://tilouki.fr",
  resendApiKey: "re_test_key",
  smtp: null,
};

describe("validateEmailEnvironment", () => {
  it("accepte une config Resend complète", () => {
    const issues = validateEmailEnvironment({
      production: true,
      config: baseConfig,
    });
    expect(issues.filter((issue) => issue.level === "error")).toEqual([]);
  });

  it("refuse un FROM_EMAIL invalide", () => {
    const issues = validateEmailEnvironment({
      config: { ...baseConfig, from: "pas-un-email" },
    });
    expect(issues.some((issue) => issue.message.includes("FROM_EMAIL"))).toBe(true);
  });

  it("avertit si ADMIN_EMAIL absent en dev", () => {
    const issues = validateEmailEnvironment({
      production: false,
      config: { ...baseConfig, adminEmail: null },
    });
    expect(issues.some((issue) => issue.message.includes("ADMIN_EMAIL"))).toBe(true);
    expect(issues.find((issue) => issue.message.includes("ADMIN_EMAIL"))?.level).toBe(
      "warn",
    );
  });

  it("refuse SMTP sans mot de passe", () => {
    const issues = validateEmailEnvironment({
      production: true,
      config: {
        ...baseConfig,
        provider: "smtp",
        resendApiKey: null,
        smtp: {
          host: "smtp.example.com",
          port: 587,
          user: "user",
          password: "",
          secure: false,
        },
      },
    });
    expect(issues.some((issue) => issue.message.includes("SMTP_PASSWORD"))).toBe(true);
  });
});
