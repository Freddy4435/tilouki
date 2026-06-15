"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { X } from "lucide-react";

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
  subscribeAnnouncementBarDismissal,
} from "@/lib/announcements/session-dismissal";
import type { ShopAnnouncement } from "@/lib/announcements/types";
import { cn } from "@/lib/utils";

interface AnnouncementBarProps {
  enabled: boolean;
  announcements: ShopAnnouncement[];
}

function subscribeToReducedMotionPreference(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getReducedMotionPreference(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionPreferenceServer(): boolean {
  return false;
}

function useAnnouncementBarDismissed() {
  return useSyncExternalStore(
    subscribeAnnouncementBarDismissal,
    isAnnouncementBarDismissedForSession,
    () => false,
  );
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotionPreference,
    getReducedMotionPreference,
    getReducedMotionPreferenceServer,
  );
}

export function AnnouncementBar({ enabled, announcements }: AnnouncementBarProps) {
  const dismissed = useAnnouncementBarDismissed();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [paused, setPaused] = useState(false);
  const [index, setIndex] = useState(0);

  const messages = useMemo(
    () => getActiveAnnouncements(announcements),
    [announcements],
  );
  const messageKey = useMemo(
    () => messages.map((message) => `${message.text}:${message.href ?? ""}`).join("|"),
    [messages],
  );
  const visible = shouldShowAnnouncementBar(enabled, announcements, dismissed);
  const autoRotate = shouldAutoRotateAnnouncements(
    messages.length,
    prefersReducedMotion,
  );
  const [prevMessageKey, setPrevMessageKey] = useState(messageKey);

  if (messageKey !== prevMessageKey) {
    setPrevMessageKey(messageKey);
    setIndex(0);
  }

  const safeIndex = messages.length > 0 ? index % messages.length : 0;
  const current = messages[safeIndex];

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--announcement-bar-height",
      getAnnouncementBarHeightCss(visible),
    );
    return () => {
      document.documentElement.style.setProperty("--announcement-bar-height", "0px");
    };
  }, [visible]);

  useEffect(() => {
    if (!visible || !autoRotate || paused) return;

    const timer = window.setInterval(() => {
      setIndex((currentIndex) =>
        getNextAnnouncementIndex(currentIndex, messages.length),
      );
    }, ANNOUNCEMENT_ROTATION_MS);

    return () => window.clearInterval(timer);
  }, [autoRotate, messages.length, paused, visible]);

  if (!visible || !current) {
    return null;
  }

  const content = (
    <span
      key={prefersReducedMotion ? current.text : `${safeIndex}-${current.text}`}
      className={cn(
        "block truncate px-10 text-center text-sm font-medium",
        !prefersReducedMotion && "animate-in fade-in duration-500",
      )}
    >
      {current.text}
    </span>
  );

  return (
    <div
      className="bg-primary text-primary-foreground relative flex h-[var(--announcement-bar-height)] items-center justify-center"
      role="region"
      aria-label="Annonces boutique"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {current.href ? (
        <Link
          href={current.href}
          className="hover:text-primary-foreground/90 focus-visible:ring-primary-foreground/60 absolute inset-0 flex items-center justify-center focus-visible:ring-2 focus-visible:outline-none"
        >
          {content}
        </Link>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          {content}
        </div>
      )}

      <button
        type="button"
        className="text-primary-foreground/90 hover:text-primary-foreground focus-visible:ring-primary-foreground/60 absolute top-1/2 right-2 z-10 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none"
        aria-label="Fermer les annonces pour cette visite"
        onClick={dismissAnnouncementBarForSession}
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}
