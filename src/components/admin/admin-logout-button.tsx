"use client";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { adminLogoutAction } from "@/server/actions/admin/auth";

export function AdminLogoutButton() {
  return (
    <form action={adminLogoutAction}>
      <Button type="submit" variant="ghost" size="sm" className="w-full justify-start gap-2">
        <LogOut className="size-4" />
        Déconnexion
      </Button>
    </form>
  );
}
