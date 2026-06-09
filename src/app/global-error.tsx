"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased">
        <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
          <h1 className="text-2xl font-semibold">Erreur critique</h1>
          <p className="text-neutral-600 mt-3 text-sm">
            L&apos;application a rencontré un problème. Rechargez la page ou revenez plus tard.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white"
          >
            Recharger
          </button>
        </main>
      </body>
    </html>
  );
}
