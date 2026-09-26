"use client";

import { useMemo, useState } from "react";
import {
  distanceToLieu,
  filterByCategory,
  filterByRadius,
  sortByDistance,
  type Category,
  type Coordinates,
  type Lieu,
} from "@gosee/shared";
import { CategoryFilter } from "./CategoryFilter";
import { GeoFilter } from "./GeoFilter";
import { LieuCard } from "./LieuCard";

export function LieuList({
  lieux,
  initialCategory,
}: {
  lieux: Lieu[];
  initialCategory: Category | "all";
}) {
  const [category, setCategory] = useState<Category | "all">(initialCategory);
  const [position, setPosition] = useState<Coordinates | null>(null);
  const [radiusKm, setRadiusKm] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const byCategory = filterByCategory(lieux, category);
    const byRadius = filterByRadius(byCategory, position, radiusKm);
    return sortByDistance(byRadius, position);
  }, [lieux, category, position, radiusKm]);

  return (
    <div>
      <CategoryFilter active={category} onChange={setCategory} />
      <GeoFilter
        position={position}
        radiusKm={radiusKm}
        onPositionChange={setPosition}
        onRadiusChange={setRadiusKm}
      />

      <h2 className="sr-only">Lieux</h2>
      <p className="mt-4 text-sm text-neutral-500">
        {filtered.length} lieu{filtered.length > 1 ? "x" : ""}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((lieu) => (
          <LieuCard
            key={lieu.id}
            lieu={lieu}
            distanceKm={position ? distanceToLieu(lieu, position) : null}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-8 text-center text-neutral-500">
          Aucun lieu ne correspond à ces critères pour le moment.
        </p>
      )}
    </div>
  );
}
