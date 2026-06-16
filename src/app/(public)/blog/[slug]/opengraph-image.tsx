import { ImageResponse } from "next/og";

import { getBlogArticleBySlug } from "@/content/blog/articles";
import { getBlogCategoryLabel } from "@/lib/blog/categories";
import { siteConfig, buyingGuidesNav } from "@/lib/constants/site";

export const alt = `Article — ${buyingGuidesNav.label} Tilouki`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface BlogOpenGraphImageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogOpenGraphImage({ params }: BlogOpenGraphImageProps) {
  const { slug } = await params;
  const article = getBlogArticleBySlug(slug);
  const title = article?.title ?? `${buyingGuidesNav.label} Tilouki`;
  const category = article
    ? getBlogCategoryLabel(article.category)
    : "Conseils enfants";
  const description =
    article?.metaDescription ??
    "Conseils tailles, matières et quotidien — la boutique française de vêtements enfants.";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "56px 64px",
        background: "linear-gradient(145deg, #f8f6f0 0%, #e4efe8 50%, #fffcf7 100%)",
        color: "#2e2a25",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: "#3d6b5e",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {siteConfig.name} — {buyingGuidesNav.label}
        </div>
        <div
          style={{
            display: "inline-flex",
            alignSelf: "flex-start",
            padding: "8px 16px",
            borderRadius: 999,
            background: "rgba(61, 107, 94, 0.12)",
            color: "#3d6b5e",
            fontSize: 20,
            fontWeight: 600,
          }}
        >
          {category}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 980 }}>
        <div
          style={{
            fontSize: 52,
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}
        >
          {title.length > 90 ? `${title.slice(0, 87)}…` : title}
        </div>
        <div
          style={{
            fontSize: 26,
            color: "#57534e",
            lineHeight: 1.4,
          }}
        >
          {description.length > 120 ? `${description.slice(0, 117)}…` : description}
        </div>
      </div>
    </div>,
    { ...size },
  );
}
