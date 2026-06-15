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
    ...(description ? [{ title: "Description" as const, content: description }] : []),
    {
      title: "Livraison",
      content:
        "Expédition depuis la France en point relais (Mondial Relay ou Chronopost selon votre choix). Les frais et délais exacts sont confirmés avant paiement.",
    },
    {
      title: "Retours",
      content:
        "Retour possible sous 14 jours après réception pour les articles non portés, non lavés et dans leur état d'origine. Consultez la page Livraison & retours pour la procédure.",
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
    <div className="space-y-3 border-t pt-6">
      <h2 className="text-base font-semibold">Informations complémentaires</h2>
      {sections.map((section) => (
        <details
          key={section.title}
          className="bg-card group rounded-xl border px-4 py-3 shadow-[var(--shadow-soft)]"
        >
          <summary className="cursor-pointer list-none font-medium marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between gap-4">
              {section.title}
              <span className="text-muted-foreground text-lg leading-none transition-transform group-open:rotate-45">
                +
              </span>
            </span>
          </summary>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed whitespace-pre-line">
            {section.content}
          </p>
        </details>
      ))}
    </div>
  );
}
