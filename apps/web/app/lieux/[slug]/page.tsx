import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORY_LABELS, type Category, type Lieu } from "@gosee/shared";
import { getLieuBySlug } from "@/lib/lieux";
import { absoluteUrl } from "@/lib/seo";

type Params = Promise<{ slug: string }>;

// schema.org n'a pas de type "lieu touristique générique" unique ; on choisit
// le plus proche par catégorie. "evenement" reste TouristAttraction tant que
// le pilier 3 n'apporte pas de vraies dates (Event exige startDate, qu'on
// n'a pas encore — mieux vaut ne pas émettre un schema invalide).
const SCHEMA_TYPE: Record<Category, string> = {
  site_touristique: "TouristAttraction",
  loisir: "TouristAttraction",
  hotel: "LodgingBusiness",
  activite: "TouristAttraction",
  evenement: "TouristAttraction",
};

function jsonLd(lieu: Lieu, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": SCHEMA_TYPE[lieu.category],
    name: lieu.nom,
    description: lieu.description ?? undefined,
    url,
    address: {
      "@type": "PostalAddress",
      addressLocality: lieu.department ?? undefined,
      addressCountry: lieu.country,
    },
    ...(lieu.lat != null && lieu.lng != null
      ? { geo: { "@type": "GeoCoordinates", latitude: lieu.lat, longitude: lieu.lng } }
      : {}),
  };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const lieu = await getLieuBySlug(slug);
  if (!lieu) return {};

  const title = `${lieu.nom} — ${lieu.department ?? lieu.country}`;
  const description =
    lieu.description?.slice(0, 155) ?? `Découvrez ${lieu.nom} sur Gosee, au ${lieu.country}.`;
  const url = absoluteUrl(`/lieux/${lieu.slug}`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function LieuDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const lieu = await getLieuBySlug(slug);

  if (!lieu) notFound();

  const url = absoluteUrl(`/lieux/${lieu.slug}`);

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(lieu, url)) }}
      />

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
