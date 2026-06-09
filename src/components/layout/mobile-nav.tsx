"use client";

import { Menu } from "lucide-react";
import { useState } from "react";

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
      <SheetContent side="left" className="w-[min(100vw-2rem,22rem)] overflow-y-auto p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="sr-only">Menu navigation</SheetTitle>
          <div onClick={() => setOpen(false)}>
            <SiteLogo />
          </div>
        </SheetHeader>

        <div className="space-y-6 p-4">
          <SearchBar placeholder="Rechercher…" />

          <nav aria-label="Navigation principale">
            <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
              Menu
            </p>
            <ul className="space-y-1">
              {mainNavItems.map((item) => (
                <li key={item.href}>
                  <ButtonLink
                    href={item.href}
                    variant="ghost"
                    className="w-full justify-start"
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
            <ul className="space-y-1">
              <li>
                <ButtonLink
                  href="/catalogue"
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => setOpen(false)}
                >
                  Tout voir
                </ButtonLink>
              </li>
              {categories.map((category) => (
                <li key={category.slug}>
                  <ButtonLink
                    href={`/categorie/${category.slug}`}
                    variant="ghost"
                    className="w-full justify-start"
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
            <ul className="space-y-1">
              {footerNavItems.legal.map((item) => (
                <li key={item.href}>
                  <ButtonLink
                    href={item.href}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </ButtonLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
