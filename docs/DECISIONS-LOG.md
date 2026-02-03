# Decisions Log - Skali Prog Migration Next.js

> Journal des décisions techniques et architecturales
> Projet: Migration Skali Prog vers Next.js

---

## 2026-02-03 - Approche de Migration

### Contexte
Choix entre migration complète (from scratch) vs migration progressive.

### Options Considérées
1. **From Scratch** - Nouveau projet, recréer toutes les features
   - Avantages: Code propre, architecture moderne, pas de legacy
   - Inconvénients: Plus long, risque de perdre des fonctionnalités

2. **Migration Progressive** - Module par module
   - Avantages: Moins risqué, coexistence possible, livraison incrémentale
   - Inconvénients: Complexité de coexistence, deux codebases

### Décision
**Migration Progressive** avec:
- Nouveau projet Next.js `skali-admin/` dans le même repo
- Proxy vers ancien code pour modules non migrés
- Supabase comme source de vérité partagée

### Conséquences
- Besoin de gérer la coexistence ancien/nouveau
- Sessions partagées entre les deux apps
- Migration module par module sans interruption de service

### Status
[x] Décidé | [ ] Implémenté | [ ] Abandonné

---

## 2026-02-03 - Stack Technique

### Contexte
Choix de la stack pour le nouveau projet Next.js.

### Options Considérées
1. **shadcn/ui + Tailwind**
   - Avantages: Composants modernes, customisables, accessible
   - Inconvénients: Requires setup

2. **Garder Gorilla Glass design**
   - Avantages: Continuité visuelle
   - Inconvénients: Code CSS custom à maintenir

3. **Material UI / Chakra UI**
   - Avantages: Complet, documenté
   - Inconvénients: Plus lourd, moins flexible

### Décision
**shadcn/ui + Tailwind CSS** avec:
- TypeScript strict
- Zustand pour state management
- TanStack Query pour data fetching
- Supabase client existant

### Conséquences
- Nouveau design system à créer
- Composants à recréer en React
- Pattern existant dans member-portal-next à suivre

### Status
[x] Décidé | [ ] Implémenté | [ ] Abandonné

---

## 2026-02-03 - Priorité MVP

### Contexte
Définir quel module migrer en premier.

### Options Considérées
1. **Auth + Members + Programming** - Core business
2. **Admin complet** - Discord, Inventory, Settings
3. **Portail membre** - Déjà commencé en Next.js

### Décision
**Admin complet** prioritaire:
- Settings > API Keys
- Discord Unified (4 onglets)
- Inventory (équipements + méthodologies)
- Cardio Sessions
- Members management

### Conséquences
- Focus sur les fonctionnalités admin d'abord
- Les coachs/athlètes continuent d'utiliser l'ancien code
- Admin peut basculer rapidement sur nouvelle interface

### Status
[x] Décidé | [ ] Implémenté | [ ] Abandonné

---

## 2026-02-03 - Process de Développement

### Contexte
Choix du process de développement à suivre.

### Options Considérées
1. **Direct coding** - Commencer à coder immédiatement
2. **Process BMAD** - Brief → PRD → Architecture → Stories → Dev

### Décision
**Process BMAD complet** avec:
- Phase 1: Analysis (Brainstorming, Project Brief)
- Phase 2: Planning (PRD)
- Phase 3: Solutioning (Architecture, UX Spec)
- Phase 4: Implementation (Stories, Dev, QA)

### Conséquences
- Documentation complète avant de coder
- Checkpoints humains entre chaque phase
- Traçabilité des décisions

### Status
[x] Décidé | [ ] En cours | [ ] Abandonné

---

*Dernière mise à jour: 2026-02-03*
