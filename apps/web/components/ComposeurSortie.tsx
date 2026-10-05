"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  PRICE_LEVEL_LABELS,
  alternatives,
  composerSortie,
  formatDuree,
  lienItineraire,
  parseSortieParams,
  planifierSortie,
  sortieQuery,
  type Coordinates,
  type Duree,
  type Lieu,
  type PriceLevel,
  type SortieComposee,
  type SortieCriteres,
  type Ville,
} from "@gosee/shared";
import { ChoixChips } from "./ChoixChips";
import { EtapeSortie } from "./EtapeSortie";

const TEMPS_LABELS: Record<Duree, string> = {
  courte: "2 h",
  demi_journee: "Demi-journée",
  journee: "Journée",
  sejour: "Plusieurs jours",
};

// Préférences saisies dans « Je ne sais pas quoi faire » : réutilisées pour
// ne pas reposer les mêmes questions.
const RECO_KEY = "gosee:reco-preferences";

type GeoStatus = "idle" | "loading" | "denied";

export function ComposeurSortie({ lieux, villes }: { lieux: Lieu[]; villes: Ville[] }) {
  const searchParams = useSearchParams();
  const initial = useMemo(() => parseSortieParams(searchParams), [searchParams]);
  const ancre = searchParams.get("ancre");
  const ancreLieu = ancre ? lieux.find((l) => l.slug === ancre) : undefined;

  const [depart, setDepart] = useState<{ label: string; pos: Coordinates } | null>(
    initial.criteres ? { label: "Point de départ", pos: initial.criteres.position } : null
  );
  const [temps, setTemps] = useState<Duree[]>(initial.criteres ? [initial.criteres.temps] : []);
  const [budget, setBudget] = useState<PriceLevel[]>(initial.criteres ? [initial.criteres.budget] : []);
  const [extra, setExtra] = useState<Pick<SortieCriteres, "groupe" | "ambiances">>({
    groupe: initial.criteres?.groupe ?? "amis",
    ambiances: initial.criteres?.ambiances ?? [],
  });
  const [etapes, setEtapes] = useState<SortieComposee | null>(initial.etapes);
  const [geo, setGeo] = useState<GeoStatus>("idle");
  const [copie, setCopie] = useState(false);

  useEffect(() => {
    if (initial.criteres) return;
    try {
      const saved = JSON.parse(localStorage.getItem(RECO_KEY) ?? "null");
      if (saved) {
        if (saved.temps?.[0]) setTemps([saved.temps[0]]);
        if (saved.budget?.[0]) setBudget([saved.budget[0]]);
        setExtra({ groupe: saved.groupe?.[0] ?? "amis", ambiances: saved.ambiances ?? [] });
      }
    } catch {
      // stockage indisponible : on garde les valeurs par défaut
    }
  }, [initial.criteres]);

  const criteres: SortieCriteres | null =
    depart && temps[0] && budget[0]
      ? { position: depart.pos, temps: temps[0], budget: budget[0], ...extra, ancre }
      : null;

  const sortie = useMemo(
    () => (criteres && etapes ? planifierSortie(lieux, etapes.slugs, etapes.types, criteres.position) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lieux, etapes, criteres?.position.lat, criteres?.position.lng]
  );

  // Lien partageable : l'URL reflète toujours la sortie affichée.
  useEffect(() => {
    if (!criteres) return;
    const url = `${window.location.pathname}?${sortieQuery(criteres, etapes)}`;
    window.history.replaceState(null, "", url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etapes, criteres?.position.lat, criteres?.position.lng, criteres?.temps, criteres?.budget]);

  function localiser() {
    if (!("geolocation" in navigator)) return setGeo("denied");
    setGeo("loading");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setDepart({ label: "Ma position", pos: { lat: p.coords.latitude, lng: p.coords.longitude } });
        setGeo("idle");
      },
      () => setGeo("denied"),
      { timeout: 10_000 }
    );
  }

  function composer() {
    if (criteres) setEtapes(composerSortie(lieux, criteres));
  }

  function modifier(fn: (e: SortieComposee) => SortieComposee) {
    setEtapes((e) => (e ? fn({ slugs: [...e.slugs], types: [...e.types] }) : e));
  }

  async function partager() {
    const url = window.location.href;
    const titre = "Notre sortie avec Gosee";
    try {
      if (navigator.share) await navigator.share({ title: titre, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopie(true);
        setTimeout(() => setCopie(false), 2000);
      }
    } catch {
      // partage annulé par l'utilisateur
    }
  }

  const maps = sortie ? lienItineraire(sortie) : null;

  return (
    <div>
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-900/5 sm:p-5">
        {ancreLieu && (
          <p className="mb-1 rounded-lg bg-orange-50 px-3 py-2 text-sm text-orange-900">
            Sortie construite autour de <strong>{ancreLieu.nom}</strong>
          </p>
        )}

        <fieldset className="mt-3">
          <legend className="text-sm font-semibold text-neutral-900">D&apos;où partez-vous ?</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={localiser}
              className={`rounded-full px-3.5 py-2 text-sm font-medium ${
                depart?.label === "Ma position"
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-emerald-700 ring-1 ring-emerald-600"
              }`}
            >
              📍 {geo === "loading" ? "Localisation…" : "Ma position"}
            </button>
            <select
              aria-label="Ville de départ"
              value={villes.find((v) => v.nom === depart?.label)?.nom ?? ""}
              onChange={(e) => {
                const v = villes.find((x) => x.nom === e.target.value);
                if (v) setDepart({ label: v.nom, pos: { lat: v.lat, lng: v.lng } });
              }}
              className="rounded-full bg-white px-3.5 py-2 text-sm text-neutral-800 ring-1 ring-neutral-200"
            >
              <option value="">Ou choisir une ville…</option>
              {villes.map((v) => (
                <option key={v.nom} value={v.nom}>
                  {v.nom}
                </option>
              ))}
            </select>
          </div>
          {geo === "denied" && (
            <p className="mt-1.5 text-xs text-neutral-500">
              Localisation indisponible : choisissez une ville de départ.
            </p>
          )}
        </fieldset>

        <ChoixChips legend="Combien de temps ?" options={TEMPS_LABELS} selected={temps} onChange={setTemps} />
        <ChoixChips
          legend="Budget par personne ?"
          options={PRICE_LEVEL_LABELS}
          selected={budget}
          onChange={setBudget}
        />

        <button
          type="button"
          onClick={composer}
          disabled={!criteres}
          className="mt-5 w-full rounded-xl bg-orange-500 px-4 py-3.5 text-base font-bold text-white shadow-md shadow-orange-500/25 hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:shadow-none"
        >
          {!criteres ? "Départ, temps et budget requis" : etapes ? "Recomposer ma sortie" : "Composer ma sortie"}
        </button>
      </div>

      {sortie && criteres && etapes && (
        <section className="mt-6">
          <h2 className="text-xl font-extrabold text-neutral-900">Votre sortie</h2>

          {sortie.etapes.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-600">
              Aucune sortie ne tient dans ce temps et ce budget depuis ce point de départ. Essayez
              plus de temps ou un budget plus large.
            </p>
          ) : (
            <>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <Resume titre="Durée" valeur={`≈ ${formatDuree(sortie.dureeTotale)}`} />
                <Resume titre="Trajets" valeur={`≈ ${Math.round(sortie.kmTotal)} km`} />
                <Resume
                  titre={sortie.budget.repasInclus ? "Budget" : "Budget hors repas"}
                  valeur={
                    sortie.budget.max === 0
                      ? "Gratuit"
                      : `${fcfa(sortie.budget.min)} – ${fcfa(sortie.budget.max)}`
                  }
                />
              </div>

              <ol className="mt-5 flex flex-col gap-5">
                {sortie.etapes.map((etape, i) => (
                  <EtapeSortie
                    key={`${etapes.slugs[i]}-${i}`}
                    etape={etape}
                    index={i}
                    total={sortie.etapes.length}
                    alternatives={alternatives(lieux, etapes, i, criteres)}
                    onRemplacer={(slug) =>
                      modifier((e) => {
                        e.slugs[i] = slug;
                        return e;
                      })
                    }
                    onSupprimer={() =>
                      modifier((e) => {
                        e.slugs.splice(i, 1);
                        e.types.splice(i, 1);
                        return e;
                      })
                    }
                    onDeplacer={(sens) =>
                      modifier((e) => {
                        const j = i + sens;
                        [e.slugs[i], e.slugs[j]] = [e.slugs[j], e.slugs[i]];
                        [e.types[i], e.types[j]] = [e.types[j], e.types[i]];
                        return e;
                      })
                    }
                  />
                ))}
              </ol>

              <p className="mt-4 text-xs text-neutral-500">
                Horaires et trajets estimés à titre indicatif : Google Maps donne le temps de trajet
                réel.
              </p>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                {maps && (
                  <a
                    href={maps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-center font-semibold text-white hover:bg-emerald-700"
                  >
                    Ouvrir l&apos;itinéraire dans Google Maps
                  </a>
                )}
                <button
                  type="button"
                  onClick={partager}
                  className="flex-1 rounded-xl border border-emerald-600 px-4 py-3 font-semibold text-emerald-700 hover:bg-emerald-50"
                >
                  {copie ? "Lien copié ✓" : "Partager cette sortie"}
                </button>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}

function Resume({ titre, valeur }: { titre: string; valeur: string }) {
  return (
    <div className="rounded-xl bg-white p-2.5 ring-1 ring-neutral-900/5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">{titre}</p>
      <p className="mt-0.5 text-sm font-bold text-neutral-900">{valeur}</p>
    </div>
  );
}

function fcfa(n: number): string {
  return n >= 1000 ? `${Math.round(n / 1000)} k` : `${n}`;
}
