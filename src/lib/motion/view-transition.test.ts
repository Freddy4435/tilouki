import { describe, expect, it, vi } from "vitest";

import {
  ritualViewTransitionName,
  runViewTransition,
} from "@/lib/motion/view-transition";

describe("view-transition", () => {
  it("génère un nom stable par rituel", () => {
    expect(ritualViewTransitionName("nuit-calme")).toBe("ritual-nuit-calme");
  });

  it("exécute sans view transition quand l'API est absente", () => {
    const update = vi.fn();
    runViewTransition(update);
    expect(update).toHaveBeenCalledOnce();
  });
});
