"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app-error]", error.digest ?? "unknown");
  }, [error]);

  return (
    <main className="container-tilouki flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
        Erreur inattendue
      </p>
      <h1 className="font-heading mt-2 text-3xl font-semibold">Un problème est survenu</h1>
      <p className="text-muted-foreground mt-3 max-w-md text-sm">
        Nous n&apos;avons pas pu afficher cette page. Vous pouvez réessayer ou revenir au catalogue.
      </p>
      <div className="mt-8 flex gap-3">
        <Button type="button" onClick={reset} className="rounded-full">
          Réessayer
        </Button>
        <ButtonLink href="/catalogue" variant="outline" className="rounded-full">
          Catalogue
        </ButtonLink>
      </div>
    </main>
  );
}
