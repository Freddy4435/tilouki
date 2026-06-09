"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateOrderTrackingAction } from "@/server/actions/admin/orders";

interface OrderTrackingFormProps {
  orderId: string;
  trackingNumber: string | null;
  disabled?: boolean;
}

export function OrderTrackingForm({
  orderId,
  trackingNumber,
  disabled,
}: OrderTrackingFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(trackingNumber ?? "");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      setError(null);
      const result = await updateOrderTrackingAction({
        orderId,
        trackingNumber: value.trim(),
      });
      if (result.error) setError(result.error);
      else router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="tracking-update">Numéro de suivi colis</Label>
        <Input
          id="tracking-update"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ex. 3S1234567890"
          disabled={disabled || isPending}
        />
      </div>
      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" size="sm" variant="outline" disabled={disabled || isPending}>
        {isPending ? "Mise à jour…" : "Mettre à jour le suivi"}
      </Button>
    </form>
  );
}
