# Project Brief - Skali Admin

> Version: 1.0
> Date: 2026-02-03
> Agent: @ANALYST (Mary)
> Status: **EN ATTENTE VALIDATION**

---

## 1. Executive Summary

Migration de l'interface d'administration Skali Prog depuis Vanilla JavaScript vers Next.js avec shadcn/ui. Projet destiné à 1-3 administrateurs de La Skàli Laval. Focus sur les modules Admin, Members, Calendar, Performance, Teams, CRM et TV Mode. Les modules Programming Pro, Nutrition, Cardio et Reports sont exclus du scope.

---

## 2. Problem Statement

### Quel problème résolvons-nous ?
- Code Vanilla JS legacy difficile à maintenir (121 fichiers, 98K lignes)
- Pas de type safety (bugs runtime)
- Architecture IIFE non modulaire
- UI inconsistante entre modules
- Difficile d'ajouter de nouvelles features

### Pour qui ?
- 1-3 administrateurs La Skàli (toi + coachs seniors)

### Pourquoi maintenant ?
- Dette technique accumulée
- Besoin de moderniser avant d'ajouter des features
- Opportunité de nettoyer et simplifier

---

## 3. Proposed Solution

### Description
Nouveau projet Next.js `skali-admin/` avec :
- TypeScript strict pour type safety
- shadcn/ui pour UI cohérente et moderne
- Architecture modulaire (App Router)
- Migration progressive (coexistence avec ancien code)

### Différenciateurs
- Code maintenable et testable
- Meilleure DX (Developer Experience)
- Performance optimisée (SSR, code splitting)
- Design system cohérent

---

## 4. Target Users

### Persona 1: Admin Principal (Toi)
- Accès complet à toutes les fonctionnalités
- Gère la configuration système (API keys, Discord)
- Gère l'inventaire équipement
- Supervise les membres et coachs

### Persona 2: Coach Senior
- Accès limité (pas de config système)
- Gère les membres et sessions
- Consulte les performances
- Utilise le calendrier

---

## 5. Success Metrics

| KPI | Target | Mesure |
|-----|--------|--------|
| Migration Admin complète | 100% | Toutes les features admin fonctionnelles |
| Temps de chargement | < 2s | Lighthouse Performance |
| Bugs critiques | 0 | Pas de régression vs ancien code |
| Adoption | 100% | Admins utilisent le nouveau code |

---

## 6. Scope

### In Scope (MVP)

#### Epic 1: Foundation
- Setup projet Next.js + shadcn/ui
- Configuration Supabase
- Système d'authentification (3 rôles)
- Layout admin avec sidebar

#### Epic 2: Settings & API Keys
- Page gestion clés API
- CRUD complet (Supabase, Discord, Claude, etc.)
- Test de connexion pour chaque clé

#### Epic 3: Discord
- Onglet Notifications (webhooks)
- Onglet Morning Coach (routine quotidienne)
- Onglet Liaison Membres (Discord ↔ Skali)
- Onglet Bot Controls

#### Epic 4: Inventory
- Liste équipements gym
- CRUD équipements
- Méthodologies d'entraînement

#### Epic 5: Members
- Liste membres avec pagination
- Fiche membre détaillée
- Import CSV

#### Epic 6: Calendar
- Vue calendrier sessions
- CRUD sessions

#### Epic 7: Performance
- Dashboard performances
- Pokemon Cards
- Historique

#### Epic 8: Teams & CRM
- Team builder
- Analytics CRM

#### Epic 9: TV Mode
- Affichage optimisé 1080p
- Mode présentation salle

### Out of Scope (Supprimés définitivement)
- ❌ Programming Pro (génération programmes IA)
- ❌ Nutrition (plans nutritionnels)
- ❌ Cardio (cardiomon, cardiotv)
- ❌ Reports (rapports, allures)

---

## 7. Constraints

| Type | Contrainte |
|------|------------|
| **Budget** | Aucun (projet interne) |
| **Timeline** | Pas de deadline stricte, qualité > vitesse |
| **Technical** | Node.js requis (à installer) |
| **Technical** | Supabase existant (pas de migration DB) |
| **Technical** | Coexistence avec ancien code pendant migration |

---

## 8. Risks & Assumptions

### Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Migration incomplète | Moyenne | Haute | MVP serré, itérations courtes |
| Régression features | Moyenne | Haute | Tests, checklist features |
| Node.js non installé | **Actuel** | Bloquant | Installer avant de continuer |
| Over-engineering | Haute | Moyenne | KISS, YAGNI, MVP first |

### Assumptions
- Supabase reste la base de données (pas de migration)
- Les 3 rôles (ADMIN/COACH/ATHLETE) restent identiques
- shadcn/ui est acceptable comme design system
- 1-3 utilisateurs max

---

## 9. Dependencies

| Dependency | Status | Owner |
|------------|--------|-------|
| Node.js installé | ❌ Bloquant | Utilisateur |
| Accès Supabase | ✅ OK | Existant |
| Clés API (Discord, Claude) | ✅ OK | Dans Supabase |
| Repo Git | ✅ OK | skaliProgV1 |

---

## 10. Open Questions

- [x] Combien d'utilisateurs ? → 1-3 admins
- [x] Modules à supprimer ? → Prog Pro, Nutrition, Cardio, Reports
- [x] Design system ? → shadcn/ui
- [ ] Auth strategy détaillée ? → À définir en Phase 3 (Architecture)
- [ ] Déploiement ? → À définir (Vercel probable)

---

## 11. Next Steps

| # | Action | Owner | Status |
|---|--------|-------|--------|
| 1 | Valider ce Project Brief | Humain | ⏳ En attente |
| 2 | Installer Node.js | Humain | ⏳ Bloquant |
| 3 | Créer PRD (Phase 2) | @PM | Après validation |
| 4 | Créer Architecture (Phase 3) | @ARCH | Après PRD |

---

## Validation

**⏸️ CHECKPOINT:** Ce document nécessite validation humaine avant de passer à la Phase 2 (PRD).

Questions de validation :
1. Le scope (modules inclus/exclus) est-il correct ?
2. Les epics MVP sont-ils bien priorisés ?
3. Les contraintes sont-elles complètes ?

---

*Project Brief v1.0 - BMAD Process*
*Skali Admin Migration - La Skàli Laval*
