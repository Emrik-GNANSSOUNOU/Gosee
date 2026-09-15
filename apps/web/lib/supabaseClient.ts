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

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    // Fait passer les requêtes de lecture par le Data Cache de Next.js
    // (60s) : les pages restent server-rendered (bon pour le SEO / le
    // crawl) sans refaire un aller-retour Supabase à chaque requête.
    fetch: (input, init) => fetch(input, { ...init, next: { revalidate: 60 } }),
  },
});
