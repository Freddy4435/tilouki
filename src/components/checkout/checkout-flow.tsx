"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Lock } from "lucide-react";

import { CartAlerts } from "@/components/cart/cart-alerts";
import { CheckoutSteps } from "@/components/checkout/checkout-steps";
import { CheckoutSummary } from "@/components/checkout/checkout-summary";
import { CustomerForm } from "@/components/checkout/customer-form";
import { RelayPointSelector } from "@/components/shipping/relay-point-selector";
import { TermsCheckbox } from "@/components/checkout/terms-checkbox";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCartValidation } from "@/hooks/use-cart-validation";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { useCartStore } from "@/lib/cart/store";
import {
  checkoutCustomerSchema,
  checkoutFormSchema,
  relayPointSchema,
  type CheckoutFormValues,
} from "@/lib/validations/checkout";

export function CheckoutFlow() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const canCheckout = useCartStore((s) => s.canCheckout());
  const validationMessages = useCartStore((s) => s.validationMessages);
  const [step, setStep] = useState(1);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const mounted = useIsMounted();

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

  useEffect(() => {
    if (!mounted) return;
    if (items.length === 0) {
      router.replace("/panier");
    }
  }, [items.length, mounted, router]);

  if (!mounted || items.length === 0) {
    return null;
  }

  const goToStep2 = async () => {
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
    const relayPoint = form.getValues("relayPoint");
    const result = relayPointSchema.safeParse(relayPoint);

    if (!result.success) {
      form.setError("relayPoint", {
        message: result.error.issues[0]?.message ?? "Sélectionnez un point relais.",
      });
      return;
    }

    setStep(3);
  };

  const handlePayment = form.handleSubmit(async (values) => {
    setPaymentError(null);

    const stockValid = await validate();
    if (!stockValid || !canCheckout) {
      setPaymentError(
        "Certains articles ne sont plus disponibles en quantité suffisante. Retournez au panier pour ajuster.",
      );
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
          items: items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (response.status === 429) {
        setPaymentError("Trop de tentatives. Patientez une minute avant de réessayer.");
        setIsPaying(false);
        return;
      }

      if (!response.ok || !data.url) {
        setPaymentError(data.error ?? "Impossible de lancer le paiement.");
        setIsPaying(false);
        return;
      }

      globalThis.location.assign(data.url);
    } catch {
      setPaymentError("Erreur réseau. Réessayez dans un instant.");
      setIsPaying(false);
    }
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div>
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
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-xl">Vos informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <CustomerForm form={form} />
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                  <ButtonLink href="/panier" variant="outline" className="rounded-full">
                    Retour au panier
                  </ButtonLink>
                  <Button type="button" className="rounded-full" onClick={() => void goToStep2()}>
                    Continuer vers la livraison
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {step === 2 ? (
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-xl">Livraison en point relais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <RelayPointSelector form={form} />
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => setStep(1)}
                  >
                    Retour
                  </Button>
                  <Button type="button" className="rounded-full" onClick={() => void goToStep3()}>
                    Continuer vers le paiement
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {step === 3 ? (
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-xl">Paiement sécurisé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Vous serez redirigé vers Stripe pour régler votre commande en toute sécurité.
                  Aucun paiement n&apos;est enregistré tant que la transaction n&apos;est pas
                  confirmée.
                </p>

                <TermsCheckbox form={form} />

                {paymentError ? (
                  <p className="text-destructive text-sm" role="alert">
                    {paymentError}
                  </p>
                ) : null}

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => setStep(2)}
                    disabled={isPaying}
                  >
                    Retour
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    className="rounded-full"
                    disabled={isPaying || isValidating || !canCheckout}
                  >
                    {isPaying ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Lock className="size-4" />
                    )}
                    {isPaying ? "Redirection…" : "Payer en toute sécurité"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </form>
      </div>

      <CheckoutSummary form={form} />
    </div>
  );
}
