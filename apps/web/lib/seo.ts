// URL absolue du site, utilisée pour les canonicals, Open Graph, robots.txt
// et sitemap.xml. À définir via NEXT_PUBLIC_SITE_URL sur Vercel (sinon repli
// sur localhost en dev).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000").replace(
  /\/+$/,
  ""
);

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

// L'adresse saisie mélange rue, quartier, ville et département
// (« Av. Germain Olory Togbé, Cotonou », « Ouidah, Atlantique »...). On en
// retire le département et les fragments ambigus (« Toffo, Atlantique /
// Zogbodomey, Zou »), puis : dernier fragment = ville, premier = rue.
export function adresseStructuree(address: string | null, department: string | null) {
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

export interface Crumb {
  name: string;
  path: string;
}

// Données structurées BreadcrumbList, pour que Google affiche le fil
// d'Ariane (Accueil › Catégorie › Lieu) à la place de l'URL brute.
export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}
