import { describe, expect, it, beforeEach } from "vitest";

import { useGrowthPassportStore } from "@/lib/growth-passport/store";

describe("growth-passport store", () => {
  beforeEach(() => {
    useGrowthPassportStore.setState({ profiles: [], activeProfileId: null });
  });

  it("enregistre un profil enfant et l'active", () => {
    useGrowthPassportStore.getState().upsertProfile({
      name: "Lina",
      sizeLabel: "4 ans",
    });

    const active = useGrowthPassportStore.getState().activeProfile();
    expect(active?.name).toBe("Lina");
    expect(active?.sizeLabel).toBe("4 ans");
  });
});
