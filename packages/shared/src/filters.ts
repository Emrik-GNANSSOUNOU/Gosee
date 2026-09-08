import type { Category, Lieu } from "./types";

export function filterByCategory(lieux: Lieu[], category: Category | "all"): Lieu[] {
  if (category === "all") return lieux;
  return lieux.filter((lieu) => lieu.category === category);
}
