import { CalendarHeart } from "lucide-react";

import { NewsletterSignupForm } from "@/components/newsletter/newsletter-signup-form";
import {
  ARRIVAGE_NEWSLETTER_PROMISE,
  ARRIVAGE_NEWSLETTER_RAYON_PROMISE,
} from "@/lib/newsletter/copy";
import { cn } from "@/lib/utils";

interface ArrivageNewsletterCtaProps {
  source: string;
  variant?: "default" | "rayon";
  categoryName?: string;
  className?: string;
  notifyHeading?: string;
}

export function ArrivageNewsletterCta({
  source,
  variant = "default",
  categoryName,
  className,
  notifyHeading = "Me prévenir",
}: ArrivageNewsletterCtaProps) {
  const description =
    variant === "rayon" && categoryName
      ? `${ARRIVAGE_NEWSLETTER_RAYON_PROMISE} Rayon ${categoryName.toLowerCase()}.`
      : ARRIVAGE_NEWSLETTER_PROMISE;

  return (
    <div
      className={cn(
        "border-tilouki-argile/30 bg-tilouki-argile-soft/20 rounded-[var(--radius-card)] border p-4 sm:p-5",
        className,
      )}
    >
      <p className="text-tilouki-navy mb-3 inline-flex items-center gap-2 text-sm font-semibold">
        <CalendarHeart className="text-tilouki-pistache size-4 shrink-0" aria-hidden />
        Alerte arrivage du mercredi
      </p>
      <NewsletterSignupForm
        id={`newsletter-${source}`}
        source={source}
        heading={notifyHeading}
        description={description}
        submitLabel="Me prévenir"
        compact
      />
    </div>
  );
}
