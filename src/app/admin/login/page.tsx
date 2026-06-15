import type { Metadata } from "next";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { siteConfig } from "@/lib/constants/site";

export const metadata: Metadata = {
  title: "Connexion admin",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="bg-muted/30 flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-heading text-2xl">{siteConfig.name}</CardTitle>
          <CardDescription>
            Connexion à l&apos;espace d&apos;administration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminLoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
