import { createClient } from "@supabase/supabase-js";

// .trim() : une valeur d'env collée dans un dashboard (Vercel...) embarque
// souvent un espace ou un \n final, ce qui casse les en-têtes HTTP envoyés
// par supabase-js ("Cannot convert argument to a ByteString").
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY doivent être définis."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
