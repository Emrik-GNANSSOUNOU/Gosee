-- Gosee — schéma initial (pilier 1-2 "Découvrir")
-- À exécuter dans le SQL Editor du dashboard Supabase.

create extension if not exists "pgcrypto";

create table if not exists lieux (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  category text not null check (category in
    ('site_touristique','loisir','hotel','activite','evenement')),
  description text,
  department text,
  country text not null default 'Bénin',
  address text,
  lat double precision,
  lng double precision,
  google_maps_url text,
  horaires jsonb,
  contact text,
  photos text[],
  price_info jsonb,
  verified boolean not null default false,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lieux_category_idx on lieux(category);
create index if not exists lieux_department_idx on lieux(department);

alter table lieux enable row level security;

drop policy if exists "lieux publics en lecture" on lieux;
create policy "lieux publics en lecture" on lieux
  for select using (true);
