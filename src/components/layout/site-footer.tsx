"use client";

import Link from "next/link";
import { CreditCard, Mail, MapPin, Truck } from "lucide-react";

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
    <footer className={cn("bg-tilouki-beige mt-auto border-t", className)}>
      <div className="container-tilouki section-tilouki pb-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-4">
            <p className="font-heading text-xl font-semibold">{name}</p>
            <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="size-4 shrink-0" aria-hidden />
                <a href={`mailto:${contactEmail}`} className="hover:text-foreground transition-colors">
                  {contactEmail}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0" aria-hidden />
                <span>France — livraison nationale</span>
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
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
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
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
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
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-3">
            <p className="mb-3 text-sm font-semibold">Nos engagements</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm">
                <CreditCard className="text-primary mt-0.5 size-4 shrink-0" aria-hidden />
                <span className="text-muted-foreground">Paiement sécurisé par Stripe</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <Truck className="text-primary mt-0.5 size-4 shrink-0" aria-hidden />
                <span className="text-muted-foreground">Livraison en point relais</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="text-muted-foreground flex flex-col gap-3 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {currentYear} {name}. Tous droits réservés.
          </p>
          <p className="text-center sm:text-right">
            Paiement sécurisé · Point relais · Retour 14 jours · Stock réel
          </p>
        </div>
      </div>
    </footer>
  );
}
