import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import type { Lieu } from "@gosee/shared";

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category");

  let query = supabase.from("lieux").select("*").order("nom");
  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ lieux: data as Lieu[] });
}
