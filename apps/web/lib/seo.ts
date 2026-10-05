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

export { adresseStructuree } from "@gosee/shared";

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
