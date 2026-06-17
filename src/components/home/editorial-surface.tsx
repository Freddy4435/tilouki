import { cn } from "@/lib/utils";

type EditorialSurfaceTone = "pistache" | "rose" | "cloud" | "argile" | "denim";

const TONE_CLASSES: Record<
  EditorialSurfaceTone,
  { bg: string; border: string; label: string }
> = {
  pistache: {
    bg: "bg-tilouki-pistache-soft",
    border: "border-tilouki-pistache/25",
    label: "text-tilouki-navy",
  },
  rose: {
    bg: "bg-tilouki-rose-linge-soft",
    border: "border-tilouki-rose-linge/30",
    label: "text-tilouki-navy",
  },
  cloud: {
    bg: "bg-tilouki-cloud",
    border: "border-tilouki-border-subtle",
    label: "text-tilouki-navy",
  },
  argile: {
    bg: "bg-tilouki-argile-soft",
    border: "border-tilouki-argile/25",
    label: "text-tilouki-navy",
  },
  denim: {
    bg: "bg-tilouki-denim-soft",
    border: "border-tilouki-denim/20",
    label: "text-tilouki-navy",
  },
};

/** @deprecated tones legacy — mappés vers la palette 2026 */
const LEGACY_TONE_MAP: Record<string, EditorialSurfaceTone> = {
  jade: "pistache",
  powder: "rose",
  butter: "argile",
  teal: "denim",
};

interface EditorialSurfaceProps {
  label?: string;
  title?: string;
  tone?: EditorialSurfaceTone | "jade" | "powder" | "cloud" | "butter" | "teal";
  className?: string;
}

export function EditorialSurface({
  label,
  title,
  tone = "rose",
  className,
}: EditorialSurfaceProps) {
  const resolvedTone =
    tone in LEGACY_TONE_MAP
      ? LEGACY_TONE_MAP[tone as keyof typeof LEGACY_TONE_MAP]!
      : tone;
  const palette = TONE_CLASSES[resolvedTone as EditorialSurfaceTone];

  return (
    <div
      className={cn(
        "flex h-full w-full items-end border p-5 shadow-[var(--shadow-inset-surface)] sm:p-6",
        palette.bg,
        palette.border,
        className,
      )}
    >
      <div className="max-w-[14rem] space-y-1.5">
        {label ? (
          <p className={cn("text-retail-label", palette.label)}>{label}</p>
        ) : null}
        {title ? (
          <p className="text-foreground text-base leading-snug font-semibold text-balance sm:text-lg">
            {title}
          </p>
        ) : null}
      </div>
    </div>
  );
}
