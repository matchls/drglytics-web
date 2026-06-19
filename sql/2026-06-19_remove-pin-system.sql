-- Migration : suppression complète du système PIN (#128)
--
-- On passe à l'authentification Supabase Auth. Le PIN n'est plus utilisé :
-- les écritures sont désormais autorisées par session (auth.uid()).
-- Tous les joueurs existants re-uploadent leur save via leur nouveau compte.
--
-- ATTENTION : cette migration supprime toutes les données de players et guestbook.
-- À exécuter UNE SEULE FOIS, après avoir prévenu les joueurs.
--
-- À exécuter dans le SQL Editor de Supabase.

-- ── Étape 1 — VIDER les données (départ propre) ─────────────────────────────────────
-- Les joueurs vont re-uploader leur save via leur compte Supabase.
-- Le livre d'or repart de zéro également (les anciens messages référencent des
-- player_name qui n'auront plus forcément la même casse ou le même player_name).
TRUNCATE TABLE public.guestbook;
TRUNCATE TABLE public.players;

-- ── Étape 2 — SUPPRIMER la colonne pin_hash de players ──────────────────────────────
-- La contrainte de colonne dans le GRANT (2026-06-01_lock-raw-data-pin-hash.sql)
-- disparaît automatiquement avec la colonne.
ALTER TABLE public.players DROP COLUMN IF EXISTS pin_hash;

-- ── Étape 3 — SUPPRIMER la table pin_attempts ───────────────────────────────────────
-- Cette table servait à l'anti-brute-force du PIN. Elle n'a plus de raison d'être.
DROP TABLE IF EXISTS public.pin_attempts;

-- ── Vérification ────────────────────────────────────────────────────────────────────
-- `select column_name from information_schema.columns where table_name = 'players';`
-- → pin_hash ne doit plus apparaître.
-- `select count(*) from players;` → doit renvoyer 0.
-- `select count(*) from guestbook;` → doit renvoyer 0.
