import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { villesDeDepart } from "@gosee/shared";
import { ComposeurSortie } from "@/components/ComposeurSortie";
import { getAllLieux } from "@/lib/lieux";
import { absoluteUrl } from "@/lib/seo";

// ISR, comme l'accueil : la composition tourne côté navigateur sur ces données.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Créer ma sortie : activités, pause repas et itinéraire",
  description:
    "Composez votre sortie en quelques secondes : des activités qui tiennent dans votre temps et votre budget, une pause repas à côté, et l'itinéraire complet à ouvrir dans Google Maps.",
  alternates: { canonical: absoluteUrl("/creer-ma-sortie") },
};

export default async function CreerMaSortiePage() {
  const lieux = await getAllLieux();

  return (
    <main className="min-h-screen bg-neutral-50 pb-10">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <Link href="/" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
          ← Retour
        </Link>
        <header className="mb-5 mt-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl">
            Créer ma sortie
          </h1>
          <p className="mt-1 text-neutral-600">
            Dites-nous d&apos;où vous partez, combien de temps vous avez et votre budget : on compose
            la sortie, pause repas et itinéraire compris. Vous pouvez ensuite tout ajuster.
          </p>
        </header>

        {/* useSearchParams (lien partagé) impose une frontière Suspense. */}
        <Suspense>
          <ComposeurSortie lieux={lieux} villes={villesDeDepart(lieux)} />
        </Suspense>
      </div>
    </main>
  );
}
