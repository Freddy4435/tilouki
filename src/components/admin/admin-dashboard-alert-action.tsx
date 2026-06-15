"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import type { AdminDashboardAlertAction } from "@/lib/admin/dashboard-alerts";
import { Button } from "@/components/ui/button";
import { deactivateAllDemoProductsAction } from "@/server/actions/admin/products";

interface Props {
  action: AdminDashboardAlertAction;
}

export function AdminDashboardAlertActionButton({ action }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run() {
    startTransition(async () => {
      if (action.action !== "deactivate-demo-products") return;

      const result = await deactivateAllDemoProductsAction();
      if (result.error) {
        toast.error(result.error);
        return;
      }

      const count = result.count ?? 0;
      toast.success(
        count > 0
          ? `${count} produit${count > 1 ? "s" : ""} démo passé${count > 1 ? "s" : ""} en brouillon.`
          : "Aucun produit démo actif à désactiver.",
      );
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="mt-2"
      disabled={pending}
      onClick={run}
    >
      {pending ? "Désactivation…" : action.label}
    </Button>
  );
}
