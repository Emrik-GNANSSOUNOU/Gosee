import type { Lieu } from "./types";

export interface Coordinates {
  lat: number;
  lng: number;
}

export const RADIUS_OPTIONS_KM = [5, 10, 25, 50] as const;

const EARTH_RADIUS_KM = 6371;

// Haversine : distance à vol d'oiseau entre deux points GPS, suffisante pour
// trier/filtrer une liste de lieux (pas besoin d'un itinéraire routier ici,
// Google Maps s'en charge déjà sur la fiche détail).
export function distanceKm(a: Coordinates, b: Coordinates): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function distanceToLieu(lieu: Lieu, position: Coordinates): number | null {
  if (lieu.lat == null || lieu.lng == null) return null;
  return distanceKm(position, { lat: lieu.lat, lng: lieu.lng });
}

export function filterByRadius(lieux: Lieu[], position: Coordinates | null, radiusKm: number | null): Lieu[] {
  if (!position || radiusKm == null) return lieux;
  return lieux.filter((lieu) => {
    const d = distanceToLieu(lieu, position);
    return d != null && d <= radiusKm;
  });
}

// Lieux sans GPS relégués en fin de liste plutôt qu'exclus : rare (tous les
// lieux vérifiés en ont), mais ne doit pas faire disparaître un lieu du tri.
export function sortByDistance(lieux: Lieu[], position: Coordinates | null): Lieu[] {
  if (!position) return lieux;
  return [...lieux].sort((a, b) => {
    const da = distanceToLieu(a, position);
    const db = distanceToLieu(b, position);
    if (da == null && db == null) return 0;
    if (da == null) return 1;
    if (db == null) return -1;
    return da - db;
  });
}

// Suggestions « À proximité » d'une fiche : les plus proches, hors le lieu
// lui-même et hors ses doublons au même endroit (ex. « Ganvié » et « Sortie
// pirogue à Ganvié », à moins d'1 km), dans un rayon raisonnable.
export function lieuxProches(lieu: Lieu, lieux: Lieu[], limit = 3, maxKm = 60): Array<{ lieu: Lieu; distanceKm: number }> {
  if (lieu.lat == null || lieu.lng == null) return [];
  const origin = { lat: lieu.lat, lng: lieu.lng };
  return lieux
    .filter((l) => l.slug !== lieu.slug)
    .map((l) => ({ lieu: l, distanceKm: distanceToLieu(l, origin) }))
    .filter((x): x is { lieu: Lieu; distanceKm: number } => x.distanceKm != null && x.distanceKm >= 1 && x.distanceKm <= maxKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}
