import { afterEach, describe, expect, it, vi } from "vitest";

import type {
  CreateShipmentLabelInput,
  ShipmentLabel,
} from "@/lib/shipping/types";
import type { AdminOrderDetail } from "@/lib/supabase/queries/admin/orders";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  getAdminOrder: vi.fn(),
  getAdminSupabase: vi.fn(),
  getAdminShopSettings: vi.fn(),
  createShipmentLabel:
    vi.fn<(input: CreateShipmentLabelInput) => Promise<ShipmentLabel>>(),
  sendShippingConfirmation: vi.fn(),
  revalidatePath: vi.fn(),
  logSecure: vi.fn(),
  ordersUpdateEq: vi.fn(),
  historyInsert: vi.fn(),
  ordersUpdate: vi.fn(),
  shipmentsUpsert: vi.fn(),
  hasCreateShipmentLabel: { value: true },
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/server/auth", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/lib/supabase/queries/admin/orders", () => ({
  getAdminOrder: mocks.getAdminOrder,
}));
vi.mock("@/lib/supabase/queries/admin/client", () => ({
  getAdminSupabase: mocks.getAdminSupabase,
}));
vi.mock("@/lib/supabase/queries/admin/settings", () => ({
  getAdminShopSettings: mocks.getAdminShopSettings,
}));
vi.mock("@/lib/email", () => ({
  sendShippingConfirmation: mocks.sendShippingConfirmation,
}));
vi.mock("@/lib/security/log", () => ({ logSecure: mocks.logSecure }));
vi.mock("@/lib/shipping/provider", () => ({
  getShippingProvider: () =>
    mocks.hasCreateShipmentLabel.value
      ? {
          name: "mondial_relay" as const,
          searchRelayPoints: vi.fn(),
          createShipmentLabel: mocks.createShipmentLabel,
        }
      : { name: "unconfigured" as const, searchRelayPoints: vi.fn() },
}));

import { ShipmentLabelError } from "@/lib/shipping/errors";
import { createShippingLabelAction } from "@/server/actions/admin/orders";

const ORDER_ID = "11111111-2222-4333-8444-555555555555";

function buildOrder(overrides: Partial<AdminOrderDetail> = {}): AdminOrderDetail {
  return {
    id: ORDER_ID,
    orderNumber: "TLK-2026-0042",
    customerName: "Jeanne Dupont",
    customerFirstName: "Jeanne",
    customerLastName: "Dupont",
    customerEmail: "jeanne@example.com",
    customerPhone: "0612345678",
    status: "paid",
    paymentStatus: "paid",
    totalCents: 4500,
    subtotalCents: 4000,
    shippingCents: 500,
    discountCents: 0,
    currency: "EUR",
    trackingNumber: null,
    shippingNumber: null,
    shippingLabelUrl: null,
    labelCreatedAt: null,
    trackingToken: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    stripeSessionId: null,
    stripePaymentIntentId: null,
    relayPointId: "012417",
    relayPointName: "BODHI TELECOM",
    relayPointAddress: "2 RUE DE MULHOUSE",
    relayPointZip: "75002",
    relayPointCity: "PARIS",
    relayPointCountry: "FR",
    shippingProvider: "mondial_relay",
    shippingMethod: "relay_point",
    totalWeightGrams: 800,
    shippingRateLabel: null,
    relayPointLabel: "BODHI TELECOM (PARIS)",
    internalNotes: null,
    createdAt: "2026-06-01T10:00:00Z",
    statusHistory: [],
    items: [],
    ...overrides,
  };
}

function setupHappyPath(orderOverrides: Partial<AdminOrderDetail> = {}) {
  mocks.requireAdmin.mockResolvedValue({ id: "admin-1", email: "admin@tilouki.fr" });
  mocks.getAdminOrder.mockResolvedValue(buildOrder(orderOverrides));
  mocks.getAdminShopSettings.mockResolvedValue({
    id: "settings-1",
    shopName: "Tilouki",
    legalName: "Tilouki SARL",
    address: "10 rue des Lilas, 44000 Nantes",
    email: "contact@tilouki.fr",
    phone: "0240000000",
  });
  mocks.ordersUpdateEq.mockResolvedValue({ error: null });
  mocks.ordersUpdate.mockReturnValue({ eq: mocks.ordersUpdateEq });
  mocks.shipmentsUpsert.mockResolvedValue({ error: null });
  mocks.historyInsert.mockResolvedValue({ error: null });
  mocks.getAdminSupabase.mockResolvedValue({
    from: (table: string) => {
      if (table === "orders") return { update: mocks.ordersUpdate };
      if (table === "shipments") return { upsert: mocks.shipmentsUpsert };
      return { insert: mocks.historyInsert };
    },
  });
  mocks.createShipmentLabel.mockResolvedValue({
    shipmentNumber: "12345678",
    labelUrl:
      "https://www.mondialrelay.com/ww2/PDF/StickerMaker2.aspx?ens=XX&expedition=12345678&format=A4&crc=ABC",
  });
  mocks.sendShippingConfirmation.mockResolvedValue(undefined);
}

afterEach(() => {
  vi.clearAllMocks();
  mocks.hasCreateShipmentLabel.value = true;
});

describe("createShippingLabelAction — garde-fous", () => {
  it("refuse une commande non payée", async () => {
    setupHappyPath({ paymentStatus: "pending", status: "pending" });

    const result = await createShippingLabelAction({ orderId: ORDER_ID });

    expect(result.error).toContain("payée");
    expect(mocks.createShipmentLabel).not.toHaveBeenCalled();
  });

  it("refuse une commande déjà expédiée", async () => {
    setupHappyPath({ status: "shipped" });

    const result = await createShippingLabelAction({ orderId: ORDER_ID });

    expect(result.error).toBeTruthy();
    expect(mocks.createShipmentLabel).not.toHaveBeenCalled();
  });

  it("refuse si une étiquette existe déjà", async () => {
    setupHappyPath({ shippingNumber: "87654321" });

    const result = await createShippingLabelAction({ orderId: ORDER_ID });

    expect(result.error).toContain("déjà été générée");
    expect(mocks.createShipmentLabel).not.toHaveBeenCalled();
  });

  it("refuse sans point relais complet", async () => {
    setupHappyPath({ relayPointId: null });

    const result = await createShippingLabelAction({ orderId: ORDER_ID });

    expect(result.error).toContain("Point relais");
    expect(mocks.createShipmentLabel).not.toHaveBeenCalled();
  });

  it("refuse sans poids exploitable", async () => {
    setupHappyPath({ totalWeightGrams: null });

    const result = await createShippingLabelAction({ orderId: ORDER_ID });

    expect(result.error).toContain("Poids");
    expect(mocks.createShipmentLabel).not.toHaveBeenCalled();
  });

  it("refuse si l'adresse boutique est inexploitable", async () => {
    setupHappyPath();
    mocks.getAdminShopSettings.mockResolvedValue({
      id: "settings-1",
      shopName: "Tilouki",
      legalName: null,
      address: "adresse incomplète sans code postal",
      email: null,
      phone: null,
    });

    const result = await createShippingLabelAction({ orderId: ORDER_ID });

    expect(result.error).toContain("Adresse expéditeur");
    expect(mocks.createShipmentLabel).not.toHaveBeenCalled();
  });

  it("refuse si le provider ne sait pas créer d'étiquette", async () => {
    setupHappyPath();
    mocks.hasCreateShipmentLabel.value = false;

    const result = await createShippingLabelAction({ orderId: ORDER_ID });

    expect(result.error).toContain("n'est pas disponible");
  });
});

describe("createShippingLabelAction — succès", () => {
  it("génère, persiste, passe en shipped et envoie l'e-mail (commande paid)", async () => {
    setupHappyPath();

    const result = await createShippingLabelAction({ orderId: ORDER_ID });

    expect(result.error).toBeUndefined();
    expect(result.shipmentNumber).toBe("12345678");
    expect(result.labelUrl).toContain("StickerMaker2.aspx");

    expect(mocks.createShipmentLabel).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: ORDER_ID,
        relayPointId: "012417",
        relayPointCountry: "FR",
        weightGrams: 800,
        deliveryMode: "24R",
        sender: expect.objectContaining({
          name: "Tilouki SARL",
          street: "10 rue des Lilas",
          zip: "44000",
          city: "Nantes",
        }),
        recipient: expect.objectContaining({
          name: "Jeanne Dupont",
          zip: "75002",
          city: "PARIS",
        }),
      }),
    );

    expect(mocks.ordersUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "shipped",
        shipping_number: "12345678",
        tracking_number: "12345678",
        shipping_label_url: expect.stringContaining("mondialrelay.com"),
        label_created_at: expect.any(String),
        shipped_at: expect.any(String),
      }),
    );
    expect(mocks.shipmentsUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        order_id: ORDER_ID,
        carrier_shipment_number: "12345678",
        status: "shipped",
      }),
      { onConflict: "order_id" },
    );

    // Machine d'états respectée : paid → preparing → shipped (2 entrées d'historique).
    expect(mocks.historyInsert).toHaveBeenCalledTimes(2);
    expect(mocks.historyInsert).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ from_status: "paid", to_status: "preparing" }),
    );
    expect(mocks.historyInsert).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ from_status: "preparing", to_status: "shipped" }),
    );

    expect(mocks.sendShippingConfirmation).toHaveBeenCalledTimes(1);
    expect(mocks.revalidatePath).toHaveBeenCalled();
  });

  it("ne crée qu'une transition pour une commande déjà en préparation", async () => {
    setupHappyPath({ status: "preparing" });

    const result = await createShippingLabelAction({ orderId: ORDER_ID });

    expect(result.error).toBeUndefined();
    expect(mocks.historyInsert).toHaveBeenCalledTimes(1);
    expect(mocks.historyInsert).toHaveBeenCalledWith(
      expect.objectContaining({ from_status: "preparing", to_status: "shipped" }),
    );
  });

  it("n'échoue pas si l'e-mail d'expédition échoue", async () => {
    setupHappyPath();
    mocks.sendShippingConfirmation.mockRejectedValue(new Error("smtp down"));

    const result = await createShippingLabelAction({ orderId: ORDER_ID });

    expect(result.error).toBeUndefined();
    expect(result.shipmentNumber).toBe("12345678");
  });
});

describe("createShippingLabelAction — erreurs provider", () => {
  it("remonte le message d'une ShipmentLabelError sans persister", async () => {
    setupHappyPath();
    mocks.createShipmentLabel.mockRejectedValue(
      new ShipmentLabelError(
        "Mondial Relay a refusé l'expédition : Poids du colis invalide.",
        "validation",
      ),
    );

    const result = await createShippingLabelAction({ orderId: ORDER_ID });

    expect(result.error).toContain("Poids du colis invalide");
    expect(mocks.ordersUpdate).not.toHaveBeenCalled();
    expect(mocks.sendShippingConfirmation).not.toHaveBeenCalled();
  });

  it("remonte l'erreur Chronopost si l'API automatique n'est pas disponible", async () => {
    setupHappyPath({ shippingProvider: "chronopost" });
    mocks.createShipmentLabel.mockRejectedValue(
      new ShipmentLabelError(
        "La génération automatique d'étiquette Chronopost n'est pas encore disponible.",
        "configuration",
      ),
    );

    const result = await createShippingLabelAction({ orderId: ORDER_ID });

    expect(result.error).toContain("Chronopost");
    expect(mocks.ordersUpdate).not.toHaveBeenCalled();
  });

  it("masque les erreurs inattendues du provider", async () => {
    setupHappyPath();
    mocks.createShipmentLabel.mockRejectedValue(new Error("stack interne"));

    const result = await createShippingLabelAction({ orderId: ORDER_ID });

    expect(result.error).toBe("Génération de l'étiquette impossible. Réessayez plus tard.");
    expect(result.error).not.toContain("stack interne");
    expect(mocks.ordersUpdate).not.toHaveBeenCalled();
  });
});
