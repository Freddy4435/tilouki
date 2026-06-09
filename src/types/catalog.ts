import type { ProductBadgeType } from "@/components/product/product-badges";
import type { ProductGender } from "@/types/database";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  sku: string;
  sizeLabel: string | null;
  ageLabel: string | null;
  color: string | null;
  priceCents: number;
  compareAtPriceCents: number | null;
  stockQuantity: number;
  weightGrams: number | null;
  isActive: boolean;
}

export interface ProductListItem {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  minPriceCents: number;
  compareAtPriceCents: number | null;
  primaryImageUrl: string | null;
  primaryImageAlt: string | null;
  categorySlug: string | null;
  categoryName: string | null;
  season: string | null;
  material: string | null;
  sizes: string[];
  ageLabels: string[];
  totalStock: number;
  badges: ProductBadgeType[];
  createdAt: string;
}

export type ProductSort = "newest" | "price_asc" | "price_desc" | "name_asc";

export interface CatalogueQuery {
  categorySlug?: string;
  gender?: ProductGender;
  season?: string;
  query?: string;
  minPriceCents?: number;
  maxPriceCents?: number;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
  promo?: "petit-prix";
}

export interface PaginatedProducts {
  items: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface OrderTrackingInfo {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalCents: number;
  currency: string;
  createdAt: string;
  trackingNumber: string | null;
}

export interface ProductDetail extends ProductListItem {
  description: string | null;
  brandLabel: string;
  madeIn: string | null;
  careInstructions: string | null;
  gender: ProductGender;
  seoTitle: string | null;
  seoDescription: string | null;
  categoryId: string | null;
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface ProductFilters {
  categorySlug?: string;
  gender?: ProductGender;
  season?: string;
  query?: string;
  minPriceCents?: number;
  maxPriceCents?: number;
  limit?: number;
  offset?: number;
}

export interface LegalPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  updatedAt: string;
}

export interface RelayPointInput {
  id: string;
  name: string;
  address: string;
  zip: string;
  city: string;
  country: string;
}

export interface CheckoutLineItem {
  variantId: string;
  quantity: number;
}

export interface CreateOrderInput {
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone: string | null;
  items: CheckoutLineItem[];
  relayPoint: RelayPointInput;
  shippingCents: number;
  discountCents?: number;
  currency?: string;
}

export interface CreatedOrder {
  id: string;
  orderNumber: string;
  trackingToken: string;
  subtotalCents: number;
  shippingCents: number;
  discountCents: number;
  totalCents: number;
  currency: string;
}
