import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { isRelayPointIdAllowed } from "@/lib/shipping/checkout";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("isRelayPointIdAllowed", () => {
  it("autorise un identifiant Mondial Relay réel en production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(isRelayPointIdAllowed("012417")).toBe(true);
  });

  it("bloque les points mock DEV-MR- en production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(isRelayPointIdAllowed("DEV-MR-75001-01")).toBe(false);
  });

  it("bloque les points mock DEV-CHR- en production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(isRelayPointIdAllowed("DEV-CHR-69001-01")).toBe(false);
  });

  it("bloque les placeholders widget en production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(isRelayPointIdAllowed("WIDGET-PLACEHOLDER-abc")).toBe(false);
  });

  it("autorise les points mock hors production", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(isRelayPointIdAllowed("DEV-MR-75001-01")).toBe(true);
  });

  it("refuse un identifiant vide", () => {
    expect(isRelayPointIdAllowed("")).toBe(false);
    expect(isRelayPointIdAllowed("   ")).toBe(false);
  });
});
