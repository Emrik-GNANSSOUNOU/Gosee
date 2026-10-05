import type { Metadata } from "next";
import Link from "next/link";
import { Recommandeur } from "@/components/Recommandeur";
import { getAllLieux } from "@/lib/lieux";
import { absoluteUrl } from "@/lib/seo";

// Même contrainte que l'accueil : dépend d'un fetch Supabase à la requête.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Que faire aujourd'hui ? Idées de sortie personnalisées",
  description:
    "Indiquez votre budget, votre temps et avec qui vous sortez : Gosee vous propose les sorties qui vous correspondent, avec la raison de chaque choix.",
  alternates: { canonical: absoluteUrl("/recommandations") },
};

export default async function RecommandationsPage() {
  const lieux = await getAllLieux();

  return (
    <main className="min-h-screen bg-neutral-50 pb-10">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <Link href="/" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
          ← Retour
        </Link>
        <header className="mb-5 mt-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl">
            Je ne sais pas quoi faire
          </h1>
          <p className="mt-1 text-neutral-600">
            Dis-nous ton budget, ton temps et avec qui tu sors : on te propose les sorties qui te
            correspondent.
          </p>
        </header>

        <Recommandeur lieux={lieux} />
      </div>
    </main>
  );
}
