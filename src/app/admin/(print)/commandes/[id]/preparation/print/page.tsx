import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PrepSlipPrintTrigger } from "@/components/admin/prep-slip-print-trigger";
import { buildPrepSlipBodyHtml, PREP_SLIP_STYLES } from "@/lib/admin/prep-slip";
import { getAdminOrder } from "@/lib/supabase/queries/admin/orders";

export const dynamic = "force-dynamic";

interface PrepSlipPrintPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PrepSlipPrintPageProps): Promise<Metadata> {
  const { id } = await params;
  const order = await getAdminOrder(id);
  return {
    title: order ? `Impression — ${order.orderNumber}` : "Bon de préparation",
    robots: { index: false, follow: false },
  };
}

export default async function PrepSlipPrintPage({ params }: PrepSlipPrintPageProps) {
  const { id } = await params;
  const order = await getAdminOrder(id);
  if (!order) notFound();

  const bodyHtml = buildPrepSlipBodyHtml(order);

  return (
    <>
      <PrepSlipPrintTrigger />
      <style>{PREP_SLIP_STYLES}</style>
      <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    </>
  );
}
