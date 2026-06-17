import { Suspense } from "react";

import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { AccountTrigger } from "@/components/account/account-trigger";
import { HeaderReassuranceNav } from "@/components/layout/header-reassurance-nav";
import { CartTrigger } from "@/components/cart/cart-trigger";
import { FavoritesTrigger } from "@/components/favorites/favorites-trigger";
import { CategoryMenu } from "@/components/layout/category-menu";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SearchBar } from "@/components/layout/search-bar";
import { SiteLogo } from "@/components/layout/site-logo";
import { cn } from "@/lib/utils";
import type { ShopAnnouncement } from "@/lib/announcements/types";

interface SiteHeaderProps {
  className?: string;
  announcementsEnabled?: boolean;
  announcements?: ShopAnnouncement[];
}

export function SiteHeader({
  className,
  announcementsEnabled = false,
  announcements = [],
}: SiteHeaderProps) {
  return (
    <header className={cn("bg-background sticky top-0 z-50 w-full", className)}>
      <div className="brand-header-stripe" aria-hidden />
      <AnnouncementBar enabled={announcementsEnabled} announcements={announcements} />
      <div className="border-border/40 bg-tilouki-mint-soft/50 hidden border-b py-2 md:block">
        <div className="container-tilouki flex items-center justify-between gap-4">
          <p className="text-muted-foreground text-xs leading-snug sm:text-sm">
            Boutique indépendante — vêtements enfants sélectionnés avec soin, expédiés
            depuis la France.
          </p>
          <HeaderReassuranceNav />
        </div>
      </div>

      <div
        className="border-border/80 supports-[backdrop-filter]:bg-background/95 border-b backdrop-blur"
        style={{ height: "var(--header-height)" }}
      >
        <div className="container-tilouki flex h-full items-center gap-3 md:gap-6">
          <MobileNav />

          <SiteLogo className="shrink-0" priority />

          <div className="hidden flex-1 justify-center md:flex">
            <Suspense
              fallback={
                <div className="bg-muted h-10 max-w-md flex-1 animate-pulse rounded-full" />
              }
            >
              <SearchBar />
            </Suspense>
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <Suspense fallback={null}>
              <SearchBar compact className="md:hidden" />
            </Suspense>
            <FavoritesTrigger />
            <AccountTrigger />
            <CartTrigger />
          </div>
        </div>
      </div>

      <Suspense fallback={null}>
        <CategoryMenu />
      </Suspense>
    </header>
  );
}
