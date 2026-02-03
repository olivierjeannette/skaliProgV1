# PAUSE-STATE - Skali Prog Migration Next.js

> Dernier update: 2026-02-03
> Phase actuelle: **5 - DEPLOIEMENT** (Prêt pour Vercel)
> Agent actif: **@DEV**
> Prochain: **Déploiement Vercel**

---

## RÉSUMÉ AUDIT - 2026-02-03

### Structure Finale (Nettoyée)

```
skaliProgV1/
├── .claude/           # Config Claude (ignoré git)
├── .git/              # Git
├── .gitignore         # Gitignore
├── CLAUDE.md          # Instructions process
├── docs/              # Documentation
│   ├── PAUSE-STATE.md # Ce fichier
│   ├── DECISIONS-LOG.md
│   ├── architecture.md
│   ├── brainstorm.md
│   ├── prd.md
│   ├── project-brief.md
│   ├── sql/           # Migrations SQL Supabase (référence)
│   └── stories/
└── skali-admin/       # ⭐ PROJET NEXT.JS (à déployer sur Vercel)
    ├── src/
    ├── public/
    ├── package.json
    └── ...
```

### Fichiers Supprimés (Legacy Vanilla JS)

- `css/` - 26 fichiers CSS (450KB)
- `js/` - 121 fichiers JavaScript (98KB)
- `data/`, `ref/`, `scripts/`, `tests/`, `tools/`
- `sql 2/`, `member-portal-next/`
- `index.html`, `member-portal.html`, `nutrition-pro.html`
- `package.json`, `package-lock.json` (racine)
- `eslint.config.js`, `jest.config.js`, `manifest.json`, `sw.js`

### Connexion Supabase

**OUI, le projet est toujours lié à Supabase.**

- URL: `https://dhzknhevbzdauakzbdhr.supabase.co`
- Clé Anon: Configurée dans `skali-admin/.env.local`
- Client: `skali-admin/src/lib/supabase/client.ts`
- Discord Guild ID: `1400713384546009169`

---

## POUR REPRENDRE LE CONTEXTE

**Dis simplement:** `*status` ou "$continue"

**Documents à lire (dans l'ordre):**
1. `docs/PAUSE-STATE.md` - CE FICHIER (résumé état)
2. `docs/DECISIONS-LOG.md` - Décisions techniques
3. `docs/prd.md` - Requirements si besoin de contexte

---

## MODULES COMPLETS - NE PAS REFAIRE

| Module | Status | Fichiers Clés | Date |
|--------|--------|---------------|------|
| Nettoyage projet | ✅ | Legacy supprimé, structure clean | 2026-02-03 |
| Phase 1: Brainstorming | ✅ | `docs/brainstorm.md` | 2026-02-03 |
| Phase 1: Project Brief | ✅ | `docs/project-brief.md` | 2026-02-03 |
| Phase 2: PRD | ✅ | `docs/prd.md` (38 stories, 9 epics) | 2026-02-03 |
| Phase 3: Architecture | ✅ | `docs/architecture.md` | 2026-02-03 |
| Setup Next.js | ✅ | `skali-admin/` créé, dépendances installées | 2026-02-03 |
| Auth Store | ✅ | `skali-admin/src/stores/auth-store.ts` | 2026-02-03 |
| Admin Layout + Sidebar | ✅ | `skali-admin/src/components/layout/AdminSidebar.tsx` | 2026-02-03 |
| Settings > API Keys | ✅ | `skali-admin/src/app/(admin)/settings/api-keys/page.tsx` | 2026-02-03 |
| Discord Unified (4 tabs) | ✅ | `skali-admin/src/app/(admin)/discord/page.tsx` | 2026-02-03 |
| Inventory (4 tabs, CRUD) | ✅ | `skali-admin/src/app/(admin)/inventory/page.tsx` | 2026-02-03 |
| Members (liste, fiche, édition) | ✅ | `skali-admin/src/app/(admin)/members/page.tsx` | 2026-02-03 |
| Calendar (vue mois, CRUD sessions) | ✅ | `skali-admin/src/app/(admin)/calendar/page.tsx` | 2026-02-03 |
| Performance (dashboard, Pokemon cards) | ✅ | `skali-admin/src/app/(admin)/performance/page.tsx` | 2026-02-03 |
| Teams (TeamBuilder Pro) | ✅ | `skali-admin/src/app/(admin)/teams/page.tsx` | 2026-02-03 |
| CRM (gestion leads) | ✅ | `skali-admin/src/app/(admin)/crm/page.tsx` | 2026-02-03 |
| TV Mode (affichage 1080p) | ✅ | `skali-admin/src/app/(admin)/tv/page.tsx` | 2026-02-03 |
| SSH + GitHub CLI | ✅ | `~/.ssh/id_ed25519` configuré | 2026-02-03 |
| Member Portal | ✅ | `skali-admin/src/app/(portal)/portal/page.tsx` | 2026-02-03 |
| Audit + Nettoyage | ✅ | Legacy supprimé, .env.local configuré | 2026-02-03 |

## MODULES EXCLUS (Supprimés du scope)

- Programming Pro (génération programmes IA)
- Nutrition (plans nutritionnels)
- Cardio (cardiomon, cardiotv)
- Reports (rapports, allures)

---

## DÉPLOIEMENT VERCEL

### Prérequis

1. **Build vérifié:** `npm run build` ✅ (0 erreurs)
2. **Variables d'environnement à configurer sur Vercel:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://dhzknhevbzdauakzbdhr.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
   AUTH_SECRET=<générer une clé sécurisée>
   ```

### Configuration Vercel

| Setting | Valeur |
|---------|--------|
| Root Directory | `skali-admin` |
| Framework Preset | Next.js |
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Install Command | `npm install` |

### Étapes

1. Connecter le repo GitHub à Vercel
2. Configurer Root Directory: `skali-admin`
3. Ajouter les variables d'environnement
4. Déployer

---

## STACK TECHNIQUE

| Layer | Technologie | Status |
|-------|-------------|--------|
| Framework | Next.js 16.1.6 (App Router) | ✅ Installé |
| Language | TypeScript | ✅ Configuré |
| UI Components | shadcn/ui | ✅ Installé |
| Styling | Tailwind CSS v4 | ✅ Configuré |
| State | Zustand | ✅ Installé |
| Data Fetching | TanStack Query | ✅ Installé |
| Backend | Supabase | ✅ Configuré |
| Auth | Custom 3 rôles (ADMIN/COACH/ATHLETE) | ✅ Implémenté |
| Deploy | Vercel | En attente |

---

## COMMANDES PROJET

```bash
# Développement
cd /Users/jackson/Documents/skaliProgV1/skali-admin
export PATH="/opt/homebrew/bin:$PATH"  # Si node pas dans PATH
npm run dev          # Port 3000
npm run build        # Build production
npm run lint         # Vérifier erreurs
```

---

## STRUCTURE SKALI-ADMIN

```
skali-admin/
├── src/
│   ├── app/
│   │   ├── (admin)/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── discord/page.tsx      # Module Discord (4 tabs)
│   │   │   ├── inventory/page.tsx    # Module Inventory (4 tabs)
│   │   │   ├── members/page.tsx      # Module Members (liste, fiche, édition)
│   │   │   ├── calendar/page.tsx     # Module Calendar (vue mois, CRUD)
│   │   │   ├── performance/page.tsx  # Module Performance (dashboard, Pokemon cards)
│   │   │   ├── teams/page.tsx        # Module Teams (TeamBuilder Pro)
│   │   │   ├── crm/page.tsx          # Module CRM (gestion leads)
│   │   │   ├── tv/page.tsx           # Module TV Mode (1080p)
│   │   │   ├── settings/
│   │   │   │   └── api-keys/page.tsx # Module API Keys
│   │   │   └── layout.tsx
│   │   ├── (portal)/
│   │   │   ├── portal/page.tsx       # Member Portal (auth, carte Pokemon, données)
│   │   │   └── layout.tsx
│   │   ├── (auth)/
│   │   │   └── login/page.tsx
│   │   └── api/
│   │       ├── auth/login/route.ts
│   │       └── api-keys/route.ts
│   ├── components/
│   │   ├── layout/AdminSidebar.tsx
│   │   └── ui/                       # shadcn/ui components
│   ├── config/
│   │   ├── navigation.ts
│   │   ├── api-keys.ts
│   │   └── roles.ts
│   ├── lib/supabase/client.ts
│   ├── stores/
│   │   ├── auth-store.ts
│   │   └── portal-store.ts           # Store portail membre
│   └── types/index.ts
├── public/
│   └── favicon.ico
└── package.json
```

---

## SESSIONS

### Session 10 - 2026-02-03 (Audit + Nettoyage)

- Audit complète du projet
- Suppression de tous les fichiers legacy (Vanilla JS):
  - 26 fichiers CSS, 121 fichiers JS
  - 11 dossiers legacy
  - Fichiers config obsolètes
- Migration SQL vers `docs/sql/` (référence)
- Configuration Supabase vérifiée et mise à jour dans `.env.local`
- Build vérifié: `npm run build` ✅
- Préparation déploiement Vercel
- Structure finale: ~50 fichiers au lieu de 200+

### Sessions Précédentes

Voir historique complet dans la version précédente du fichier.

---

## COMMANDES BMAD RAPIDES

| Commande | Action |
|----------|--------|
| `*status` | Voir état du projet |
| `$continue` | Reprendre le travail |
| `*implement [module]` | Implémenter un module |
| `*review` | Review code |

---

*BMAD Process v2.0 - Skali Prog Migration*
*Prêt pour déploiement Vercel*
