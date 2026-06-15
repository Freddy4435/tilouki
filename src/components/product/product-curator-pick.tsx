import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

interface ProductCuratorPickProps {
  note: string;
  className?: string;
}

export function ProductCuratorPick({ note, className }: ProductCuratorPickProps) {
  return (
    <aside
      className={cn(
        "border-tilouki-jade/30 bg-tilouki-jade-soft/35 rounded-[var(--radius-card)] border px-4 py-3.5",
        className,
      )}
      aria-label="Pourquoi on l'a choisi"
    >
      <p className="text-tilouki-teal-dark inline-flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase">
        <Sparkles className="size-3.5" aria-hidden />
        Pourquoi on l&apos;a choisi
      </p>
      <p className="text-foreground mt-2 text-sm leading-relaxed whitespace-pre-line">
        {note}
      </p>
    </aside>
  );
}
