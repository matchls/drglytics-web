-- Migration : lier un joueur à un compte Supabase Auth (#128)
--
-- On ajoute user_id pour préparer la migration du système PIN vers l'authentification.
-- Un joueur peut ne pas encore avoir de compte (user_id = NULL) — les anciens joueurs
-- protégés par PIN continuent de fonctionner sans changement.
--
-- À exécuter dans le SQL Editor de Supabase.

-- ── Étape 1 — Ajouter la colonne user_id ────────────────────────────────────────────
-- Nullable : les joueurs existants n'ont pas encore de compte.
-- ON DELETE SET NULL : si le compte Supabase est supprimé, le joueur reste en base
-- (ses stats sont préservées) mais perd son lien — il redevient "non réclamé".
ALTER TABLE public.players
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- ── Étape 2 — Contrainte UNIQUE sur user_id ─────────────────────────────────────────
-- Un compte Supabase = un joueur. Plusieurs NULL sont autorisés (joueurs non réclamés),
-- donc les anciens joueurs sans compte ne rentrent pas en conflit entre eux.
ALTER TABLE public.players
ADD CONSTRAINT players_user_id_unique UNIQUE (user_id);

-- ── Étape 3 — Index de performance ──────────────────────────────────────────────────
-- Les lookups "quel joueur appartient à cet utilisateur ?" seront fréquents.
CREATE INDEX players_user_id_idx ON public.players(user_id);

-- ── Étape 4 — Exclure user_id de la portée de la clé anon ───────────────────────────
-- La migration 2026-06-01_lock-raw-data-pin-hash.sql avait re-granté toutes les
-- colonnes SAUF raw_data et pin_hash à anon. user_id vient d'être ajouté, donc il
-- est maintenant visible par anon — on le retire.
-- On révoque et on re-grante en excluant raw_data, pin_hash ET user_id.
REVOKE SELECT ON public.players FROM anon, authenticated;

DO $$
DECLARE
  cols_anon text;
  cols_auth text;
BEGIN
  -- anon : toutes les colonnes sauf raw_data, pin_hash, user_id
  SELECT string_agg(quote_ident(column_name), ', ')
    INTO cols_anon
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'players'
    AND column_name NOT IN ('raw_data', 'pin_hash', 'user_id');

  -- authenticated : toutes les colonnes sauf raw_data et pin_hash
  -- (user_id est visible pour les utilisateurs connectés — utile pour le flow "claim")
  SELECT string_agg(quote_ident(column_name), ', ')
    INTO cols_auth
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'players'
    AND column_name NOT IN ('raw_data', 'pin_hash');

  EXECUTE format('GRANT SELECT (%s) ON public.players TO anon', cols_anon);
  EXECUTE format('GRANT SELECT (%s) ON public.players TO authenticated', cols_auth);
END $$;

-- ── Vérification ────────────────────────────────────────────────────────────────────
-- Depuis un client anon : `select user_id from players limit 1;` doit échouer.
-- Depuis un client authenticated : doit réussir.
-- `select player_name from players` doit toujours marcher pour les deux.
