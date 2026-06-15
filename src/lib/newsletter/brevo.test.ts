import { afterEach, describe, expect, it, vi } from "vitest";

import { getBrevoConfig, syncContactToBrevo } from "@/lib/newsletter/brevo";

describe("brevo — configuration optionnelle", () => {
  const originalApiKey = process.env.BREVO_API_KEY;
  const originalListId = process.env.BREVO_LIST_ID;

  afterEach(() => {
    process.env.BREVO_API_KEY = originalApiKey;
    process.env.BREVO_LIST_ID = originalListId;
    vi.unstubAllGlobals();
  });

  it("retourne null sans variables d'environnement", () => {
    delete process.env.BREVO_API_KEY;
    delete process.env.BREVO_LIST_ID;
    expect(getBrevoConfig()).toBeNull();
  });

  it("ignore une synchronisation si Brevo est absent", async () => {
    delete process.env.BREVO_API_KEY;
    delete process.env.BREVO_LIST_ID;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await syncContactToBrevo("client@example.com");

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
