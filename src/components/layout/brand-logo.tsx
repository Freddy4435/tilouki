import Image from "next/image";

import { brandAssets, siteConfig } from "@/lib/constants/site";
import { cn } from "@/lib/utils";

export type BrandLogoVariant = "header" | "footer" | "admin" | "auth" | "mark";

/** Logo horizontal Tilouki.fr (ratio pack ~1200×471). */
const headerVariantClassName: Record<Exclude<BrandLogoVariant, "mark">, string> = {
  header: "h-9 w-auto max-w-[9.5rem] sm:h-10 sm:max-w-[11rem]",
  footer: "h-8 w-auto max-w-[10rem]",
  admin: "h-8 w-auto max-w-[8.5rem]",
  auth: "mx-auto h-12 w-auto max-w-[13rem] sm:h-14 sm:max-w-[15rem]",
};

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  className?: string;
  priority?: boolean;
  alt?: string;
}

export function BrandLogo({
  variant = "header",
  className,
  priority = false,
  alt = `${siteConfig.name} — vêtements enfants`,
}: BrandLogoProps) {
  if (variant === "mark") {
    return (
      <Image
        src={brandAssets.mark.png}
        alt={alt}
        width={brandAssets.mark.width}
        height={brandAssets.mark.height}
        className={cn("size-9 shrink-0 object-contain", className)}
        priority={priority}
        sizes="36px"
      />
    );
  }

  const { webp, png, width, height } = brandAssets.header;
  const imageClassName = cn(
    "block w-auto max-w-full object-contain object-left",
    headerVariantClassName[variant],
    className,
  );

  return (
    <picture className="block shrink-0 leading-none">
      <source srcSet={webp} type="image/webp" />
      {/* img natif : fallback WebP/PNG du pack sans conflit avec next/image */}
      <img
        src={png}
        alt={alt}
        width={width}
        height={height}
        className={imageClassName}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
      />
    </picture>
  );
}
