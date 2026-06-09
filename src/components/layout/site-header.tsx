import { CartTrigger } from "@/components/cart/cart-trigger";
import { CategoryMenu } from "@/components/layout/category-menu";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SearchBar } from "@/components/layout/search-bar";
import { SiteLogo } from "@/components/layout/site-logo";
import { TrustSection } from "@/components/layout/trust-section";
import { cn } from "@/lib/utils";

interface SiteHeaderProps {
  className?: string;
}

export function SiteHeader({ className }: SiteHeaderProps) {
  return (
    <header className={cn("bg-background sticky top-0 z-50 w-full", className)}>
      <TrustSection variant="bar" className="hidden sm:block" />

      <div
        className="border-border/80 border-b backdrop-blur supports-[backdrop-filter]:bg-background/95"
        style={{ height: "var(--header-height)" }}
      >
        <div className="container-tilouki flex h-full items-center gap-3 md:gap-6">
          <MobileNav />

          <SiteLogo className="shrink-0" />

          <div className="hidden flex-1 justify-center md:flex">
            <SearchBar />
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <SearchBar compact className="md:hidden" />
          <CartTrigger />
          </div>
        </div>
      </div>

      <CategoryMenu />
    </header>
  );
}
