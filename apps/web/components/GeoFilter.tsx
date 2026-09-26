"use client";

import { useState } from "react";
import { RADIUS_OPTIONS_KM, type Coordinates } from "@gosee/shared";

interface GeoFilterProps {
  position: Coordinates | null;
  radiusKm: number | null;
  onPositionChange: (position: Coordinates | null) => void;
  onRadiusChange: (radiusKm: number | null) => void;
}

type Status = "idle" | "loading" | "denied" | "unsupported";

export function GeoFilter({ position, radiusKm, onPositionChange, onRadiusChange }: GeoFilterProps) {
  const [status, setStatus] = useState<Status>("idle");

  function requestPosition() {
    if (!("geolocation" in navigator)) {
      setStatus("unsupported");
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onPositionChange({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        onRadiusChange(25);
        setStatus("idle");
      },
      () => setStatus("denied"),
      { enableHighAccuracy: false, timeout: 10_000 }
    );
  }

  function disable() {
    onPositionChange(null);
    onRadiusChange(null);
    setStatus("idle");
  }

  if (!position) {
    return (
      <div className="mb-5">
        <button
          type="button"
          onClick={requestPosition}
          disabled={status === "loading"}
          className="group flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 p-4 text-left shadow-md shadow-emerald-600/20 transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 sm:p-5"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 text-2xl">
            <span aria-hidden>📍</span>
          </span>
          <span className="flex-1">
            <span className="block text-base font-bold text-white sm:text-lg">
              {status === "loading" ? "Localisation en cours…" : "Autour de moi"}
            </span>
            <span className="block text-sm text-white/85">
              Découvre les lieux et activités proches de toi
            </span>
          </span>
          <span
            aria-hidden
            className="shrink-0 text-xl text-white/80 transition-transform group-hover:translate-x-0.5"
          >
            →
          </span>
        </button>
        {status === "denied" && (
          <p className="mt-1.5 text-xs text-neutral-500">
            Localisation refusée — autorise-la dans les réglages de ton navigateur pour voir les lieux proches de toi.
          </p>
        )}
        {status === "unsupported" && (
          <p className="mt-1.5 text-xs text-neutral-500">
            La géolocalisation n&apos;est pas disponible sur cet appareil.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mb-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 p-4 shadow-md shadow-emerald-600/20 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-base font-bold text-white sm:text-lg">
          <span aria-hidden>📍</span>
          Autour de moi
        </span>
        <button
          type="button"
          onClick={disable}
          className="shrink-0 text-sm font-medium text-white/80 underline hover:text-white"
        >
          Désactiver
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {RADIUS_OPTIONS_KM.map((km) => (
          <button
            key={km}
            type="button"
            onClick={() => onRadiusChange(km)}
            className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              radiusKm === km
                ? "bg-white text-emerald-700"
                : "bg-white/15 text-white hover:bg-white/25"
            }`}
          >
            {km} km
          </button>
        ))}
        <button
          type="button"
          onClick={() => onRadiusChange(null)}
          className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            radiusKm === null ? "bg-white text-emerald-700" : "bg-white/15 text-white hover:bg-white/25"
          }`}
        >
          Tout voir
        </button>
      </div>
    </div>
  );
}
