import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  expirePendingOrders: vi.fn(),
}));

vi.mock("@/lib/supabase/queries/orders", () => ({
  expirePendingOrders: mocks.expirePendingOrders,
}));

vi.mock("@/lib/security/log", () => ({
  logSecure: vi.fn(),
}));

import { GET } from "@/app/api/cron/expire-pending-orders/route";

const CRON_SECRET = "test-cron-secret-with-enough-length-32chars";

function cronRequest(secret?: string): Request {
  const init: RequestInit = {};
  if (secret) {
    init.headers = { Authorization: `Bearer ${secret}` };
  }
  return new Request("http://localhost/api/cron/expire-pending-orders", init);
}

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("GET /api/cron/expire-pending-orders", () => {
  it("refuse sans CRON_SECRET configuré", async () => {
    vi.stubEnv("CRON_SECRET", "");

    const response = await GET(cronRequest(CRON_SECRET));

    expect(response.status).toBe(401);
    expect(mocks.expirePendingOrders).not.toHaveBeenCalled();
  });

  it("refuse sans header Authorization", async () => {
    vi.stubEnv("CRON_SECRET", CRON_SECRET);

    const response = await GET(cronRequest());

    expect(response.status).toBe(401);
    expect(mocks.expirePendingOrders).not.toHaveBeenCalled();
  });

  it("refuse avec un mauvais secret", async () => {
    vi.stubEnv("CRON_SECRET", CRON_SECRET);

    const response = await GET(cronRequest("wrong-secret"));

    expect(response.status).toBe(401);
    expect(mocks.expirePendingOrders).not.toHaveBeenCalled();
  });

  it("libère le stock des commandes pending expirées", async () => {
    vi.stubEnv("CRON_SECRET", CRON_SECRET);
    mocks.expirePendingOrders.mockResolvedValue(2);

    const response = await GET(cronRequest(CRON_SECRET));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true, expired: 2 });
    expect(mocks.expirePendingOrders).toHaveBeenCalledOnce();
  });
});
