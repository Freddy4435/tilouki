"use client";

import Link from "next/link";
import { Mail, MapPin } from "lucide-react";

import { ReassuranceStrip } from "@/components/layout/reassurance-strip";
import { useShop } from "@/components/providers/shop-provider";
import { Separator } from "@/components/ui/separator";
import { footerNavItems } from "@/lib/constants/site";
import { cn } from "@/lib/utils";

interface SiteFooterProps {
  className?: string;
}

export function SiteFooter({ className }: SiteFooterProps) {
  const { name, description, contactEmail, categories } = useShop();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn("mt-auto border-t border-tilouki-blue/10 bg-card", className)}>
      <div className="border-border/50 border-b bg-gradient-to-r from-tilouki-blue-soft/30 via-background to-tilouki-sage-light/30 py-5">
        <div className="container-tilouki">
          <ReassuranceStrip variant="pills" />
        </div>
      </div>

      <div className="container-tilouki section-tilouki pb-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-4">
            <p className="font-heading text-2xl font-semibold">{name}</p>
            <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
            <ul className="text-muted-foreground space-y-2.5 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="text-tilouki-sage size-4 shrink-0" aria-hidden />
                <a
                  href={`mailto:${contactEmail}`}
                  className="hover:text-foreground font-medium transition-colors"
                >
                  {contactEmail}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="text-tilouki-blue size-4 shrink-0" aria-hidden />
                <span>Expédié depuis la France — livraison nationale</span>
              </li>
            </ul>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-3">
            <div>
              <p className="mb-3 text-sm font-semibold">Catégories</p>
              <ul className="space-y-2">
                {categories.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={item.href}
                      className="text-muted-foreground hover:text-primary text-sm transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold">Boutique</p>
              <ul className="space-y-2">
                {footerNavItems.boutique.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-muted-foreground hover:text-primary text-sm transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold">Informations légales</p>
              <ul className="space-y-2">
                {footerNavItems.legal.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-muted-foreground hover:text-primary text-sm transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-tilouki-sage/15 bg-tilouki-sage-light/30 p-5 lg:col-span-3">
            <p className="mb-3 text-sm font-semibold">Acheter en confiance</p>
            <ReassuranceStrip variant="stack" />
          </div>
        </div>

        <Separator className="my-8" />

        <div className="text-muted-foreground flex flex-col gap-2 text-center text-xs sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p>
            © {currentYear} {name}. Tous droits réservés.
          </p>
          <p>Boutique indépendante — vêtements enfants sélectionnés avec soin.</p>
        </div>
      </div>
    </footer>
  );
}
