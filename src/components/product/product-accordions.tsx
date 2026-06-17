import type { ProductDetail } from "@/types/catalog";

interface ProductAccordionsProps {
  product: ProductDetail;
  /** Description sans le bloc « Pourquoi on l'a choisi » */
  descriptionOverride?: string | null;
}

export function ProductAccordions({
  product,
  descriptionOverride,
}: ProductAccordionsProps) {
  const description =
    descriptionOverride?.trim() ||
    product.description?.trim() ||
    product.shortDescription?.trim() ||
    null;

  const sections = [
    ...(description
      ? [{ title: "Description détaillée" as const, content: description }]
      : []),
    {
      title: "Livraison",
      content:
        "Expédition depuis la France en point relais. Frais et délais confirmés avant paiement.",
    },
    {
      title: "Retours",
      content:
        "14 jours après réception pour les articles non portés et non lavés. Procédure sur la page Livraison & retours.",
    },
    ...(product.careInstructions
      ? []
      : [
          {
            title: "Entretien" as const,
            content: "Suivre les instructions de l'étiquette du vêtement.",
          },
        ]),
  ];

  if (sections.length === 0) return null;

  return (
    <div className="space-y-2 border-t pt-6">
      <h2 className="text-base font-semibold">En savoir plus</h2>
      {sections.map((section) => (
        <details
          key={section.title}
          className="bg-card group rounded-[var(--radius-card)] border px-4 py-3"
        >
          <summary className="cursor-pointer list-none text-sm font-medium marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between gap-4">
              {section.title}
              <span className="text-muted-foreground text-lg leading-none transition-transform group-open:rotate-45">
                +
              </span>
            </span>
          </summary>
          <p className="text-muted-foreground mt-2.5 text-sm leading-relaxed whitespace-pre-line">
            {section.content}
          </p>
        </details>
      ))}
    </div>
  );
}
