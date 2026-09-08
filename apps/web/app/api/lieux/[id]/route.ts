import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import type { Lieu } from "@gosee/shared";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("lieux")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ lieu: data as Lieu });
}
