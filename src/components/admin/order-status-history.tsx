import { ORDER_STATUS_LABELS } from "@/lib/admin/status-labels";
import type { AdminOrderStatusHistoryEntry } from "@/lib/supabase/queries/admin/orders";

interface OrderStatusHistoryProps {
  entries: AdminOrderStatusHistoryEntry[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrderStatusHistory({ entries }: OrderStatusHistoryProps) {
  if (entries.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Aucun changement de statut enregistré pour le moment.
      </p>
    );
  }

  return (
    <ol className="space-y-3">
      {entries.map((entry) => (
        <li key={entry.id} className="border-l-2 pl-3 text-sm">
          <p className="text-muted-foreground text-xs">{formatDate(entry.createdAt)}</p>
          <p className="font-medium">
            {entry.fromStatus
              ? `${ORDER_STATUS_LABELS[entry.fromStatus]} → ${ORDER_STATUS_LABELS[entry.toStatus]}`
              : ORDER_STATUS_LABELS[entry.toStatus]}
          </p>
          {entry.note ? (
            <p className="text-muted-foreground text-xs">Suivi : {entry.note}</p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
