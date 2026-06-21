# Graph Report - .  (2026-06-21)

## Corpus Check
- 293 files · ~445,655 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 416 nodes · 916 edges · 28 communities (19 shown, 9 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 39 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Class Stats Cards|Class Stats Cards]]
- [[_COMMUNITY_Profile Claim & Auth|Profile Claim & Auth]]
- [[_COMMUNITY_Monthly Leaderboard & Community Stats|Monthly Leaderboard & Community Stats]]
- [[_COMMUNITY_Player Profile & Comparison|Player Profile & Comparison]]
- [[_COMMUNITY_Package Dependencies|Package Dependencies]]
- [[_COMMUNITY_Upload Flow & Abyss Bar|Upload Flow & Abyss Bar]]
- [[_COMMUNITY_Badge Components|Badge Components]]
- [[_COMMUNITY_Project Architecture (Docs)|Project Architecture (Docs)]]
- [[_COMMUNITY_i18n Translations|i18n Translations]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Progress Delta Feature|Progress Delta Feature]]
- [[_COMMUNITY_Asset Manifest|Asset Manifest]]
- [[_COMMUNITY_Next.js Config & Security|Next.js Config & Security]]
- [[_COMMUNITY_Charts & Theme|Charts & Theme]]
- [[_COMMUNITY_Guestbook & Supabase Client|Guestbook & Supabase Client]]
- [[_COMMUNITY_Auth Middleware|Auth Middleware]]
- [[_COMMUNITY_i18n Hook Rules|i18n Hook Rules]]
- [[_COMMUNITY_Weapon Icons & Overclocks|Weapon Icons & Overclocks]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_Tailwind Config|Tailwind Config]]
- [[_COMMUNITY_ClassCard Doc Ref|ClassCard Doc Ref]]
- [[_COMMUNITY_MissionStats Doc Ref|MissionStats Doc Ref]]
- [[_COMMUNITY_NavBar Doc Ref|NavBar Doc Ref]]

## God Nodes (most connected - your core abstractions)
1. `useTranslation()` - 56 edges
2. `t()` - 32 edges
3. `DashboardData` - 28 edges
4. `usePrefs()` - 25 edges
5. `TranslationKey` - 19 edges
6. `createClient()` - 19 edges
7. `compilerOptions` - 16 edges
8. `formatTime()` - 10 edges
9. `PlayerRow` - 9 edges
10. `formatDistance()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `BountyTargets()` --calls--> `t()`  [INFERRED]
  components/leaderboard/BountyTargets.tsx → lib/__tests__/leaderboard.test.ts
- `OptionsPage()` --calls--> `t()`  [INFERRED]
  app/options/page.tsx → lib/__tests__/leaderboard.test.ts
- `Props` --references--> `DashboardData`  [EXTRACTED]
  components/AbyssBarBadges.tsx → lib/types.ts
- `AbyssBarBadges()` --calls--> `t()`  [INFERRED]
  components/AbyssBarBadges.tsx → lib/__tests__/leaderboard.test.ts
- `HonorEntry` --references--> `TranslationKey`  [EXTRACTED]
  components/AbyssBarHonorRoll.tsx → lib/i18n/index.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Upload → Parse → Save to Supabase Flow** — claude_uploadform, claude_lib_api, claude_flask_backend, claude_dashboard_page, claude_lib_supabase [EXTRACTED 1.00]
- **CI Quality Gates (Typecheck, Lint, Test, Build)** — workflows_ci_typecheck_step, workflows_ci_lint_step, workflows_ci_unit_tests_step, workflows_ci_build_step [EXTRACTED 1.00]
- **Pages Reading from Supabase players Table** — claude_dashboard_page, claude_leaderboard_page, claude_player_profile_page, claude_lib_supabase, claude_supabase_players_table [EXTRACTED 0.95]

## Communities (28 total, 9 thin omitted)

### Community 0 - "Class Stats Cards"
Cohesion: 0.07
Nodes (48): CLASS_IMAGE_SIZE, CLASS_IMAGES, ClassCard(), getRankKey(), Props, ClassPieChart(), Props, CompareView() (+40 more)

### Community 1 - "Profile Claim & Auth"
Cohesion: 0.08
Nodes (31): claimProfile(), ClaimResult, escapeLike(), getProfileOwnership(), ProfileOwnership, getLeaderboardVisibility(), updateLeaderboardVisibility(), logout() (+23 more)

### Community 2 - "Monthly Leaderboard & Community Stats"
Cohesion: 0.12
Nodes (30): getMonthlyLeaderboard(), MonthlyEntry, CommunityTotals, fetchCommunityTotals(), fetchLeaderboard(), HonorRoll, HonorRollEntry, LeaderboardParams (+22 more)

### Community 3 - "Player Profile & Comparison"
Cohesion: 0.09
Nodes (29): getPlayerProfile(), saveGuestbookMessage(), CompareInner(), CompareResult, AbyssBarGuestbook(), Props, AbyssBarHonorRoll(), HonorEntry (+21 more)

### Community 4 - "Package Dependencies"
Cohesion: 0.06
Nodes (33): dependencies, html-to-image, next, react, react-dom, recharts, resend, server-only (+25 more)

### Community 5 - "Upload Flow & Abyss Bar"
Cohesion: 0.11
Nodes (20): UseUploadParams, UseUploadReturn, uploadAndSave(), getPrefs(), setPrefs(), CurrentIdentity, DashboardSession, getCurrentIdentity() (+12 more)

### Community 6 - "Badge Components"
Cohesion: 0.11
Nodes (22): AbyssBarBadges(), Props, PlayerBadges(), Props, TIER_COLORS, C, CardContent(), fmt() (+14 more)

### Community 7 - "Project Architecture (Docs)"
Cohesion: 0.11
Nodes (23): app/dashboard/page.tsx, DRG Dashboard Frontend, Python Flask Backend (drg_dashboard_backend), app/leaderboard/page.tsx, lib/api.ts — Backend API Call, lib/supabase.ts — Supabase Client, lib/types.ts — Shared TypeScript Types, Next.js 15 / React 19 App Router Stack (+15 more)

### Community 8 - "i18n Translations"
Cohesion: 0.13
Nodes (11): abyssBar, auth, dashboard, footer, translations, leaderboard, nav, options (+3 more)

### Community 9 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 10 - "Progress Delta Feature"
Cohesion: 0.42
Nodes (6): getProgressDelta(), ProgressDelta, getBestDeltaClass(), ProgressDeltaPanel(), Props, sign()

### Community 11 - "Asset Manifest"
Cohesion: 0.29
Nodes (6): classes, misc, missions, perks, resources, weapons

### Community 12 - "Next.js Config & Security"
Cohesion: 0.29
Nodes (5): apiOrigin, csp, nextConfig, securityHeaders, supabaseOrigin

### Community 13 - "Charts & Theme"
Cohesion: 0.40
Nodes (5): ClassPieChart Component (Recharts), DRG Dark Theme (Tailwind Colors), HeroStats Component, Recharts Tailwind Incompatibility (hex inline styles), tailwind.config.ts

### Community 14 - "Guestbook & Supabase Client"
Cohesion: 0.50
Nodes (3): fetchGuestbook(), GuestbookEntry, supabase

## Knowledge Gaps
- **127 isolated node(s):** `extends`, `resend`, `ContactResult`, `BACKEND_PARSE_TIMEOUT_MS`, `GVAS_MAGIC` (+122 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useTranslation()` connect `Player Profile & Comparison` to `Class Stats Cards`, `Profile Claim & Auth`, `Monthly Leaderboard & Community Stats`, `Upload Flow & Abyss Bar`, `Badge Components`, `i18n Translations`, `Progress Delta Feature`?**
  _High betweenness centrality (0.100) - this node is a cross-community bridge._
- **Why does `DashboardData` connect `Class Stats Cards` to `Profile Claim & Auth`, `Player Profile & Comparison`, `Upload Flow & Abyss Bar`, `Badge Components`, `Progress Delta Feature`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `TranslationKey` connect `Monthly Leaderboard & Community Stats` to `Class Stats Cards`, `i18n Translations`, `Player Profile & Comparison`, `Badge Components`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Are the 31 inferred relationships involving `t()` (e.g. with `CompareInner()` and `AbyssBarBadges()`) actually correct?**
  _`t()` has 31 INFERRED edges - model-reasoned connections that need verification._
- **What connects `extends`, `resend`, `ContactResult` to the rest of the system?**
  _129 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Class Stats Cards` be split into smaller, more focused modules?**
  _Cohesion score 0.06538461538461539 - nodes in this community are weakly interconnected._
- **Should `Profile Claim & Auth` be split into smaller, more focused modules?**
  _Cohesion score 0.07890070921985816 - nodes in this community are weakly interconnected._