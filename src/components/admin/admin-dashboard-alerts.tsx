import { AlertTriangle, CircleAlert } from "lucide-react";
import Link from "next/link";

import type { AdminDashboardAlert } from "@/lib/admin/dashboard-alerts";
import { cn } from "@/lib/utils";

interface AdminDashboardAlertsProps {
  alerts: AdminDashboardAlert[];
}

const severityStyles = {
  critical: {
    container: "border-red-500/40 bg-red-50 dark:bg-red-950/20",
    icon: CircleAlert,
    title: "text-red-950 dark:text-red-100",
    text: "text-red-900 dark:text-red-50/90",
  },
  warning: {
    container: "border-amber-500/40 bg-amber-50 dark:bg-amber-950/20",
    icon: AlertTriangle,
    title: "text-amber-950 dark:text-amber-100",
    text: "text-amber-900 dark:text-amber-50/90",
  },
} as const;

export function AdminDashboardAlerts({ alerts }: AdminDashboardAlertsProps) {
  if (alerts.length === 0) return null;

  return (
    <section className="mb-8 space-y-3" aria-label="Alertes configuration">
      <h2 className="text-sm font-semibold tracking-wide uppercase">Alertes</h2>
      <div className="grid gap-3 lg:grid-cols-2">
        {alerts.map((alert) => {
          const style = severityStyles[alert.severity];
          const Icon = style.icon;

          return (
            <div
              key={alert.id}
              className={cn("rounded-xl border px-4 py-3", style.container)}
              role="alert"
            >
              <p className={cn("flex items-start gap-2 text-sm font-medium", style.title)}>
                <Icon className="mt-0.5 size-4 shrink-0" />
                {alert.title}
              </p>
              <p className={cn("mt-1 text-sm", style.text)}>{alert.description}</p>
              <Link
                href={alert.href}
                className="text-primary mt-2 inline-block text-sm font-medium underline"
              >
                {alert.hrefLabel} →
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
