"use client";

import { CATEGORIES, CATEGORY_LABELS, type Category } from "@gosee/shared";

interface CategoryFilterProps {
  active: Category | "all";
  onChange: (category: Category | "all") => void;
}

function hrefFor(category: Category | "all"): string {
  return category === "all" ? "/" : `/?category=${category}`;
}

export function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  const options: Array<{ value: Category | "all"; label: string }> = [
    { value: "all", label: "Tout" },
    ...CATEGORIES.map((category) => ({ value: category, label: CATEGORY_LABELS[category] })),
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
      {options.map((option) => (
        // Vrai <a href> (pas un <button>) : Google et les lecteurs sans JS
        // peuvent suivre/indexer /?category=X directement. Le clic est
        // intercepté pour un filtrage instantané côté client, mais
        // clic-molette / "ouvrir dans un nouvel onglet" restent utilisables.
        <a
          key={option.value}
          href={hrefFor(option.value)}
          onClick={(e) => {
            e.preventDefault();
            onChange(option.value);
            window.history.replaceState(null, "", hrefFor(option.value));
          }}
          className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            active === option.value
              ? "border-emerald-600 bg-emerald-600 text-white"
              : "border-neutral-300 bg-white text-neutral-700 hover:border-emerald-600"
          }`}
        >
          {option.label}
        </a>
      ))}
    </div>
  );
}
