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

## Les 7 piliers fonctionnels

Toute fonctionnalité doit se rattacher à l'un de ces piliers ; sinon, la remettre en question.

1. **Découvrir** — activités, lieux, restaurants, loisirs, sites touristiques, événements
2. **Voir ce qui se passe maintenant** — aujourd'hui, ce soir, ce week-end, cette semaine, tendances, nouveautés
3. **Découverte géolocalisée** — « que puis-je faire autour de moi ? » (distance, horaires, prix, itinéraire)
4. **Recommandations personnalisées** — budget, localisation, temps disponible, nombre de personnes, préférences
5. **Créer sa sortie** — combiner activité → restaurant → événement → itinéraire
6. **Information toujours actualisée** — fraîcheur des données, gestion des annulations/reports/promotions
7. **Réservation et billetterie** — achat de billets, réservation, paiement (Mobile Money, carte), historique

## Scope MVP — ordre strict validé

Ne pas développer un pilier suivant avant que le précédent soit fonctionnel, sauf validation explicite.

1. **Découvrir** — le socle : lister/afficher lieux, activités, restaurants, événements, avec filtres par catégorie et fiche détaillée
2. **Découverte géolocalisée** — « autour de moi » avec rayon de distance ajustable et itinéraire
3. **Voir ce qui se passe maintenant** — agenda aujourd'hui / ce week-end / cette semaine, nouveautés/tendances
4. **Billetterie / réservation** — ajoutée en dernier dans le MVP, une fois 1 à 3 fonctionnels

**Hors MVP (V2)** : recommandations personnalisées (moteur de logique plus poussé), créer sa sortie (dépend des recommandations), information toujours actualisée en tant que système d'admin/alertes construit progressivement.

## Modèle de données

### Socle (piliers 1 à 3)

- **Lieu** : nom, type (hôtel/resto/loisir/site touristique...), adresse, coordonnées GPS, description, photos, horaires, contact
- **Événement** : titre, description, date/heure début-fin, lieu associé, catégorie, prix, statut (prévu/annulé/reporté)
- **Activité** : à fusionner avec Lieu ou à distinguer selon les cas (ex. visite guidée sans lieu fixe) — décision à trancher au moment de l'implémentation
- **Catégorie / Tag** : pour classer et filtrer (tourisme, plage, culture, business...)
- **Utilisateur** : profil, localisation, préférences

### Billetterie (pilier 7, fin de MVP)

- **Billet** : type (standard/VIP...), prix, quantité disponible, événement associé
- **Réservation** : utilisateur, billet(s), quantité, statut (en attente/confirmée/annulée), date de réservation
- **Paiement** : montant, méthode (Mobile Money/carte), statut, référence transaction, réservation associée

Chaque activité/événement doit pouvoir porter, à terme : nom, catégorie, description, photos, localisation, GPS, horaires, prix, disponibilité, contact, lien de réservation, dates de début/fin, organisateur, statut, date de dernière mise à jour.

## Spécifications fonctionnelles (user stories du MVP)

### 1. Découvrir
- En tant qu'utilisateur, je veux voir une liste de lieux/activités/événements, afin d'explorer ce qui existe au Bénin
- En tant qu'utilisateur, je veux filtrer par catégorie (resto, loisir, tourisme...), afin de trouver ce qui m'intéresse
- En tant qu'utilisateur, je veux voir la fiche détaillée d'un lieu/événement (photos, horaires, prix, avis), afin de décider si ça me convient

### 2. Découverte géolocalisée
- En tant qu'utilisateur, je veux voir les lieux/événements autour de ma position, afin de trouver une sortie proche
- En tant qu'utilisateur, je veux ajuster un rayon de distance, afin d'affiner ma recherche et réduire mon temps de déplacement
- En tant qu'utilisateur, je veux obtenir un itinéraire vers un lieu, afin de m'y rendre facilement

### 3. Voir ce qui se passe maintenant
- En tant qu'utilisateur, je veux voir les événements du jour/du week-end/de la semaine, afin de ne rien manquer
- En tant qu'utilisateur, je veux voir les événements récemment ajoutés ou tendances, afin de découvrir des nouveautés
- En tant qu'utilisateur de passage temporaire, je veux voir les événements qui se dérouleront pendant mon séjour

## Données de contenu déjà disponibles

Un premier jeu de données réelles et vérifiées existe dans le projet (`benin_contenu_curation.xlsx`) :
- **60 lieux incontournables** répartis par département (Littoral, Atlantique, Ouémé, Plateau, Zou, Collines, Mono, Couffo, Atacora, Donga, Borgou, Alibori), avec nom, type, description, localisation, coordonnées GPS et lien Google Maps, vérifiés via Google Places
- **Hôtels, activités et événements** associés par département

À utiliser comme données de seed (mock puis premier import réel) pour les tables Lieu / Événement dès le développement du pilier « Découvrir » — préférer ce jeu de données réel à des mocks génériques.

## Conventions (à compléter au fil du projet)

- Structure de dossiers : [à définir — ex. monorepo avec `apps/web`, `apps/mobile`, `packages/shared` pour la logique métier et le client API partagés]
- Nommage des composants : [à définir]
- Commits : [conventional commits recommandé — à confirmer]

## Commandes

- Dev web : `npm run dev`
- Build : `npm run build`
- Lint : `npm run lint`
- Tests : [à définir]

## Règles pour Claude Code

- Respecter l'ordre strict du scope MVP ; ne pas anticiper un pilier V2 sans demande explicite
- Sur toute tâche touchant plus de 3 fichiers, proposer un plan et attendre validation avant de coder
- Ne jamais coder une fonctionnalité web sans considérer son équivalent mobile (même API, logique partagée)
- Toujours tester le rendu sur un viewport mobile réel (375px) avant de considérer une tâche terminée
- Ne pas introduire de nouvelle dépendance sans le signaler explicitement
- Utiliser les données réelles de `benin_contenu_curation.xlsx` plutôt que des exemples génériques dès que possible
- Ne rien coder en dur qui suppose un seul pays (le Bénin est le marché de départ, pas la limite)
- Éviter que Gosee devienne : un simple annuaire, un simple réseau social, un site touristique pur, une simple billetterie, ou une app saturée de fonctionnalités sans rapport avec les 7 piliers
