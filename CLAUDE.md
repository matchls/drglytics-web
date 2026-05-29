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
├── player/
│   └── [name]/
│       └── page.tsx        ← profil public d'un joueur (lit raw_data depuis Supabase)
└── leaderboard/
    └── page.tsx            ← classement public (lit Supabase, triable par colonne)

components/
├── UploadForm.tsx          ← formulaire upload, barre de progression, tips DRG
├── ClassCard.tsx           ← card stats d'une classe (missions, kills, temps, distance, downs)
├── ClassPieChart.tsx       ← camembert Recharts par classe (affiché au clic sur HeroStats)
├── HeroStats.tsx           ← stats globales en hexagones (style DRG)
├── MissionStats.tsx        ← stats de mission filtrées par catégorie (onglets)
├── NavBar.tsx              ← navigation Upload / Profil / Leaderboard
└── OverclockList.tsx       ← liste des overclocks forgés avec icônes d'armes

lib/
├── api.ts                  ← appel POST /api/parse vers le backend
├── i18n.ts                 ← hook useTranslation() + dictionnaire FR/EN
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
Gunner   : #5cba5c  (vert)
Engineer : #d44a4a  (rouge)
Scout    : #4a8fd4  (bleu)
```

⚠️ Les icônes de perks sont **blanches sur fond transparent** — le fond doit rester sombre.

---

## i18n

- Hook : `const t = useTranslation()` dans les composants React
- Les fonctions **hors composant** ne peuvent pas appeler un hook — passer `t` en paramètre : `function fn(x, t: (key: TranslationKey) => string)`
- Nouvelles clés à ajouter dans les deux blocs `en` et `fr` de `lib/i18n.ts`
- Les unités (KM, MI) et noms propres DRG ne se traduisent pas
- Réutiliser les clés existantes plutôt qu'en créer des doublons (`catMissions`, `catKills`, `downs`, etc.)

---

## Recharts (ClassPieChart)

- N'accepte pas les classes Tailwind — utiliser les valeurs hex directement pour les styles inline
- Supprimer la bordure blanche entre segments : prop `stroke="none"` sur `<Pie>`
- Styler le tooltip : props `contentStyle` et `itemStyle` sur `<Tooltip>` (fond `#1e1208`, bordure `#3d2a0f`, texte `#e8a320`)

---

## Table Supabase `players` — colonnes disponibles

Stats globales : `total_missions`, `total_kills`, `total_time_s`, `total_distance_cm`, `total_downs`, `total_minerals`, `perk_points`
Par classe (préfixe `driller_` / `gunner_` / `engineer_` / `scout_`) : `_missions`, `_kills`, `_time_s`, `_distance_cm`, `_downs`
Overclocks : `forged_overclocks`, `unforged_overclocks`
Abyss Bar : `bartender_tips`, `beers_consumed`, `rounds_ordered`
JSON complet : `raw_data` (type `DashboardData`)

⚠️ Ne jamais faire `.select("*")` sur cette table — `raw_data` est lourd. Toujours sélectionner les colonnes utiles.

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
- Sauvegarde Supabase après upload (upsert sur `player_name`, toutes les stats par classe)
- `/dashboard` : hero stats cliquables, camembert par classe (Recharts), cards par classe, overclocks filtrables par classe, mission stats par catégorie
- `/leaderboard` : tableau triable par colonne (▲/▼), colonne classe favorite colorée, lignes cliquables → profil joueur
- `/player/[name]` : page profil publique chargée depuis `raw_data` Supabase
- Leaderboard : Company Quota (top 5 proportionnel) et Bounty Targets (agrégats communautaires) avec vraies données
- i18n FR/EN sur tous les labels (leaderboard, HeroStats, dashboard)
- Navbar avec page active en orange
- Unités distance (km/mi) et temps (h/d+h) selon préférences

### Ce qui reste à faire 🔜

**Design**
- Coins biseautés (`clip-path`) sur les cards de classe et overclocks — style hexagonal DRG
- Séparateurs horizontaux oranges entre les sections
- Cohérence des majuscules sur tous les labels

**Dashboard — fonctionnalités**
- Nombre d'overclocks forgés par classe dans le header de la section OverclockList

**Assets**
- Icônes de minerais dans les stats Mining
- Icônes de missions/assignments dans les onglets Mission Stats

**Déploiement**
- Déployer sur Vercel
- Configurer les variables d'environnement Vercel (Supabase + URL backend Railway)
