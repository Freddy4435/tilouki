import { AlertTriangle, CameraOff, Recycle, Sparkles } from "lucide-react";

interface ProductSellabilityNoticeProps {
  sellable: boolean;
}

export function ProductSellabilityNotice({ sellable }: ProductSellabilityNoticeProps) {
  if (sellable) return null;

  return (
    <div
      className="flex gap-3 rounded-[var(--radius-card)] border border-amber-500/35 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:bg-amber-950/20 dark:text-amber-50"
      role="status"
    >
      <CameraOff className="size-5 shrink-0" aria-hidden />
      <div>
        <p className="font-semibold">Bientôt disponible en ligne</p>
        <p className="mt-1 leading-relaxed opacity-90">
          Les photos commerciales de cet article sont en cours de finalisation.
          L&apos;achat en ligne sera activé dès qu&apos;elles seront publiées.
        </p>
      </div>
    </div>
  );
}

interface ProductDefectNoticeProps {
  defects: string[];
  secondHand?: boolean;
  curatedSelection?: boolean;
  conditionTitle?: string | null;
  conditionIntro?: string | null;
}

export function ProductDefectNotice({
  defects,
  secondHand = false,
  curatedSelection = false,
  conditionTitle,
  conditionIntro,
}: ProductDefectNoticeProps) {
  if (defects.length === 0 && !secondHand && !curatedSelection && !conditionIntro) {
    return null;
  }

  const title =
    conditionTitle ??
    (secondHand
      ? "Seconde main — état décrit"
      : curatedSelection
        ? "Sélection Tilouki"
        : "État du vêtement");

  const Icon = secondHand ? Recycle : curatedSelection ? Sparkles : AlertTriangle;

  return (
    <div
      className="border-border/80 bg-muted/25 rounded-[var(--radius-card)] border px-4 py-3 text-sm"
      role="note"
    >
      <p className="inline-flex items-center gap-2 font-semibold">
        <Icon
          className="size-4 shrink-0 text-amber-800 dark:text-amber-300"
          aria-hidden
        />
        {title}
      </p>
      {conditionIntro ? (
        <p className="text-muted-foreground mt-2 leading-relaxed">{conditionIntro}</p>
      ) : null}
      {defects.length > 0 ? (
        <ul className="text-foreground mt-2 space-y-1.5 leading-relaxed">
          {defects.map((defect) => (
            <li key={defect} className="flex gap-2">
              <span className="text-tilouki-persimmon-dark font-bold" aria-hidden>
                •
              </span>
              <span>{defect}</span>
            </li>
          ))}
        </ul>
      ) : secondHand ? (
        <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
          Aucun défaut signalé sur les photos — état conforme à la description.
        </p>
      ) : null}
    </div>
  );
}
