// supabaseServer.ts — Client Supabase CÔTÉ SERVEUR (clé service_role)
//
// Analogie : si lib/supabase.ts est le téléphone posé dans le hall d'accueil
// (tout le monde peut s'en servir, accès limité), celui-ci est la ligne directe
// dans le bureau du directeur — il peut tout faire, et il ne doit JAMAIS sortir
// de la pièce serveur.
//
// "server-only" est un garde du corps : si jamais ce fichier était importé
// depuis un composant navigateur, le BUILD échouerait immédiatement.
// C'est notre filet de sécurité contre la fuite de la clé service_role.
import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// La clé service_role ignore les RLS — réservée aux écritures vérifiées côté serveur.
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  // Pas de session utilisateur ici : ce client agit en tant que "service", pas en tant que personne.
  auth: { persistSession: false, autoRefreshToken: false },
});
