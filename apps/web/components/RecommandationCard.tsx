import Image from "next/image";
import Link from "next/link";
import { CATEGORY_LABELS, type Recommandation } from "@gosee/shared";
import { getLieuImage } from "@/lib/images";

export function RecommandationCard({ reco, rang }: { reco: Recommandation; rang: number }) {
  const { lieu, raisons } = reco;

  return (
    <Link
      href={`/lieux/${lieu.slug}`}
      className="group flex gap-3 overflow-hidden rounded-2xl bg-white p-3 shadow-sm ring-1 ring-neutral-900/5 transition-shadow hover:shadow-lg"
    >
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:h-28 sm:w-28">
        <Image
          src={getLieuImage(lieu)}
          alt={lieu.nom}
          fill
          sizes="112px"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <span className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white shadow">
          {rang}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-neutral-500">
          {CATEGORY_LABELS[lieu.category]}
          {lieu.department && ` · ${lieu.department}`}
        </p>
        <h3 className="mt-0.5 font-bold leading-snug text-neutral-900">{lieu.nom}</h3>
        <ul className="mt-1.5 flex flex-wrap gap-1">
          {raisons.map((raison) => (
            <li
              key={raison}
              className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-800"
            >
              {raison}
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
}
