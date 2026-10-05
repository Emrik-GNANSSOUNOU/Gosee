import { CATEGORY_PLURAL_LABELS, categoryFromSlug } from "@gosee/shared";
import { dansLePaysPrincipal } from "@/lib/categories";
import { getAllLieux } from "@/lib/lieux";
import { ogImage, OG_SIZE } from "@/lib/ogImage";

export const alt = "Catégorie de lieux sur Gosee";
export const size = OG_SIZE;
export const contentType = "image/png";
export const revalidate = 300;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const category = categoryFromSlug((await params).slug);
  const lieux = await getAllLieux();
  if (!category) return ogImage({ surtitre: "Gosee", titre: "Catégorie introuvable" });

  const n = lieux.filter((l) => l.category === category).length;
  return ogImage({
    surtitre: `${n} adresses ${dansLePaysPrincipal(lieux)}`,
    titre: CATEGORY_PLURAL_LABELS[category],
    pastilles: ["Budget", "Durée", "Itinéraire"],
  });
}
