import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

import type {
  ProductionReadinessCheck,
  ProductionReadinessSummary,
  ReadinessDisplayStatus,
} from "@/lib/admin/production-readiness";
import { cn } from "@/lib/utils";

const STATUS_ICON = {
  ok: CheckCircle2,
  warning: AlertTriangle,
  blocking: XCircle,
} as const;

const STATUS_CLASS = {
  ok: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  blocking: "text-destructive",
} as const;

const GROUP_LABELS = {
  data: "Données boutique",
  deploy: "Configuration production (verify:deploy:prod)",
} as const;

function StatusIcon({ status }: { status: ReadinessDisplayStatus }) {
  const Icon = STATUS_ICON[status];
  return <Icon className={cn("mt-0.5 size-5 shrink-0", STATUS_CLASS[status])} />;
}

function ReadinessRow({ check }: { check: ProductionReadinessCheck }) {
  return (
    <li className="flex gap-3 rounded-lg border p-4">
      <StatusIcon status={check.status} />
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="font-medium">{check.label}</p>
          {check.actionHref && check.actionLabel ? (
            <Link
              href={check.actionHref}
              className="text-primary text-sm underline-offset-4 hover:underline"
            >
              {check.actionLabel}
            </Link>
          ) : null}
        </div>
        {check.detail ? (
          <p className="text-muted-foreground text-sm">{check.detail}</p>
        ) : null}
      </div>
    </li>
  );
}

export function ProductionReadinessBanner({
  summary,
}: {
  summary: ProductionReadinessSummary;
}) {
  if (summary.readyToCollect) {
    return (
      <div
        className="mb-8 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100"
        role="status"
      >
        <p className="flex items-center gap-2 text-lg font-semibold">
          <CheckCircle2 className="size-5 shrink-0" />
          Prêt à encaisser
        </p>
        {summary.warningCount > 0 ? (
          <p className="mt-2 text-sm opacity-90">
            Boutique et configuration production OK — {summary.warningCount}{" "}
            avertissement
            {summary.warningCount > 1 ? "s" : ""} non bloquant
            {summary.warningCount > 1 ? "s" : ""} ci-dessous.
          </p>
        ) : (
          <p className="mt-2 text-sm opacity-90">
            Données légales, catalogue et variables production validées. Le checkout
            production peut être ouvert.
          </p>
        )}
      </div>
    );
  }

  if (summary.readyToSell && !summary.deployEnvValid) {
    return (
      <div
        className="mb-8 rounded-xl border border-amber-300/60 bg-amber-50 px-5 py-4 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100"
        role="alert"
      >
        <p className="flex items-center gap-2 text-lg font-semibold">
          <AlertTriangle className="size-5 shrink-0" />
          Boutique prête — configuration production incomplète
        </p>
        <p className="mt-2 text-sm opacity-90">
          Les paramètres boutique et pages légales sont OK, mais{" "}
          {summary.deployEnvValid ? "0" : "au moins une"} variable production manque.
          Exécutez <code className="text-xs">npm run verify:deploy:prod</code> et
          complétez Vercel — voir la section « Configuration production » ci-dessous.
        </p>
      </div>
    );
  }

  return (
    <div
      className="border-destructive/30 bg-destructive/5 mb-8 rounded-xl border px-5 py-4"
      role="alert"
    >
      <p className="text-destructive flex items-center gap-2 text-lg font-semibold">
        <XCircle className="size-5 shrink-0" />
        {summary.blockingCount} point{summary.blockingCount > 1 ? "s" : ""} bloquant
        {summary.blockingCount > 1 ? "s" : ""}
      </p>
      <p className="text-muted-foreground mt-2 text-sm">
        Complétez les éléments marqués ❌ avant d&apos;ouvrir la boutique au public.
        {summary.warningCount > 0
          ? ` ${summary.warningCount} avertissement${summary.warningCount > 1 ? "s" : ""} supplémentaire${summary.warningCount > 1 ? "s" : ""}.`
          : ""}
      </p>
    </div>
  );
}

export function ProductionReadinessChecklist({
  summary,
}: {
  summary: ProductionReadinessSummary;
}) {
  const groups = ["data", "deploy"] as const;

  return (
    <div className="space-y-8">
      {groups.map((group) => {
        const items = summary.checks.filter((check) => check.group === group);
        return (
          <section key={group} aria-labelledby={`readiness-${group}`}>
            <h2
              id={`readiness-${group}`}
              className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase"
            >
              {GROUP_LABELS[group]}
            </h2>
            <ul className="space-y-3">
              {items.map((check) => (
                <ReadinessRow key={check.id} check={check} />
              ))}
            </ul>
          </section>
        );
      })}
      <p className="text-muted-foreground text-xs">
        La section « Configuration production » reprend les contrôles de{" "}
        <code className="text-xs">npm run verify:deploy:prod</code>. Aucune valeur
        secrète n&apos;est affichée — consultez{" "}
        <code className="text-xs">docs/variables-production.md</code> pour le détail de
        chaque variable.
      </p>
    </div>
  );
}
