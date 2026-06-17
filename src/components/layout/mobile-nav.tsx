"use client";

import Link from "next/link";
import {
  Baby,
  BookOpen,
  CloudRain,
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
  "cloud-rain": CloudRain,
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
  prominent = false,
}: {
  link: NavMobileLink;
  contactEmail: string;
  onNavigate: () => void;
  prominent?: boolean;
}) {
  const Icon = link.icon ? MOBILE_LINK_ICONS[link.icon] : null;
  const href = resolveMobileHref(link.href, contactEmail);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={
        prominent
          ? "bg-tilouki-milk text-tilouki-navy border-tilouki-border hover:bg-tilouki-pistache-soft/60 flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-button)] border px-3 text-base font-semibold transition-colors"
          : "text-foreground hover:bg-tilouki-pistache-soft/50 flex min-h-12 items-center gap-3 rounded-[var(--radius-button)] px-3 text-base font-medium transition-colors"
      }
    >
      {Icon && !prominent ? (
        <span className="bg-tilouki-pistache-soft text-tilouki-navy flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-button)]">
          <Icon className="size-4.5" aria-hidden />
        </span>
      ) : Icon && prominent ? (
        <Icon className="size-4.5 shrink-0" aria-hidden />
      ) : null}
      <span>{link.label}</span>
    </Link>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { navigation, contactEmail } = useShop();

  const close = () => setOpen(false);
  const momentsSection = navigation.mobileSections.find((section) => section.id === "moments");

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

          <ButtonLink href="/catalogue" size="lg" className="w-full min-h-12" onClick={close}>
            Voir tout le catalogue
          </ButtonLink>

          {momentsSection ? (
            <nav aria-label={momentsSection.title}>
              <p className="text-retail-label text-tilouki-ink-muted mb-2">
                {momentsSection.title}
              </p>
              <ul className="grid grid-cols-2 gap-2">
                {momentsSection.links.map((link) => (
                  <li key={`moments-${link.href}`}>
                    <MobileNavLink
                      link={link}
                      contactEmail={contactEmail}
                      onNavigate={close}
                      prominent
                    />
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          {navigation.mobileSections
            .filter((section) => section.id !== "moments")
            .map((section) => (
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
