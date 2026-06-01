-- Migration : index unique INSENSIBLE À LA CASSE sur players.player_name
-- Stratégie B — préserver la casse d'affichage, comparer en insensible à la casse.
-- Corrige les doublons de leaderboard (ex. "Poussif" + "POUSSIF").
--
-- À exécuter dans le SQL Editor de Supabase, étape par étape, en LISANT chaque bloc.
-- ⚠️ Ne pas lancer l'étape 3 tant que l'étape 1 renvoie des lignes : la création de
--    l'index unique ÉCHOUERAIT s'il reste deux pseudos identiques à la casse près.

-- ── Étape 1 — DÉTECTER les collisions déjà présentes ────────────────────────────
-- Renvoie les groupes de pseudos qui ne diffèrent QUE par la casse
-- (typiquement "Poussif" + "POUSSIF" fabriqués par le bug).
-- Doit renvoyer 0 ligne AVANT de poser l'index à l'étape 3.
select lower(player_name) as canonical,
       count(*)           as n,
       array_agg(player_name) as variants
from players
group by lower(player_name)
having count(*) > 1;

-- ── Étape 2 — FUSIONNER manuellement chaque doublon trouvé ──────────────────────
-- Pour chaque groupe renvoyé ci-dessus :
--   • GARDER la ligne de référence : celle qui a un pin_hash (le propriétaire
--     historique) et/ou les stats les plus à jour.
--   • Reporter à la main toute donnée utile depuis la ligne en trop, PUIS la supprimer.
-- Exemple (À ADAPTER, ne jamais exécuter à l'aveugle) :
--   -- ligne orpheline en MAJUSCULES créée par le bug, sans pin_hash :
--   delete from players where player_name = 'POUSSIF';
-- Re-lancer l'étape 1 jusqu'à obtenir 0 ligne.

-- ── Étape 3 — POSER l'index unique insensible à la casse ────────────────────────
-- Désormais "Poussif", "poussif" et "POUSSIF" entrent en collision : une seule de
-- ces formes peut exister. C'est le VRAI garde-fou contre les doublons, au-delà du
-- code applicatif (il tient même face à une écriture concurrente ou directe).
create unique index if not exists players_player_name_lower_key
  on players (lower(player_name));

-- Note : la table `guestbook` n'est PAS concernée. Elle stocke déjà tout en
-- MAJUSCULES de façon cohérente avec elle-même, donc aucun doublon de casse à
-- corriger là. On la laisse telle quelle.
