import { HomeValueProps } from "@/components/home/home-value-props";
import { ShippingHighlights } from "@/components/home/shipping-highlights";

interface HomeReassuranceSectionProps {
  shopName: string;
}

/** Réassurance finale — livraison, valeurs boutique, avant le footer global. */
export function HomeReassuranceSection({ shopName }: HomeReassuranceSectionProps) {
  return (
    <>
      <ShippingHighlights shopName={shopName} />
      <HomeValueProps />
    </>
  );
}
