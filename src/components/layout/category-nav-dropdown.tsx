"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { NavUniverseItem } from "@/lib/navigation/types";
import { cn } from "@/lib/utils";

interface CategoryNavDropdownProps {
  item: NavUniverseItem;
  isActive: boolean;
}

export function CategoryNavDropdown({ item, isActive }: CategoryNavDropdownProps) {
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
                ? "bg-tilouki-jade-soft text-tilouki-teal-dark"
                : "text-foreground hover:bg-tilouki-jade-soft/50 hover:text-tilouki-teal-dark",
            )}
            aria-haspopup="menu"
          >
            {item.label}
            <ChevronDown className="size-3.5 opacity-60" aria-hidden />
          </Button>
        }
      />
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className="border-border bg-card w-[min(100vw-2rem,28rem)] min-w-[16rem] rounded-[var(--radius-card)] border p-0 shadow-[var(--shadow-card)]"
      >
        <div className="grid grid-cols-1 gap-0 sm:grid-cols-2">
          {item.panels.map((panel) => (
            <div
              key={panel.title}
              className="border-border/50 border-b p-3 last:border-b-0 sm:border-r sm:border-b-0 sm:p-4 sm:last:border-r-0"
            >
              <p className="text-retail-label text-tilouki-ink-muted mb-2">
                {panel.title}
              </p>
              <ul className="space-y-0.5">
                {panel.links.map((link) => (
                  <li key={`${panel.title}-${link.href}`}>
                    <DropdownMenuItem
                      render={
                        <Link href={link.href} className="w-full cursor-pointer" />
                      }
                      className="text-foreground hover:bg-tilouki-jade-soft/60 rounded-[var(--radius-button)] px-2 py-1.5 text-sm font-medium"
                    >
                      {link.label}
                    </DropdownMenuItem>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-border/50 bg-tilouki-cloud/60 border-t px-3 py-2">
          <DropdownMenuItem
            render={<Link href={item.href} className="w-full cursor-pointer" />}
            className="text-tilouki-teal-dark justify-center rounded-[var(--radius-button)] px-2 py-1.5 text-sm font-semibold"
          >
            Voir tout — {item.label}
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
