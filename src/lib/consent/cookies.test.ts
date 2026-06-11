import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  COOKIE_CONSENT_KEY,
  parseCookieConsent,
  writeCookieConsent,
} from "@/lib/consent/cookies";

describe("cookie consent", () => {
  const storage = new Map<string, string>();

  const localStorageMock = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value);
    },
    removeItem: (key: string) => {
      storage.delete(key);
    },
    clear: () => storage.clear(),
  };

  beforeEach(() => {
    storage.clear();
    vi.stubGlobal("localStorage", localStorageMock);
    vi.stubGlobal("window", {
      dispatchEvent: vi.fn(),
      localStorage: localStorageMock,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("parse un consentement valide", () => {
    const state = parseCookieConsent(
      JSON.stringify({ essential: true, analytics: true, date: "2026-01-01" }),
    );
    expect(state?.analytics).toBe(true);
  });

  it("rejette un JSON invalide", () => {
    expect(parseCookieConsent("not-json")).toBeNull();
  });

  it("persiste le choix analytics", () => {
    writeCookieConsent(false);
    const raw = storage.get(COOKIE_CONSENT_KEY);
    expect(raw).toBeTruthy();
    expect(parseCookieConsent(raw ?? null)?.analytics).toBe(false);
  });
});
