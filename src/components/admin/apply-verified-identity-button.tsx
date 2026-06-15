"use client";

import { useState, type RefObject } from "react";

import { Button } from "@/components/ui/button";
import { VERIFIED_SELLER_IDENTITY } from "@/lib/legal/verified-seller-identity";

interface ApplyVerifiedIdentityFieldRefs {
  legalName: RefObject<HTMLInputElement | null>;
  legalStatus: RefObject<HTMLInputElement | null>;
  address: RefObject<HTMLTextAreaElement | null>;
}

interface ApplyVerifiedIdentityButtonProps {
  fieldRefs: ApplyVerifiedIdentityFieldRefs;
  siretInputId?: string;
}

function writeFieldValue(
  element: HTMLInputElement | HTMLTextAreaElement | null,
  value: string,
) {
  if (!element) return;
  element.value = value;
}

export function ApplyVerifiedIdentityButton({
  fieldRefs,
  siretInputId = "siret",
}: ApplyVerifiedIdentityButtonProps) {
  const [message, setMessage] = useState<string | null>(null);

  const apply = () => {
    writeFieldValue(fieldRefs.legalName.current, VERIFIED_SELLER_IDENTITY.legalName);
    writeFieldValue(
      fieldRefs.legalStatus.current,
      VERIFIED_SELLER_IDENTITY.legalStatus,
    );
    writeFieldValue(fieldRefs.address.current, VERIFIED_SELLER_IDENTITY.address);

    const siretInput = document.getElementById(siretInputId) as HTMLInputElement | null;
    writeFieldValue(siretInput, VERIFIED_SELLER_IDENTITY.siret);

    setMessage(
      "Identité SIRET vérifiée appliquée au formulaire. Vérifiez puis enregistrez.",
    );
  };

  return (
    <div className="space-y-2">
      <Button type="button" variant="outline" size="sm" onClick={apply}>
        Appliquer l&apos;identité SIRET vérifiée
      </Button>
      {message ? <p className="text-muted-foreground text-xs">{message}</p> : null}
    </div>
  );
}
