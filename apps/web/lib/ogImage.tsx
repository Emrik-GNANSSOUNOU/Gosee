import { ImageResponse } from "next/og";

// Visuel de partage (WhatsApp, Facebook, X...) généré à la volée, aux
// couleurs de Gosee : pas de photo réelle disponible pour l'instant, donc
// une carte typographique plutôt qu'une image générique trompeuse.

export const OG_SIZE = { width: 1200, height: 630 };

export function ogImage({
  surtitre,
  titre,
  pastilles = [],
}: {
  surtitre: string;
  titre: string;
  pastilles?: string[];
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #047857 0%, #059669 55%, #f97316 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 40, fontWeight: 800, letterSpacing: -1 }}>
          Gosee
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 32, opacity: 0.9 }}>{surtitre}</div>
          <div
            style={{
              display: "flex",
              fontSize: titre.length > 40 ? 64 : 80,
              fontWeight: 800,
              lineHeight: 1.05,
              marginTop: 12,
            }}
          >
            {titre}
          </div>
          {pastilles.length > 0 && (
            <div style={{ display: "flex", gap: 16, marginTop: 32 }}>
              {pastilles.map((p) => (
                <div
                  key={p}
                  style={{
                    display: "flex",
                    fontSize: 28,
                    padding: "10px 24px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.2)",
                  }}
                >
                  {p}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    ),
    OG_SIZE
  );
}
