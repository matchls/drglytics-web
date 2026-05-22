# DRG Dashboard — Frontend CLAUDE.md

## Contexte du projet

Frontend Next.js du dashboard DRG. Affiche les stats d'un joueur Deep Rock Galactic parsées depuis son fichier de sauvegarde, et un leaderboard public.

**Développeur :** Mat — développeur fullstack débutant. Ce projet est un exercice d'apprentissage.

**Dépôt backend :** `drg_dashboard_backend` (Python Flask) — dépôt séparé, tourne sur un autre serveur.

**Approche pédagogique :**
- Préférer les analogies pour expliquer les concepts
- Expliquer le "pourquoi" avant le "comment"
- Ne pas écrire de grosses quantités de code d'un coup — une étape à la fois
- Code lisible avant tout : noms descriptifs en anglais, commentaires en français si utile
- Petits pas : proposer et expliquer avant de coder

---

## Stack technique

- **Framework :** Next.js 14 (App Router)
- **Langage :** TypeScript
- **Styling :** Tailwind CSS — couleurs DRG définies dans `tailwind.config.ts`
- **Base de données :** Supabase (PostgreSQL) via `@supabase/supabase-js`
- **Déploiement cible :** Vercel

---

## Flux de données

```
1. Joueur uploade son .sav + entre son pseudo sur /
2. UploadForm.tsx → lib/api.ts → POST /api/parse (backend Flask)
3. Backend renvoie un JSON de stats
4. dashboard/page.tsx sauvegarde dans Supabase (table players) via lib/supabase.ts
5. /dashboard affiche les stats de la session (sessionStorage)
6. /leaderboard lit Supabase et affiche le classement trié
```

---

## Structure du projet

```
app/
├── page.tsx                ← upload du .sav + champ pseudo
├── dashboard/
│   └── page.tsx            ← dashboard joueur (lit sessionStorage + sauvegarde Supabase)
└── leaderboard/
    └── page.tsx            ← classement public (lit Supabase, triable par colonne)

components/
├── UploadForm.tsx          ← formulaire upload, barre de progression, tips DRG
├── ClassCard.tsx           ← card stats d'une classe (missions, kills, temps, distance, downs)
├── HeroStats.tsx           ← stats globales en hexagones (style DRG)
├── MissionStats.tsx        ← stats de mission filtrées par catégorie (onglets)
├── NavBar.tsx              ← navigation Upload / Profil / Leaderboard
└── OverclockList.tsx       ← liste des overclocks forgés avec icônes d'armes

lib/
├── api.ts                  ← appel POST /api/parse vers le backend
├── supabase.ts             ← client Supabase partagé (instancié une seule fois)
├── types.ts                ← types TypeScript partagés (DashboardData, ClassSummary, etc.)
└── weaponIcons.ts          ← mapping nom d'arme → chemin de l'icône

public/
└── icons/
    ├── weapons/            ← icônes des armes (PNG, scrappées du wiki DRG)
    └── manifest.json       ← index de tous les assets disponibles
```

---

## Thème et couleurs

Le thème est **sombre, palette brune chaude** inspirée de Deep Rock Galactic.

Défini dans `tailwind.config.ts` :

```
drg-dark    : #110b06   ← fond principal
drg-panel   : #1e1208   ← fond des cards/panels
drg-border  : #3d2a0f   ← bordures
drg-orange  : #e8a320   ← accent principal (titres, boutons actifs, highlights)
drg-orange-light : #f5b942
```

Couleurs des classes :
```
Driller  : #e6c020  (jaune)
Gunner   : #d44a4a  (rouge)
Engineer : #5cba5c  (vert)
Scout    : #4a8fd4  (bleu)
```

⚠️ Les icônes de perks sont **blanches sur fond transparent** — le fond doit rester sombre.

---

## Règles de code

- **Types TypeScript :** toujours typer les props et les retours de fonction
- **Composants :** un composant = un fichier, nommé en PascalCase
- **Commentaires :** en français si ça aide à comprendre, sinon en anglais
- **Pas de code magique :** ajouter un commentaire si ce n'est pas évident
- **Noms de variables :** anglais, descriptifs (`playerStats` pas `ps`)

---

## Variables d'environnement

Fichier `.env.local` (non commité) :
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_API_URL=http://localhost:5000   ← backend Flask en local
```

---

## Commandes

```bash
npm run dev      # dev local sur http://localhost:3000
npm run build    # build de production
npm run lint     # vérification TypeScript/ESLint
```

---

## État actuel (mai 2026)

### Ce qui fonctionne ✅

- Upload `.sav` → appel backend → affichage dashboard
- Sauvegarde Supabase après upload (upsert sur `player_name`)
- `/dashboard` : hero stats, cards par classe, overclocks avec icônes d'armes, mission stats par catégorie
- `/leaderboard` : tableau triable (temps, missions, kills, distance, downs)
- Navbar avec page active en orange
- Police Barlow Condensed
- Unités distance (km) et temps (h min) dans Mission Stats

### Ce qui reste à faire 🔜

**Design (priorité actuelle)**
- Coins biseautés (`clip-path`) sur les cards de classe et overclocks — style hexagonal DRG
- Séparateurs horizontaux oranges entre les sections
- Cohérence des majuscules sur tous les labels

**Dashboard — fonctionnalités**
- Réordonner : Mission Stats avant Overclocks
- Camembert par stat de classe (clic sur une stat → camembert coloré par classe avec Recharts)
- Filtre par classe dans la section Overclocks (boutons Driller / Gunner / Engineer / Scout)
- Nombre d'overclocks forgés par classe dans le header de la section

**Assets**
- Icônes de minerais dans les stats Mining
- Icônes de missions/assignments dans les onglets Mission Stats

**Déploiement**
- Déployer sur Vercel
- Configurer les variables d'environnement Vercel (Supabase + URL backend Railway)
