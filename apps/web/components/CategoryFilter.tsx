"use client";

import { CATEGORIES, CATEGORY_LABELS, type Category } from "@gosee/shared";

interface CategoryFilterProps {
  active: Category | "all";
  onChange: (category: Category | "all") => void;
}

export function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  const options: Array<{ value: Category | "all"; label: string }> = [
    { value: "all", label: "Tout" },
    ...CATEGORIES.map((category) => ({ value: category, label: CATEGORY_LABELS[category] })),
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            active === option.value
              ? "border-emerald-600 bg-emerald-600 text-white"
              : "border-neutral-300 bg-white text-neutral-700 hover:border-emerald-600"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
