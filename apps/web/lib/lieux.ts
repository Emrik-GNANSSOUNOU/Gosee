import { cache } from "react";
import type { Lieu } from "@gosee/shared";
import { supabase } from "./supabaseClient";

// cache() : mémoïse par requête serveur, pour que generateMetadata() et le
// composant de page (qui ont chacun besoin des mêmes données) ne déclenchent
// qu'un seul appel réseau à Supabase.

export const getAllLieux = cache(async (): Promise<Lieu[]> => {
  const { data, error } = await supabase.from("lieux").select("*").order("nom");
  if (error) throw new Error(error.message);
  return data as Lieu[];
});

// null uniquement si le slug n'existe pas (PGRST116 = aucune ligne). Toute
// autre erreur (Supabase en pause, réseau...) est levée : en ISR, Next garde
// alors la dernière version valide de la page au lieu de mettre en cache
// une 404.
export const getLieuBySlug = cache(async (slug: string): Promise<Lieu | null> => {
  const { data, error } = await supabase.from("lieux").select("*").eq("slug", slug).single();
  if (error?.code === "PGRST116") return null;
  if (error) throw new Error(error.message);
  return data as Lieu;
});
