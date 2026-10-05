import Link from "next/link";
import { breadcrumbJsonLd, type Crumb } from "@/lib/seo";

// Le dernier élément est la page courante : affiché, pas cliquable.
export function FilAriane({ crumbs, className = "" }: { crumbs: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Fil d'Ariane" className={className}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbs)) }}
      />
      <ol className="flex flex-wrap items-center gap-1 text-sm text-neutral-500">
        {crumbs.map((crumb, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={crumb.path} className="flex items-center gap-1">
              {i > 0 && <span aria-hidden>›</span>}
              {last ? (
                <span aria-current="page" className="font-medium text-neutral-800">
                  {crumb.name}
                </span>
              ) : (
                <Link href={crumb.path} className="hover:text-neutral-900 hover:underline">
                  {crumb.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
