import {
  AMBIANCE_LABELS,
  DUREE_LABELS,
  IDEAL_POUR_LABELS,
  PRICE_LEVEL_LABELS,
  PRICE_LEVEL_RANGES,
  type Lieu,
} from "@gosee/shared";

export function InfosPratiques({ lieu }: { lieu: Lieu }) {
  const tags = lieu.tags ?? [];
  const idealPour = lieu.ideal_pour ?? [];

  if (!lieu.price_level && !lieu.duree && tags.length === 0 && idealPour.length === 0) {
    return null;
  }

  return (
    <section className="mt-6 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <h2 className="text-base font-bold text-neutral-900">Infos pratiques</h2>

      <div className="mt-3 grid grid-cols-2 gap-3">
        {lieu.price_level && (
          <div className="rounded-lg bg-emerald-50 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Budget</p>
            <p className="mt-0.5 text-sm font-semibold text-neutral-900">
              {PRICE_LEVEL_LABELS[lieu.price_level]}
            </p>
            {PRICE_LEVEL_RANGES[lieu.price_level] && (
              <p className="text-xs text-neutral-600">{PRICE_LEVEL_RANGES[lieu.price_level]}</p>
            )}
          </div>
        )}
        {lieu.duree && (
          <div className="rounded-lg bg-amber-50 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-amber-700">Durée</p>
            <p className="mt-0.5 text-sm font-semibold text-neutral-900">
              {DUREE_LABELS[lieu.duree]}
            </p>
          </div>
        )}
      </div>

      {lieu.prix && <p className="mt-3 text-sm text-neutral-700">{lieu.prix}</p>}

      {tags.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Ambiance</p>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-800"
              >
                {AMBIANCE_LABELS[tag] ?? tag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {idealPour.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Idéal</p>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {idealPour.map((p) => (
              <li
                key={p}
                className="rounded-full border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-800"
              >
                {IDEAL_POUR_LABELS[p] ?? p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {lieu.infos_estimees && (
        <p className="mt-4 text-xs text-neutral-500">
          Budget et durée estimés par Gosee (pas de tarif public trouvé) — à confirmer sur place.
        </p>
      )}
    </section>
  );
}
