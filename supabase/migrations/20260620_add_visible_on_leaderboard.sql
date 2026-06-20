-- Ajoute la colonne de visibilité leaderboard (issue #134).
-- Par défaut true : les joueurs existants restent visibles.
-- À exécuter dans le SQL Editor de Supabase.

ALTER TABLE players
  ADD COLUMN IF NOT EXISTS visible_on_leaderboard boolean NOT NULL DEFAULT true;
