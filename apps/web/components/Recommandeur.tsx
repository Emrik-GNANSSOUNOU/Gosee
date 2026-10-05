"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AMBIANCE_LABELS,
  IDEAL_POUR_LABELS,
  PRICE_LEVEL_LABELS,
  recommander,
  type Ambiance,
  type Coordinates,
  type Duree,
  type IdealPour,
  type Lieu,
  type PriceLevel,
  type RecoResultat,
} from "@gosee/shared";
import { ChoixChips } from "./ChoixChips";
import { RecommandationCard } from "./RecommandationCard";

// Formulé du point de vue de l'utilisateur (« combien de temps as-tu ? »),
// d'où des libellés propres plutôt que DUREE_LABELS.
const TEMPS_LABELS: Record<Duree, string> = {
  courte: "1 à 2 h",
  demi_journee: "Demi-journée",
  journee: "Journée",
  sejour: "Plusieurs jours",
};

const STORAGE_KEY = "gosee:reco-preferences";

interface Preferences {
  budget: PriceLevel[];
  temps: Duree[];
  groupe: IdealPour[];
  ambiances: Ambiance[];
}

type GeoStatus = "idle" | "loading" | "denied" | "unsupported";

export function Recommandeur({ lieux }: { lieux: Lieu[] }) {
  const [prefs, setPrefs] = useState<Preferences>({
    budget: [],
    temps: [],
    groupe: [],
    ambiances: [],
  });
  const [position, setPosition] = useState<Coordinates | null>(null);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const [resultat, setResultat] = useState<RecoResultat | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Préférences gardées sur l'appareil (pas de compte pour l'instant) ;
  // la position n'est jamais stockée.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setPrefs((p) => ({ ...p, ...JSON.parse(saved) }));
    } catch {
      // stockage indisponible (navigation privée...) : on repart de zéro
    }
  }, []);

  function update<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    setPrefs((p) => ({ ...p, [key]: value }));
  }

  function requestPosition() {
    if (!("geolocation" in navigator)) {
      setGeoStatus("unsupported");
      return;
    }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus("idle");
      },
      () => setGeoStatus("denied"),
      { enableHighAccuracy: false, timeout: 10_000 }
    );
  }

  const complet = prefs.budget.length > 0 && prefs.temps.length > 0 && prefs.groupe.length > 0;

  function trouver() {
    if (!complet) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // idem : non bloquant
    }
    setResultat(
      recommander(lieux, {
        budget: prefs.budget[0],
        temps: prefs.temps[0],
        groupe: prefs.groupe[0],
        ambiances: prefs.ambiances,
        position,
      })
    );
    requestAnimationFrame(() =>
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  }

  return (
    <div>
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-900/5 sm:p-5">
        <ChoixChips
          legend="Quel budget par personne ?"
          options={PRICE_LEVEL_LABELS}
          selected={prefs.budget}
          onChange={(v) => update("budget", v)}
        />
        <ChoixChips
          legend="Combien de temps as-tu ?"
          options={TEMPS_LABELS}
          selected={prefs.temps}
          onChange={(v) => update("temps", v)}
        />
        <ChoixChips
          legend="Avec qui ?"
          options={IDEAL_POUR_LABELS}
          selected={prefs.groupe}
          onChange={(v) => update("groupe", v)}
        />
        <ChoixChips
          legend="Quelles ambiances ? (facultatif, plusieurs choix)"
          options={AMBIANCE_LABELS}
          selected={prefs.ambiances}
          multiple
          onChange={(v) => update("ambiances", v)}
        />

        <div className="mt-5">
          {position ? (
            <p className="flex items-center gap-2 text-sm font-medium text-emerald-700">
              <span aria-hidden>📍</span>
              Position prise en compte
              <button
                type="button"
                onClick={() => setPosition(null)}
                className="ml-auto shrink-0 text-xs text-neutral-500 underline"
              >
                Retirer
              </button>
            </p>
          ) : (
            <button
              type="button"
              onClick={requestPosition}
              disabled={geoStatus === "loading"}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-600 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-60"
            >
              <span aria-hidden>📍</span>
              {geoStatus === "loading" ? "Localisation…" : "Utiliser ma position (recommandé)"}
            </button>
          )}
          {geoStatus === "denied" && (
            <p className="mt-1.5 text-xs text-neutral-500">
              Localisation refusée — les suggestions couvriront tout le pays.
            </p>
          )}
          {geoStatus === "unsupported" && (
            <p className="mt-1.5 text-xs text-neutral-500">
              Géolocalisation indisponible sur cet appareil.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={trouver}
          disabled={!complet}
          className="mt-5 w-full rounded-xl bg-orange-500 px-4 py-3.5 text-base font-bold text-white shadow-md shadow-orange-500/25 transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:shadow-none"
        >
          {complet ? "Trouver mes idées de sortie" : "Budget, temps et groupe requis"}
        </button>
      </div>

      <div ref={resultsRef} className="scroll-mt-4">
        {resultat && (
          <section className="mt-6">
            <h2 className="text-xl font-extrabold text-neutral-900">
              {resultat.recommandations.length > 0
                ? "Voilà ce que tu peux faire"
                : "Aucune idée pour ces critères"}
            </h2>
            {resultat.elargi && (
              <p className="mt-1 text-sm text-neutral-600">
                Rien ne correspond exactement à ces ambiances : voici d&apos;autres idées qui
                tiennent dans ton budget et ton temps.
              </p>
            )}
            {resultat.recommandations.length === 0 && (
              <p className="mt-1 text-sm text-neutral-600">
                Essaie un budget plus large ou davantage de temps
                {position ? ", ou retire ta position pour voir tout le pays" : ""}.
              </p>
            )}
            <div className="mt-4 flex flex-col gap-3">
              {resultat.recommandations.map((reco, i) => (
                <div key={reco.lieu.id}>
                  <RecommandationCard reco={reco} rang={i + 1} />
                  <Link
                    href={`/creer-ma-sortie?ancre=${reco.lieu.slug}`}
                    className="mt-1 inline-block px-1 text-sm font-medium text-orange-700 hover:underline"
                  >
                    🗺️ Construire ma sortie autour de cette idée →
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
