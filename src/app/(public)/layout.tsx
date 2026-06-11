import { ConsentGatedAnalytics } from "@/components/analytics/consent-gated-analytics";
import { AppProviders } from "@/components/providers/app-providers";
import { ShopProvider } from "@/components/providers/shop-provider";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteJsonLd } from "@/components/seo/site-json-ld";
import { buildShopThemeStyle } from "@/lib/shop/theme";
import { getShopSettings } from "@/lib/supabase/queries/shop";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getShopSettings();
  const themeStyle = buildShopThemeStyle(settings);

  return (
    <ShopProvider settings={settings}>
      <SiteJsonLd settings={settings} />
      <div className="flex min-h-screen flex-col" style={themeStyle}>
        <AppProviders>
          <SiteHeader />
          <main
            id="contenu-principal"
            className="flex-1 pb-[var(--cookie-banner-height,0px)]"
          >
            {children}
          </main>
          <SiteFooter />
          <CookieConsent />
          <ConsentGatedAnalytics />
        </AppProviders>
      </div>
    </ShopProvider>
  );
}
