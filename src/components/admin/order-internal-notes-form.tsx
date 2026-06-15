"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateOrderInternalNotesAction } from "@/server/actions/admin/orders";

interface OrderInternalNotesFormProps {
  orderId: string;
  initialNotes: string | null;
}

export function OrderInternalNotesForm({
  orderId,
  initialNotes,
}: OrderInternalNotesFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      setError(null);
      const result = await updateOrderInternalNotesAction({
        orderId,
        internalNotes: notes,
      });
      if (result.error) setError(result.error);
      else router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="internal-notes">Notes internes</Label>
        <textarea
          id="internal-notes"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes visibles uniquement par l'équipe admin…"
          className="border-input bg-background w-full rounded-lg border px-2.5 py-2 text-sm"
        />
      </div>
      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Enregistrement…" : "Enregistrer les notes"}
      </Button>
    </form>
  );
}
