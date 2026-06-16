import Link from "next/link";
import { Ruler } from "lucide-react";

import { resolveBriefSizeTip } from "@/lib/catalog/product-page-content";
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
  const tip = resolveBriefSizeTip({
    sizes,
    ageLabels,
    gender,
    material,
    secondHand,
  });

  return (
    <aside
      id="size-guide"
      className="border-tilouki-jade/25 bg-card scroll-mt-24 rounded-[var(--radius-card)] border p-4 lg:scroll-mt-8"
    >
      <p className="inline-flex items-center gap-2 text-sm font-semibold">
        <Ruler className="text-tilouki-teal-dark size-4" aria-hidden />
        Conseil taille
      </p>
      <p className="text-foreground mt-2 text-sm leading-relaxed font-medium">{tip}</p>
      <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
        Entre deux tailles ? Prenez la plus grande — votre enfant grandit vite.
      </p>
      <Link
        href="/guide-tailles"
        className="text-tilouki-teal-dark mt-3 inline-flex text-xs font-semibold hover:underline"
      >
        Ouvrir l&apos;atelier des tailles →
      </Link>
    </aside>
  );
}
