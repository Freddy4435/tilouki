"use client";

import { useEffect } from "react";

/** Déclenche la boîte d'impression une fois la page chargée. */
export function PrepSlipPrintTrigger() {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.print();
    }, 200);

    return () => window.clearTimeout(timer);
  }, []);

  return null;
}
