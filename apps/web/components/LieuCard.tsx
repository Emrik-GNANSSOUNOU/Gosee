import Image from "next/image";
import Link from "next/link";
import { CATEGORY_ICONS, CATEGORY_LABELS, type Lieu } from "@gosee/shared";
import { getLieuImage } from "@/lib/images";

export function LieuCard({ lieu }: { lieu: Lieu }) {
  return (
    <Link
      href={`/lieux/${lieu.slug}`}
      className="group block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
        <Image
          src={getLieuImage(lieu)}
          alt={lieu.nom}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/20" />

        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-neutral-900 shadow-sm backdrop-blur">
          <span aria-hidden>{CATEGORY_ICONS[lieu.category]}</span>
          {CATEGORY_LABELS[lieu.category]}
        </span>

        {lieu.verified && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-600/90 px-2.5 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur">
            ✓ Vérifié
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="text-lg font-bold leading-snug text-white drop-shadow-sm">
            {lieu.nom}
          </h3>
          {lieu.department && (
            <p className="mt-0.5 text-sm text-white/85 drop-shadow-sm">{lieu.department}</p>
          )}
        </div>
      </div>

      <div className="p-4">
        {lieu.description && (
          <p className="line-clamp-2 text-sm text-neutral-600">{lieu.description}</p>
        )}
        <p className="mt-3 flex items-center gap-1 text-sm font-medium text-emerald-700 transition-all duration-300 group-hover:gap-2">
          Découvrir
          <span aria-hidden>→</span>
        </p>
      </div>
    </Link>
  );
}
