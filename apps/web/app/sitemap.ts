import type { MetadataRoute } from "next";
import { CATEGORIES } from "@gosee/shared";
import { supabase } from "@/lib/supabaseClient";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data } = await supabase.from("lieux").select("slug, updated_at");

  const lieuEntries: MetadataRoute.Sitemap = (data ?? [])
    .filter((lieu) => lieu.slug)
    .map((lieu) => ({
      url: `${SITE_URL}/lieux/${lieu.slug}`,
      lastModified: lieu.updated_at ?? undefined,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  const categoryEntries: MetadataRoute.Sitemap = CATEGORIES.map((category) => ({
    url: `${SITE_URL}/?category=${category}`,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    ...categoryEntries,
    ...lieuEntries,
  ];
}
