import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORY_ICONS, CATEGORY_LABELS, type Category, type Lieu } from "@gosee/shared";
import { getLieuImage } from "@/lib/images";
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
    <main className="min-h-screen bg-neutral-50 pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(lieu, url)) }}
      />

      <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-200 sm:aspect-[16/7]">
        <Image
          src={getLieuImage(lieu)}
          alt={lieu.nom}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />

        <Link
          href="/"
          className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium text-neutral-900 shadow-sm backdrop-blur hover:bg-white"
        >
          ← Retour
        </Link>

        {lieu.verified && (
          <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-emerald-600/90 px-3 py-1.5 text-sm font-semibold text-white shadow-sm backdrop-blur">
            ✓ Vérifié
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-2xl px-4 pb-5">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-neutral-900 shadow-sm backdrop-blur">
            <span aria-hidden>{CATEGORY_ICONS[lieu.category]}</span>
            {CATEGORY_LABELS[lieu.category]}
          </span>
          <h1 className="mt-2 text-2xl font-extrabold leading-tight text-white drop-shadow-sm sm:text-3xl">
            {lieu.nom}
          </h1>
          <div className="mt-1 flex items-center gap-2 text-white/85 drop-shadow-sm">
            {lieu.department && (
              <span>
                {lieu.department}, {lieu.country}
              </span>
            )}
            {lieu.rating != null && (
              <span className="flex items-center gap-0.5">
                <span aria-hidden>★</span>
                {lieu.rating.toFixed(1)}
                {lieu.reviews_count != null && ` (${lieu.reviews_count} avis)`}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4">
        {lieu.description && (
          <p className="mt-5 leading-relaxed text-neutral-700">{lieu.description}</p>
        )}

        <dl className="mt-6 divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white shadow-sm">
          {lieu.address && (
            <div className="flex justify-between gap-4 px-4 py-3">
              <dt className="text-sm text-neutral-500">Adresse</dt>
              <dd className="text-right text-sm text-neutral-900">{lieu.address}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4 px-4 py-3">
            <dt className="text-sm text-neutral-500">Horaires</dt>
            <dd
              className={`text-right text-sm ${lieu.horaires ? "text-neutral-900" : "text-neutral-400"}`}
            >
              {lieu.horaires ?? "Non renseignés"}
            </dd>
          </div>
          {lieu.contact && (
            <div className="flex justify-between gap-4 px-4 py-3">
              <dt className="text-sm text-neutral-500">Téléphone</dt>
              <dd className="text-right text-sm text-neutral-900">{lieu.contact}</dd>
            </div>
          )}
          {lieu.website && (
            <div className="flex justify-between gap-4 px-4 py-3">
              <dt className="text-sm text-neutral-500">Site web</dt>
              <dd className="text-right text-sm">
                <a
                  href={lieu.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 hover:underline"
                >
                  {lieu.website.replace(/^https?:\/\//, "")}
                </a>
              </dd>
            </div>
          )}
        </dl>

        {lieu.google_maps_url && (
          <a
            href={lieu.google_maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 block rounded-lg bg-emerald-600 px-4 py-3 text-center font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
          >
            Voir l&apos;itinéraire sur Google Maps
          </a>
        )}
      </div>
    </main>
  );
}
