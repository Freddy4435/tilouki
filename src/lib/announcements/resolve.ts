import type { ShopAnnouncement } from "@/lib/announcements/types";

export function getActiveAnnouncements(
  announcements: ShopAnnouncement[],
): ShopAnnouncement[] {
  return announcements
    .filter((item) => item.active && item.text.trim().length > 0)
    .slice(0, 3);
}

export function shouldShowAnnouncementBar(
  enabled: boolean,
  announcements: ShopAnnouncement[],
  dismissedForSession: boolean,
): boolean {
  if (dismissedForSession || !enabled) return false;
  return getActiveAnnouncements(announcements).length > 0;
}

export function getAnnouncementBarHeightCss(visible: boolean): string {
  return visible ? "2.25rem" : "0px";
}

export function shouldAutoRotateAnnouncements(
  messageCount: number,
  prefersReducedMotion: boolean,
): boolean {
  if (prefersReducedMotion) return false;
  return messageCount > 1;
}

export function getNextAnnouncementIndex(
  currentIndex: number,
  messageCount: number,
): number {
  if (messageCount <= 0) return 0;
  return (currentIndex + 1) % messageCount;
}
