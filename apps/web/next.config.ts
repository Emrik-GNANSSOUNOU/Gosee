import type { NextConfig } from "next";
import { CATEGORIES, CATEGORY_SLUGS } from "@gosee/shared";

const nextConfig: NextConfig = {
  transpilePackages: ["@gosee/shared"],
  // Vraies photos des lieux hébergées par Wikimedia Commons.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "thumb.wikimedia.org" },
    ],
  },
  // Anciennes pages catégorie (/?category=X), déjà présentes dans le sitemap
  // et possiblement indexées : redirection permanente vers la vraie page.
  async redirects() {
    return CATEGORIES.map((category) => ({
      source: "/",
      has: [{ type: "query" as const, key: "category", value: category }],
      destination: `/categorie/${CATEGORY_SLUGS[category]}`,
      permanent: true,
    }));
  },
};

export default nextConfig;
