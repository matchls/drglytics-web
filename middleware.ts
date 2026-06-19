// Middleware Next.js — rafraîchit la session Supabase à chaque requête
// Sans ça, un token expiré ferait voir l'utilisateur comme déconnecté côté serveur

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // On construit la réponse ici pour pouvoir y écrire des cookies plus bas
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Écrire les cookies à la fois dans la requête et dans la réponse
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT : ne pas supprimer cet appel — il rafraîchit le token de session
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Toutes les routes sauf les assets statiques
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
