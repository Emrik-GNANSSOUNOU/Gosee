import type { Metadata } from "next";
import { LieuList } from "@/components/LieuList";
import { RecoBanner } from "@/components/RecoBanner";
import { SortieBanner } from "@/components/SortieBanner";
import { dansLePaysPrincipal } from "@/lib/categories";
import { getAllLieux } from "@/lib/lieux";
import { absoluteUrl } from "@/lib/seo";

// ISR (cf. REVALIDATE_SECONDS) : plus de fetch Supabase à chaque visite, et
// la dernière version reste servie si la base est en pause. Les anciennes
// URL /?category=X redirigent vers /categorie/<slug> (next.config.ts).
export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: absoluteUrl("/") },
};

export default async function HomePage() {
  const lieux = await getAllLieux();
  const pays = dansLePaysPrincipal(lieux);

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <header className="mb-6">
          <p className="text-3xl font-extrabold tracking-tight text-neutral-900">Gosee</p>
          <h1 className="mt-1 text-lg font-semibold text-neutral-700">
            Que faire {pays} ? Lieux, activités et sorties à découvrir
          </h1>
        </header>

        <RecoBanner />
        <SortieBanner />
        <LieuList lieux={lieux} activeCategory="all" />
      </div>
    </main>
  );
}
