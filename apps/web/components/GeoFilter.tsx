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
      <div className="mb-3">
        <button
          type="button"
          onClick={requestPosition}
          disabled={status === "loading"}
          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600 bg-white px-4 py-1.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-60"
        >
          <span aria-hidden>📍</span>
          {status === "loading" ? "Localisation en cours…" : "Autour de moi"}
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
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white">
        <span aria-hidden>📍</span>
        Autour de moi
      </span>
      {RADIUS_OPTIONS_KM.map((km) => (
        <button
          key={km}
          type="button"
          onClick={() => onRadiusChange(km)}
          className={`shrink-0 rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
            radiusKm === km
              ? "border-emerald-600 bg-emerald-600 text-white"
              : "border-neutral-300 bg-white text-neutral-700 hover:border-emerald-600"
          }`}
        >
          {km} km
        </button>
      ))}
      <button
        type="button"
        onClick={() => onRadiusChange(null)}
        className={`shrink-0 rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
          radiusKm === null
            ? "border-emerald-600 bg-emerald-600 text-white"
            : "border-neutral-300 bg-white text-neutral-700 hover:border-emerald-600"
        }`}
      >
        Tout voir
      </button>
      <button
        type="button"
        onClick={disable}
        className="shrink-0 text-sm text-neutral-500 underline hover:text-neutral-700"
      >
        Désactiver
      </button>
    </div>
  );
}
