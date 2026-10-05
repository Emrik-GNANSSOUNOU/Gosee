import type { Recommandation } from "@gosee/shared";
import { LieuCompactCard } from "./LieuCompactCard";

export function RecommandationCard({ reco, rang }: { reco: Recommandation; rang: number }) {
  return <LieuCompactCard lieu={reco.lieu} chips={reco.raisons} badge={String(rang)} />;
}
