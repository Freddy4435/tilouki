"use client";

import { Download } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { ButtonLink } from "@/components/ui/button-link";

export function OrdersExportButton() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const href = `/api/admin/orders/export?${params.toString()}`;

  return (
    <ButtonLink href={href} variant="outline" size="sm" download>
      <Download className="size-4" />
      Exporter CSV
    </ButtonLink>
  );
}
