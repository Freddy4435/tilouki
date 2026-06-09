export interface OrderEmailItem {
  productName: string;
  sku?: string | null;
  sizeLabel?: string | null;
  ageLabel?: string | null;
  quantity: number;
  unitPriceCents: number;
  totalPriceCents: number;
}

export interface OrderEmailRelayPoint {
  name: string;
  address: string;
  zip: string;
  city: string;
  country?: string | null;
}

export interface OrderEmailPayload {
  orderId: string;
  orderNumber: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone?: string | null;
  subtotalCents: number;
  shippingCents: number;
  discountCents: number;
  totalCents: number;
  currency: string;
  items: OrderEmailItem[];
  relayPoint: OrderEmailRelayPoint;
  trackingToken: string;
  trackingNumber?: string | null;
  siteUrl: string;
  shopName: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}
