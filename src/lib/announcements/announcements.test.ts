import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ANNOUNCEMENT_ROTATION_MS } from "@/lib/announcements/defaults";
import {
  getActiveAnnouncements,
  getAnnouncementBarHeightCss,
  getNextAnnouncementIndex,
  shouldAutoRotateAnnouncements,
  shouldShowAnnouncementBar,
} from "@/lib/announcements/resolve";
import {
  dismissAnnouncementBarForSession,
  isAnnouncementBarDismissedForSession,
  resetAnnouncementBarDismissalForSession,
} from "@/lib/announcements/session-dismissal";
import { parseShopAnnouncementsJson } from "@/lib/announcements/validation";

const sampleAnnouncements = [
  { text: "Message 1", active: true },
  { text: "Message 2", active: true },
  { text: "Message inactif", active: false },
];

describe("announcements — résolution", () => {
  it("ne garde que les messages actifs non vides", () => {
    expect(getActiveAnnouncements(sampleAnnouncements)).toEqual([
      { text: "Message 1", active: true },
      { text: "Message 2", active: true },
    ]);
  });

  it("masque la barre si désactivée ou fermée en session", () => {
    expect(shouldShowAnnouncementBar(true, sampleAnnouncements, false)).toBe(true);
    expect(shouldShowAnnouncementBar(false, sampleAnnouncements, false)).toBe(false);
    expect(shouldShowAnnouncementBar(true, sampleAnnouncements, true)).toBe(false);
  });

  it("ajuste la hauteur CSS de la barre", () => {
    expect(getAnnouncementBarHeightCss(true)).toBe("2.25rem");
    expect(getAnnouncementBarHeightCss(false)).toBe("0px");
  });
});

describe("announcements — rotation", () => {
  it("fait défiler les index par modulo", () => {
    expect(getNextAnnouncementIndex(0, 3)).toBe(1);
    expect(getNextAnnouncementIndex(2, 3)).toBe(0);
  });

  it("n'auto-rotate pas avec prefers-reduced-motion ou un seul message", () => {
    expect(shouldAutoRotateAnnouncements(3, true)).toBe(false);
    expect(shouldAutoRotateAnnouncements(1, false)).toBe(false);
    expect(shouldAutoRotateAnnouncements(2, false)).toBe(true);
  });

  it("utilise un intervalle de 5 secondes", () => {
    expect(ANNOUNCEMENT_ROTATION_MS).toBe(5_000);
  });

  it("simule la rotation temporisée sans reduced motion", () => {
    vi.useFakeTimers();
    let index = 0;
    const rotate = () => {
      index = getNextAnnouncementIndex(index, 2);
    };

    const interval = setInterval(rotate, ANNOUNCEMENT_ROTATION_MS);
    expect(index).toBe(0);
    vi.advanceTimersByTime(ANNOUNCEMENT_ROTATION_MS);
    expect(index).toBe(1);
    vi.advanceTimersByTime(ANNOUNCEMENT_ROTATION_MS);
    expect(index).toBe(0);
    clearInterval(interval);
    vi.useRealTimers();
  });
});

describe("announcements — fermeture session mémoire", () => {
  beforeEach(() => {
    resetAnnouncementBarDismissalForSession();
  });

  afterEach(() => {
    resetAnnouncementBarDismissalForSession();
  });

  it("mémorise la fermeture pour l'onglet courant", () => {
    expect(isAnnouncementBarDismissedForSession()).toBe(false);
    dismissAnnouncementBarForSession();
    expect(isAnnouncementBarDismissedForSession()).toBe(true);
    dismissAnnouncementBarForSession();
    expect(isAnnouncementBarDismissedForSession()).toBe(true);
  });
});

describe("announcements — validation admin", () => {
  it("accepte jusqu'à 3 messages et refuse le 4e", () => {
    const ok = parseShopAnnouncementsJson([
      { text: "A", active: true },
      { text: "B", active: false },
      { text: "C", active: true },
    ]);
    expect(ok.ok).toBe(true);

    const tooMany = parseShopAnnouncementsJson([
      { text: "1", active: true },
      { text: "2", active: true },
      { text: "3", active: true },
      { text: "4", active: true },
    ]);
    expect(tooMany.ok).toBe(false);
  });
});
