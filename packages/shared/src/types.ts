import type { Ambiance, Duree, IdealPour, PriceLevel } from "./pratique";

export type Category = "site_touristique" | "loisir" | "hotel" | "activite";

export const CATEGORIES: Category[] = ["site_touristique", "loisir", "hotel", "activite"];

export const CATEGORY_LABELS: Record<Category, string> = {
  site_touristique: "Site touristique",
  loisir: "Loisir",
  hotel: "Hôtel",
  activite: "Activité",
};

export const CATEGORY_ICONS: Record<Category, string> = {
  site_touristique: "🏛️",
  loisir: "🌴",
  hotel: "🏨",
  activite: "🎯",
};

// Segments d'URL publics des pages catégorie (/categorie/<slug>) : en
// français lisible, distincts des codes internes stockés en base.
export const CATEGORY_SLUGS: Record<Category, string> = {
  site_touristique: "sites-touristiques",
  loisir: "loisirs",
  hotel: "hotels",
  activite: "activites",
};

export const CATEGORY_PLURAL_LABELS: Record<Category, string> = {
  site_touristique: "Sites touristiques",
  loisir: "Loisirs",
  hotel: "Hôtels",
  activite: "Activités",
};

export function categoryFromSlug(slug: string): Category | null {
  const found = (Object.keys(CATEGORY_SLUGS) as Category[]).find((c) => CATEGORY_SLUGS[c] === slug);
  return found ?? null;
}

// « au Bénin », « en Côte d'Ivoire »... : les marchés d'expansion prévus ont
// chacun leur préposition ; repli neutre pour un pays non listé.
const COUNTRY_IN: Record<string, string> = {
  Bénin: "au Bénin",
  Togo: "au Togo",
  Ghana: "au Ghana",
  Sénégal: "au Sénégal",
  Nigeria: "au Nigeria",
  "Burkina Faso": "au Burkina Faso",
  Niger: "au Niger",
  "Côte d'Ivoire": "en Côte d'Ivoire",
};

export function dansLePays(country: string): string {
  return COUNTRY_IN[country] ?? `(${country})`;
}

export interface Lieu {
  id: string;
  slug: string;
  nom: string;
  category: Category;
  description: string | null;
  department: string | null;
  country: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  google_maps_url: string | null;
  horaires: string | null;
  contact: string | null;
  website: string | null;
  rating: number | null;
  reviews_count: number | null;
  photos: string[] | null;
  verified: boolean;
  source: string | null;
  // Optionnels : absents tant que la migration "infos pratiques" de
  // supabase/schema.sql n'a pas été appliquée.
  prix?: string | null;
  price_level?: PriceLevel | null;
  duree?: Duree | null;
  tags?: Ambiance[] | null;
  ideal_pour?: IdealPour[] | null;
  infos_estimees?: boolean;
}
