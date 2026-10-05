import { ogImage, OG_SIZE } from "@/lib/ogImage";

export const alt = "Gosee — découvrir, choisir et planifier ses sorties";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogImage({
    surtitre: "Je ne sais pas quoi faire ?",
    titre: "Voilà exactement ce que tu peux faire.",
    pastilles: ["Lieux", "Autour de moi", "Idées de sortie"],
  });
}
