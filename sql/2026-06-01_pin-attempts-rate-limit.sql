-- Migration : table pin_attempts — anti-brute-force du PIN (#30)
--
-- Le PIN est l'UNIQUE facteur d'authentification du projet. Sa vérification
-- (verifyPIN) n'imposait aucune limite : 10 000 combinaisons (4 chiffres)
-- restaient atteignables. Cette table fournit un compteur d'échecs DURABLE et
-- PARTAGÉ entre toutes les instances serverless (contrairement au limiteur en
-- mémoire de lib/rateLimit.ts, qui ne survit pas à une instance froide sur Vercel).
--
-- À exécuter dans le SQL Editor de Supabase, en LISANT chaque bloc.

-- ── Étape 1 — CRÉER la table ────────────────────────────────────────────────────
-- Une ligne par couple (joueur, IP). Le verrou est porté par locked_until :
-- tant que cet instant est dans le futur, toute tentative est refusée AVANT bcrypt.
create table if not exists pin_attempts (
  player_name     text        not null,            -- normalisé en MAJUSCULES (identité)
  ip              text        not null,            -- 1er IP de x-forwarded-for
  failed_count    int         not null default 0,  -- échecs dans la fenêtre courante
  first_failed_at timestamptz not null default now(), -- début de la fenêtre glissante
  locked_until    timestamptz,                     -- null = pas verrouillé
  updated_at      timestamptz not null default now(),
  primary key (player_name, ip)
);

-- ── Étape 2 — VERROUILLER l'accès anon (RLS) ─────────────────────────────────────
-- On active RLS SANS définir la moindre policy : par défaut, plus personne ne
-- peut lire/écrire cette table... sauf la clé service_role (supabaseAdmin), qui
-- IGNORE les RLS. C'est exactement ce qu'on veut : seul le serveur y touche.
-- Aucun client navigateur (clé anon) ne doit voir ni manipuler ces compteurs.
alter table pin_attempts enable row level security;
