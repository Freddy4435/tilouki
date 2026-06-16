import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { EditorialSurface } from "@/components/home/editorial-surface";
import { isRealEditorialImage } from "@/lib/editorial/images";
import { resolveEditorialAltFromSrc } from "@/lib/media/editorial-images";
import type { EditorialBlock } from "@/lib/editorial/types";

const SURFACE_TONES = ["jade", "powder", "cloud", "butter", "teal"] as const;

interface EditorialUniverseSectionProps {
  blocks: EditorialBlock[];
}

export function EditorialUniverseSection({ blocks }: EditorialUniverseSectionProps) {
  if (blocks.length === 0) return null;

  return (
    <section className="py-8 md:py-10" aria-labelledby="editorial-universe-title">
      <div className="container-tilouki">
        <div className="mb-6 text-center md:mb-8">
          <p className="text-retail-label text-tilouki-teal-dark">
            L&apos;univers Tilouki
          </p>
          <h2 id="editorial-universe-title" className="text-section-title mt-1">
            Nos coups de cœur par univers
          </h2>
          <p className="text-muted-foreground mx-auto mt-2 max-w-2xl text-sm leading-relaxed sm:text-base">
            Bébé, fille, garçon ou nuit douce — parcourez les sélections qui vous
            ressemblent, à votre rythme.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {blocks.map((block, index) => (
            <Link
              key={`${block.href}-${block.title}`}
              href={block.href}
              className="group bg-card flex flex-col overflow-hidden rounded-[var(--radius-product)] shadow-[var(--shadow-soft)] ring-1 ring-black/[0.04] transition-shadow hover:shadow-[var(--shadow-card)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                {isRealEditorialImage(block.imageUrl) ? (
                  <Image
                    src={block.imageUrl!}
                    alt={resolveEditorialAltFromSrc(block.imageUrl!, `Univers ${block.title}`)}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <EditorialSurface
                    label={block.surfaceLabel ?? block.title}
                    title={block.title}
                    tone={SURFACE_TONES[index % SURFACE_TONES.length]}
                    className="min-h-full"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                <h3 className="font-display text-lg leading-snug font-semibold">
                  {block.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {block.hook}
                </p>
                <span className="text-primary mt-auto inline-flex items-center gap-1 text-sm font-semibold">
                  Explorer
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
