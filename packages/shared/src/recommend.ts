import { distanceToLieu, type Coordinates } from "./geo";
import {
  AMBIANCE_LABELS,
  DUREE_LABELS,
  IDEAL_POUR_LABELS,
  PRICE_LEVEL_LABELS,
  type Ambiance,
  type Duree,
  type IdealPour,
  type PriceLevel,
} from "./pratique";
import type { Lieu } from "./types";

// Moteur de recommandations à base de règles (pas d'IA) : les critères
// excluent ce qui ne rentre pas dans le budget/le temps, puis un score
// classe le reste. Chaque suggestion porte ses raisons, affichées telles
// quelles à l'utilisateur.

export interface RecoCriteres {
  budget: PriceLevel;
  temps: Duree;
  groupe: IdealPour;
  ambiances: Ambiance[];
  position?: Coordinates | null;
}

export interface Recommandation {
  lieu: Lieu;
  score: number;
  distanceKm: number | null;
  raisons: string[];
}

const PRICE_ORDER: PriceLevel[] = ["gratuit", "economique", "moyen", "eleve"];
const DUREE_ORDER: Duree[] = ["courte", "demi_journee", "journee", "sejour"];
const AMBIANCES = Object.keys(AMBIANCE_LABELS) as Ambiance[];
const GROUPES = Object.keys(IDEAL_POUR_LABELS) as IdealPour[];

// Distance à vol d'oiseau au-delà de laquelle le trajet mangerait le temps
// disponible (routes lentes : on reste prudent).
export const MAX_DISTANCE_KM: Record<Duree, number> = {
  courte: 15,
  demi_journee: 60,
  journee: 200,
  sejour: Infinity,
};

// En dessous de cette distance, deux lieux sont considérés comme la même
// sortie (ex. « Ganvié » et « Sortie pirogue à Ganvié ») : on n'en garde qu'un.
const SAME_PLACE_KM = 1;

export interface RecoResultat {
  recommandations: Recommandation[];
  // true quand aucun lieu ne correspondait aux ambiances choisies et que la
  // recherche a été élargie à toutes les ambiances (à dire à l'utilisateur).
  elargi: boolean;
}

// Ne renvoie jamais « rien » si une sortie tient dans le budget et le temps :
// l'utilisateur vient chercher une idée, pas un écran vide.
export function recommander(lieux: Lieu[], criteres: RecoCriteres, limit = 5): RecoResultat {
  const strict = classer(lieux, criteres, limit);
  if (strict.length > 0 || criteres.ambiances.length === 0) {
    return { recommandations: strict, elargi: false };
  }
  const large = classer(lieux, { ...criteres, ambiances: [] }, limit);
  return { recommandations: large, elargi: large.length > 0 };
}

function classer(lieux: Lieu[], criteres: RecoCriteres, limit: number): Recommandation[] {
  const { budget, temps, groupe, ambiances, position } = criteres;
  const maxPrice = PRICE_ORDER.indexOf(budget);
  const maxDuree = DUREE_ORDER.indexOf(temps);
  const maxDistance = MAX_DISTANCE_KM[temps];

  const candidats: Recommandation[] = [];

  for (const lieu of lieux) {
    // Un hôtel n'est pas une sortie en soi : il reviendra avec le pilier
    // « Créer sa sortie » (activité + hébergement).
    if (lieu.category === "hotel") continue;
    // On ne propose jamais une sortie signalée comme déconseillée.
    if (lieu.alerte) continue;
    if (!lieu.price_level || !lieu.duree) continue;
    if (PRICE_ORDER.indexOf(lieu.price_level) > maxPrice) continue;
    if (DUREE_ORDER.indexOf(lieu.duree) > maxDuree) continue;

    const tags = lieu.tags ?? [];
    const communes = ambiances.filter((a) => tags.includes(a));
    if (ambiances.length > 0 && communes.length === 0) continue;

    const distanceKm = position ? distanceToLieu(lieu, position) : null;
    if (position && (distanceKm == null || distanceKm > maxDistance)) continue;

    let score = communes.length * 3;
    const pourGroupe = (lieu.ideal_pour ?? []).includes(groupe);
    if (pourGroupe) score += 2;
    // Une sortie qui occupe le temps disponible vaut mieux qu'une visite
    // éclair quand on a la journée.
    if (lieu.duree === temps) score += 1;
    if (distanceKm != null && Number.isFinite(maxDistance)) {
      score += 2 * (1 - distanceKm / maxDistance);
    }
    if (lieu.rating != null) score += (lieu.rating - 3) * 0.5;

    candidats.push({
      lieu,
      score,
      distanceKm,
      raisons: raisons(lieu, communes, pourGroupe ? groupe : null, distanceKm),
    });
  }

  candidats.sort((a, b) => b.score - a.score);

  const retenus: Recommandation[] = [];
  for (const c of candidats) {
    if (retenus.length >= limit) break;
    const doublon = retenus.some((r) => memeEndroit(r.lieu, c.lieu));
    if (!doublon) retenus.push(c);
  }
  return retenus;
}

function memeEndroit(a: Lieu, b: Lieu): boolean {
  if (a.lat == null || a.lng == null || b.lat == null || b.lng == null) return false;
  return distanceToLieu(a, { lat: b.lat, lng: b.lng })! < SAME_PLACE_KM;
}

function raisons(
  lieu: Lieu,
  communes: Ambiance[],
  groupe: IdealPour | null,
  distanceKm: number | null
): string[] {
  const out: string[] = [];
  if (lieu.price_level) out.push(PRICE_LEVEL_LABELS[lieu.price_level]);
  if (lieu.duree) out.push(DUREE_LABELS[lieu.duree]);
  if (distanceKm != null) out.push(`à ${formatDistance(distanceKm)}`);
  if (communes.length > 0) out.push(communes.map((a) => AMBIANCE_LABELS[a]).join(" · "));
  if (groupe) out.push(`Idéal ${IDEAL_POUR_LABELS[groupe].toLowerCase()}`);
  return out;
}

export function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(km < 10 ? 1 : 0)} km`;
}

// Lecture des critères depuis une query string (API web, liens partageables,
// futur client mobile). Renvoie null si un critère obligatoire manque.
export function parseCriteres(params: {
  get(name: string): string | null;
}): RecoCriteres | null {
  const budget = params.get("budget") as PriceLevel | null;
  const temps = params.get("temps") as Duree | null;
  const groupe = params.get("groupe") as IdealPour | null;
  if (!budget || !PRICE_ORDER.includes(budget)) return null;
  if (!temps || !DUREE_ORDER.includes(temps)) return null;
  if (!groupe || !GROUPES.includes(groupe)) return null;

  const ambiances = (params.get("ambiances") ?? "")
    .split(",")
    .filter((a): a is Ambiance => AMBIANCES.includes(a as Ambiance));

  const lat = Number.parseFloat(params.get("lat") ?? "");
  const lng = Number.parseFloat(params.get("lng") ?? "");
  const position = Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;

  return { budget, temps, groupe, ambiances, position };
}
