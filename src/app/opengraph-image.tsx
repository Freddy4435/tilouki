import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { brandAssets, siteConfig } from "@/lib/constants/site";

export const alt = `${siteConfig.name} — vêtements enfants`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logoPath = join(process.cwd(), "public", brandAssets.header.png.replace(/^\//, ""));
  const logoBuffer = await readFile(logoPath);
  const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: 28,
        padding: "64px 72px",
        background: "linear-gradient(135deg, #f8f6f0 0%, #e4efe8 55%, #fffcf7 100%)",
        color: "#2e2a25",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse OG */}
      <img
        src={logoSrc}
        alt=""
        width={520}
        height={204}
        style={{ objectFit: "contain" }}
      />
      <div
        style={{
          fontSize: 30,
          color: "#57534e",
          maxWidth: 820,
          lineHeight: 1.35,
        }}
      >
        Vêtements enfants, livraison en point relais
      </div>
    </div>,
    { ...size },
  );
}
