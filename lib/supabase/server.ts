// Client Supabase côté serveur (Server Components, Server Actions, Route Handlers)
// Analogie : un combiné téléphonique qui lit les cookies depuis l'en-tête de la requête HTTP
// — pas de "use client" ici, ce fichier ne tourne jamais dans le navigateur

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            // setAll peut échouer dans un Server Component (lecture seule)
            // c'est normal — les Server Actions et Route Handlers peuvent écrire
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ignoré volontairement dans les Server Components
          }
        },
      },
    }
  );
}
