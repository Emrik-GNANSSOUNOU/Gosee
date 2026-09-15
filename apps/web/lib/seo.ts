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
