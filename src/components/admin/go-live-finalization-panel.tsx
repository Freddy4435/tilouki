import { CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";

import type { ProductionReadinessSummary } from "@/lib/admin/production-readiness";
import { cn } from "@/lib/utils";

interface GoLiveFinalizationPanelProps {
  summary: ProductionReadinessSummary;
}

interface StepItem {
  id: string;
  title: string;
  description: string;
  done: boolean;
  href?: string;
  hrefLabel?: string;
}

function StepRow({ step }: { step: StepItem }) {
  const Icon = step.done ? CheckCircle2 : Circle;

  return (
    <li className="flex gap-3 rounded-lg border p-4">
      <Icon
        className={cn(
          "mt-0.5 size-5 shrink-0",
          step.done ? "text-emerald-600" : "text-muted-foreground",
        )}
        aria-hidden
      />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-medium">{step.title}</p>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {step.description}
        </p>
        {step.href && step.hrefLabel ? (
          <Link
            href={step.href}
            className="text-primary text-sm font-medium underline-offset-4 hover:underline"
          >
            {step.hrefLabel}
          </Link>
        ) : null}
      </div>
    </li>
  );
}

export function GoLiveFinalizationPanel({ summary }: GoLiveFinalizationPanelProps) {
  const legalCheck = summary.checks.find((c) => c.id === "legal-identity");
  const legalPagesCheck = summary.checks.find((c) => c.id === "legal-pages");

  const steps: StepItem[] = [
    {
      id: "deploy",
      title: "Configuration production (Vercel)",
      description:
        "Stripe Live, webhook, e-mails, Mondial Relay, Upstash, HTTPS, CRON_SECRET, SHIPPING_DEV_MOCK=false. Contrôle : npm run verify:deploy:prod",
      done: summary.deployEnvValid,
      href: "/admin/preparation",
      hrefLabel: "Détail des variables",
    },
    {
      id: "legal-admin",
      title: "Identité légale admin",
      description:
        "E-mail et téléphone de contact, médiateur de la consommation (nom + URL). IDU REP textile si vous êtes adhérent Refashion.",
      done: legalCheck?.status === "ok",
      href: "/admin/parametres",
      hrefLabel: "Paramètres boutique",
    },
    {
      id: "legal-pages",
      title: "Pages légales publiées",
      description:
        "Les six pages (mentions, CGV, confidentialité, cookies, livraison, rétractation) sans texte provisoire.",
      done: legalPagesCheck?.status === "ok",
      href: "/admin/pages-legales",
      hrefLabel: "Pages légales",
    },
    {
      id: "delivery",
      title: "Livrable propre & recette live",
      description:
        "Transmettre le code uniquement via npm run delivery:clean (jamais d'archive manuelle). Puis un achat Live à petit montant : webhook 200, e-mail, suivi — voir docs/GO_LIVE_RECETTE.md.",
      done: false,
    },
  ];

  const automatedDone = steps.filter(
    (step) => step.id !== "delivery" && step.done,
  ).length;
  const automatedTotal = steps.length - 1;

  return (
    <section
      className="bg-card mb-8 rounded-xl border p-5 shadow-[var(--shadow-soft)] sm:p-6"
      aria-labelledby="go-live-finalization-title"
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="go-live-finalization-title" className="text-lg font-semibold">
            Finalisation production
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {automatedDone}/{automatedTotal} contrôles automatisés OK — recette live à
            valider manuellement.
          </p>
        </div>
        <p className="text-muted-foreground font-mono text-xs">
          npm run go-live:preflight
        </p>
      </div>
      <ul className="space-y-3">
        {steps.map((step) => (
          <StepRow key={step.id} step={step} />
        ))}
      </ul>
    </section>
  );
}
