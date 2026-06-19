// Client Supabase côté navigateur
// Analogie : un combiné téléphonique qui sait lire/écrire dans le sac à dos du navigateur (les cookies)
// À utiliser dans les composants "use client" uniquement

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
