import type { Metadata } from "next";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "@gosee/shared";
import { LieuList } from "@/components/LieuList";
import { getAllLieux } from "@/lib/lieux";
import { absoluteUrl } from "@/lib/seo";

type SearchParams = Promise<{ category?: string }>;

function parseCategory(raw?: string): Category | "all" {
  return raw && (CATEGORIES as string[]).includes(raw) ? (raw as Category) : "all";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const category = parseCategory((await searchParams).category);

  if (category === "all") {
    return { alternates: { canonical: absoluteUrl("/") } };
  }

  const label = CATEGORY_LABELS[category];
  return {
    title: `${label} au Bénin`,
    description: `Découvrez tous les lieux de catégorie ${label.toLowerCase()} référencés par Gosee au Bénin, avec localisation et itinéraire.`,
    alternates: { canonical: absoluteUrl(`/?category=${category}`) },
  };
}

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const category = parseCategory((await searchParams).category);
  const lieux = await getAllLieux();

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Gosee</h1>
        <p className="mt-1 text-neutral-600">
          Découvrez les lieux, activités et événements incontournables du Bénin.
        </p>
      </header>

      <LieuList lieux={lieux} initialCategory={category} />
    </main>
  );
}
