"use client";

import { useState } from "react";
import {
  formatDistance,
  formatDuree,
  formatHeure,
  type Etape,
  type Lieu,
} from "@gosee/shared";
import { LieuCompactCard } from "./LieuCompactCard";

const ICONE = { visite: "📍", repas: "🍽️", nuit: "🛏️" } as const;

interface EtapeSortieProps {
  etape: Etape;
  index: number;
  total: number;
  alternatives: Lieu[];
  onRemplacer: (slug: string) => void;
  onSupprimer: () => void;
  onDeplacer: (sens: -1 | 1) => void;
}

export function EtapeSortie({
  etape,
  index,
  total,
  alternatives,
  onRemplacer,
  onSupprimer,
  onDeplacer,
}: EtapeSortieProps) {
  const [choix, setChoix] = useState(false);
  const { lieu } = etape;

  return (
    <li className="relative pl-8">
      {/* Fil vertical de la frise */}
      <span aria-hidden className="absolute left-3 top-0 h-full w-px bg-neutral-200" />
      <span
        aria-hidden
        className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm ring-2 ring-orange-400"
      >
        {ICONE[etape.type]}
      </span>

      {etape.trajet && (
        <p className="mb-1 text-xs text-neutral-500">
          {etape.trajet.km < 1.2 ? "🚶" : "🚗"} ≈ {formatDuree(etape.trajet.minutes)} ·{" "}
          {formatDistance(etape.trajet.km)}
        </p>
      )}

      <p className="text-sm font-semibold text-neutral-900">
        {formatHeure(etape.debut)}
        {etape.type !== "nuit" && ` – ${formatHeure(etape.fin)}`}
        <span className="ml-1 font-normal text-neutral-500">
          {etape.type === "repas" ? "Pause repas" : etape.type === "nuit" ? "Nuit sur place" : ""}
        </span>
      </p>

      <div className="mt-1.5">
        {lieu ? (
          <LieuCompactCard
            lieu={lieu}
            chips={[
              ...(etape.type === "visite" ? [formatDuree(etape.fin - etape.debut)] : []),
              ...(lieu.prix && lieu.prix.length < 40 ? [lieu.prix] : []),
            ]}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-3 text-sm text-neutral-600">
            Pas encore de restaurant référencé à proximité : prévoyez une pause dans un maquis
            du coin.
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium">
        {alternatives.length > 0 && (
          <button
            type="button"
            onClick={() => setChoix((v) => !v)}
            className="rounded-full bg-orange-50 px-3 py-1.5 text-orange-800 hover:bg-orange-100"
          >
            {choix ? "Fermer" : "Remplacer"}
          </button>
        )}
        <button
          type="button"
          onClick={() => onDeplacer(-1)}
          disabled={index === 0}
          aria-label="Monter l'étape"
          className="rounded-full bg-neutral-100 px-3 py-1.5 text-neutral-700 disabled:opacity-40"
        >
          ↑
        </button>
        <button
          type="button"
          onClick={() => onDeplacer(1)}
          disabled={index === total - 1}
          aria-label="Descendre l'étape"
          className="rounded-full bg-neutral-100 px-3 py-1.5 text-neutral-700 disabled:opacity-40"
        >
          ↓
        </button>
        <button
          type="button"
          onClick={onSupprimer}
          className="rounded-full bg-neutral-100 px-3 py-1.5 text-neutral-700 hover:bg-red-50 hover:text-red-700"
        >
          Retirer
        </button>
      </div>

      {choix && (
        <ul className="mt-2 flex flex-col gap-2">
          {alternatives.map((alt) => (
            <li key={alt.slug}>
              <button
                type="button"
                onClick={() => {
                  setChoix(false);
                  onRemplacer(alt.slug);
                }}
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-left text-sm hover:border-orange-300"
              >
                <span className="font-semibold text-neutral-900">{alt.nom}</span>
                {alt.address && <span className="block text-xs text-neutral-500">{alt.address}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
