import { dansLePays, type Category, type Lieu } from "@gosee/shared";

// Textes propres à chaque page catégorie (titre, description, intro) : un
// contenu distinct par page plutôt qu'une simple liste filtrée, pour que
// chacune réponde à sa propre recherche (« que visiter au Bénin », « hôtel au
// Bénin »...). Le pays vient des données : rien n'est figé sur le Bénin.

interface CategoryCopy {
  title: (pays: string) => string;
  h1: (pays: string) => string;
  description: (pays: string, n: number) => string;
  intro: (pays: string) => string;
}

export const CATEGORY_COPY: Record<Category, CategoryCopy> = {
  site_touristique: {
    title: (pays) => `Que visiter ${pays} ? Sites touristiques incontournables`,
    h1: (pays) => `Sites touristiques ${pays}`,
    description: (pays, n) =>
      `${n} sites touristiques ${pays} : palais royaux, lieux de mémoire, temples, parcs nationaux. Prix, durée de visite et itinéraire pour chacun.`,
    intro: () =>
      "Palais royaux, routes de mémoire, temples vaudou, cités lacustres, parcs nationaux : les lieux qui racontent l'histoire du pays. Chaque fiche indique le budget à prévoir, le temps de visite et le chemin pour s'y rendre.",
  },
  loisir: {
    title: (pays) => `Loisirs ${pays} : plages, nature et détente`,
    h1: (pays) => `Loisirs ${pays}`,
    description: (pays, n) =>
      `${n} idées de loisirs ${pays} : plages, cascades, forêts, randonnées et balades. Gratuit ou petit budget, avec durée et itinéraire.`,
    intro: () =>
      "Une plage pour l'après-midi, une cascade pour le week-end, une forêt à explorer : des sorties pour souffler, souvent gratuites ou à petit prix, du littoral jusqu'aux montagnes du nord.",
  },
  hotel: {
    title: (pays) => `Hôtels ${pays} : où dormir pendant votre séjour`,
    h1: (pays) => `Hôtels ${pays}`,
    description: (pays, n) =>
      `${n} hôtels ${pays}, en bord de mer, en ville ou près des sites à visiter. Gamme de prix, contact et itinéraire pour chaque établissement.`,
    intro: () =>
      "En bord de mer, en centre-ville ou au pied des sites à visiter : des adresses pour poser ses valises, avec leur gamme de prix et leur contact pour réserver.",
  },
  activite: {
    title: (pays) => `Activités ${pays} : excursions, visites guidées et sorties`,
    h1: (pays) => `Activités ${pays}`,
    description: (pays, n) =>
      `${n} activités ${pays} : excursions en pirogue, safaris, visites guidées, parcs de loisirs. Budget, durée et itinéraire pour organiser votre sortie.`,
    intro: () =>
      "Pirogue sur les lagunes, safari au petit matin, visite guidée d'une cité royale, journée en parc de loisirs : des expériences à vivre plutôt qu'à regarder.",
  },
  restaurant: {
    title: (pays) => `Où manger ${pays} ? Restaurants et maquis`,
    h1: (pays) => `Restaurants ${pays}`,
    description: (pays, n) =>
      `${n} restaurants et maquis ${pays}, près des sites à visiter : adresse, contact et itinéraire pour une pause repas pendant votre sortie.`,
    intro: () =>
      "Une pause repas entre deux visites : restaurants, maquis et cafés situés près des lieux à découvrir, pour composer une sortie complète.",
  },
};

// Pays majoritaire du catalogue (le marché affiché), « Bénin » à défaut.
export function paysPrincipal(lieux: Lieu[]): string {
  const counts = new Map<string, number>();
  for (const l of lieux) counts.set(l.country, (counts.get(l.country) ?? 0) + 1);
  let best = "Bénin";
  let max = 0;
  for (const [country, n] of counts) {
    if (n > max) {
      best = country;
      max = n;
    }
  }
  return best;
}

export function dansLePaysPrincipal(lieux: Lieu[]): string {
  return dansLePays(paysPrincipal(lieux));
}
