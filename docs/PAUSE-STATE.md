# PAUSE-STATE - Skali Prog Migration Next.js

> Dernier update: 2026-02-03
> Phase actuelle: **4 - IMPLEMENTATION** (Dev en cours)
> Agent actif: **@DEV**
> Prochain: Modules P2 (Performance, Teams, CRM)

---

## 🔄 POUR REPRENDRE LE CONTEXTE

**Dis simplement:** `*status` ou "$continue"

**Documents à lire (dans l'ordre):**
1. `docs/PAUSE-STATE.md` ← CE FICHIER (résumé état)
2. `docs/DECISIONS-LOG.md` ← Décisions techniques
3. `docs/prd.md` ← Requirements si besoin de contexte

---

## ⚠️ MODULES COMPLETS - NE PAS REFAIRE

| Module | Status | Fichiers Clés | Date |
|--------|--------|---------------|------|
| Nettoyage projet | ✅ | `archive/` supprimé, SQL renommées | 2026-02-03 |
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
| SSH + GitHub CLI | ✅ | `~/.ssh/id_ed25519` configuré | 2026-02-03 |

## ❌ MODULES EXCLUS (Supprimés du scope)

- Programming Pro (génération programmes IA)
- Nutrition (plans nutritionnels)
- Cardio (cardiomon, cardiotv)
- Reports (rapports, allures)

## ✅ MODULES À MIGRER

| Module | Priorité | Status |
|--------|----------|--------|
| Admin (Settings, API Keys) | P0 - MVP | ✅ Complet |
| Admin (Discord Unified) | P0 - MVP | ✅ Complet (UI + liaison membres) |
| Admin (Inventory) | P0 - MVP | ✅ Complet (4 tabs, CRUD équipements) |
| Members | P1 | ✅ Complet (liste, fiche détaillée, édition) |
| Calendar | P1 | ✅ Complet (vue mois, CRUD sessions) |
| Performance | P2 | ⏳ Pending |
| Teams | P2 | ⏳ Pending |
| CRM | P2 | ⏳ Pending |
| TV Mode | P3 | ⏳ Pending |

---

## CONTEXTE PROJET

**Nom:** Skali Admin - Migration Next.js
**Objectif:** Migrer Skali Prog (Vanilla JS, 121 fichiers, 98K lignes) vers Next.js
**Approche:** Migration progressive module par module
**Priorité MVP:** Admin complet (Discord, Inventory, Settings, API Keys)
**Design:** shadcn/ui + Tailwind CSS

---

## EN COURS

- [x] Phase 1: Brainstorming → `docs/brainstorm.md` ✅
- [x] Phase 1: Project Brief → `docs/project-brief.md` ✅
- [x] Phase 2: PRD → `docs/prd.md` ✅
- [x] Phase 3: Architecture → `docs/architecture.md` ✅
- [x] Node.js installé (/opt/homebrew/bin/node v25.5.0) ✅
- [x] Setup Next.js (`skali-admin/`) ✅
- [x] Module Discord Unified (4 onglets) ✅
- [x] Module API Keys ✅
- [x] Module Inventory (4 onglets, CRUD équipements) ✅
- [x] SSH + GitHub configuré ✅
- [x] Module Members (liste, fiche, édition) ✅
- [x] Module Calendar (vue mois, CRUD sessions) ✅
- [ ] **🚧 NEXT: Modules P2 (Performance, Teams, CRM)**

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

---

## COMMANDES PROJET

```bash
# Nouveau code (Next.js)
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
│   │   │   ├── discord/page.tsx      ← Module Discord (4 tabs)
│   │   │   ├── inventory/page.tsx    ← Module Inventory (4 tabs)
│   │   │   ├── members/page.tsx      ← Module Members (liste, fiche, édition)
│   │   │   ├── calendar/page.tsx     ← Module Calendar (vue mois, CRUD)
│   │   │   ├── settings/
│   │   │   │   └── api-keys/page.tsx ← Module API Keys
│   │   │   └── layout.tsx
│   │   ├── (auth)/
│   │   │   └── login/page.tsx
│   │   └── api/
│   │       ├── auth/login/route.ts
│   │       └── api-keys/route.ts
│   ├── components/
│   │   ├── layout/AdminSidebar.tsx
│   │   └── ui/                       ← shadcn/ui components
│   ├── config/
│   │   ├── navigation.ts
│   │   ├── api-keys.ts
│   │   └── roles.ts
│   ├── lib/supabase/client.ts
│   ├── stores/auth-store.ts
│   └── types/index.ts
└── package.json
```

---

## SESSIONS

### Session 1 - 2026-02-03
- Audit codebase complet (121 JS, 26 CSS, 11 modules)
- Nettoyage: supprimé archive/, corrigé SQL migrations
- Process BMAD: Brief ✅ → PRD ✅ → Architecture ✅
- Modules exclus: Prog Pro, Nutrition, Cardio, Reports

### Session 2 - 2026-02-03 (Suite)
- Node.js fonctionnel (/opt/homebrew/bin/node v25.5.0)
- Ajout référence PAUSE-STATE.md dans CLAUDE.md
- Module Discord Unified migré (4 onglets: Notifications, Morning, Liaison, Bot)
- Placeholders créés pour Inventory, Members, Calendar
- Navigation corrigée (routes sans /admin prefix)

### Session 3 - 2026-02-03 (Suite)
- CLAUDE.md: Ajout Mode Autonome + Git Auto-Push
- SSH configuré pour GitHub (clé ed25519)
- GitHub CLI installé (gh v2.86.0)
- Module Inventory complet:
  - 4 onglets: Config, Inventaire, Méthodologie, Mouvements
  - CRUD équipements (add, edit, delete)
  - Filtrage par catégorie + recherche
  - Stats cards (total, quantité, alertes)
- **MVP Admin P0 COMPLET** 🎉

### Session 4 - 2026-02-03 (Suite)
- Module Members complet:
  - Liste paginée (12/page)
  - Stats cards (total, actifs, inactifs, ce mois)
  - Recherche par nom/email/téléphone
  - Filtres actifs/inactifs
  - Tri par colonnes (nom, âge, genre, poids, taille)
  - Dialog fiche membre détaillée
  - Dialog édition membre (CRUD)
  - Composant Select shadcn/ui ajouté
- Type Member étendu avec tous les champs

### Session 5 - 2026-02-03 (Suite)
- Module Calendar complet:
  - Vue calendrier mensuel interactif
  - Navigation mois/aujourd'hui
  - Stats par catégorie (CrossTraining, Musculation, Cardio, Hyrox, Récupération)
  - Liste sessions du jour sélectionné
  - Dialog création/édition session avec catégorie, description, durées, rounds
  - Suppression session
  - Indicateurs visuels par catégorie sur le calendrier
  - Type TrainingSession ajouté
  - Composant Textarea ajouté
- **P1 COMPLET (Members + Calendar)** 🎉
- **NEXT:** Modules P2 (Performance, Teams, CRM)

---

## 📝 COMMANDES BMAD RAPIDES

| Commande | Action |
|----------|--------|
| `*status` | Voir état du projet |
| `$continue` | Reprendre le travail |
| `*implement [module]` | Implémenter un module |
| `*review` | Review code |

---

*BMAD Process v2.0 - Skali Prog Migration*
