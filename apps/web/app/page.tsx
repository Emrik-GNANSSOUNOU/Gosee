import type { Lieu } from "@gosee/shared";
import { LieuList } from "@/components/LieuList";
import { supabase } from "@/lib/supabaseClient";

async function getLieux(): Promise<Lieu[]> {
  const { data, error } = await supabase.from("lieux").select("*").order("nom");
  if (error) throw new Error(error.message);
  return data as Lieu[];
}

export default async function HomePage() {
  const lieux = await getLieux();

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Gosee</h1>
        <p className="mt-1 text-neutral-600">
          Découvrez les lieux, activités et événements incontournables du Bénin.
        </p>
      </header>

      <LieuList lieux={lieux} />
    </main>
  );
}
