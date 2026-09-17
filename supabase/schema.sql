-- Gosee — schéma initial (pilier 1-2 "Découvrir")
-- À exécuter dans le SQL Editor du dashboard Supabase.

create extension if not exists "pgcrypto";

create table if not exists lieux (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  slug text,
  category text not null check (category in
    ('site_touristique','loisir','hotel','activite','evenement')),
  description text,
  department text,
  country text not null default 'Bénin',
  address text,
  lat double precision,
  lng double precision,
  google_maps_url text,
  horaires text,
  contact text,
  website text,
  rating numeric(2,1),
  reviews_count integer,
  photos text[],
  price_info jsonb,
  verified boolean not null default false,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Si la table existait déjà avant l'ajout du slug (pilier 1, révision SEO) :
alter table lieux add column if not exists slug text;

-- Enrichissement horaires/contact/note (recherche web, sept. 2026) :
-- horaires passe de jsonb (jamais peuplé) à text (chaînes lisibles type
-- "Lun-Ven 8h30-18h30"), plus simple pour de la donnée en grande partie
-- absente ou hétérogène plutôt qu'une vraie structure par jour.
alter table lieux alter column horaires type text using horaires::text;
alter table lieux add column if not exists website text;
alter table lieux add column if not exists rating numeric(2,1);
alter table lieux add column if not exists reviews_count integer;

create index if not exists lieux_category_idx on lieux(category);
create index if not exists lieux_department_idx on lieux(department);
create unique index if not exists lieux_slug_idx on lieux(slug);

alter table lieux enable row level security;

drop policy if exists "lieux publics en lecture" on lieux;
create policy "lieux publics en lecture" on lieux
  for select using (true);
