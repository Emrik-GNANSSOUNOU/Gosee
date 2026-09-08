/**
 * Importe data/seed/lieux.json dans la table `lieux` de Supabase.
 * Nécessite SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env.local
 * (clé service_role — jamais exposée côté client).
 *
 * Usage: npm run seed
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";

config({ path: resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis (.env.local)");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  const seedPath = resolve(__dirname, "../data/seed/lieux.json");
  const lieux = JSON.parse(readFileSync(seedPath, "utf-8"));

  console.log(`Import de ${lieux.length} lieux...`);

  const { error: deleteError } = await supabase.from("lieux").delete().not("id", "is", null);
  if (deleteError) {
    console.error("Erreur lors du nettoyage de la table:", deleteError.message);
    process.exit(1);
  }

  const { error: insertError, count } = await supabase
    .from("lieux")
    .insert(lieux, { count: "exact" });

  if (insertError) {
    console.error("Erreur lors de l'import:", insertError.message);
    process.exit(1);
  }

  console.log(`${count} lieux importés avec succès.`);
}

main();
