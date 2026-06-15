import { HOME_FAQ } from "@/lib/catalog/constants";

export function FaqSection() {
  return (
    <section className="container-tilouki py-12 md:py-16">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-section-title mb-6 text-center">Questions fréquentes</h2>
        <div className="space-y-3">
          {HOME_FAQ.map((item) => (
            <details
              key={item.question}
              className="bg-card group rounded-[var(--radius-card)] border px-5 py-4 shadow-[var(--shadow-soft)]"
            >
              <summary className="cursor-pointer list-none font-medium marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-4">
                  {item.question}
                  <span className="text-muted-foreground text-lg leading-none transition-transform group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
