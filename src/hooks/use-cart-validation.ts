"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { validateCartOnClient } from "@/lib/cart/validate-client";
import { CHECKOUT_CLIENT_MESSAGES } from "@/lib/checkout/client-messages";
import { useCartStore } from "@/lib/cart/store";

interface UseCartValidationOptions {
  enabled?: boolean;
}

export function useCartValidation({ enabled = true }: UseCartValidationOptions = {}) {
  const items = useCartStore((s) => s.items);
  const applyValidation = useCartStore((s) => s.applyValidation);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const validate = useCallback(async () => {
    if (items.length === 0) {
      setError(null);
      return true;
    }

    const currentRequest = ++requestId.current;
    setIsValidating(true);
    setError(null);

    const result = await validateCartOnClient(items);

    if (currentRequest !== requestId.current) return false;

    setIsValidating(false);

    if (!result) {
      setError(CHECKOUT_CLIENT_MESSAGES.stockCheckFailed);
      return false;
    }

    applyValidation(result);
    return result.valid;
  }, [applyValidation, items]);

  const cartKey = items.map((item) => `${item.variantId}:${item.quantity}`).join("|");

  useEffect(() => {
    if (!enabled || items.length === 0) return;
    const timer = window.setTimeout(() => {
      void validate();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [enabled, cartKey, validate, items.length]);

  return { isValidating, error, validate };
}
