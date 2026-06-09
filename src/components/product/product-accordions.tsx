import type { ProductDetail } from "@/types/catalog";

interface ProductAccordionsProps {
  product: ProductDetail;
}

export function ProductAccordions({ product }: ProductAccordionsProps) {
  const sections = [
    {
      title: "Description",
      content: product.description ?? "Description à venir.",
    },
    {
      title: "Livraison",
      content:
        "Livraison en point relais Mondial Relay. Préparation depuis mon stock en France. Les délais exacts sont confirmés lors de la commande.",
    },
    {
      title: "Retours",
      content:
        "Retour possible sous 14 jours pour les articles non portés, non lavés et dans leur état d'origine. Consultez nos conditions de retour pour la procédure complète.",
    },
    {
      title: "Entretien",
      content: product.careInstructions ?? "Suivre les instructions de l'étiquette du vêtement.",
    },
  ];

  return (
    <div className="space-y-3 border-t pt-6">
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
