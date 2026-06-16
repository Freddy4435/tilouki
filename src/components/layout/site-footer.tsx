"use client";

import { BrandLogo } from "@/components/layout/brand-logo";
import { FooterSocialLinks } from "@/components/layout/footer-social-links";
import { FooterTrustBlock } from "@/components/layout/footer-trust-block";
import { NewsletterSignupForm } from "@/components/layout/newsletter-signup-form";
import { ReassuranceStrip } from "@/components/layout/reassurance-strip";
import { useShop } from "@/components/providers/shop-provider";
import { Separator } from "@/components/ui/separator";
import { footerNavItems } from "@/lib/constants/site";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface SiteFooterProps {
  className?: string;
}

export function SiteFooter({ className }: SiteFooterProps) {
  const { name, description, categories, socialLinks } = useShop();
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn("border-tilouki-mint/25 bg-card mt-auto border-t", className)}
    >
      <div className="border-border/50 bg-tilouki-mint-soft/40 border-b py-5">
        <div className="container-tilouki">
          <ReassuranceStrip variant="pills" />
        </div>
      </div>

      <div className="container-tilouki section-tilouki pb-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-4">
            <BrandLogo variant="footer" alt={`${name} — vêtements enfants`} />
            <p className="sr-only">{name}</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {description}
            </p>
            <FooterSocialLinks links={socialLinks ?? {}} />
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-3">
            <div>
              <p className="text-retail-label text-tilouki-ink-muted mb-3">
                Catégories
              </p>
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
              <p className="text-retail-label text-tilouki-ink-muted mb-3">Boutique</p>
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
              <p className="text-retail-label text-tilouki-ink-muted mb-3">
                Informations légales
              </p>
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

          <div className="border-tilouki-sage/15 bg-tilouki-sage-light/30 rounded-2xl border p-5 lg:col-span-3">
            <NewsletterSignupForm />
          </div>
        </div>

        <div className="my-8">
          <FooterTrustBlock />
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
