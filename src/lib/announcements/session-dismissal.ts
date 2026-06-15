/** Fermeture de la barre d'annonces pour l'onglet courant (mémoire module, pas de storage). */

let dismissedForSession = false;
const listeners = new Set<() => void>();

function notifyListeners() {
  for (const listener of listeners) {
    listener();
  }
}

export function isAnnouncementBarDismissedForSession(): boolean {
  return dismissedForSession;
}

export function dismissAnnouncementBarForSession(): void {
  if (dismissedForSession) return;
  dismissedForSession = true;
  notifyListeners();
}

export function subscribeAnnouncementBarDismissal(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Tests uniquement — réinitialise l'état de session en mémoire. */
export function resetAnnouncementBarDismissalForSession(): void {
  dismissedForSession = false;
  notifyListeners();
}
