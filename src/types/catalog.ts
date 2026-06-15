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
  secondaryImageUrl?: string | null;
  secondaryImageAlt?: string | null;
  categorySlug: string | null;
  categoryName: string | null;
  season: string | null;
  material: string | null;
  sizes: string[];
  ageLabels: string[];
  totalStock: number;
  badges: ProductBadgeType[];
  createdAt: string;
  colorOptions?: ProductCardColorOption[];
  quickAddVariants?: ProductQuickAddVariant[];
  ratingAverage?: number | null;
  ratingCount?: number;
}

export interface ProductCardColorOption {
  color: string;
  imageUrl: string | null;
}

export interface ProductQuickAddVariant {
  id: string;
  sizeLabel: string | null;
  ageLabel: string | null;
  color: string | null;
  priceCents: number;
  stockQuantity: number;
  sku: string;
  weightGrams: number | null;
}

export type ProductReviewStatus = "pending" | "published" | "rejected";

export interface ProductRatingSummary {
  average: number;
  count: number;
}

export interface ProductReview {
  id: string;
  productId: string;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  verifiedPurchase: boolean;
  createdAt: string;
  publishedAt: string | null;
}

export interface ProductReviewAdmin extends ProductReview {
  status: ProductReviewStatus;
  authorEmail: string;
  productName: string;
  productSlug: string;
  orderId: string | null;
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
  sizes?: string[];
  colors?: string[];
  ages?: string[];
  ageBand?: "bebe" | "1-3-ans" | "4-8-ans";
}

export interface CatalogueFacetValue {
  value: string;
  count: number;
}

export interface CatalogueFacets {
  sizes: CatalogueFacetValue[];
  colors: CatalogueFacetValue[];
  ages: CatalogueFacetValue[];
}

export interface PaginatedCatalogueResult extends PaginatedProducts {
  facets: CatalogueFacets;
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
  /** Numéro d'expédition transporteur (lien de suivi public). */
  shippingNumber: string | null;
  relayPointZip: string | null;
  /** Transporteur de la commande (mondial_relay, chronopost…). */
  shippingProvider: string | null;
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
  /** Transporteur choisi à l'étape livraison — Mondial Relay par défaut. */
  carrier?: "mondial_relay" | "chronopost";
  /** Ignoré — recalculé côté serveur depuis Supabase. */
  shippingCents?: number;
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
