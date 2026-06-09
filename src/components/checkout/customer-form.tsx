"use client";

import type { UseFormReturn } from "react-hook-form";

import { FormField } from "@/components/checkout/form-field";
import { Input } from "@/components/ui/input";
import type { CheckoutFormValues } from "@/lib/validations/checkout";

interface CustomerFormProps {
  form: UseFormReturn<CheckoutFormValues>;
}

export function CustomerForm({ form }: CustomerFormProps) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField id="firstName" label="Prénom" error={errors.firstName?.message}>
        <Input
          id="firstName"
          autoComplete="given-name"
          aria-invalid={Boolean(errors.firstName)}
          {...register("firstName")}
        />
      </FormField>

      <FormField id="lastName" label="Nom" error={errors.lastName?.message}>
        <Input
          id="lastName"
          autoComplete="family-name"
          aria-invalid={Boolean(errors.lastName)}
          {...register("lastName")}
        />
      </FormField>

      <FormField
        id="email"
        label="E-mail"
        error={errors.email?.message}
        className="sm:col-span-2"
      >
        <Input
          id="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
      </FormField>

      <FormField
        id="phone"
        label="Téléphone"
        error={errors.phone?.message}
        className="sm:col-span-2"
      >
        <Input
          id="phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder="06 12 34 56 78"
          aria-invalid={Boolean(errors.phone)}
          {...register("phone")}
        />
      </FormField>
    </div>
  );
}
