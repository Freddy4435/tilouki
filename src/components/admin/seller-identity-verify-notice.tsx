import { Info } from "lucide-react";

import {
  SELLER_IDENTITY_VERIFY_NOTICE,
  type SellerIdentityFieldKey,
} from "@/lib/legal/verified-seller-identity";

const FIELD_LABELS: Record<SellerIdentityFieldKey, string> = {
  legalName: "nom légal",
  legalStatus: "statut juridique",
  siret: "SIRET",
  address: "adresse",
};

interface SellerIdentityVerifyNoticeProps {
  suggestedFields?: SellerIdentityFieldKey[];
}

export function SellerIdentityVerifyNotice({
  suggestedFields = [],
}: SellerIdentityVerifyNoticeProps) {
  return (
    <div
      className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2.5 text-sm text-sky-950 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-50"
      role="note"
    >
      <p className="flex items-start gap-2 font-medium">
        <Info className="mt-0.5 size-4 shrink-0" />
        {SELLER_IDENTITY_VERIFY_NOTICE}
      </p>
      <p className="mt-1 text-xs leading-relaxed">
        Les valeurs d&apos;identité proviennent de l&apos;annuaire public des
        entreprises (SIRET {suggestedFields.length > 0 ? "proposé" : "enregistré"}).
        Relisez nom, statut, SIRET et adresse, complétez téléphone, e-mail et médiateur,
        puis enregistrez.
      </p>
      {suggestedFields.length > 0 ? (
        <p className="mt-1 text-xs leading-relaxed">
          Champs préremplis à confirmer :{" "}
          {suggestedFields.map((field) => FIELD_LABELS[field]).join(", ")}.
        </p>
      ) : null}
    </div>
  );
}
