# Gosee

App de découverte, planification et réservation de sorties au Bénin (web + mobile).
Développée en stage agence, avec Claude Code.

**Promesse produit :** Découvrir → Choisir → Planifier → Réserver → Profiter.

**Phrase directrice :** l'utilisateur ne vient pas chercher une liste, il vient chercher une idée de sortie. Chaque fonctionnalité doit transformer un « je ne sais pas quoi faire » en « voilà exactement ce que je peux faire ».

## Positionnement

Pas un simple agenda d'événements, pas un simple guide touristique, pas une simple billetterie : une plateforme intelligente de découverte et de planification. Un catalogue montre ce qui existe ; Gosee aide à décider quoi faire.

Concurrents identifiés : Wakabi, ADDB (découverte), AZAN (événementiel/billetterie), Benin Events (promotion/découverte d'événements). Différenciation : personnalisation, géolocalisation, actualité, recommandations, combinaison d'activités, planification, réservation — pas la simple présence d'une fonctionnalité de plus.

Modèle : B2C2B, cœur B2C. Le B2B (professionnels : organisateurs, restaurants, hôtels, sites touristiques, guides, agences...) vient nourrir l'expérience B2C, jamais l'inverse.

Cible : résidents autant que touristes. Lancement au Bénin, mais architecture et marque pensées pour une expansion régionale (Togo, Côte d'Ivoire, Ghana, Sénégal...) — ne rien coder en dur qui suppose un seul pays.

## Stack technique (validée)

- **Web** : Next.js → déployé sur Vercel
- **API** : Next.js API Routes → sur Vercel
- **Mobile** : React Native → consomme la même API que le web
- **Base de données** : Supabase

Contrainte transversale : la logique métier (filtres, calcul de distance, règles de disponibilité, etc.) doit être partageable entre web et mobile — ne pas la coupler fortement à Next.js. Toute nouvelle dépendance doit être signalée avant d'être ajoutée.

## Les 6 piliers fonctionnels

Toute fonctionnalité doit se rattacher à l'un de ces piliers ; sinon, la remettre en question.

L'app ne présente pas d'événements (pas d'agenda daté) — ce type de contenu a été retiré du périmètre produit.

1. **Découvrir** — activités, lieux, restaurants, loisirs, sites touristiques
2. **Découverte géolocalisée** — « que puis-je faire autour de moi ? » (distance, horaires, prix, itinéraire)
3. **Recommandations personnalisées** — budget, localisation, temps disponible, nombre de personnes, préférences
4. **Créer sa sortie** — combiner activité → restaurant → itinéraire
5. **Information toujours actualisée** — fraîcheur des données, gestion des annulations/reports/promotions
6. **Réservation et billetterie** — achat de billets, réservation, paiement (Mobile Money, carte), historique

## Scope MVP — ordre strict validé

Ne pas développer un pilier suivant avant que le précédent soit fonctionnel, sauf validation explicite.

1. **Découvrir** — le socle : lister/afficher lieux, activités, restaurants, avec filtres par catégorie et fiche détaillée
2. **Découverte géolocalisée** — « autour de moi » avec rayon de distance ajustable et itinéraire
3. **Billetterie / réservation** — ajoutée en dernier dans le MVP, une fois 1 et 2 fonctionnels

**Hors MVP (V2)** : recommandations personnalisées (moteur de logique plus poussé), créer sa sortie (dépend des recommandations), information toujours actualisée en tant que système d'admin/alertes construit progressivement.

## Modèle de données

### Socle (piliers 1-2)

- **Lieu** : nom, type (hôtel/resto/loisir/site touristique...), adresse, coordonnées GPS, description, photos, horaires, contact
- **Activité** : à fusionner avec Lieu ou à distinguer selon les cas (ex. visite guidée sans lieu fixe) — décision à trancher au moment de l'implémentation
- **Catégorie / Tag** : pour classer et filtrer (tourisme, plage, culture, business...)
- **Utilisateur** : profil, localisation, préférences

### Billetterie (pilier 6, fin de MVP)

- **Billet** : type (standard/VIP...), prix, quantité disponible, lieu/activité associée
- **Réservation** : utilisateur, billet(s), quantité, statut (en attente/confirmée/annulée), date de réservation
- **Paiement** : montant, méthode (Mobile Money/carte), statut, référence transaction, réservation associée

Chaque activité doit pouvoir porter, à terme : nom, catégorie, description, photos, localisation, GPS, horaires, prix, disponibilité, contact, lien de réservation, organisateur, statut, date de dernière mise à jour.

## Spécifications fonctionnelles (user stories du MVP)

### 1. Découvrir
- En tant qu'utilisateur, je veux voir une liste de lieux/activités, afin d'explorer ce qui existe au Bénin
- En tant qu'utilisateur, je veux filtrer par catégorie (resto, loisir, tourisme...), afin de trouver ce qui m'intéresse
- En tant qu'utilisateur, je veux voir la fiche détaillée d'un lieu (photos, horaires, prix, avis), afin de décider si ça me convient

### 2. Découverte géolocalisée
- En tant qu'utilisateur, je veux voir les lieux autour de ma position, afin de trouver une sortie proche
- En tant qu'utilisateur, je veux ajuster un rayon de distance, afin d'affiner ma recherche et réduire mon temps de déplacement
- En tant qu'utilisateur, je veux obtenir un itinéraire vers un lieu, afin de m'y rendre facilement

## Données de contenu déjà disponibles

Un premier jeu de données réelles et vérifiées existe dans le projet (`benin_contenu_curation.xlsx`) :
- **60 lieux incontournables** répartis par département (Littoral, Atlantique, Ouémé, Plateau, Zou, Collines, Mono, Couffo, Atacora, Donga, Borgou, Alibori), avec nom, type, description, localisation, coordonnées GPS et lien Google Maps, vérifiés via Google Places
- **Hôtels et activités** associés par département

À utiliser comme données de seed (mock puis premier import réel) pour la table Lieu dès le développement du pilier « Découvrir » — préférer ce jeu de données réel à des mocks génériques.

## Conventions

- Structure de dossiers : monorepo npm workspaces —
  - `apps/web` : app Next.js (App Router), déployée sur Vercel
  - `packages/shared` : logique métier partagée web/mobile (types, filtres, calcul de distance géo) — `apps/mobile` sera ajouté ici le jour où le mobile démarre
  - `supabase` : `schema.sql` (à exécuter manuellement dans le SQL Editor du dashboard) + `seed.ts` (importe `data/seed/lieux.json` dans Supabase)
  - `data/` : `seed/lieux.json` (généré, ne pas éditer à la main) + `scripts/export_xlsx_to_json.py` (génère le JSON depuis `benin_contenu_curation.xlsx`, la source de vérité du contenu)
- Nommage des composants : PascalCase, un composant par fichier (`apps/web/components/`)
- Commits : pas de convention stricte imposée ; messages descriptifs en français, corps explique le "pourquoi" si non-évident

## Variables d'environnement

Aucune valeur réelle dans ce fichier ni dans le repo — voir `.env.example` (racine) et `apps/web/.env.local.example` pour la liste à jour des noms. Résumé :

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (`apps/web/.env.local`) : client Supabase, lecture publique seule (RLS)
- `NEXT_PUBLIC_SITE_URL` (`apps/web/.env.local`) : URL canonique (SEO, sitemap, robots) ; sur Vercel, déjà configurée en Production/Preview
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (`.env.local` racine) : utilisés uniquement par `supabase/seed.ts` (accès complet, jamais exposé au client)

Ces variables sont déjà configurées sur Vercel (projet `gosee-web`) pour Production et Preview — rien à refaire pour déployer. Pour développer/seed en local (ou depuis une session cloud), les valeurs sont dans le dashboard Supabase (Project Settings → API).

## Commandes

- Install : `npm install` (racine, installe tous les workspaces)
- Dev web : `npm run dev`
- Build : `npm run build`
- Lint : `npm run lint`
- Seed Supabase : `npm run seed` (réimporte tout `data/seed/lieux.json` — supprime puis réinsère toutes les lignes de la table `lieux`)
- Régénérer le JSON depuis le xlsx : `python data/scripts/export_xlsx_to_json.py` (nécessite `pip install openpyxl`)
- Mettre à jour la base sans PC ni seed : `python data/scripts/generate_sql_update.py` → coller `supabase/maj_contenu.sql` dans le SQL Editor de Supabase puis Run (ajoute les colonnes manquantes, insère les lieux nouveaux et met à jour les autres par slug (upsert), sans changer leurs id ; relançable sans risque)
- Vraies photos (Wikimedia Commons, licences libres) : `python data/scripts/fetch_commons_photos.py` (revue CSV seule) puis `--apply` (écrit les colonnes Photo du xlsx) ; nécessite l'accès réseau à `commons.wikimedia.org`
- Tests : [à définir]

## État d'avancement (dernière mise à jour : octobre 2026)

**Fait :**
- Pilier 1 (Découvrir) : liste + fiche détaillée, filtres catégorie, style "vitrine boutique" (grandes images, badges, CTA), SEO (slugs, sitemap, JSON-LD)
- Pilier 2 (Découverte géolocalisée) : bandeau "Autour de moi" (mis en avant visuellement, pas un simple filtre discret), rayon ajustable 5/10/25/50 km, tri par distance, itinéraire Google Maps sur la fiche détail
- 90 lieux en base (les événements ont été retirés du périmètre produit — voir pilier 1 et règles ci-dessous)
- ~32 lieux enrichis (horaires, téléphone, site web, note/avis) par recherche web manuelle ; le reste n'a pas d'info publique trouvable (sites naturels, petits établissements) — champs laissés vides plutôt qu'inventés
- Photos : 27 lieux ont une vraie photo Wikimedia Commons (licences CC BY / CC BY-SA, crédit affiché sous la photo de la fiche ; hôtes `upload.wikimedia.org` et `thumb.wikimedia.org` autorisés dans next.config), sélectionnées à la main après revue (8 propositions rejetées car hors sujet, Nikki écartée). Les autres lieux gardent un visuel neutre SVG par catégorie (`public/images/placeholders`). Nouvelle recherche : `fetch_commons_photos.py` (revue CSV, puis `--apply`)
- Infos pratiques (préparation du pilier Recommandations, oct. 2026) : les 90 lieux ont gamme de prix, durée, ambiances et public idéal (colonnes xlsx « Prix », « Gamme de prix », « Durée », « Ambiances », « Idéal pour », « Infos estimées »), affichés dans un bloc « Infos pratiques » sur la fiche. Prix sourcés quand un tarif public a été trouvé (souvent anciens : 2021, plateformes de réservation) ; sinon `infos_estimees = true` et la fiche l'indique. Vocabulaire partagé dans `packages/shared/src/pratique.ts`

- Pilier Recommandations personnalisées (passé devant la billetterie sur décision explicite de l'utilisateur, oct. 2026 — billetterie en pause) : page `/recommandations` « Je ne sais pas quoi faire » (bandeau orange sur l'accueil, au-dessus d'« Autour de moi »), questionnaire budget/temps/groupe/ambiances + position facultative, 5 suggestions avec leurs raisons. Moteur à règles dans `packages/shared/src/recommend.ts` (exclusion budget/durée/distance max selon le temps dispo, score ambiances/groupe/proximité/note, dédoublonnage des lieux au même endroit, élargissement automatique si aucune ambiance ne correspond). Hôtels exclus (reviendront avec « Créer sa sortie »). API `GET /api/recommandations` pour le mobile. Préférences gardées en localStorage (pas de compte)

- SEO (oct. 2026) : vraies pages `/categorie/<slug>` (titre, h1, intro, canonical propres ; anciennes `/?category=X` redirigées en 308), fil d'Ariane + BreadcrumbList, bloc « À proximité » (3 lieux voisins), meta descriptions générées (`packages/shared/src/meta.ts`, tournures variées), images de partage `next/og`, ISR 5 min partout (`revalidate = 300`, fiches en ISR à la demande) ; JSON-LD complet (pays ISO, ville/rue/département, téléphone, hasMap, sameAs, isAccessibleForFree, priceRange hôtels ; pas d'aggregateRating, notes tierces)
- Descriptions des 90 lieux réécrites à partir de recherches (UNESCO, sites officiels, presse) ; champ `alerte` (bandeau rouge en tête de fiche, lieu exclu des recommandations) : Pendjari, parc W et Malanville = zone formellement déconseillée (conseils aux voyageurs), Tanougou/Atacora/Kandi = proches de cette zone

- Pilier « Créer sa sortie » (oct. 2026, sur décision de l'utilisateur) : page `/creer-ma-sortie` (départ = position ou ville tirée des données, temps, budget ; groupe/ambiances repris des préférences de recommandation). Moteur `packages/shared/src/sortie.ts` : choix glouton des activités (score des recommandations − temps de trajet) dans le temps disponible, ordre le plus court, horaire indicatif, pause repas (temps réservé, placée au plus près de 12h45, jamais hors 11h-14h30), hôtel pour un séjour ; trajets estimés (vol d'oiseau × 1,3, à pied < 1,2 km sinon 30 km/h + 10 min). Étapes remplaçables/déplaçables/supprimables, itinéraire Google Maps multi-étapes (sans clé), partage par lien (état complet dans l'URL). Points d'entrée : bandeau accueil, CTA fiche (`?ancre=slug`), sous chaque recommandation. API `GET /api/sortie` pour le mobile
- Restaurants : catégorie `restaurant` prête (contrainte SQL, pages, JSON-LD `Restaurant`) mais **vide** — import OpenStreetMap (`data/scripts/import_osm_restaurants.py`) impossible depuis le cloud (overpass-api.de coupe les connexions des hébergeurs cloud, miroirs sans réponse) ; à lancer depuis un PC (réseau domestique), puis export + `generate_sql_update.py`. En attendant, la pause repas utilise les 8 lieux avec `restauration = true` (hôtels-restaurants, restaurant du Centre Songhaï ; colonne xlsx « Restauration sur place »), sinon une étape générique. Les catégories vides sont masquées (filtres, sitemap, page 404)

**Prochaine étape :** à décider avec l'utilisateur — restaurants réels (import OSM depuis un PC, ou Google Places), puis la billetterie (dernier pilier du MVP).

**Après chaque modification du contenu** : régénérer et coller `supabase/maj_contenu.sql` dans le SQL Editor de Supabase (voir Commandes), puis merger la branche sur `main`.

**En attente / bloqué :**
- Vraies photos + avis Google Places : nécessite une clé API Google Cloud (Places API), bloquée côté utilisateur sur l'activation de la facturation Google Cloud. Plan déjà défini une fois débloqué : résoudre un `place_id` par lieu, proxy serveur pour les photos (cache court, jamais stockées en permanence — CGU Google), Google Places prioritaire sur les données déjà enrichies par recherche web.

## Points de vigilance (infra)

- **Deux projets Vercel** (`gosee-web` et `gosee-web-gwtp`) pointent sur le même repo GitHub — `gosee-web-gwtp` est à supprimer (contenu dupliqué indexable, canonicals vers localhost car sans `NEXT_PUBLIC_SITE_URL`) ; suppression à faire par l'utilisateur dans le dashboard Vercel (pas d'accès Vercel depuis les sessions cloud).
- **Déploiements Vercel bloqués si l'auteur du commit n'est pas reconnu** : le plan Hobby exige que l'auteur git soit le compte GitHub lié au compte Vercel (`Emrik-GNANSSOUNOU`). La config git de ce repo est déjà réglée en conséquence (`git config user.name/user.email` au niveau du repo, pas globalement) — si une nouvelle machine/session clone le repo, refaire ce réglage avant de push, sinon le déploiement reste bloqué (`TEAM_ACCESS_REQUIRED`).
- **Supabase (plan gratuit)** se met en pause après une période d'inactivité prolongée. Depuis le passage en ISR (oct. 2026), les pages déjà générées restent servies pendant la pause (plus de 500), mais **un build lancé pendant la pause échoue** (accueil, catégories et `/recommandations` sont pré-générés au build) — le déploiement précédent reste alors en ligne. Se répare en rouvrant le dashboard Supabase et en cliquant "Restore project", puis en relançant le déploiement. Un build local/cloud sans accès réseau à Supabase échoue pour la même raison (vérifier avec `npx tsc --noEmit -p apps/web` + lint, ou un build avec données mockées).
- **Dépôt GitHub public** (pas privé) — à vérifier si c'est voulu.

## Règles pour Claude Code

- Respecter l'ordre strict du scope MVP ; ne pas anticiper un pilier V2 sans demande explicite
- Sur toute tâche touchant plus de 3 fichiers, proposer un plan et attendre validation avant de coder
- Ne jamais coder une fonctionnalité web sans considérer son équivalent mobile (même API, logique partagée)
- Toujours tester le rendu sur un viewport mobile réel (375px) avant de considérer une tâche terminée
- Ne pas introduire de nouvelle dépendance sans le signaler explicitement
- Utiliser les données réelles de `benin_contenu_curation.xlsx` plutôt que des exemples génériques dès que possible
- Ne rien coder en dur qui suppose un seul pays (le Bénin est le marché de départ, pas la limite)
- Éviter que Gosee devienne : un simple annuaire, un simple réseau social, un site touristique pur, une simple billetterie, ou une app saturée de fonctionnalités sans rapport avec les 6 piliers
- Ne pas présenter de contenu événementiel (agenda daté) : ce type de contenu est explicitement hors périmètre
