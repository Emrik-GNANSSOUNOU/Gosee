"""
Génère supabase/maj_contenu.sql depuis data/seed/lieux.json : un script à
coller tel quel dans le SQL Editor de Supabase (même depuis un téléphone)
pour appliquer les colonnes manquantes et mettre à jour le contenu des
lieux existants, sans PC ni `npm run seed`.

Insère les lieux nouveaux (ex. restaurants importés) et met à jour les
autres par slug (les id ne changent pas, contrairement au seed qui supprime
puis réinsère tout). Sans risque à relancer.

Usage : python data/scripts/export_xlsx_to_json.py
        python data/scripts/generate_sql_update.py
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LIEUX = ROOT / "data" / "seed" / "lieux.json"
SCHEMA = ROOT / "supabase" / "schema.sql"
OUT = ROOT / "supabase" / "maj_contenu.sql"

# Colonnes écrites pour chaque lieu (insertion d'un lieu nouveau, ex. un
# restaurant importé, ou mise à jour d'un lieu existant, retrouvé par slug).
BASE = ["nom", "category", "department", "country", "address", "google_maps_url", "source"]
NUMS = ["lat", "lng", "rating", "reviews_count"]
TEXT = ["description", "horaires", "contact", "website", "prix", "price_level", "duree", "alerte",
        "photo_credit", "photo_source"]
ARRAYS = ["tags", "ideal_pour", "photos"]
BOOLS = ["verified", "infos_estimees"]

def q(v):
    return "null" if v is None else "'" + str(v).replace("'", "''") + "'"


def arr(values):
    return "array[" + ",".join(q(v) for v in values) + "]::text[]" if values else "'{}'::text[]"


def main():
    lieux = json.loads(LIEUX.read_text(encoding="utf-8"))
    schema = SCHEMA.read_text(encoding="utf-8")
    # Toutes les colonnes ajoutées après coup (« add column if not exists »),
    # pour qu'une base en retard de plusieurs migrations soit remise à niveau.
    migrations = re.findall(r"alter table lieux add column if not exists.*?;", schema, re.S)
    # Dernière version de la contrainte de catégorie (ex. ajout de « restaurant »).
    contrainte = re.findall(r"alter table lieux add constraint lieux_category_check.*?;", schema, re.S)[-1:]
    migrations += ["alter table lieux drop constraint if exists lieux_category_check;", *contrainte]

    out = [
        "-- Gosee — mise à jour du contenu des lieux. GÉNÉRÉ par",
        "-- data/scripts/generate_sql_update.py : ne pas éditer à la main.",
        "-- À coller tel quel dans le SQL Editor de Supabase, puis « Run ».",
        "-- Sans risque à relancer (mêmes valeurs).",
        "",
        "begin;",
        "",
        *migrations,
        "",
    ]
    cols = ["slug", *BASE, *NUMS, *TEXT, *ARRAYS, *BOOLS]
    for l in lieux:
        vals = [q(l["slug"])]
        vals += [q(l.get(c)) for c in BASE]
        vals += ["null" if l.get(c) is None else str(l[c]) for c in NUMS]
        vals += [q(l.get(c)) for c in TEXT]
        vals += [arr(l.get(c) or []) for c in ARRAYS]
        vals += ["true" if l.get(c) else "false" for c in BOOLS]
        updates = ", ".join(f"{c} = excluded.{c}" for c in cols if c != "slug")
        out.append(
            f"insert into lieux ({', '.join(cols)}) values ({', '.join(vals)}) "
            f"on conflict (slug) do update set {updates}, updated_at = now();"
        )
    out += [
        "",
        "commit;",
        "",
        f"-- Vérification : lieux_a_jour doit valoir {len(lieux)}.",
        "select count(*) filter (where updated_at > now() - interval '5 minutes') as lieux_a_jour,",
        "       count(*) filter (where alerte is not null) as lieux_en_alerte, count(*) as total from lieux;",
        "",
    ]
    OUT.write_text("\n".join(out), encoding="utf-8")
    print(f"{len(lieux)} lieux -> {OUT}")


if __name__ == "__main__":
    main()
