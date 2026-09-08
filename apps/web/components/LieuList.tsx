"use client";

import { useMemo, useState } from "react";
import { filterByCategory, type Category, type Lieu } from "@gosee/shared";
import { CategoryFilter } from "./CategoryFilter";
import { LieuCard } from "./LieuCard";

export function LieuList({ lieux }: { lieux: Lieu[] }) {
  const [category, setCategory] = useState<Category | "all">("all");

  const filtered = useMemo(() => filterByCategory(lieux, category), [lieux, category]);

  return (
    <div>
      <CategoryFilter active={category} onChange={setCategory} />

      <p className="mt-3 text-sm text-neutral-500">
        {filtered.length} lieu{filtered.length > 1 ? "x" : ""}
      </p>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
