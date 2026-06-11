"use client";

import { Menu, ShoppingBag } from "lucide-react";
import { useState } from "react";

import { CartTrigger } from "@/components/cart/cart-trigger";
import { ReassuranceStrip } from "@/components/layout/reassurance-strip";
import { SearchBar } from "@/components/layout/search-bar";
import { SiteLogo } from "@/components/layout/site-logo";
import { useShop } from "@/components/providers/shop-provider";
import { ButtonLink } from "@/components/ui/button-link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { footerNavItems, mainNavItems } from "@/lib/constants/site";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { categories } = useShop();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="md:hidden"
        render={
          <Button variant="ghost" size="icon" aria-label="Ouvrir le menu">
            <Menu className="size-5" />
          </Button>
        }
      />
      <SheetContent side="left" className="flex w-[min(100vw-2rem,22rem)] flex-col p-0">
        <SheetHeader className="border-b bg-tilouki-cream/50 p-4">
          <SheetTitle className="sr-only">Menu navigation</SheetTitle>
          <div className="flex items-center justify-between gap-2">
            <div onClick={() => setOpen(false)}>
              <SiteLogo />
            </div>
            <div onClick={() => setOpen(false)}>
              <CartTrigger />
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-5 overflow-y-auto p-4">
          <SearchBar placeholder="Rechercher un vêtement…" />

          <ButtonLink
            href="/catalogue"
            size="lg"
            className="w-full rounded-full"
            onClick={() => setOpen(false)}
          >
            <ShoppingBag className="size-4" />
            Voir le catalogue
          </ButtonLink>

          <nav aria-label="Navigation principale">
            <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
              Menu
            </p>
            <ul className="space-y-0.5">
              {mainNavItems.map((item) => (
                <li key={item.href}>
                  <ButtonLink
                    href={item.href}
                    variant="ghost"
                    className="h-10 w-full justify-start rounded-xl px-3"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </ButtonLink>
                </li>
              ))}
            </ul>
          </nav>

          <Separator />

          <nav aria-label="Catégories">
            <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
              Catégories
            </p>
            <ul className="flex flex-wrap gap-2">
              <li>
                <ButtonLink
                  href="/catalogue"
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => setOpen(false)}
                >
                  Tout voir
                </ButtonLink>
              </li>
              {categories.map((category) => (
                <li key={category.slug}>
                  <ButtonLink
                    href={`/categorie/${category.slug}`}
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => setOpen(false)}
                  >
                    {category.label}
                  </ButtonLink>
                </li>
              ))}
            </ul>
          </nav>

          <Separator />

          <nav aria-label="Liens légaux">
            <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
              Informations
            </p>
            <ul className="space-y-0.5">
              {footerNavItems.legal.map((item) => (
                <li key={item.href}>
                  <ButtonLink
                    href={item.href}
                    variant="ghost"
                    size="sm"
                    className="h-9 w-full justify-start rounded-lg px-3 text-muted-foreground"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </ButtonLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="border-t bg-tilouki-beige/40 p-4">
          <ReassuranceStrip variant="stack" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
