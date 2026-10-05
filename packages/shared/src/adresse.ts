import type { Lieu } from "./types";

// L'adresse saisie mélange rue, quartier, ville et département
// (« Av. Germain Olory Togbé, Cotonou », « Ouidah, Atlantique »...). On en
// retire le département et les fragments ambigus (« Toffo, Atlantique /
// Zogbodomey, Zou »), puis : dernier fragment = ville, premier = rue.
export function adresseStructuree(
  address: string | null,
  department: string | null
): { streetAddress?: string; addressLocality?: string } {
  // Lieu à cheval sur plusieurs départements : pas de ville unique à donner.
  if (department?.includes("/")) return {};
  const dep = (department ?? "").toLowerCase();
  const parts = (address ?? "")
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p && !p.includes("/") && p.toLowerCase() !== dep && !/\(zone\)$/.test(p));
  if (parts.length === 0) return {};
  if (parts.length === 1) return { addressLocality: parts[0] };
  return { streetAddress: parts[0], addressLocality: parts[parts.length - 1] };
}

// Villes proposées comme point de départ quand l'utilisateur ne partage pas
// sa position : celles qui comptent au moins 2 lieux, positionnées au centre
// de leurs lieux. Tirées des données, donc valables pour tout pays ajouté.
export interface Ville {
  nom: string;
  lat: number;
  lng: number;
}

export function villesDeDepart(lieux: Lieu[]): Ville[] {
  const groupes = new Map<string, { lat: number; lng: number; n: number }>();
  for (const l of lieux) {
    if (l.lat == null || l.lng == null || l.alerte) continue;
    const ville = adresseStructuree(l.address, l.department).addressLocality;
    // Pas un lieu-dit naturel (« Lac Nokoué ») comme point de départ.
    if (!ville || /^(lac|zone|route|forêt|plage|parc)\b/i.test(ville)) continue;
    const g = groupes.get(ville) ?? { lat: 0, lng: 0, n: 0 };
    g.lat += l.lat;
    g.lng += l.lng;
    g.n += 1;
    groupes.set(ville, g);
  }
  return [...groupes.entries()]
    .filter(([, g]) => g.n >= 2)
    .map(([nom, g]) => ({ nom, lat: g.lat / g.n, lng: g.lng / g.n }))
    .sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
}
