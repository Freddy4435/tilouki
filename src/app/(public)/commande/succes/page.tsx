import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";

import { CheckoutSuccessClient } from "@/components/checkout/checkout-success-client";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { getOrderByStripeSessionId } from "@/lib/supabase/queries/orders";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Commande confirmée",
  robots: { index: false, follow: false },
};

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CommandeSuccesPage({ searchParams }: SuccessPageProps) {
  const { session_id: sessionId } = await searchParams;
  const order = sessionId ? await getOrderByStripeSessionId(sessionId) : null;
  const isPaid = order?.paymentStatus === "paid";
  const trackingHref = order?.trackingToken
    ? `/suivi-commande?token=${order.trackingToken}`
    : "/suivi-commande";

  return (
    <div className="container-tilouki section-tilouki max-w-lg">
      <CheckoutSuccessClient isPaid={isPaid} />
      <Card className="text-center shadow-[var(--shadow-card)]">
        <CardContent className="space-y-4 p-8">
          <div className="bg-tilouki-sage-light text-tilouki-sage-dark mx-auto flex size-14 items-center justify-center rounded-full">
            <CheckCircle2 className="size-7" />
          </div>
          <h1 className="font-heading text-2xl font-semibold">
            Merci pour votre commande !
          </h1>

          {order && isPaid ? (
            <div className="text-muted-foreground space-y-2 text-sm leading-relaxed">
              <p>
                Commande{" "}
                <span className="text-foreground font-semibold">
                  {order.orderNumber}
                </span>
              </p>
              <p>
                Total réglé :{" "}
                <span className="text-foreground font-semibold tabular-nums">
                  {formatPrice(order.totalCents)}
                </span>
              </p>
              <p>
                Un e-mail de confirmation vous sera envoyé avec votre numéro de suivi.
              </p>
            </div>
          ) : order && !isPaid ? (
            <p className="text-muted-foreground text-sm leading-relaxed">
              Votre paiement est en cours de confirmation. Vous recevrez un e-mail dès
              validation.
            </p>
          ) : (
            <p className="text-muted-foreground text-sm leading-relaxed">
              Votre paiement a été accepté. Un e-mail de confirmation vous sera envoyé.
            </p>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <ButtonLink href={trackingHref} className="rounded-full">
              Suivre ma commande
            </ButtonLink>
            <ButtonLink href="/catalogue" variant="outline" className="rounded-full">
              Continuer mes achats
            </ButtonLink>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
