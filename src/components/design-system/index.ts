/**
 * Point d'entrée du design system Tilouki.
 * Importez depuis ce fichier pour les composants métier réutilisables.
 */

export { EmptyState } from "@/components/ui/empty-state";
export {
  ProductBadge,
  ProductBadgeList,
  type ProductBadgeType,
} from "@/components/product/product-badges";
export { SizeAgeBadge, SizeAgeBadgeList } from "@/components/product/size-age-badge";
export { ProductCard, type ProductCardProps } from "@/components/product/product-card";
export {
  ProductCardSkeleton,
  ProductGridSkeleton,
} from "@/components/product/product-card-skeleton";
export { ProductGrid } from "@/components/product/product-grid";
export { CartEmptyState } from "@/components/cart/cart-empty-state";
export { TrustSection } from "@/components/layout/trust-section";
export { ReassuranceStrip } from "@/components/layout/reassurance-strip";
export { HomeValueProps } from "@/components/home/home-value-props";
export { getReassuranceMicrocopy, HOME_VALUE_PROPS } from "@/lib/constants/reassurance";
export { SearchBar } from "@/components/layout/search-bar";
export { CategoryMenu } from "@/components/layout/category-menu";
export { SiteHeader } from "@/components/layout/site-header";
export { SiteFooter } from "@/components/layout/site-footer";
export { SiteLogo } from "@/components/layout/site-logo";
export { useToast } from "@/hooks/use-toast";
