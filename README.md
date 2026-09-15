# Gosee

App de découverte, planification et réservation de sorties au Bénin.
Voir [CLAUDE.md](./CLAUDE.md) pour la vision produit complète.

Ce dépôt contient le socle technique et le pilier 1 ("Découvrir") : une
page qui liste les lieux/activités/événements réels du Bénin, filtrable
par catégorie, avec une fiche détaillée par lieu.

## Stack

- **Web** : Next.js (App Router) — `apps/web`
- **API** : Next.js API Routes (même stack, consommée aussi par le futur
  mobile React Native) — `apps/web/app/api`
- **Logique métier partagée** (framework-agnostic, réutilisable par le
  mobile) — `packages/shared`
- **Base de données** : Supabase (Postgres)
- **Données de seed** : extraites de `benin_contenu_curation.xlsx` →
  `data/seed/lieux.json`

## Arborescence

```
apps/web/           Application Next.js
packages/shared/     Types + logique métier partagés (web + futur mobile)
data/scripts/        Script Python d'export xlsx → JSON
data/seed/           Données de seed versionnées (lieux.json)
supabase/            Schéma SQL + script de seed Supabase
```

## Prérequis

- Node.js 20+ et npm 10+
- Un projet Supabase (gratuit) — voir "Configurer Supabase" ci-dessous

## Configurer Supabase

1. Créer un projet sur [supabase.com](https://supabase.com) (plan gratuit).
2. Dans le **SQL Editor** du dashboard, exécuter le contenu de
   [`supabase/schema.sql`](./supabase/schema.sql) pour créer la table
   `lieux`.
3. Récupérer les clés dans **Project Settings → API** :
   - `Project URL` et clé `anon public` → `apps/web/.env.local`
     (copier depuis `apps/web/.env.local.example`)
   - `Project URL` et clé `service_role` (secrète) → `.env.local` à la
     racine (copier depuis `.env.example`)
4. Importer les données réelles :

```bash
npm install
npm run seed
```

Ce script vide la table `lieux` puis y insère les ~97 lieux du fichier
`benin_contenu_curation.xlsx` (déjà exportés dans `data/seed/lieux.json`).
Pour ré-exporter depuis le xlsx après une mise à jour du fichier source
(nécessite `pip install openpyxl`) :

```bash
python data/scripts/export_xlsx_to_json.py
```

## Lancer en local

```bash
npm install
npm run dev
```

L'app est disponible sur [http://localhost:3000](http://localhost:3000).

## Autres commandes

```bash
npm run build   # build de production
npm run lint    # lint
```

## Déploiement (Vercel)

1. Pousser ce repo sur GitHub.
2. Sur [vercel.com](https://vercel.com) → **Add New Project** → importer
   le repo GitHub.
3. Définir le **Root Directory** sur `apps/web` (monorepo npm workspaces).
4. Ajouter les variables d'environnement (Project Settings → Environment
   Variables) :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` : l'URL de production (ex.
     `https://gosee-web-xxx.vercel.app`), sans slash final — utilisée pour
     les canonicals, Open Graph, `robots.txt` et `sitemap.xml`
5. Déployer. Chaque push sur la branche principale redéploie
   automatiquement.

## SEO

- `app/sitemap.ts` et `app/robots.ts` sont générés nativement par Next.js
  (`/sitemap.xml`, `/robots.txt`) à partir des lieux en base.
- Chaque fiche lieu (`/lieux/[slug]`) a un `<title>`/description dynamiques,
  une URL canonique, des balises Open Graph/Twitter, et un JSON-LD
  (`TouristAttraction` / `LodgingBusiness` selon la catégorie).
- Les URLs utilisent un `slug` lisible (ex. `/lieux/fondation-zinsou`),
  généré à l'export (`data/scripts/export_xlsx_to_json.py`) et stocké en
  base — pas l'UUID interne.
- Le filtre catégorie est reflété dans l'URL (`/?category=hotel`) : lien
  `<a href>` réel (crawlable, partageable) intercepté en JS pour un
  filtrage instantané côté client, sans rechargement.

## Notes de modélisation

- Les événements du jeu de données n'ont pas de date/heure réelle : ils
  sont modélisés comme des `lieux` (catégorie `evenement`) plutôt que
  dans une table `evenements` à part. Cette dernière sera introduite au
  pilier 3 ("voir ce qui se passe maintenant"), quand de vraies données
  temporelles seront disponibles.
- Les champs `horaires`, `contact`, `photos`, `price_info` existent dans
  le schéma mais restent `null` : absents du jeu de données source,
  à enrichir progressivement (voir pilier 6 de CLAUDE.md).
