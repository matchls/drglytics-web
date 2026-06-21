-- Rate limiting durable (#148)
-- Table stockant les compteurs par clé avec fenêtre glissante.

CREATE TABLE IF NOT EXISTS rate_limits (
  key       TEXT PRIMARY KEY,
  count     INTEGER NOT NULL DEFAULT 1,
  reset_at  TIMESTAMPTZ NOT NULL
);

-- Nettoyage automatique des entrées expirées (appelé manuellement ou via pg_cron)
CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM rate_limits WHERE reset_at < NOW();
$$;

-- Fonction RPC atomique : INSERT ou UPDATE en une seule opération PostgreSQL.
-- Retourne TRUE si la requête est autorisée, FALSE si la limite est dépassée.
--
-- Logique :
--   - Nouvelle clé ou fenêtre expirée → remet le compteur à 1 → autorisé
--   - Fenêtre active → incrémente le compteur → autorisé ssi count <= max
--
-- L'atomicité d'INSERT...ON CONFLICT empêche les race conditions entre instances.
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_key       TEXT,
  p_max       INTEGER,
  p_window_ms BIGINT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_now      TIMESTAMPTZ := NOW();
  v_reset_at TIMESTAMPTZ := v_now + (p_window_ms || ' milliseconds')::INTERVAL;
  v_count    INTEGER;
BEGIN
  INSERT INTO rate_limits (key, count, reset_at)
  VALUES (p_key, 1, v_reset_at)
  ON CONFLICT (key) DO UPDATE
    SET
      count    = CASE
                   WHEN rate_limits.reset_at < v_now THEN 1
                   ELSE rate_limits.count + 1
                 END,
      reset_at = CASE
                   WHEN rate_limits.reset_at < v_now THEN v_reset_at
                   ELSE rate_limits.reset_at
                 END
  RETURNING count INTO v_count;

  RETURN v_count <= p_max;
END;
$$;

-- Accès service role uniquement (la fonction est appelée via supabaseAdmin)
REVOKE ALL ON FUNCTION check_rate_limit(TEXT, INTEGER, BIGINT) FROM PUBLIC;
REVOKE ALL ON FUNCTION cleanup_rate_limits() FROM PUBLIC;
