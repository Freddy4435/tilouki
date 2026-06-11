import { ArrowRight } from "lucide-react";
import Link from "next/link";

import type { AdminDashboardPriority } from "@/lib/admin/dashboard-alerts";
import { cn } from "@/lib/utils";

interface AdminDashboardPrioritiesProps {
  priorities: AdminDashboardPriority[];
}

export function AdminDashboardPriorities({ priorities }: AdminDashboardPrioritiesProps) {
  if (priorities.length === 0) {
    return (
      <section className="mb-8 rounded-xl border border-emerald-500/30 bg-emerald-50/60 px-4 py-4 dark:bg-emerald-950/20">
        <p className="text-sm font-medium text-emerald-950 dark:text-emerald-100">
          Tout est en ordre pour le moment.
        </p>
        <p className="text-muted-foreground mt-1 text-sm">
          Surveillez les indicateurs ci-dessous ou ajoutez de nouveaux produits.
        </p>
      </section>
    );
  }

  return (
    <section className="mb-8" aria-label="À faire maintenant">
      <h2 className="mb-3 text-sm font-semibold tracking-wide uppercase">À faire maintenant</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {priorities.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "group flex items-start justify-between gap-3 rounded-xl border px-4 py-3 transition-colors hover:bg-muted/40",
              item.emphasis && "border-primary/30 bg-primary/5",
            )}
          >
            <div>
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="text-muted-foreground mt-0.5 text-sm">{item.description}</p>
              <span className="text-primary mt-2 inline-block text-xs font-medium">
                {item.hrefLabel}
              </span>
            </div>
            <ArrowRight className="text-muted-foreground mt-0.5 size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </section>
  );
}
