/** Durées et courbes partagées — sobres, mobile-friendly. */
export const MOTION_FAST_MS = 180;
export const MOTION_BASE_MS = 320;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Enveloppe une navigation ou mise à jour DOM dans l'API View Transition si disponible.
 * No-op si reduced-motion, SSR, ou navigateur non compatible.
 */
export function runViewTransition(update: () => void | Promise<void>): void {
  if (typeof document === "undefined") {
    void update();
    return;
  }

  if (prefersReducedMotion() || !document.startViewTransition) {
    void update();
    return;
  }

  document.startViewTransition(() => update());
}

export function ritualViewTransitionName(slug: string): string {
  return `ritual-${slug}`;
}
