import { describe, expect, it } from "vitest";

import { formatResendHttpError } from "@/lib/email/providers/errors";

describe("formatResendHttpError", () => {
  it("masque les adresses e-mail dans le message Resend", () => {
    const message = formatResendHttpError(
      403,
      JSON.stringify({
        message: "The tilouki.fr domain is not verified for client@example.com",
      }),
    );

    expect(message).toContain("HTTP 403");
    expect(message).not.toContain("client@example.com");
    expect(message).toContain("[email]");
  });
});
