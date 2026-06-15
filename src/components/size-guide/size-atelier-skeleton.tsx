export function SizeAtelierSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Chargement de l'atelier des tailles">
      <div className="bg-muted/40 h-24 animate-pulse rounded-[var(--radius-card)]" />
      <div className="bg-muted/40 h-28 animate-pulse rounded-[var(--radius-card)]" />
      <div className="bg-muted/40 h-64 animate-pulse rounded-[var(--radius-card)]" />
    </div>
  );
}
