import Link from "next/link";
import { notFound } from "next/navigation";

import {
  EMAIL_PREVIEW_TYPES,
  isEmailPreviewType,
  renderEmailPreview,
} from "@/lib/email/preview";

interface DevEmailsPageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function DevEmailsPage({ searchParams }: DevEmailsPageProps) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const params = await searchParams;
  const selectedType = params.type ?? EMAIL_PREVIEW_TYPES[0].id;
  const activeType = isEmailPreviewType(selectedType)
    ? selectedType
    : EMAIL_PREVIEW_TYPES[0].id;

  const rendered = renderEmailPreview(activeType);

  return (
    <div className="min-h-screen bg-zinc-100">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
          Développement uniquement
        </p>
        <h1 className="mt-1 text-xl font-semibold text-zinc-900">
          Prévisualisation e-mails
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600">
          Aperçu HTML des e-mails transactionnels sans envoi réel. Pour tester la
          délivrabilité, configurez Resend ou SMTP et utilisez{" "}
          <code className="rounded bg-zinc-100 px-1">EMAIL_DEV_REDIRECT</code> dans{" "}
          <code className="rounded bg-zinc-100 px-1">.env.local</code>.
        </p>
        <nav className="mt-4 flex flex-wrap gap-2">
          {EMAIL_PREVIEW_TYPES.map((entry) => (
            <Link
              key={entry.id}
              href={`/dev/emails?type=${entry.id}`}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                entry.id === activeType
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
              }`}
            >
              {entry.label}
            </Link>
          ))}
        </nav>
        <p className="mt-3 text-sm text-zinc-700">
          <span className="font-medium">Sujet :</span> {rendered.subject}
        </p>
      </header>

      <div className="grid gap-6 p-6 lg:grid-cols-2">
        <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700">
            Rendu HTML
          </div>
          <iframe
            title={`Aperçu ${activeType}`}
            srcDoc={rendered.html}
            className="h-[720px] w-full border-0 bg-white"
            sandbox=""
          />
        </section>

        <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700">
            Version texte
          </div>
          <pre className="max-h-[720px] overflow-auto p-4 text-sm whitespace-pre-wrap text-zinc-800">
            {rendered.text}
          </pre>
        </section>
      </div>
    </div>
  );
}
