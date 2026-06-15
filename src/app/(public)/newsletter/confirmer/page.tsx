import type { Metadata } from "next";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/button-link";
import { confirmNewsletterSubscription } from "@/lib/newsletter/service";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { newsletterConfirmSchema } from "@/lib/validations/newsletter";

export const metadata: Metadata = buildPageMetadata({
  title: "Confirmation newsletter",
  description: "Confirmez votre inscription à la newsletter Tilouki.",
  path: "/newsletter/confirmer",
  noIndex: true,
});

interface NewsletterConfirmPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function NewsletterConfirmPage({
  searchParams,
}: NewsletterConfirmPageProps) {
  const params = await searchParams;
  const parsed = newsletterConfirmSchema.safeParse({ token: params.token ?? "" });

  if (!parsed.success) {
    return <ConfirmShell ok={false} message="Lien de confirmation invalide." />;
  }

  const result = await confirmNewsletterSubscription(parsed.data.token);

  return (
    <ConfirmShell ok={result.ok} message={result.ok ? result.message : result.error} />
  );
}

function ConfirmShell({ ok, message }: { ok: boolean; message: string }) {
  return (
    <div className="container-tilouki section-tilouki max-w-lg py-16 text-center">
      <h1 className="font-heading text-2xl font-semibold">
        {ok ? "Inscription confirmée" : "Confirmation impossible"}
      </h1>
      <p className="text-muted-foreground mt-4 text-sm leading-relaxed">{message}</p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <ButtonLink href="/" className="rounded-full">
          Retour à l&apos;accueil
        </ButtonLink>
        {ok ? (
          <Link
            href="/catalogue"
            className="text-primary text-sm font-semibold hover:underline"
          >
            Découvrir le catalogue
          </Link>
        ) : null}
      </div>
    </div>
  );
}
