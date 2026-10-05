import {
  DUREE_LABELS,
  PRICE_LEVEL_LABELS,
  formatDistance,
  lieuxProches,
  type Lieu,
} from "@gosee/shared";
import { LieuCompactCard } from "./LieuCompactCard";

// Maillage interne : chaque fiche renvoie vers les lieux voisins, ce qui
// aide Google à découvrir les fiches et donne une suite à la visite.
export function AProximite({ lieu, lieux }: { lieu: Lieu; lieux: Lieu[] }) {
  const proches = lieuxProches(lieu, lieux);
  if (proches.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold text-neutral-900">À proximité</h2>
      <div className="mt-3 flex flex-col gap-3">
        {proches.map(({ lieu: proche, distanceKm }) => (
          <LieuCompactCard
            key={proche.slug}
            lieu={proche}
            chips={[
              `à ${formatDistance(distanceKm)}`,
              ...(proche.price_level ? [PRICE_LEVEL_LABELS[proche.price_level]] : []),
              ...(proche.duree ? [DUREE_LABELS[proche.duree]] : []),
            ]}
          />
        ))}
      </div>
    </section>
  );
}
