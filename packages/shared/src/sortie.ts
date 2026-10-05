import { distanceKm, distanceToLieu, type Coordinates } from "./geo";
import type { Duree, PriceLevel } from "./pratique";
import { candidatsClasses, type RecoCriteres } from "./recommend";
import type { Lieu } from "./types";

// « Créer sa sortie » : compose une suite d'étapes (activités, pause repas,
// nuit sur place) qui tient dans le temps et le budget, dans l'ordre le plus
// court, avec un horaire indicatif. Deux temps séparés pour que l'utilisateur
// puisse modifier la sortie : composerSortie() choisit les étapes,
// planifierSortie() calcule l'horaire d'une liste d'étapes donnée (choisie
// par le moteur ou réordonnée à la main).

export type TypeEtape = "visite" | "repas" | "nuit";

export interface Etape {
  type: TypeEtape;
  // null pour une pause repas sans restaurant connu à proximité.
  lieu: Lieu | null;
  debut: number; // minutes depuis minuit
  fin: number;
  trajet: { km: number; minutes: number } | null; // depuis l'étape précédente
}

export interface Sortie {
  etapes: Etape[];
  depart: Coordinates;
  heureDepart: number;
  dureeTotale: number; // minutes, trajets compris
  kmTotal: number;
  // Fourchette indicative par personne, hors repas quand le prix du
  // restaurant est inconnu (cas des données OpenStreetMap).
  budget: { min: number; max: number; repasInclus: boolean };
}

export interface SortieCriteres extends RecoCriteres {
  position: Coordinates; // point de départ obligatoire
  heureDepart?: number; // minutes depuis minuit, 9h30 par défaut
  ancre?: string | null; // slug d'un lieu autour duquel construire la sortie
}

// Temps de visite retenu pour chaque durée typique d'un lieu.
export const VISITE_MINUTES: Record<Duree, number> = {
  courte: 90,
  demi_journee: 180,
  journee: 330,
  sejour: 330, // la journée sur place ; la nuit est une étape à part
};

// Temps disponible (trajets compris) et nombre d'activités visées.
const TEMPS_MINUTES: Record<Duree, number> = {
  courte: 150,
  demi_journee: 300,
  journee: 570,
  sejour: 570,
};
const ETAPES_MAX: Record<Duree, number> = { courte: 2, demi_journee: 3, journee: 4, sejour: 4 };

const REPAS_MINUTES = 75;
const REPAS_RAYON_KM = 15;
const NUIT_RAYON_KM = 40;

// Fourchettes de prix par personne correspondant aux gammes (FCFA).
const PRIX: Record<PriceLevel, [number, number]> = {
  gratuit: [0, 0],
  economique: [500, 5_000],
  moyen: [5_000, 20_000],
  eleve: [20_000, 60_000],
};

// Estimation prudente d'un trajet : distance à vol d'oiseau majorée de 30 %
// (routes), à pied sous 1,2 km, sinon en voiture/zem à 30 km/h + 10 min
// (attente, stationnement). Affichée « ≈ » : Google Maps donne le vrai trajet.
export function estimerTrajet(a: Coordinates, b: Coordinates): { km: number; minutes: number } {
  const km = distanceKm(a, b) * 1.3;
  if (km < 1.2) return { km, minutes: Math.max(5, Math.round((km / 4.5) * 60)) };
  return { km, minutes: Math.round((km / 30) * 60 + 10) };
}

function coords(lieu: Lieu): Coordinates | null {
  return lieu.lat != null && lieu.lng != null ? { lat: lieu.lat, lng: lieu.lng } : null;
}

function dureeVisite(lieu: Lieu): number {
  return lieu.duree ? VISITE_MINUTES[lieu.duree] : 90;
}

// ---------------------------------------------------------------------------
// Composition

export interface SortieComposee {
  slugs: string[]; // étapes dans l'ordre (activités, restaurant, hôtel)
  types: TypeEtape[];
}

export function composerSortie(lieux: Lieu[], criteres: SortieCriteres): SortieComposee {
  const heureDepart = criteres.heureDepart ?? 9 * 60 + 30;
  // Le temps de la pause repas est réservé d'emblée quand la sortie risque
  // de couvrir l'heure du déjeuner, sinon le repas fait déborder la sortie.
  const avecRepas = heureDepart < 12 * 60 + 30 && heureDepart + TEMPS_MINUTES[criteres.temps] > 12 * 60 + 30;
  const tempsDispo = TEMPS_MINUTES[criteres.temps] - (avecRepas ? REPAS_MINUTES : 0);
  const etapesMax = ETAPES_MAX[criteres.temps];

  // Les candidats sont ceux du moteur de recommandations (budget, durée,
  // ambiances, groupe, lieux en alerte exclus), sans limite de distance par
  // rapport au départ : c'est le trajet qui tranche ci-dessous.
  const candidats = candidatsClasses(lieux, { ...criteres, position: null });
  const pris = new Set<string>();
  const activites: Lieu[] = [];

  const ancre = criteres.ancre ? lieux.find((l) => l.slug === criteres.ancre) : undefined;
  let ici = criteres.position;
  let temps = 0;

  if (ancre && coords(ancre)) {
    const t = estimerTrajet(ici, coords(ancre)!);
    activites.push(ancre);
    pris.add(ancre.slug);
    temps += t.minutes + dureeVisite(ancre);
    ici = coords(ancre)!;
  }

  // Glouton : à chaque pas, la meilleure activité compte tenu de son intérêt
  // (score du moteur) et du temps de trajet pour s'y rendre depuis l'étape
  // courante, tant qu'elle tient dans le temps restant.
  while (activites.length < etapesMax) {
    let meilleur: { lieu: Lieu; valeur: number; cout: number } | null = null;
    for (const c of candidats) {
      const pos = coords(c.lieu);
      if (!pos || pris.has(c.lieu.slug)) continue;
      if (activites.some((a) => memeEndroit(a, c.lieu))) continue;
      const t = estimerTrajet(ici, pos);
      const cout = t.minutes + dureeVisite(c.lieu);
      if (temps + cout > tempsDispo) continue;
      const valeur = c.score - 0.06 * t.minutes;
      if (!meilleur || valeur > meilleur.valeur) meilleur = { lieu: c.lieu, valeur, cout };
    }
    if (!meilleur) break;
    activites.push(meilleur.lieu);
    pris.add(meilleur.lieu.slug);
    temps += meilleur.cout;
    ici = coords(meilleur.lieu)!;
  }

  const ordonnees = ancre ? activites : ordonnerPlusCourt(activites, criteres.position);
  const slugs = ordonnees.map((l) => l.slug);
  const types: TypeEtape[] = slugs.map(() => "visite");

  // Pause repas placée entre deux étapes, au moment le plus proche de
  // 12h45, au restaurant le plus proche de l'étape qui la précède.
  const plan = planifierSortie(lieux, slugs, types, criteres.position, heureDepart);
  if (avecRepas && plan.etapes.length > 0) {
    let apres = 0;
    for (let i = 1; i < plan.etapes.length; i++) {
      if (Math.abs(plan.etapes[i].fin - 12 * 60 - 45) < Math.abs(plan.etapes[apres].fin - 12 * 60 - 45)) apres = i;
    }
    // Pas de pause repas hors des heures raisonnables (11h-14h30) : cas d'une
    // activité à la journée (excursion...), qui inclut en général le repas.
    const debutRepas = plan.etapes[apres].fin;
    if (debutRepas >= 11 * 60 && debutRepas <= 14 * 60 + 30) {
      const pres = plan.etapes[apres].lieu;
      const resto = pres ? restaurantProche(lieux, pres, criteres.budget) : null;
      slugs.splice(apres + 1, 0, resto?.slug ?? "");
      types.splice(apres + 1, 0, "repas");
    }
  }

  if (criteres.temps === "sejour" && ordonnees.length > 0) {
    const hotel = hotelProche(lieux, ordonnees[ordonnees.length - 1], criteres.budget);
    if (hotel) {
      slugs.push(hotel.slug);
      types.push("nuit");
    }
  }

  return { slugs, types };
}

// Plus proche voisin depuis le départ : suffisant pour 2 à 4 étapes.
function ordonnerPlusCourt(etapes: Lieu[], depart: Coordinates): Lieu[] {
  const reste = [...etapes];
  const out: Lieu[] = [];
  let ici = depart;
  while (reste.length > 0) {
    reste.sort((a, b) => distanceKm(ici, coords(a)!) - distanceKm(ici, coords(b)!));
    const next = reste.shift()!;
    out.push(next);
    ici = coords(next)!;
  }
  return out;
}

function memeEndroit(a: Lieu, b: Lieu): boolean {
  const pa = coords(a);
  const pb = coords(b);
  return !!pa && !!pb && distanceKm(pa, pb) < 1;
}

const PRICE_ORDER: PriceLevel[] = ["gratuit", "economique", "moyen", "eleve"];

function dansBudget(lieu: Lieu, budget: PriceLevel): boolean {
  // Prix inconnu (restaurants OpenStreetMap) : on ne l'écarte pas.
  return !lieu.price_level || PRICE_ORDER.indexOf(lieu.price_level) <= PRICE_ORDER.indexOf(budget);
}

export function restaurantProche(lieux: Lieu[], pres: Lieu, budget: PriceLevel, exclure: string[] = []): Lieu | null {
  return procheDeCategorie(lieux, pres, "restaurant", REPAS_RAYON_KM, budget, exclure)[0] ?? null;
}

// Peut accueillir la pause repas : un restaurant, ou un lieu avec
// restauration sur place (hôtel-restaurant, restaurant d'un site visité).
function sertARepas(l: Lieu): boolean {
  return l.category === "restaurant" || !!l.restauration;
}

function hotelProche(lieux: Lieu[], pres: Lieu, budget: PriceLevel): Lieu | null {
  return procheDeCategorie(lieux, pres, "hotel", NUIT_RAYON_KM, budget, [])[0] ?? null;
}

function procheDeCategorie(
  lieux: Lieu[],
  pres: Lieu,
  category: Lieu["category"],
  rayonKm: number,
  budget: PriceLevel,
  exclure: string[]
): Lieu[] {
  const pos = coords(pres);
  if (!pos) return [];
  return lieux
    .filter((l) => (category === "restaurant" ? sertARepas(l) : l.category === category))
    // Pour un repas pris dans un hôtel, la gamme de prix connue est celle de
    // la nuit : elle ne dit rien du repas, on ne filtre pas dessus.
    .filter((l) => !l.alerte && !exclure.includes(l.slug) && (category === "restaurant" && l.category !== "restaurant" ? true : dansBudget(l, budget)))
    .map((l) => ({ l, d: distanceToLieu(l, pos) }))
    .filter((x): x is { l: Lieu; d: number } => x.d != null && x.d <= rayonKm)
    .sort((a, b) => a.d - b.d)
    .map((x) => x.l);
}

// Propositions pour remplacer une étape : même type d'étape, proches de
// l'étape d'origine, pas déjà dans la sortie.
export function alternatives(
  lieux: Lieu[],
  sortie: SortieComposee,
  index: number,
  criteres: SortieCriteres,
  limit = 3
): Lieu[] {
  const type = sortie.types[index];
  const actuel = lieux.find((l) => l.slug === sortie.slugs[index]);
  const voisin = actuel ?? lieux.find((l) => l.slug === sortie.slugs[index - 1] || l.slug === sortie.slugs[index + 1]);
  if (!voisin) return [];
  if (type === "repas") return procheDeCategorie(lieux, voisin, "restaurant", REPAS_RAYON_KM, criteres.budget, sortie.slugs).slice(0, limit);
  if (type === "nuit") return procheDeCategorie(lieux, voisin, "hotel", NUIT_RAYON_KM, criteres.budget, sortie.slugs).slice(0, limit);

  const pos = coords(voisin)!;
  return candidatsClasses(lieux, { ...criteres, position: null })
    .filter((c) => !sortie.slugs.includes(c.lieu.slug) && coords(c.lieu))
    .map((c) => ({ c, d: distanceKm(pos, coords(c.lieu)!) }))
    .filter((x) => x.d <= 40)
    .sort((a, b) => b.c.score - 0.1 * b.d - (a.c.score - 0.1 * a.d))
    .slice(0, limit)
    .map((x) => x.c.lieu);
}

// ---------------------------------------------------------------------------
// Planning

export function planifierSortie(
  lieux: Lieu[],
  slugs: string[],
  types: TypeEtape[],
  depart: Coordinates,
  heureDepart = 9 * 60 + 30
): Sortie {
  const parSlug = new Map(lieux.map((l) => [l.slug, l]));
  const etapes: Etape[] = [];
  let ici: Coordinates = depart;
  let heure = heureDepart;
  let kmTotal = 0;
  let min = 0;
  let max = 0;
  let repasInclus = true;

  slugs.forEach((slug, i) => {
    const type = types[i] ?? "visite";
    const lieu = parSlug.get(slug) ?? null;
    const pos = lieu ? coords(lieu) : null;
    const trajet = pos ? estimerTrajet(ici, pos) : null;
    if (trajet) {
      heure += trajet.minutes;
      kmTotal += trajet.km;
      ici = pos!;
    }
    const duree = type === "repas" ? REPAS_MINUTES : type === "nuit" ? 0 : lieu ? dureeVisite(lieu) : 0;
    etapes.push({ type, lieu, debut: heure, fin: heure + duree, trajet });
    heure += duree;

    // Le prix d'un hôtel-restaurant est celui de la nuit : pour une pause
    // repas, seul le prix d'un vrai restaurant compte.
    const prixApplicable = type !== "repas" || lieu?.category === "restaurant";
    if (lieu?.price_level && prixApplicable) {
      min += PRIX[lieu.price_level][0];
      max += PRIX[lieu.price_level][1];
    } else if (type === "repas") {
      repasInclus = false;
    }
  });

  return {
    etapes,
    depart,
    heureDepart,
    dureeTotale: heure - heureDepart,
    kmTotal,
    budget: { min, max, repasInclus },
  };
}

// ---------------------------------------------------------------------------
// Itinéraire et partage

// Lien Google Maps multi-étapes (sans clé API) : départ, étapes intermédiaires,
// arrivée. Google limite le nombre d'étapes intermédiaires : 8 suffisent ici.
export function lienItineraire(sortie: Sortie): string | null {
  const points = sortie.etapes.map((e) => (e.lieu ? coords(e.lieu) : null)).filter((p): p is Coordinates => !!p);
  if (points.length === 0) return null;
  const fmt = (p: Coordinates) => `${p.lat},${p.lng}`;
  const params = new URLSearchParams({
    api: "1",
    origin: fmt(sortie.depart),
    destination: fmt(points[points.length - 1]),
    travelmode: "driving",
  });
  const intermediaires = points.slice(0, -1).slice(0, 8);
  if (intermediaires.length > 0) params.set("waypoints", intermediaires.map(fmt).join("|"));
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function formatHeure(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = Math.round(minutes % 60);
  return `${h}h${m.toString().padStart(2, "0")}`;
}

export function formatDuree(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m.toString().padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Paramètres d'URL (lien partageable, API /api/sortie, futur client mobile)

const TEMPS_VALIDES: Duree[] = ["courte", "demi_journee", "journee", "sejour"];
const TYPES_VALIDES: TypeEtape[] = ["visite", "repas", "nuit"];

export interface SortieParams {
  criteres: SortieCriteres | null;
  // Étapes déjà choisies (lien partagé ou sortie modifiée à la main).
  etapes: SortieComposee | null;
}

export function parseSortieParams(params: { get(name: string): string | null }): SortieParams {
  const lat = Number.parseFloat(params.get("lat") ?? "");
  const lng = Number.parseFloat(params.get("lng") ?? "");
  const temps = params.get("temps") as Duree | null;
  const budget = params.get("budget") as PriceLevel | null;
  const heure = Number.parseInt(params.get("heure") ?? "", 10);
  const valide =
    Number.isFinite(lat) && Number.isFinite(lng) && !!temps && TEMPS_VALIDES.includes(temps) && !!budget && PRICE_ORDER.includes(budget);

  const criteres: SortieCriteres | null = valide
    ? {
        position: { lat, lng },
        temps: temps!,
        budget: budget!,
        groupe: (params.get("groupe") as SortieCriteres["groupe"]) ?? "amis",
        ambiances: (params.get("ambiances") ?? "").split(",").filter(Boolean) as SortieCriteres["ambiances"],
        heureDepart: Number.isFinite(heure) ? heure : undefined,
        ancre: params.get("ancre"),
      }
    : null;

  const slugs = params.get("etapes")?.split(",") ?? null;
  const types = (params.get("types")?.split(",") ?? []).map((t) => (TYPES_VALIDES.includes(t as TypeEtape) ? (t as TypeEtape) : "visite"));
  const etapes = slugs && slugs.length > 0 ? { slugs, types: slugs.map((_, i) => types[i] ?? "visite") } : null;

  return { criteres, etapes };
}

export function sortieQuery(criteres: SortieCriteres, etapes: SortieComposee | null): string {
  const p = new URLSearchParams({
    lat: criteres.position.lat.toFixed(5),
    lng: criteres.position.lng.toFixed(5),
    temps: criteres.temps,
    budget: criteres.budget,
    groupe: criteres.groupe,
  });
  if (criteres.ambiances.length) p.set("ambiances", criteres.ambiances.join(","));
  if (criteres.heureDepart != null) p.set("heure", String(criteres.heureDepart));
  if (criteres.ancre) p.set("ancre", criteres.ancre);
  if (etapes) {
    p.set("etapes", etapes.slugs.join(","));
    p.set("types", etapes.types.join(","));
  }
  return p.toString();
}
