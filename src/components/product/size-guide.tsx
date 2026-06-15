import { Ruler } from "lucide-react";

import { resolveContextualSizeAdvice } from "@/lib/catalog/product-page-content";
import type { ProductGender } from "@/types/database";

interface SizeGuideProps {
  sizes?: string[];
  ageLabels?: string[];
  gender?: ProductGender;
  material?: string | null;
  secondHand?: boolean;
}

export function SizeGuide({
  sizes = [],
  ageLabels = [],
  gender = "mixte",
  material = null,
  secondHand = false,
}: SizeGuideProps) {
  const advice = resolveContextualSizeAdvice({
    sizes,
    ageLabels,
    gender,
    material,
    secondHand,
  });

  const genderLabel =
    gender === "fille" ? "fille" : gender === "garcon" ? "garçon" : "enfant";

  return (
    <div
      id="size-guide"
      className="bg-muted/40 scroll-mt-24 rounded-xl border p-4 text-sm lg:scroll-mt-8"
    >
      <p className="inline-flex items-center gap-2 font-semibold">
        <Ruler className="text-tilouki-teal-dark size-4" aria-hidden />
        Conseil taille
      </p>
      <p className="text-foreground mt-2 leading-relaxed font-medium">{advice}</p>
      <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
        Référence {genderLabel} — tailles affichées selon l&apos;étiquette du vêtement.
      </p>
      <ul className="text-muted-foreground mt-3 list-inside list-disc space-y-1 text-xs">
        <li>3M / 6M / 9M : tout-petit</li>
        <li>12M à 24M : bébé marcheur</li>
        <li>2A à 8A : enfant</li>
      </ul>
    </div>
  );
}
