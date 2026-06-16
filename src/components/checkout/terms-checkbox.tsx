"use client";

import Link from "next/link";
import type { UseFormReturn } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { CheckoutFormValues } from "@/lib/validations/checkout";

interface TermsCheckboxProps {
  form: UseFormReturn<CheckoutFormValues>;
}

export function TermsCheckbox({ form }: TermsCheckboxProps) {
  const {
    setValue,
    watch,
    formState: { errors },
  } = form;

  const accepted = watch("acceptTerms") === true;

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <Checkbox
          id="acceptTerms"
          checked={accepted}
          aria-invalid={Boolean(errors.acceptTerms)}
          onCheckedChange={(checked) =>
            setValue("acceptTerms", checked, { shouldValidate: true })
          }
        />
        <Label htmlFor="acceptTerms" className="text-sm leading-relaxed font-normal">
          J&apos;ai lu et j&apos;accepte les{" "}
          <Link
            href="/cgv"
            className="font-medium text-foreground underline underline-offset-4"
            target="_blank"
          >
            conditions générales de vente
          </Link>
          , les informations de{" "}
          <Link
            href="/livraison-retours"
            className="font-medium text-foreground underline underline-offset-4"
            target="_blank"
          >
            livraison et retours
          </Link>{" "}
          et la{" "}
          <Link
            href="/confidentialite"
            className="font-medium text-foreground underline underline-offset-4"
            target="_blank"
          >
            politique de confidentialité
          </Link>
          .
        </Label>
      </div>
      {errors.acceptTerms?.message ? (
        <p className="text-destructive text-xs" role="alert">
          {errors.acceptTerms.message}
        </p>
      ) : null}
    </div>
  );
}
