import type { ShopSocialLinksInput } from "@/lib/social/validation";
import { hasVisibleSocialLinks } from "@/lib/social/validation";
import { cn } from "@/lib/utils";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={className}
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="5" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.2" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M14 8.5h2.5l-.5 3H14v9h-3.5v-9H9V8.5h1.5V6.8c0-1.8 1-3.3 3.8-3.3H16v3h-1.8c-.9 0-1.2.5-1.2 1.2V8.5Z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M16.5 3c.6 3.1 2.6 4.9 5.5 5.2v3.8c-2.1-.1-4-.7-5.5-1.9v7.5c0 4.2-3.4 6.8-7.1 6.3-3.2-.4-5.6-3.1-5.9-6.3-.4-4.2 2.8-7.7 6.9-7.7.6 0 1.2.1 1.7.2V11c-.5-.2-1.1-.3-1.7-.3-2 0-3.6 1.6-3.6 3.6s1.6 3.6 3.6 3.6 3.6-1.6 3.6-3.6V3h2.5z" />
    </svg>
  );
}

interface FooterSocialLinksProps {
  links: ShopSocialLinksInput;
  className?: string;
}

const SOCIAL_ITEMS = [
  { key: "instagram" as const, label: "Instagram", Icon: InstagramIcon },
  { key: "facebook" as const, label: "Facebook", Icon: FacebookIcon },
  { key: "tiktok" as const, label: "TikTok", Icon: TikTokIcon },
];

export function FooterSocialLinks({ links, className }: FooterSocialLinksProps) {
  if (!hasVisibleSocialLinks(links)) return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-muted-foreground text-xs font-medium">Suivez-nous</span>
      <ul className="flex items-center gap-1.5">
        {SOCIAL_ITEMS.map(({ key, label, Icon }) => {
          const href = links[key];
          if (!href) return null;
          return (
            <li key={key}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary bg-background/80 inline-flex size-9 items-center justify-center rounded-full border transition-colors"
                aria-label={`${label} (nouvelle fenêtre)`}
              >
                <Icon className="size-4" />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
