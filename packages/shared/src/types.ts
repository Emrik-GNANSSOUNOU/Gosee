export type Category =
  | "site_touristique"
  | "loisir"
  | "hotel"
  | "activite"
  | "evenement";

export const CATEGORIES: Category[] = [
  "site_touristique",
  "loisir",
  "hotel",
  "activite",
  "evenement",
];

export const CATEGORY_LABELS: Record<Category, string> = {
  site_touristique: "Site touristique",
  loisir: "Loisir",
  hotel: "Hôtel",
  activite: "Activité",
  evenement: "Événement",
};

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
  horaires: unknown | null;
  contact: string | null;
  photos: string[] | null;
  verified: boolean;
  source: string | null;
}
