import { cn } from "@/lib/utils";

type EditorialSurfaceTone = "jade" | "powder" | "cloud" | "butter" | "teal";

const TONE_CLASSES: Record<
  EditorialSurfaceTone,
  { bg: string; blobA: string; blobB: string; label: string }
> = {
  jade: {
    bg: "bg-tilouki-jade-soft",
    blobA: "bg-tilouki-jade/25",
    blobB: "bg-tilouki-cloud/80",
    label: "text-tilouki-teal-dark",
  },
  powder: {
    bg: "bg-tilouki-powder-soft",
    blobA: "bg-tilouki-powder/40",
    blobB: "bg-tilouki-jade-soft/70",
    label: "text-tilouki-plum",
  },
  cloud: {
    bg: "bg-tilouki-cloud",
    blobA: "bg-tilouki-jade/20",
    blobB: "bg-tilouki-powder-soft/60",
    label: "text-tilouki-teal-dark",
  },
  butter: {
    bg: "bg-tilouki-butter-soft",
    blobA: "bg-tilouki-butter/35",
    blobB: "bg-tilouki-jade-soft/50",
    label: "text-tilouki-ink",
  },
  teal: {
    bg: "bg-tilouki-teal/10",
    blobA: "bg-tilouki-teal/15",
    blobB: "bg-tilouki-jade-soft/60",
    label: "text-tilouki-teal-dark",
  },
};

interface EditorialSurfaceProps {
  label?: string;
  title?: string;
  tone?: EditorialSurfaceTone;
  className?: string;
}

export function EditorialSurface({
  label,
  title,
  tone = "jade",
  className,
}: EditorialSurfaceProps) {
  const palette = TONE_CLASSES[tone];

  return (
    <div
      className={cn(
        "relative flex h-full w-full items-end overflow-hidden p-5 sm:p-6",
        palette.bg,
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -top-10 -right-8 size-40 rounded-full",
          palette.blobA,
        )}
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute -bottom-8 -left-6 size-32 rounded-full",
          palette.blobB,
        )}
        aria-hidden
      />
      <div className="relative max-w-[14rem] space-y-1.5">
        {label ? (
          <p className={cn("text-retail-label", palette.label)}>{label}</p>
        ) : null}
        {title ? (
          <p className="font-display text-lg leading-snug font-semibold text-balance sm:text-xl">
            {title}
          </p>
        ) : null}
      </div>
    </div>
  );
}
