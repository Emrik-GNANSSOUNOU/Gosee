import type { Duree, IdealPour, PriceLevel } from "./pratique";
import type { Lieu } from "./types";

// Meta description d'une fiche (≈ 150 caractères, la limite d'affichage de
// Google) : la première phrase de la description, suivie des infos pratiques
// formulées de plusieurs façons. La tournure est choisie à partir du slug pour
// rester stable d'un rendu à l'autre tout en variant d'une fiche à l'autre.

const MAX = 158;

const DUREE_PHRASE: Record<Duree, string> = {
  courte: "1 à 2 h",
  demi_journee: "une demi-journée",
  journee: "une journée",
  sejour: "au moins une nuit sur place",
};

const BUDGET_PHRASE: Record<PriceLevel, string> = {
  gratuit: "accès gratuit",
  economique: "petit budget",
  moyen: "budget moyen",
  eleve: "budget élevé",
};

const GROUPE_PHRASE: Record<IdealPour, string> = {
  solo: "en solo",
  couple: "en couple",
  amis: "entre amis",
  famille: "en famille",
};

type Parts = { duree?: string; budget?: string; groupe?: string };

const TOURNURES: Array<(p: Parts) => string | null> = [
  ({ duree, budget, groupe }) =>
    duree && budget ? `Comptez ${duree}, ${budget}${groupe ? ` — idéal ${groupe}` : ""}.` : null,
  ({ duree, budget, groupe }) =>
    budget && duree ? `${cap(budget)}, ${duree} sur place${groupe ? `, parfait ${groupe}` : ""}.` : null,
  ({ duree, budget, groupe }) =>
    duree && budget ? `À prévoir : ${duree}, ${budget}${groupe ? `. À faire ${groupe}` : ""}.` : null,
  ({ duree, budget, groupe }) =>
    groupe && duree ? `Une sortie ${groupe} d'${duree.startsWith("1") ? "environ " : ""}${duree}${budget ? `, ${budget}` : ""}.` : null,
];

const CONCLUSIONS = [
  "Horaires et itinéraire sur Gosee.",
  "Infos pratiques et itinéraire.",
  "Tarifs, accès et itinéraire.",
  "Tout pour s'y rendre sur Gosee.",
];

export function metaDescription(lieu: Lieu): string {
  const intro = premierePhrase(lieu.description) ?? `${lieu.nom}, ${lieu.address ?? lieu.country}.`;
  const groupe = choisirGroupe(lieu.ideal_pour ?? []);
  const parts: Parts = {
    duree: lieu.duree ? DUREE_PHRASE[lieu.duree] : undefined,
    budget: budgetPhrase(lieu),
    groupe: groupe ? GROUPE_PHRASE[groupe] : undefined,
  };

  const h = hash(lieu.slug);
  const tournure = TOURNURES[h % TOURNURES.length](parts) ?? TOURNURES[0](parts);
  const conclusion = CONCLUSIONS[(h >> 3) % CONCLUSIONS.length];

  // Du plus complet au plus court, jusqu'à tenir dans la limite.
  const candidats = [
    [intro, tournure, conclusion],
    [intro, tournure],
    [intro, TOURNURES[0]({ ...parts, groupe: undefined })],
    [intro, conclusion],
    [intro],
  ];
  for (const c of candidats) {
    const text = c.filter(Boolean).join(" ");
    if (text.length <= MAX) return text;
  }
  return tronquer(intro, MAX);
}

function budgetPhrase(lieu: Lieu): string | undefined {
  // Un tarif sourcé et court (« ≈ 2 000 FCFA / pers. ») est plus parlant
  // qu'une gamme ; les tarifs longs ou datés restent sur la fiche.
  const prix = lieu.prix?.replace(/\s*\(.*?\)\s*/g, "").trim();
  if (prix && /FCFA/.test(prix) && prix.length <= 26 && !lieu.infos_estimees) return `env. ${prix.replace(/^≈\s*/, "").replace(/\s*\/\s*pers\.?$/, " par personne")}`;
  return lieu.price_level ? BUDGET_PHRASE[lieu.price_level] : undefined;
}

// « Famille » et « amis » parlent davantage qu'un « solo » générique.
function choisirGroupe(groupes: IdealPour[]): IdealPour | null {
  if (groupes.length === 4) return null; // convient à tous : rien de distinctif
  for (const g of ["famille", "amis", "couple", "solo"] as IdealPour[]) {
    if (groupes.includes(g)) return g;
  }
  return null;
}

function premierePhrase(text: string | null): string | null {
  if (!text) return null;
  const clean = text.replace(/\s+/g, " ").trim();
  const match = clean.match(/^(.+?[.!?])(\s|$)/);
  const phrase = match ? match[1] : clean;
  return phrase.length > 110 ? tronquer(phrase, 110) : phrase;
}

function tronquer(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).replace(/[\s,;:]+\S*$/, "")}…`;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
