import { describe, expect, it } from "vitest";

import { STRIPE_WEBHOOK_EVENT_TYPES } from "@/lib/stripe/webhook/events";

describe("STRIPE_WEBHOOK_EVENT_TYPES", () => {
  it("couvre les événements production requis", () => {
    expect([...STRIPE_WEBHOOK_EVENT_TYPES]).toEqual([
      "checkout.session.completed",
      "checkout.session.expired",
      "payment_intent.payment_failed",
      "charge.refunded",
    ]);
  });
});
