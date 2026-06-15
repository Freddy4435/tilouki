import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  maybeSingle: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  eq: vi.fn(),
  select: vi.fn(),
  from: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: mocks.from,
  }),
}));

vi.mock("@/lib/supabase/env", () => ({
  isSupabaseAdminConfigured: () => true,
}));

vi.mock("@/lib/email/send", () => ({
  sendEmail: vi.fn(async () => ({ id: "email-1", skipped: false })),
}));

import { sendEmail } from "@/lib/email/send";
import { subscribeToNewsletter } from "@/lib/newsletter/service";

function buildChain(result: { data: unknown; error: unknown }) {
  const terminal = { maybeSingle: vi.fn(async () => result) };
  const updateTerminal = { eq: vi.fn(async () => ({ error: null })) };
  const chain = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => terminal),
    insert: vi.fn(async () => ({ error: null })),
    update: vi.fn(() => updateTerminal),
    maybeSingle: terminal.maybeSingle,
  };
  return chain;
}

describe("subscribeToNewsletter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.from.mockImplementation(() => buildChain({ data: null, error: null }));
  });

  it("ignore silencieusement le honeypot", async () => {
    const result = await subscribeToNewsletter({
      email: "bot@example.com",
      consent: true,
      source: "footer",
      website: "https://spam.test",
    });

    expect(result.ok).toBe(true);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("crée une inscription en attente de confirmation", async () => {
    const chain = buildChain({ data: null, error: null });
    mocks.from.mockReturnValue(chain);

    const result = await subscribeToNewsletter({
      email: "client@example.com",
      consent: true,
      source: "footer",
    });

    expect(result.ok).toBe(true);
    expect(chain.insert).toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalled();
  });

  it("signale une adresse déjà confirmée sans révéler d'erreur", async () => {
    const chain = buildChain({
      data: { id: "sub-1", status: "confirmed" },
      error: null,
    });
    mocks.from.mockReturnValue(chain);

    const result = await subscribeToNewsletter({
      email: "client@example.com",
      consent: true,
      source: "footer",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.message).toContain("déjà inscrite");
    }
    expect(sendEmail).not.toHaveBeenCalled();
  });
});
