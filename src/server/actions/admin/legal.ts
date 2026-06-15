"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import {
  getAllLegalTemplatesForGeneration,
  getLegalPageOverwriteLabels,
  listLegalPagesRequiringOverwriteConfirmation,
} from "@/lib/legal/generate-pages";
import {
  getDefaultLegalTemplate,
  LEGAL_PAGE_ROUTES,
  type LegalPageSlug,
} from "@/lib/legal/templates";
import { CACHE_TAGS, legalTag } from "@/lib/supabase/cache";
import { getAdminSupabase } from "@/lib/supabase/queries/admin/client";
import {
  getAdminLegalPage,
  listAdminLegalPages,
} from "@/lib/supabase/queries/admin/legal";
import { requireAdmin } from "@/server/auth";

function revalidateLegalSlug(slug: string) {
  revalidateTag(CACHE_TAGS.legal, "max");
  revalidateTag(legalTag(slug), "max");
  revalidatePath("/admin/pages-legales");
  const route = LEGAL_PAGE_ROUTES[slug as LegalPageSlug];
  if (route) revalidatePath(route);
}

export async function updateLegalPageAction(
  formData: FormData,
): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await getAdminSupabase();
  if (!supabase) return { error: "Base de données indisponible." };

  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "");

  const { error } = await supabase
    .from("legal_pages")
    .update({ title, content })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidateLegalSlug(slug);
  revalidatePath("/admin/preparation");
  return {};
}

export async function resetLegalPageTemplateAction(
  slug: string,
): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await getAdminSupabase();
  if (!supabase) return { error: "Base de données indisponible." };

  const template = getDefaultLegalTemplate(slug);
  if (!template) return { error: "Modèle introuvable pour cette page." };

  const page = await getAdminLegalPage(slug);
  if (!page) return { error: "Page légale introuvable." };

  const { error } = await supabase
    .from("legal_pages")
    .update({ title: template.title, content: template.content })
    .eq("id", page.id);

  if (error) return { error: error.message };

  revalidateLegalSlug(slug);
  return {};
}

export interface GenerateAllLegalPagesResult {
  error?: string;
  needsConfirmation?: boolean;
  pagesToOverwrite?: string[];
  generatedCount?: number;
}

export async function generateAllLegalPagesAction(
  confirmOverwrite = false,
): Promise<GenerateAllLegalPagesResult> {
  await requireAdmin();
  const supabase = await getAdminSupabase();
  if (!supabase) return { error: "Base de données indisponible." };

  const pages = await listAdminLegalPages();
  const slugsToConfirm = listLegalPagesRequiringOverwriteConfirmation(pages);

  if (slugsToConfirm.length > 0 && !confirmOverwrite) {
    return {
      needsConfirmation: true,
      pagesToOverwrite: getLegalPageOverwriteLabels(slugsToConfirm),
    };
  }

  const templates = getAllLegalTemplatesForGeneration();
  let generatedCount = 0;

  for (const template of templates) {
    const page = pages.find((item) => item.slug === template.slug);
    if (!page) continue;

    const { error } = await supabase
      .from("legal_pages")
      .update({ title: template.title, content: template.content })
      .eq("id", page.id);

    if (error) return { error: error.message };
    revalidateLegalSlug(template.slug);
    generatedCount += 1;
  }

  revalidatePath("/admin/preparation");
  return { generatedCount };
}
