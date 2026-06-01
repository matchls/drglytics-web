/** @type {import('next').NextConfig} */

// En-têtes de sécurité (#32). Ils disent au navigateur comment se comporter
// défensivement vis-à-vis de notre site. Tout est appliqué à TOUTES les routes.

const isDev = process.env.NODE_ENV !== "production";

// On dérive les origines externes autorisées depuis les variables d'env, pour
// que la CSP reste juste en dev (localhost) comme en prod (Vercel/Supabase réels).
// (On ne garde que l'origine — scheme + host + port — pas le chemin.)
function originOf(url) {
  try {
    return url ? new URL(url).origin : "";
  } catch {
    return "";
  }
}
const supabaseOrigin = originOf(process.env.NEXT_PUBLIC_SUPABASE_URL);
const apiOrigin = originOf(process.env.NEXT_PUBLIC_API_URL);

// ── Content-Security-Policy ─────────────────────────────────────────────────
// La CSP est une liste blanche : elle dit "le navigateur ne peut charger des
// ressources QUE depuis ces sources". C'est la défense la plus forte contre le
// XSS (un script injecté depuis un domaine non listé est bloqué).
const csp = [
  // Par défaut, tout doit venir de notre propre origine.
  `default-src 'self'`,
  // Scripts : Next injecte des scripts inline (données d'hydratation) → on doit
  // tolérer 'unsafe-inline'. En dev, le rechargement à chaud utilise eval().
  // ⚠️ Point faible connu : 'unsafe-inline' affaiblit la protection XSS sur les
  //    scripts. L'étape suivante serait de passer aux nonces (middleware Next).
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  // Styles : Tailwind/Next injectent du CSS inline ; Google Fonts sert la
  // feuille de style Material Symbols.
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  // Fontes : les fichiers de police Material Symbols viennent de gstatic.
  `font-src 'self' https://fonts.gstatic.com`,
  // Images : nos icônes locales + data:/blob: (images encodées en ligne).
  `img-src 'self' data: blob:`,
  // Connexions XHR/fetch/websocket : Supabase, le backend, et ws: pour le HMR en dev.
  `connect-src 'self' ${supabaseOrigin} ${apiOrigin}${isDev ? " ws:" : ""}`.trim(),
  // Personne ne peut nous embarquer dans une iframe (anti-clickjacking).
  `frame-ancestors 'none'`,
  // Empêche d'injecter une <base> qui détournerait les URLs relatives.
  `base-uri 'self'`,
  // Les formulaires ne peuvent poster que vers nous.
  `form-action 'self'`,
  // Pas de plugins (Flash/applets) — surface d'attaque morte.
  `object-src 'none'`,
]
  .join("; ")
  .replace(/\s+/g, " "); // compacte les espaces dus aux origines vides

const securityHeaders = [
  // Force HTTPS pendant 2 ans, sous-domaines inclus (ignoré en HTTP local).
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Redondant avec frame-ancestors, mais couvre les vieux navigateurs.
  { key: "X-Frame-Options", value: "DENY" },
  // Interdit au navigateur de "deviner" le type MIME (anti sniffing).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Ne fuite pas l'URL complète en référent vers d'autres sites.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // On n'utilise ni caméra, ni micro, ni géoloc → on les coupe explicitement.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
