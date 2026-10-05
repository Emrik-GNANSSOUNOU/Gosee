import { CATEGORY_LABELS, DUREE_LABELS, PRICE_LEVEL_LABELS } from "@gosee/shared";
import { getLieuBySlug } from "@/lib/lieux";
import { ogImage, OG_SIZE } from "@/lib/ogImage";

export const alt = "Fiche lieu Gosee";
export const size = OG_SIZE;
export const contentType = "image/png";
export const revalidate = 300;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const lieu = await getLieuBySlug((await params).slug);
  if (!lieu) return ogImage({ surtitre: "Gosee", titre: "Lieu introuvable" });

  return ogImage({
    surtitre: [CATEGORY_LABELS[lieu.category], lieu.department, lieu.country].filter(Boolean).join(" · "),
    titre: lieu.nom,
    pastilles: [
      ...(lieu.price_level ? [PRICE_LEVEL_LABELS[lieu.price_level]] : []),
      ...(lieu.duree ? [DUREE_LABELS[lieu.duree]] : []),
    ],
  });
}
