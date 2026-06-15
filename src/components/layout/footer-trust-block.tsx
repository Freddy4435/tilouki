"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { useShop } from "@/components/providers/shop-provider";
import { buildFooterTrustLinks } from "@/lib/legal/trust-content";

export function FooterTrustBlock() {
  const shop = useShop();
  const links = buildFooterTrustLinks(shop);

  return (
    <section
      className="border-tilouki-sage/15 bg-tilouki-sage-light/20 rounded-2xl border p-5"
      aria-labelledby="footer-trust-title"
    >
      <h2
        id="footer-trust-title"
        className="text-retail-label text-tilouki-ink-muted mb-4"
      >
        Contact, livraison & garanties
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((item) => (
          <li key={item.id} className="flex gap-3">
            <span className="bg-tilouki-jade-soft text-tilouki-teal-dark flex size-9 shrink-0 items-center justify-center rounded-lg">
              <item.icon className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-semibold">{item.label}</p>
              {item.href ? (
                item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary inline-flex items-start gap-1 text-sm leading-relaxed transition-colors"
                  >
                    <span>{item.description}</span>
                    <ExternalLink className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                  </a>
                ) : item.href.startsWith("mailto:") || item.href.startsWith("tel:") ? (
                  <a
                    href={item.href}
                    className="text-muted-foreground hover:text-primary text-sm leading-relaxed transition-colors"
                  >
                    {item.description}
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-primary text-sm leading-relaxed transition-colors"
                  >
                    {item.description}
                  </Link>
                )
              ) : (
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
