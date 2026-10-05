import Link from "next/link";

export function SortieBanner() {
  return (
    <Link
      href="/creer-ma-sortie"
      className="group mb-3 flex w-full items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-orange-200 transition-transform hover:scale-[1.01] active:scale-[0.99] sm:p-5"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-50 text-2xl">
        <span aria-hidden>🗺️</span>
      </span>
      <span className="flex-1">
        <span className="block text-base font-bold text-neutral-900 sm:text-lg">Créer ma sortie</span>
        <span className="block text-sm text-neutral-600">
          Activités, pause repas et itinéraire, composés pour vous
        </span>
      </span>
      <span aria-hidden className="shrink-0 text-xl text-orange-500 transition-transform group-hover:translate-x-0.5">
        →
      </span>
    </Link>
  );
}
