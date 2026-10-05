// Infos pratiques d'un lieu (prix, durée, ambiances, public) : vocabulaire
// commun à la fiche détail et au futur moteur de recommandations.

export type PriceLevel = "gratuit" | "economique" | "moyen" | "eleve";
export type Duree = "courte" | "demi_journee" | "journee" | "sejour";
export type Ambiance =
  | "histoire"
  | "culture"
  | "spiritualite"
  | "art"
  | "nature"
  | "faune"
  | "plage"
  | "detente"
  | "aventure"
  | "sport"
  | "loisirs"
  | "marche";
export type IdealPour = "solo" | "couple" | "amis" | "famille";

// Seuils en FCFA par personne : la monnaie est propre au marché de départ,
// le libellé de gamme reste valable ailleurs.
export const PRICE_LEVEL_LABELS: Record<PriceLevel, string> = {
  gratuit: "Gratuit",
  economique: "Petit budget",
  moyen: "Budget moyen",
  eleve: "Budget élevé",
};

export const PRICE_LEVEL_RANGES: Record<PriceLevel, string | null> = {
  gratuit: null,
  economique: "< 5 000 FCFA / pers.",
  moyen: "5 000 – 20 000 FCFA / pers.",
  eleve: "> 20 000 FCFA / pers.",
};

export const PRICE_LEVEL_SHORT: Record<PriceLevel, string> = {
  gratuit: "Gratuit",
  economique: "€",
  moyen: "€€",
  eleve: "€€€",
};

export const DUREE_LABELS: Record<Duree, string> = {
  courte: "1 à 2 h",
  demi_journee: "Demi-journée",
  journee: "Journée",
  sejour: "Séjour (nuit sur place)",
};

export const AMBIANCE_LABELS: Record<Ambiance, string> = {
  histoire: "Histoire",
  culture: "Culture",
  spiritualite: "Spiritualité",
  art: "Art",
  nature: "Nature",
  faune: "Faune sauvage",
  plage: "Plage",
  detente: "Détente",
  aventure: "Aventure",
  sport: "Sport",
  loisirs: "Loisirs",
  marche: "Marché local",
};

export const IDEAL_POUR_LABELS: Record<IdealPour, string> = {
  solo: "Solo",
  couple: "En couple",
  amis: "Entre amis",
  famille: "En famille",
};
