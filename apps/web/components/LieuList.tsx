"use client";

import { useMemo, useState } from "react";
import { CATEGORY_LABELS, filterByCategory, type Category, type Lieu } from "@gosee/shared";
import { CategoryFilter } from "./CategoryFilter";
import { LieuCard } from "./LieuCard";

export function LieuList({
  lieux,
  initialCategory,
}: {
  lieux: Lieu[];
  initialCategory: Category | "all";
}) {
  const [category, setCategory] = useState<Category | "all">(initialCategory);

  const filtered = useMemo(() => filterByCategory(lieux, category), [lieux, category]);
  const heading = category === "all" ? "Tous les lieux" : CATEGORY_LABELS[category];

  return (
    <div>
      <CategoryFilter active={category} onChange={setCategory} />

      <h2 className="sr-only">{heading}</h2>
      <p className="mt-4 text-sm text-neutral-500">
        {filtered.length} lieu{filtered.length > 1 ? "x" : ""}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((lieu) => (
          <LieuCard key={lieu.id} lieu={lieu} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-8 text-center text-neutral-500">
          Aucun lieu dans cette catégorie pour le moment.
        </p>
      )}
    </div>
  );
}
