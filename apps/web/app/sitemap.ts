import type { MetadataRoute } from "next";
import { CATEGORIES, CATEGORY_SLUGS } from "@gosee/shared";
import { supabase } from "@/lib/supabaseClient";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data } = await supabase.from("lieux").select("slug, category, updated_at");

  const lieuEntries: MetadataRoute.Sitemap = (data ?? [])
    .filter((lieu) => lieu.slug)
    .map((lieu) => ({
      url: `${SITE_URL}/lieux/${lieu.slug}`,
      lastModified: lieu.updated_at ?? undefined,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  // Seulement les catégories qui ont des lieux (les autres renvoient une 404).
  const presentes = CATEGORIES.filter((c) => (data ?? []).some((l) => l.category === c));
  const categoryEntries: MetadataRoute.Sitemap = presentes.map((category) => ({
    url: `${SITE_URL}/categorie/${CATEGORY_SLUGS[category]}`,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/recommandations`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/creer-ma-sortie`, changeFrequency: "weekly", priority: 0.9 },
    ...categoryEntries,
    ...lieuEntries,
  ];
}
