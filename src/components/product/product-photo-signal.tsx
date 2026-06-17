import { Camera, Recycle } from "lucide-react";

import { cn } from "@/lib/utils";

interface ProductPhotoSignalProps {
  commercialCount: number;
  secondHand?: boolean;
  defects?: string[];
  className?: string;
}

export function ProductPhotoSignal({
  commercialCount,
  secondHand = false,
  defects = [],
  className,
}: ProductPhotoSignalProps) {
  if (commercialCount <= 0) return null;

  const photoLabel =
    commercialCount === 1
      ? "1 photo réelle"
      : `${commercialCount} photos réelles`;

  return (
    <div
      className={cn(
        "border-tilouki-pistache/25 bg-tilouki-cloud/40 flex flex-col gap-2 rounded-[var(--radius-button)] border px-3 py-2.5",
        className,
      )}
      role="status"
      aria-label={`${photoLabel}${secondHand ? ", article seconde main" : ""}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="bg-tilouki-pistache-soft/70 text-tilouki-navy inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold">
          <Camera className="size-3.5 shrink-0" aria-hidden />
          {photoLabel}
        </span>
        {secondHand ? (
          <span className="text-tilouki-navy inline-flex items-center gap-1.5 text-xs font-semibold">
            <Recycle className="size-3.5 shrink-0" aria-hidden />
            Seconde main
          </span>
        ) : null}
      </div>

      {defects.length > 0 ? (
        <ul className="text-muted-foreground space-y-1 text-xs leading-relaxed">
          {defects.map((defect) => (
            <li key={defect} className="flex gap-2">
              <span className="text-tilouki-persimmon-dark font-bold" aria-hidden>
                •
              </span>
              <span>{defect}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
