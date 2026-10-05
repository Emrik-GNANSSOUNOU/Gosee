import Link from "next/link";

export function RecoBanner() {
  return (
    <Link
      href="/recommandations"
      className="group mb-3 flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 p-4 shadow-md shadow-orange-500/20 transition-transform hover:scale-[1.01] active:scale-[0.99] sm:p-5"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 text-2xl">
        <span aria-hidden>✨</span>
      </span>
      <span className="flex-1">
        <span className="block text-base font-bold text-white sm:text-lg">
          Je ne sais pas quoi faire
        </span>
        <span className="block text-sm text-white/90">
          Budget, temps, avec qui : on te trouve la sortie idéale
        </span>
      </span>
      <span
        aria-hidden
        className="shrink-0 text-xl text-white/80 transition-transform group-hover:translate-x-0.5"
      >
        →
      </span>
    </Link>
  );
}
