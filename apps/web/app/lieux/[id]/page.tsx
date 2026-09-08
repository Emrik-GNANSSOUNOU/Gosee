import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORY_LABELS, type Lieu } from "@gosee/shared";
import { supabase } from "@/lib/supabaseClient";

async function getLieu(id: string): Promise<Lieu | null> {
  const { data, error } = await supabase.from("lieux").select("*").eq("id", id).single();
  if (error) return null;
  return data as Lieu;
}

export default async function LieuDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lieu = await getLieu(id);

  if (!lieu) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <Link href="/" className="text-sm text-emerald-700 hover:underline">
        ← Retour
      </Link>

      <div className="mt-4 flex items-start justify-between gap-2">
        <h1 className="text-2xl font-bold text-neutral-900">{lieu.nom}</h1>
        <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          {CATEGORY_LABELS[lieu.category]}
        </span>
      </div>

      {lieu.department && (
        <p className="mt-1 text-neutral-500">
          {lieu.department}, {lieu.country}
        </p>
      )}

      {lieu.description && (
        <p className="mt-4 leading-relaxed text-neutral-700">{lieu.description}</p>
      )}

      <dl className="mt-6 divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
        {lieu.address && (
          <div className="flex justify-between gap-4 px-4 py-3">
            <dt className="text-sm text-neutral-500">Adresse</dt>
            <dd className="text-right text-sm text-neutral-900">{lieu.address}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4 px-4 py-3">
          <dt className="text-sm text-neutral-500">Horaires</dt>
          <dd className="text-right text-sm text-neutral-400">Non renseignés</dd>
        </div>
        {lieu.contact && (
          <div className="flex justify-between gap-4 px-4 py-3">
            <dt className="text-sm text-neutral-500">Contact</dt>
            <dd className="text-right text-sm text-neutral-900">{lieu.contact}</dd>
          </div>
        )}
      </dl>

      {lieu.google_maps_url && (
        <a
          href={lieu.google_maps_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 block rounded-lg bg-emerald-600 px-4 py-3 text-center font-medium text-white hover:bg-emerald-700"
        >
          Voir l&apos;itinéraire sur Google Maps
        </a>
      )}
    </main>
  );
}
