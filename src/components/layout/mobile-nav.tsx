"use client";

import Link from "next/link";
import {
  Baby,
  BookOpen,
  Flower2,
  Heart,
  Mail,
  Menu,
  Moon,
  Package,
  RotateCcw,
  Ruler,
  Shirt,
  Sparkles,
  Tag,
  Truck,
} from "lucide-react";
import { useState } from "react";

import { CartTrigger } from "@/components/cart/cart-trigger";
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
import type { NavMobileLink } from "@/lib/navigation/types";

const MOBILE_LINK_ICONS = {
  sparkles: Sparkles,
  baby: Baby,
  "flower-2": Flower2,
  shirt: Shirt,
  moon: Moon,
  package: Package,
  tag: Tag,
  ruler: Ruler,
  truck: Truck,
  "rotate-ccw": RotateCcw,
  heart: Heart,
  mail: Mail,
  "book-open": BookOpen,
} as const;

function resolveMobileHref(href: string, contactEmail: string): string {
  if (href === "__contact__") {
    return `mailto:${contactEmail}`;
  }
  return href;
}

function MobileNavLink({
  link,
  contactEmail,
  onNavigate,
}: {
  link: NavMobileLink;
  contactEmail: string;
  onNavigate: () => void;
}) {
  const Icon = link.icon ? MOBILE_LINK_ICONS[link.icon] : null;
  const href = resolveMobileHref(link.href, contactEmail);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="text-foreground hover:bg-tilouki-jade-soft/50 flex min-h-11 items-center gap-3 rounded-[var(--radius-button)] px-3 text-sm font-medium transition-colors"
    >
      {Icon ? (
        <span className="bg-tilouki-jade-soft text-tilouki-teal-dark flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-button)]">
          <Icon className="size-4" aria-hidden />
        </span>
      ) : null}
      <span>{link.label}</span>
    </Link>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { navigation, contactEmail } = useShop();

  const close = () => setOpen(false);

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
      <SheetContent
        side="left"
        className="flex w-[min(100vw-2rem,22rem)] flex-col p-0 pb-[calc(var(--mobile-bottom-nav-height)+0.75rem)]"
      >
        <SheetHeader className="bg-tilouki-cloud/80 border-b p-4">
          <SheetTitle className="sr-only">Menu navigation</SheetTitle>
          <div className="flex items-center justify-between gap-2">
            <div onClick={close}>
              <SiteLogo />
            </div>
            <div onClick={close}>
              <CartTrigger />
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-5 overflow-y-auto p-4">
          <SearchBar placeholder="Rechercher un vêtement…" />

          <ButtonLink href="/catalogue" size="lg" className="w-full" onClick={close}>
            Voir tout le catalogue
          </ButtonLink>

          {navigation.mobileSections.map((section) => (
            <nav key={section.id} aria-label={section.title}>
              <p className="text-retail-label text-tilouki-ink-muted mb-2">
                {section.title}
              </p>
              <ul className="space-y-0.5">
                {section.links.map((link) => (
                  <li key={`${section.id}-${link.href}-${link.label}`}>
                    <MobileNavLink
                      link={link}
                      contactEmail={contactEmail}
                      onNavigate={close}
                    />
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <Separator />

          <p className="text-muted-foreground text-xs leading-relaxed">
            Boutique indépendante — tailles et stock affichés sur chaque fiche produit.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
