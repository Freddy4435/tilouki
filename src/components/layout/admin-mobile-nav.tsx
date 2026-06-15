"use client";

import { usePathname } from "next/navigation";
import {
  FileText,
  FolderOpen,
  LayoutDashboard,
  Menu,
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
import { useState } from "react";

import { ButtonLink } from "@/components/ui/button-link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="bg-background flex h-14 items-center border-b px-4 md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon" aria-label="Ouvrir le menu admin">
              <Menu className="size-5" />
            </Button>
          }
        />
        <SheetContent side="left" className="w-[min(100vw-2rem,20rem)]">
          <SheetHeader>
            <SheetTitle className="text-left text-base">
              {siteConfig.name} — Admin
            </SheetTitle>
          </SheetHeader>
          <nav
            className="mt-4 flex flex-col gap-1"
            aria-label="Navigation admin mobile"
          >
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
                  className={cn("justify-start gap-2", isActive && "font-medium")}
                  onClick={() => setOpen(false)}
                >
                  <Icon className="size-4" />
                  {item.label}
                </ButtonLink>
              );
            })}
          </nav>
          <Separator className="my-4" />
          <AdminLogoutButton />
          <ButtonLink
            href="/"
            variant="outline"
            className="w-full"
            onClick={() => setOpen(false)}
          >
            Retour à la boutique
          </ButtonLink>
        </SheetContent>
      </Sheet>
      <p className="ml-2 text-sm font-medium">Administration</p>
    </header>
  );
}
