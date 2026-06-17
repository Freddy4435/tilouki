"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Download, PackageCheck, Tag, Truck } from "lucide-react";

import { OrderPrepSlip } from "@/components/admin/order-prep-slip";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { formatShippingProvider } from "@/lib/shipping/labels";
import type { AdminOrderDetail } from "@/lib/supabase/queries/admin/orders";
import { cn } from "@/lib/utils";
import {
  createShippingLabelAction,
  performOrderActionAction,
  registerExternalShipmentAction,
} from "@/server/actions/admin/orders";

interface OrderExpeditionPanelProps {
  order: AdminOrderDetail;
}

export function OrderExpeditionPanel({ order }: OrderExpeditionPanelProps) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [externalTracking, setExternalTracking] = useState("");
  const [externalLabelUrl, setExternalLabelUrl] = useState("");
  const [showExternalForm, setShowExternalForm] = useState(false);

  const carrierLabel = formatShippingProvider(order.shippingProvider);
  const isDevLabel = order.shippingNumber?.startsWith("DEV-") ?? false;
  const canGenerate =
    !order.shippingNumber &&
    order.paymentStatus === "paid" &&
    ["paid", "preparing"].includes(order.status);
  const isChronopost = order.shippingProvider === "chronopost";
  const canMarkShipped =
    order.status === "preparing" &&
    Boolean(order.trackingNumber || order.shippingNumber);

  const onGenerateLabel = () => {
    startTransition(async () => {
      const result = await createShippingLabelAction({ orderId: order.id });
      if (result.error) {
        toast.error("Étiquette non générée", result.error);
        return;
      }
      toast.success(
        "Étiquette générée",
        result.shipmentNumber
          ? `N° ${result.shipmentNumber} — imprimez l'étiquette puis marquez la commande expédiée.`
          : "Téléchargez l'étiquette puis marquez la commande expédiée.",
      );
      router.refresh();
    });
  };

  const onRegisterExternal = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await registerExternalShipmentAction({
        orderId: order.id,
        trackingNumber: externalTracking.trim(),
        labelUrl: externalLabelUrl.trim() || null,
        markShipped: true,
      });
      if (result.error) {
        toast.error("Enregistrement impossible", result.error);
        return;
      }
      toast.success("Expédition enregistrée", "E-mail client envoyé si configuré.");
      setShowExternalForm(false);
      router.refresh();
    });
  };

  const onMarkShipped = () => {
    startTransition(async () => {
      const result = await performOrderActionAction({
        orderId: order.id,
        action: "mark_shipped",
      });
      if (result.error) {
        toast.error("Expédition impossible", result.error);
        return;
      }
      toast.success("Commande marquée expédiée");
      router.refresh();
    });
  };

  return (
    <div className="space-y-4 border-t pt-4">
      <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase">
        <Truck className="size-3.5" />
        Expédition — {carrierLabel}
      </p>

      {order.shippingNumber ? (
        <div className="bg-muted/30 space-y-3 rounded-lg border p-3">
          <div>
            <p className="text-muted-foreground text-xs">Numéro d&apos;expédition</p>
            <p className="font-mono text-sm font-medium">
              {order.shippingNumber}
              {isDevLabel ? (
                <span className="text-muted-foreground ml-2 font-sans text-xs">
                  [DEV]
                </span>
              ) : null}
            </p>
          </div>
          {order.trackingNumber && order.trackingNumber !== order.shippingNumber ? (
            <div>
              <p className="text-muted-foreground text-xs">Suivi client</p>
              <p className="font-mono text-sm">{order.trackingNumber}</p>
            </div>
          ) : null}
          {order.labelCreatedAt ? (
            <p className="text-muted-foreground text-xs">
              Étiquette créée le{" "}
              {new Date(order.labelCreatedAt).toLocaleString("fr-FR")}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {order.shippingLabelUrl ? (
              <a
                href={order.shippingLabelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                <Download className="size-4" />
                Télécharger l&apos;étiquette
              </a>
            ) : null}
            <OrderPrepSlip orderId={order.id} orderNumber={order.orderNumber} />
            {canMarkShipped ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={isPending}
                onClick={onMarkShipped}
              >
                <PackageCheck className="size-4" />
                Marquer expédiée
              </Button>
            ) : null}
          </div>
          {canMarkShipped ? (
            <p className="text-muted-foreground text-xs leading-relaxed">
              Collez l&apos;étiquette sur le colis, puis confirmez l&apos;expédition
              pour prévenir la cliente par e-mail.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          {canGenerate ? (
            <Button
              type="button"
              size="sm"
              onClick={onGenerateLabel}
              disabled={isPending}
            >
              <Tag className="size-4" />
              {isPending ? "Génération…" : `Générer l'étiquette ${carrierLabel}`}
            </Button>
          ) : null}

          {isChronopost && canGenerate ? (
            <p className="text-muted-foreground text-xs leading-relaxed">
              L&apos;étiquette est générée via l&apos;API Chronopost (Chrono Relais).
              Vous pouvez aussi enregistrer un suivi créé manuellement ci-dessous.
            </p>
          ) : null}

          {(isChronopost || showExternalForm) && canGenerate ? (
            <form
              onSubmit={onRegisterExternal}
              className="space-y-3 rounded-lg border p-3"
            >
              <p className="text-sm font-medium">
                {isChronopost
                  ? "Enregistrer une étiquette Chronopost (manuel)"
                  : "Enregistrer une étiquette externe"}
              </p>
              <div className="space-y-2">
                <Label htmlFor={`external-tracking-${order.id}`}>
                  Numéro de suivi *
                </Label>
                <Input
                  id={`external-tracking-${order.id}`}
                  value={externalTracking}
                  onChange={(event) => setExternalTracking(event.target.value)}
                  placeholder="Ex. XY123456789FR"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`external-label-${order.id}`}>
                  URL du PDF étiquette (optionnel)
                </Label>
                <Input
                  id={`external-label-${order.id}`}
                  value={externalLabelUrl}
                  onChange={(event) => setExternalLabelUrl(event.target.value)}
                  placeholder="https://…"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending || !externalTracking.trim()}
                >
                  Enregistrer et marquer expédiée
                </Button>
                {!isChronopost ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowExternalForm(false)}
                  >
                    Annuler
                  </Button>
                ) : null}
              </div>
            </form>
          ) : !isChronopost && canGenerate ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-muted-foreground h-auto px-0 text-xs"
              onClick={() => setShowExternalForm(true)}
            >
              Étiquette créée ailleurs ? Enregistrer le suivi manuellement
            </Button>
          ) : null}

          {!canGenerate ? (
            <p className="text-muted-foreground text-xs">
              Disponible pour les commandes payées en statut « Payée » ou « En
              préparation ».
            </p>
          ) : null}

          <OrderPrepSlip orderId={order.id} orderNumber={order.orderNumber} />
        </div>
      )}

      {canMarkShipped && !order.shippingNumber ? (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={isPending}
          onClick={onMarkShipped}
        >
          <PackageCheck className="size-4" />
          Marquer comme expédiée (suivi déjà connu)
        </Button>
      ) : null}
    </div>
  );
}
