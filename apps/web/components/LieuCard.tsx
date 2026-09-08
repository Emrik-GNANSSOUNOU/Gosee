import Link from "next/link";
import { CATEGORY_LABELS, type Lieu } from "@gosee/shared";

export function LieuCard({ lieu }: { lieu: Lieu }) {
  return (
    <Link
      href={`/lieux/${lieu.id}`}
      className="block rounded-xl border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-neutral-900">{lieu.nom}</h3>
        <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
          {CATEGORY_LABELS[lieu.category]}
        </span>
      </div>
      {lieu.department && (
        <p className="mt-1 text-sm text-neutral-500">{lieu.department}</p>
      )}
      {lieu.description && (
        <p className="mt-2 line-clamp-2 text-sm text-neutral-600">{lieu.description}</p>
      )}
    </Link>
  );
}
