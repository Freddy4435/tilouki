"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { checkRateLimit } from "@/lib/security/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export interface AuthActionResult {
  error?: string;
}

export async function adminLoginAction(
  _prev: AuthActionResult,
  formData: FormData,
): Promise<AuthActionResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase n'est pas configuré." };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "E-mail et mot de passe requis." };
  }

  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    "unknown";

  const limit = await checkRateLimit({
    key: `${ip}:admin-login`,
    limit: 5,
    windowSec: 900,
  });

  if (!limit.allowed) {
    return { error: "Trop de tentatives. Réessayez dans 15 minutes." };
  }

  if (!isSupabaseAdminConfigured()) {
    return { error: "Configuration admin incomplète (service role requis)." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: "Identifiants incorrects." };
  }

  const admin = createAdminClient();
  const { data: adminUser } = await admin
    .from("admin_users")
    .select("id, email")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (
    !adminUser ||
    adminUser.email.trim().toLowerCase() !== email.trim().toLowerCase()
  ) {
    await supabase.auth.signOut();
    return { error: "Accès réservé aux administrateurs." };
  }

  redirect("/admin");
}

export async function adminLogoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/admin");
  redirect("/admin/login");
}
