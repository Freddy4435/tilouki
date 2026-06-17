"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { NavMegaMenuItem } from "@/lib/navigation/types";
import {
  resolveCategoryTiloukiImage,
  resolveEditorialModuleTiloukiImage,
  resolveRitualTiloukiImage,
} from "@/lib/tilouki-images";
import { cn } from "@/lib/utils";

interface CategoryNavDropdownProps {
  item: NavMegaMenuItem;
  isActive: boolean;
}

function resolveFeaturedImage(item: NavMegaMenuItem) {
  const featured = item.featured;
  if (!featured) return null;

  switch (featured.imageKind) {
    case "editorial":
      return resolveEditorialModuleTiloukiImage(featured.imageSlug);
    case "ritual":
      return resolveRitualTiloukiImage(featured.imageSlug);
    default:
      return resolveCategoryTiloukiImage(featured.imageSlug);
  }
}

export function CategoryNavDropdown({ item, isActive }: CategoryNavDropdownProps) {
  const featuredImage = resolveFeaturedImage(item);
  const panelCount = item.panels.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            className={cn(
              "h-9 shrink-0 gap-1 rounded-[var(--radius-button)] px-3 text-sm font-medium",
              isActive
                ? "bg-tilouki-pistache-soft text-tilouki-navy font-semibold"
                : "text-foreground hover:bg-tilouki-pistache-soft/50 hover:text-tilouki-navy",
            )}
            aria-haspopup="menu"
            aria-expanded={undefined}
          >
            {item.label}
            <ChevronDown className="size-3.5 opacity-60" aria-hidden />
          </Button>
        }
      />
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className="border-tilouki-border bg-card z-50 w-[min(100vw-2rem,56rem)] min-w-[20rem] max-w-[56rem] rounded-[var(--radius-card)] border p-0 shadow-[var(--shadow-card)]"
      >
        <div className="flex flex-col lg:flex-row lg:items-stretch">
          {item.featured && featuredImage ? (
            <Link
              href={item.featured.href}
              className="group border-tilouki-border/60 relative min-h-[10rem] shrink-0 overflow-hidden border-b lg:w-[14rem] lg:border-r lg:border-b-0"
              tabIndex={-1}
            >
              <Image
                src={featuredImage.src}
                alt={featuredImage.alt}
                fill
                sizes="224px"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div
                className="from-tilouki-navy-dark/85 via-tilouki-navy/40 absolute inset-0 bg-gradient-to-t to-transparent"
                aria-hidden
              />
              <div className="absolute inset-x-0 bottom-0 p-3">
                <p className="text-retail-label text-white/85">À découvrir</p>
                <p className="font-sans text-sm font-semibold text-white">
                  {item.featured.title}
                </p>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/88">
                  {item.featured.description}
                </p>
              </div>
            </Link>
          ) : null}

          <div
            className="min-w-0 flex-1 overflow-hidden p-3 sm:p-4"
            role="navigation"
            aria-label={`Sous-menu ${item.label}`}
          >
            <div
              className={cn(
                "grid gap-x-4 gap-y-3",
                panelCount <= 3
                  ? "grid-cols-1 sm:grid-cols-3"
                  : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]",
              )}
            >
              {item.panels.map((panel) => (
                <div key={panel.title} className="min-w-0">
                  <p
                    id={`nav-panel-${item.id}-${panel.title.replace(/\s+/g, "-").toLowerCase()}`}
                    className="text-retail-label text-tilouki-pistache mb-1.5"
                  >
                    {panel.title}
                  </p>
                  <ul
                    className="space-y-0.5"
                    aria-labelledby={`nav-panel-${item.id}-${panel.title.replace(/\s+/g, "-").toLowerCase()}`}
                  >
                    {panel.links.map((link) => (
                      <li key={`${panel.title}-${link.href}-${link.label}`}>
                        <DropdownMenuItem
                          render={
                            <Link href={link.href} className="w-full cursor-pointer" />
                          }
                          className="text-foreground hover:bg-tilouki-pistache-soft/70 focus:bg-tilouki-pistache-soft/70 rounded-[var(--radius-button)] px-2 py-1.5 text-sm font-medium"
                        >
                          {link.label}
                        </DropdownMenuItem>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-tilouki-border/60 bg-tilouki-cloud/50 border-t px-3 py-2">
          <DropdownMenuItem
            render={<Link href={item.href} className="w-full cursor-pointer" />}
            className="text-tilouki-navy hover:bg-tilouki-pistache-soft/50 focus:bg-tilouki-pistache-soft/50 justify-center rounded-[var(--radius-button)] px-2 py-1.5 text-sm font-semibold"
          >
            Voir tout — {item.label}
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
