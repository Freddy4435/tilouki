import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/constants/site";

export const alt = `${siteConfig.name} — vêtements enfants`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px",
          background: "linear-gradient(135deg, #f8efe8 0%, #eef4f8 55%, #f5f0ea 100%)",
          color: "#1c1917",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#78716c",
            marginBottom: 20,
          }}
        >
          Boutique française
        </div>
        <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.05, maxWidth: 900 }}>
          {siteConfig.name}
        </div>
        <div style={{ fontSize: 34, marginTop: 24, color: "#57534e", maxWidth: 820, lineHeight: 1.35 }}>
          Vêtements enfants, livraison en point relais
        </div>
      </div>
    ),
    { ...size },
  );
}
