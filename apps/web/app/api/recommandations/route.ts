import { NextRequest, NextResponse } from "next/server";
import { parseCriteres, recommander, type Lieu } from "@gosee/shared";
import { supabase } from "@/lib/supabaseClient";

// GET /api/recommandations?budget=&temps=&groupe=&ambiances=a,b[&lat=&lng=]
// Même moteur que la page web (packages/shared), pour le futur client mobile.
export async function GET(request: NextRequest) {
  const criteres = parseCriteres(request.nextUrl.searchParams);
  if (!criteres) {
    return NextResponse.json(
      { error: "Paramètres requis : budget, temps, groupe (ambiances, lat, lng optionnels)" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase.from("lieux").select("*");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(recommander(data as Lieu[], criteres));
}
