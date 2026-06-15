import type { BlogCategory } from "@/content/blog/articles";

export const BLOG_CATEGORY_LABELS: Record<BlogCategory, string> = {
  tailles: "Tailles",
  matieres: "Matières",
  bebe: "Bébé",
  quotidien: "Quotidien",
  entretien: "Entretien",
  budget: "Budget",
};

export const BLOG_CATEGORIES = Object.keys(BLOG_CATEGORY_LABELS) as BlogCategory[];

export function getBlogCategoryLabel(category: BlogCategory): string {
  return BLOG_CATEGORY_LABELS[category];
}
