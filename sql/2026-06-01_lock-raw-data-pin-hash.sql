-- Migration : retirer raw_data et pin_hash de la portée de la clé anon (#31, A)
--
-- Problème : la clé anon pouvait faire `select raw_data` (et pin_hash) sur la
-- table players → moisson en masse du JSON intégral de tous les joueurs, et
-- récupération des hashs de PIN (crackables hors-ligne pour 4 chiffres).
--
-- RLS est ROW-level : il ne sait pas cacher une colonne. On agit donc sur les
-- GRANTs de colonnes. Un `revoke select (col)` seul serait ignoré tant qu'un
-- `select` sur TOUTE la table existe → on révoque tout, puis on re-grant
-- uniquement les colonnes sûres.
--
-- service_role (supabaseAdmin côté serveur) IGNORE ces grants : les lectures
-- serveur (getPlayerProfile, findPlayerByName) continuent de voir raw_data/pin_hash.
--
-- À exécuter dans le SQL Editor de Supabase.

-- ── Étape 1 — RÉVOQUER le select large de l'anon (et authenticated) ──────────────
revoke select on public.players from anon, authenticated;

-- ── Étape 2 — RE-GRANTER toutes les colonnes SAUF raw_data et pin_hash ───────────
-- Bloc dynamique : on lit la liste réelle des colonnes pour ne pas en oublier
-- une (et rester correct si la table évolue). Le leaderboard et l'Abyss Bar,
-- qui ne lisent que des colonnes de stats, continuent de fonctionner.
do $$
declare
  cols text;
begin
  select string_agg(quote_ident(column_name), ', ')
    into cols
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'players'
    and column_name not in ('raw_data', 'pin_hash');

  execute format(
    'grant select (%s) on public.players to anon, authenticated',
    cols
  );
end $$;

-- ── Vérification (optionnel) — la clé anon ne doit PLUS voir raw_data ────────────
-- Depuis un client anon : `select raw_data from players limit 1;` doit échouer
-- (permission denied for column raw_data). `select player_name from players`
-- doit toujours marcher.
