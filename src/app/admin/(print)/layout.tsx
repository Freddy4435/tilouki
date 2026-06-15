import { requireAdmin } from "@/server/auth";

/** Layout minimal pour l'impression — sans navigation admin. */
export default async function AdminPrintLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdmin();
  return <div className="min-h-screen bg-white text-black">{children}</div>;
}
