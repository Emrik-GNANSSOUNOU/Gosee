import { NextRequest, NextResponse } from "next/server";
import { composerSortie, parseSortieParams, planifierSortie, type Lieu } from "@gosee/shared";
import { supabase } from "@/lib/supabaseClient";

// GET /api/sortie?lat=&lng=&temps=&budget=[&groupe=&ambiances=&heure=&ancre=]
//   → compose une sortie ;
// avec en plus &etapes=slug1,slug2&types=visite,repas → planifie ces étapes.
// Même moteur que la page web (packages/shared), pour le futur client mobile.
export async function GET(request: NextRequest) {
  const { criteres, etapes } = parseSortieParams(request.nextUrl.searchParams);
  if (!criteres) {
    return NextResponse.json(
      { error: "Paramètres requis : lat, lng, temps, budget (groupe, ambiances, heure, ancre, etapes, types optionnels)" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase.from("lieux").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const lieux = data as Lieu[];
  const choix = etapes ?? composerSortie(lieux, criteres);
  return NextResponse.json({
    etapes: choix,
    sortie: planifierSortie(lieux, choix.slugs, choix.types, criteres.position, criteres.heureDepart),
  });
}
