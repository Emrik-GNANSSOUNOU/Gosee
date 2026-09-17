import type { Category, Lieu } from "@gosee/shared";

// Repli tant qu'aucune vraie photo n'est rattachée au lieu (le champ
// `photos` existe déjà dans le modèle : dès qu'il sera peuplé — import
// Google Places ou autre — ces visuels génériques disparaissent d'eux-mêmes.
const PLACEHOLDER_BY_CATEGORY: Record<Category, string> = {
  site_touristique: "/images/placeholders/site_touristique.jpg",
  loisir: "/images/placeholders/loisir.jpg",
  hotel: "/images/placeholders/hotel.jpg",
  activite: "/images/placeholders/activite.jpg",
  evenement: "/images/placeholders/evenement.jpg",
};

export function getLieuImage(lieu: Pick<Lieu, "photos" | "category">): string {
  return lieu.photos?.[0] ?? PLACEHOLDER_BY_CATEGORY[lieu.category];
}
