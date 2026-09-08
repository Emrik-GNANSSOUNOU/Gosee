"""
Exporte benin_contenu_curation.xlsx vers data/seed/lieux.json.

One-off script, hors runtime de l'app Next.js. Nécessite openpyxl
(`pip install openpyxl`).

Usage: python data/scripts/export_xlsx_to_json.py
"""
import json
import re
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parents[2]
XLSX_PATH = ROOT / "benin_contenu_curation.xlsx"
OUT_PATH = ROOT / "data" / "seed" / "lieux.json"

TYPE_TO_CATEGORY = {
    "Site touristique": "site_touristique",
    "Loisir": "loisir",
    "Hôtel": "hotel",
    "Activité": "activite",
    "Événement": "evenement",
}


def parse_gps(raw):
    if not raw:
        return None, None
    match = re.match(r"\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*", str(raw))
    if not match:
        return None, None
    return float(match.group(1)), float(match.group(2))


def parse_verified(statut):
    return bool(statut) and "vérifié" in str(statut).lower()


def rows_from_sheet_1(ws):
    """60 Lieux incontournables: Département, #, Nom, Type, Description,
    Localisation, GPS, Lien Google Maps, Statut."""
    for row in ws.iter_rows(min_row=2, values_only=True):
        department, _num, nom, type_, description, localisation, gps, maps_url, statut = row
        if not nom:
            continue
        lat, lng = parse_gps(gps)
        yield {
            "nom": nom,
            "category": TYPE_TO_CATEGORY.get(type_, "activite"),
            "description": description,
            "department": department,
            "country": "Bénin",
            "address": localisation,
            "lat": lat,
            "lng": lng,
            "google_maps_url": maps_url,
            "verified": parse_verified(statut),
            "source": statut,
        }


def rows_from_sheet_2(ws):
    """Hôtels-Activités-Événements: Département, Catégorie, Nom, Description,
    Localisation, GPS, Lien Google Maps, Statut."""
    for row in ws.iter_rows(min_row=2, values_only=True):
        department, categorie, nom, description, localisation, gps, maps_url, statut = row
        if not nom:
            continue
        lat, lng = parse_gps(gps)
        yield {
            "nom": nom,
            "category": TYPE_TO_CATEGORY.get(categorie, "activite"),
            "description": description,
            "department": department,
            "country": "Bénin",
            "address": localisation,
            "lat": lat,
            "lng": lng,
            "google_maps_url": maps_url,
            "verified": parse_verified(statut),
            "source": statut,
        }


def main():
    wb = openpyxl.load_workbook(XLSX_PATH, data_only=True)
    lieux = list(rows_from_sheet_1(wb.worksheets[0])) + list(rows_from_sheet_2(wb.worksheets[1]))

    seen = set()
    for lieu in lieux:
        key = (lieu["nom"], lieu["department"])
        if key in seen:
            print(f"Doublon détecté: {key}")
        seen.add(key)

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(lieux, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"{len(lieux)} lieux exportés vers {OUT_PATH}")


if __name__ == "__main__":
    main()
