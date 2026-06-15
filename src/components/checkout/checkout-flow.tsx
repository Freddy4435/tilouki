"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Loader2, Lock } from "lucide-react";

import { CartAlerts } from "@/components/cart/cart-alerts";
import { CheckoutErrorAlert } from "@/components/checkout/checkout-error-alert";
import { CheckoutFlowSkeleton } from "@/components/checkout/checkout-flow-skeleton";
import { CheckoutShippingRecap } from "@/components/checkout/checkout-shipping-recap";
import { CheckoutSteps } from "@/components/checkout/checkout-steps";
import { CheckoutSummary } from "@/components/checkout/checkout-summary";
import { CustomerForm } from "@/components/checkout/customer-form";
import { RelayPointSelector } from "@/components/shipping/relay-point-selector";
import { TermsCheckbox } from "@/components/checkout/terms-checkbox";
import { ReassuranceStrip } from "@/components/layout/reassurance-strip";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCartValidation } from "@/hooks/use-cart-validation";
import { useCartShipping } from "@/hooks/use-cart-shipping";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { useCartStore } from "@/lib/cart/store";
import {
  CHECKOUT_CLIENT_MESSAGES,
  mapCheckoutApiError,
} from "@/lib/checkout/client-messages";
import { isClientRelayPointSelectable } from "@/lib/shipping/client-guards";
import { formatPrice } from "@/lib/utils";
import {
  checkoutCustomerSchema,
  checkoutFormSchema,
  relayPointSchema,
  type CheckoutFormValues,
} from "@/lib/validations/checkout";

interface CheckoutFlowProps {
  /** Nonce CSP de la requête — transmis aux <Script> du widget Mondial Relay. */
  nonce?: string;
}

function scrollToCheckoutAlert(id: string) {
  requestAnimationFrame(() => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

export function CheckoutFlow({ nonce }: CheckoutFlowProps) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const carrier = useCartStore((s) => s.carrier);
  const subtotalCents = useCartStore((s) => s.subtotalCents());
  const canCheckout = useCartStore((s) => s.canCheckout());
  const validationMessages = useCartStore((s) => s.validationMessages);
  const [step, setStep] = useState(1);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const paymentErrorRef = useRef<HTMLDivElement>(null);
  const mounted = useIsMounted();
  const { shippingCents, carriers, rateLabel } = useCartShipping();
  const carrierLabel =
    carriers.find((info) => info.id === carrier)?.label ??
    (carrier === "chronopost" ? "Chronopost relais" : "Mondial Relay");
  const totalCents = subtotalCents + shippingCents;

  const { isValidating, error: validationError, validate } = useCartValidation();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      relayPoint: {
        id: "",
        name: "",
        address: "",
        zip: "",
        city: "",
        country: "FR",
      },
      acceptTerms: false,
    },
    mode: "onBlur",
  });

  // useWatch (et non form.watch) : compatible React Compiler — pas de skip memo sur ce composant.
  const relayPoint = useWatch({ control: form.control, name: "relayPoint" });

  useEffect(() => {
    if (!mounted) return;
    if (items.length === 0) {
      router.replace("/panier");
    }
  }, [items.length, mounted, router]);

  useEffect(() => {
    if (paymentError && paymentErrorRef.current) {
      scrollToCheckoutAlert("checkout-payment-error");
    }
  }, [paymentError]);

  if (!mounted || items.length === 0) {
    return <CheckoutFlowSkeleton />;
  }

  const goToStep2 = async () => {
    setPaymentError(null);
    const values = form.getValues();
    const result = checkoutCustomerSchema.safeParse({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
    });

    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string") {
          form.setError(field as keyof CheckoutFormValues, { message: issue.message });
        }
      }
      return;
    }

    setStep(2);
  };

  const goToStep3 = async () => {
    setPaymentError(null);
    const relayPointValue = form.getValues("relayPoint");
    const result = relayPointSchema.safeParse(relayPointValue);

    if (!result.success) {
      form.setError("relayPoint", {
        message:
          result.error.issues[0]?.message ?? CHECKOUT_CLIENT_MESSAGES.relayMissing,
      });
      scrollToCheckoutAlert("relay-point-selector");
      return;
    }

    if (!isClientRelayPointSelectable(relayPointValue.id)) {
      form.setError("relayPoint", {
        message: CHECKOUT_CLIENT_MESSAGES.relayInvalid,
      });
      scrollToCheckoutAlert("relay-point-selector");
      return;
    }

    setStep(3);
    scrollToCheckoutAlert("checkout-order-summary");
  };

  const handlePayment = form.handleSubmit(
    async (values) => {
      setPaymentError(null);

      const relayCheck = relayPointSchema.safeParse(values.relayPoint);
      if (!relayCheck.success || !isClientRelayPointSelectable(values.relayPoint.id)) {
        setPaymentError(CHECKOUT_CLIENT_MESSAGES.relayMissingBeforePay);
        setStep(2);
        return;
      }

      const stockValid = await validate();
      if (!stockValid) {
        const messages = useCartStore.getState().validationMessages;
        setPaymentError(
          validationError
            ? CHECKOUT_CLIENT_MESSAGES.stockCheckFailed
            : (messages[0] ?? CHECKOUT_CLIENT_MESSAGES.stockChanged),
        );
        return;
      }

      if (!canCheckout) {
        setPaymentError(CHECKOUT_CLIENT_MESSAGES.stockChanged);
        return;
      }

      setIsPaying(true);

      try {
        const response = await fetch("/api/checkout/create-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer: {
              firstName: values.firstName,
              lastName: values.lastName,
              email: values.email,
              phone: values.phone,
            },
            relayPoint: values.relayPoint,
            carrier,
            items: items.map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
            })),
          }),
        });

        const data = (await response.json()) as { url?: string; error?: string };

        if (!response.ok || !data.url) {
          setPaymentError(mapCheckoutApiError(response.status, data.error));
          setIsPaying(false);
          return;
        }

        globalThis.location.assign(data.url);
      } catch {
        setPaymentError(CHECKOUT_CLIENT_MESSAGES.networkError);
        setIsPaying(false);
      }
    },
    (fieldErrors) => {
      if (fieldErrors.acceptTerms) {
        scrollToCheckoutAlert("acceptTerms");
      }
    },
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <div className="order-2 lg:order-1">
        <CheckoutSteps currentStep={step} />

        <CartAlerts
          items={items}
          validationMessages={validationMessages}
          error={validationError}
          isValidating={isValidating}
          className="mb-6"
        />

        <form onSubmit={(event) => void handlePayment(event)}>
          {step === 1 ? (
            <Card className="shadow-[var(--shadow-soft)]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Vos informations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <CustomerForm form={form} />
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                  <ButtonLink href="/panier" variant="outline">
                    Retour au panier
                  </ButtonLink>
                  <Button type="button" onClick={() => void goToStep2()}>
                    Continuer vers la livraison
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {step === 2 ? (
            <Card className="shadow-[var(--shadow-soft)]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Livraison en point relais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div id="relay-point-selector">
                  <RelayPointSelector form={form} nonce={nonce} />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    Retour
                  </Button>
                  <Button type="button" onClick={() => void goToStep3()}>
                    Continuer vers le paiement
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {step === 3 ? (
            <Card className="shadow-[var(--shadow-soft)]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Paiement sécurisé
                </CardTitle>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Vérifiez le résumé de commande, la livraison et le total TTC avant de
                  payer.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-primary/5 border-primary/15 rounded-[var(--radius-card)] border px-4 py-3 lg:hidden">
                  <p className="text-muted-foreground text-xs">Total à payer (TTC)</p>
                  <p className="text-2xl font-bold tabular-nums">
                    {formatPrice(totalCents)}
                  </p>
                </div>

                <CheckoutShippingRecap
                  carrier={carrier}
                  carrierLabel={carrierLabel}
                  shippingCents={shippingCents}
                  rateLabel={rateLabel}
                  relayPoint={relayPoint}
                  showReturnInfo
                  className="bg-muted/20 rounded-[var(--radius-card)] border p-4"
                />

                <p className="text-muted-foreground text-sm leading-relaxed">
                  En cliquant sur « Commander et payer », vous confirmez votre commande
                  avec obligation de paiement et serez redirigé vers Stripe pour régler
                  le montant total TTC affiché. Aucun débit n&apos;est effectué tant que
                  la transaction n&apos;est pas confirmée.
                </p>
                <ReassuranceStrip variant="compact" className="justify-start" />

                <TermsCheckbox form={form} />

                {paymentError ? (
                  <div id="checkout-payment-error" ref={paymentErrorRef}>
                    <CheckoutErrorAlert message={paymentError} />
                  </div>
                ) : null}

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(2)}
                    disabled={isPaying}
                  >
                    Retour
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isPaying || isValidating || !canCheckout}
                  >
                    {isPaying ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Lock className="size-4" />
                    )}
                    {isPaying ? "Redirection…" : "Commander et payer"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </form>
      </div>

      <div className="order-1 lg:order-2">
        <CheckoutSummary form={form} />
      </div>
    </div>
  );
}
