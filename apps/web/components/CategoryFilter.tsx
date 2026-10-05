import Link from "next/link";
import {
  CATEGORIES,
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  CATEGORY_SLUGS,
  type Category,
} from "@gosee/shared";

// Chaque catégorie est une vraie page (/categorie/<slug>) avec son propre
// titre et sa canonical : des liens simples, suivis par Google.
export function categoryHref(category: Category | "all"): string {
  return category === "all" ? "/" : `/categorie/${CATEGORY_SLUGS[category]}`;
}

// `disponibles` : catégories qui ont au moins un lieu (pas de filtre menant
// à une page vide, ex. une catégorie dont les données ne sont pas importées).
export function CategoryFilter({
  active,
  disponibles = CATEGORIES,
}: {
  active: Category | "all";
  disponibles?: Category[];
}) {
  const options: Array<{ value: Category | "all"; label: string; icon: string }> = [
    { value: "all", label: "Tout", icon: "✨" },
    ...CATEGORIES.filter((c) => disponibles.includes(c)).map((category) => ({
      value: category,
      label: CATEGORY_LABELS[category],
      icon: CATEGORY_ICONS[category],
    })),
  ];

  return (
    <nav
      aria-label="Catégories"
      className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap"
    >
      {options.map((option) => (
        <Link
          key={option.value}
          href={categoryHref(option.value)}
          scroll={false}
          aria-current={active === option.value ? "page" : undefined}
          className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            active === option.value
              ? "border-emerald-600 bg-emerald-600 text-white"
              : "border-neutral-300 bg-white text-neutral-700 hover:border-emerald-600"
          }`}
        >
          <span aria-hidden className="mr-1">
            {option.icon}
          </span>
          {option.label}
        </Link>
      ))}
    </nav>
  );
}
