import Link from "next/link";

import { ButtonLink } from "@/components/ui/button-link";

export default function NotFound() {
  return (
    <main className="container-tilouki flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
        Erreur 404
      </p>
      <h1 className="font-heading mt-2 text-3xl font-semibold">Page introuvable</h1>
      <p className="text-muted-foreground mt-3 max-w-md text-sm">
        La page demandée n&apos;existe pas ou a été déplacée.
      </p>
      <div className="mt-8 flex gap-3">
        <ButtonLink href="/" className="rounded-full">
          Retour à l&apos;accueil
        </ButtonLink>
        <ButtonLink href="/catalogue" variant="outline" className="rounded-full">
          Voir le catalogue
        </ButtonLink>
      </div>
      <Link href="/" className="sr-only">
        Accueil
      </Link>
    </main>
  );
}
