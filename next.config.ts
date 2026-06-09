import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/checkout", destination: "/commande", permanent: true },
      { source: "/checkout/:path*", destination: "/commande/:path*", permanent: true },
      { source: "/catalogue/:slug", destination: "/produit/:slug", permanent: true },
      { source: "/legal/mentions-legales", destination: "/mentions-legales", permanent: true },
      { source: "/legal/cgv", destination: "/cgv", permanent: true },
      { source: "/legal/confidentialite", destination: "/confidentialite", permanent: true },
      { source: "/legal/cookies", destination: "/cookies", permanent: true },
      { source: "/legal/livraison-retours", destination: "/livraison-retours", permanent: true },
      { source: "/admin/legal", destination: "/admin/pages-legales", permanent: true },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "54321",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
