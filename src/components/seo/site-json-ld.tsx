import { JsonLdScript } from "@/components/seo/json-ld-script";
import { buildOrganizationJsonLd, buildWebSiteJsonLd } from "@/lib/seo/json-ld";
import type { ShopSettings } from "@/lib/shop/types";

interface SiteJsonLdProps {
  settings: ShopSettings;
}

export function SiteJsonLd({ settings }: SiteJsonLdProps) {
  return (
    <JsonLdScript data={[buildOrganizationJsonLd(settings), buildWebSiteJsonLd()]} />
  );
}
