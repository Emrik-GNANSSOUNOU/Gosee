import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CATEGORIES,
  CATEGORY_PLURAL_LABELS,
  CATEGORY_SLUGS,
  categoryFromSlug,
} from "@gosee/shared";
import { FilAriane } from "@/components/FilAriane";
import { LieuList } from "@/components/LieuList";
import { RecoBanner } from "@/components/RecoBanner";
import { CATEGORY_COPY, categoriesDisponibles, dansLePaysPrincipal } from "@/lib/categories";
import { getAllLieux } from "@/lib/lieux";
import { absoluteUrl } from "@/lib/seo";

type Params = Promise<{ slug: string }>;

// ISR : régénérée au plus toutes les 5 min (cf. REVALIDATE_SECONDS) ; la
// dernière version reste servie si Supabase ne répond pas.
export const revalidate = 300;
export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ slug: CATEGORY_SLUGS[category] }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const category = categoryFromSlug((await params).slug);
  if (!category) return {};

  const lieux = await getAllLieux();
  const pays = dansLePaysPrincipal(lieux);
  const n = lieux.filter((l) => l.category === category).length;
  const copy = CATEGORY_COPY[category];
  const url = absoluteUrl(`/categorie/${CATEGORY_SLUGS[category]}`);

  return {
    title: copy.title(pays),
    description: copy.description(pays, n),
    alternates: { canonical: url },
    openGraph: { title: copy.title(pays), description: copy.description(pays, n), url },
  };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const category = categoryFromSlug((await params).slug);
  if (!category) notFound();

  const all = await getAllLieux();
  const lieux = all.filter((l) => l.category === category);
  if (lieux.length === 0) notFound();
  const pays = dansLePaysPrincipal(all);
  const copy = CATEGORY_COPY[category];

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <FilAriane
          crumbs={[
            { name: "Accueil", path: "/" },
            { name: CATEGORY_PLURAL_LABELS[category], path: `/categorie/${CATEGORY_SLUGS[category]}` },
          ]}
        />
        <header className="mb-6 mt-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">
            {copy.h1(pays)}
          </h1>
          <p className="mt-2 max-w-3xl text-neutral-600">{copy.intro(pays)}</p>
        </header>

        <RecoBanner />
        <LieuList lieux={lieux} activeCategory={category} categories={categoriesDisponibles(all)} />
      </div>
    </main>
  );
}
