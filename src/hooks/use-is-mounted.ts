"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

export function useIsMounted(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
