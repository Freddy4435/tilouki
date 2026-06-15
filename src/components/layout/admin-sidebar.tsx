"use client";

import { usePathname } from "next/navigation";
import {
  FileText,
  FolderOpen,
  LayoutDashboard,
  MessageSquare,
  Package,
  Rocket,
  Settings,
  Shirt,
  Truck,
  Upload,
  Warehouse,
  type LucideIcon,
} from "lucide-react";

import { AdminLogoutButton } from "@/components/admin/admin-logout-button";

import { ButtonLink } from "@/components/ui/button-link";
import { Separator } from "@/components/ui/separator";
import { adminNavItems, siteConfig } from "@/lib/constants/site";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  rocket: Rocket,
  shirt: Shirt,
  upload: Upload,
  folder: FolderOpen,
  package: Package,
  "message-square": MessageSquare,
  warehouse: Warehouse,
  truck: Truck,
  settings: Settings,
  "file-text": FileText,
};

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-sidebar text-sidebar-foreground flex h-full w-64 flex-col border-r">
      <div className="flex h-[var(--header-height)] items-center gap-2 border-b px-4">
        <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg text-sm font-bold">
          T
        </span>
        <div>
          <p className="text-sm font-semibold">{siteConfig.name}</p>
          <p className="text-muted-foreground text-xs">Administration</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3" aria-label="Navigation admin">
        {adminNavItems.map((item) => {
          const Icon = iconMap[item.icon] ?? LayoutDashboard;
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <ButtonLink
              key={item.href}
              href={item.href}
              variant={isActive ? "secondary" : "ghost"}
              className={cn("w-full justify-start gap-2", isActive && "font-medium")}
            >
              <Icon className="size-4" />
              {item.label}
            </ButtonLink>
          );
        })}
      </nav>

      <Separator />

      <div className="space-y-2 p-3">
        <AdminLogoutButton />
        <ButtonLink href="/" variant="outline" className="w-full">
          Retour à la boutique
        </ButtonLink>
      </div>
    </aside>
  );
}
