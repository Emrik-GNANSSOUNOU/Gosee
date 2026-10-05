import type { Category, Lieu } from "@gosee/shared";

// Repli tant qu'aucune vraie photo n'est rattachée au lieu : un visuel
// neutre aux couleurs de la catégorie plutôt qu'une photo générique d'un
// autre endroit (trompeuse pour le visiteur). Dès que `photos` est peuplé
// (Wikimedia Commons, Google Places...), la vraie photo prend le relais.
const PLACEHOLDER_BY_CATEGORY: Record<Category, string> = {
  site_touristique: "/images/placeholders/site_touristique.svg",
  loisir: "/images/placeholders/loisir.svg",
  hotel: "/images/placeholders/hotel.svg",
  activite: "/images/placeholders/activite.svg",
};

export function getLieuImage(lieu: Pick<Lieu, "photos" | "category">): string {
  return lieu.photos?.[0] ?? PLACEHOLDER_BY_CATEGORY[lieu.category];
}

// Props à passer à next/image : les SVG locaux ne passent pas par
// l'optimiseur d'images (inutile pour du vectoriel, et refusé par défaut).
export function lieuImageProps(lieu: Pick<Lieu, "photos" | "category">) {
  const src = getLieuImage(lieu);
  return { src, unoptimized: src.endsWith(".svg") };
}
