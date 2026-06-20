-- Migration : table player_snapshots
-- Stocke un snapshot de stats à chaque upload réussi d'un utilisateur connecté.
-- Permet de calculer les deltas entre deux uploads (progression).
--
-- ⚠️ À exécuter dans l'éditeur SQL Supabase AVANT de merger la PR correspondante.

CREATE TABLE IF NOT EXISTS player_snapshots (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_name      TEXT        NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Stats globales
  total_missions   INT         NOT NULL DEFAULT 0,
  total_kills      INT         NOT NULL DEFAULT 0,
  total_time_s     BIGINT      NOT NULL DEFAULT 0,
  total_distance_cm BIGINT     NOT NULL DEFAULT 0,
  total_downs      INT         NOT NULL DEFAULT 0,

  -- Missions par classe
  driller_missions  INT        NOT NULL DEFAULT 0,
  gunner_missions   INT        NOT NULL DEFAULT 0,
  engineer_missions INT        NOT NULL DEFAULT 0,
  scout_missions    INT        NOT NULL DEFAULT 0,

  -- Overclocks
  forged_overclocks INT        NOT NULL DEFAULT 0
);

-- Index pour les requêtes "last 2 snapshots by user" — O(1) grâce au tri en index
CREATE INDEX IF NOT EXISTS idx_player_snapshots_user_created
  ON player_snapshots (user_id, created_at DESC);
