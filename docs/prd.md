# PRD - Skali Admin

> Version: 1.0
> Date: 2026-02-03
> Agent: @PM (John)
> Status: **EN ATTENTE VALIDATION**
> Basé sur: [project-brief.md](project-brief.md)

---

## 1. Overview

Migration de l'interface d'administration Skali Prog vers Next.js avec shadcn/ui. Application destinée à 1-3 administrateurs de La Skàli Laval pour gérer les membres, sessions, équipements et intégrations Discord.

**Scope MVP:** Admin complet (Settings, Discord, Inventory) + Members + Calendar

---

## 2. Functional Requirements (FR)

### Epic 1: Foundation

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-01 | Authentification par rôle | P0 | Given un utilisateur, When il entre ses credentials, Then il est authentifié avec son rôle (ADMIN/COACH/ATHLETE) |
| FR-02 | Protection des routes | P0 | Given un utilisateur non-admin, When il accède à /admin/*, Then il est redirigé vers /unauthorized |
| FR-03 | Layout admin avec sidebar | P0 | Given un admin connecté, When il navigue, Then il voit une sidebar avec tous les modules |
| FR-04 | Thème dark par défaut | P1 | Given l'application, When elle charge, Then le thème dark est appliqué |
| FR-05 | Responsive design | P1 | Given un mobile/tablet, When l'admin accède, Then l'UI s'adapte |

### Epic 2: Settings & API Keys

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-10 | Lister les clés API | P0 | Given un admin, When il va sur /settings/api-keys, Then il voit toutes les clés configurables |
| FR-11 | Modifier une clé API | P0 | Given une clé, When l'admin la modifie et sauvegarde, Then elle est stockée dans Supabase |
| FR-12 | Masquer/Afficher clé | P0 | Given une clé, When l'admin clique sur l'œil, Then la valeur est visible/masquée |
| FR-13 | Tester une clé API | P1 | Given une clé testable (Supabase, Discord), When l'admin clique "Tester", Then un feedback succès/erreur s'affiche |
| FR-14 | Batch save | P1 | Given plusieurs clés modifiées, When l'admin clique "Sauvegarder tout", Then toutes sont enregistrées |

### Epic 3: Discord

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-20 | Onglet Notifications | P0 | Given un admin, When il va sur Discord > Notifications, Then il peut configurer le webhook et envoyer un test |
| FR-21 | Onglet Morning Coach | P1 | Given un admin, When il configure Morning Coach, Then il peut définir l'heure, le message, et activer/désactiver |
| FR-22 | Onglet Liaison Membres | P0 | Given un admin, When il va sur Liaison, Then il voit les membres Discord et peut les lier aux membres Skali |
| FR-23 | Lier Discord ↔ Membre | P0 | Given un membre Discord non lié, When l'admin le lie à un membre Skali, Then l'association est sauvegardée |
| FR-24 | Sync membres Discord | P1 | Given un admin, When il clique "Sync", Then la liste des membres Discord est mise à jour depuis l'API |
| FR-25 | Onglet Bot Controls | P2 | Given un admin, When il va sur Bot Controls, Then il peut voir le status du bot et envoyer des commandes |

### Epic 4: Inventory

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-30 | Lister équipements | P0 | Given un admin, When il va sur /inventory, Then il voit tous les équipements par catégorie |
| FR-31 | Ajouter équipement | P0 | Given un admin, When il remplit le formulaire et valide, Then l'équipement est ajouté |
| FR-32 | Modifier équipement | P0 | Given un équipement, When l'admin le modifie, Then les changements sont sauvegardés |
| FR-33 | Supprimer équipement | P1 | Given un équipement, When l'admin le supprime (avec confirmation), Then il est retiré |
| FR-34 | Filtrer par catégorie | P1 | Given des équipements, When l'admin filtre, Then seuls ceux de la catégorie s'affichent |
| FR-35 | Gérer méthodologies | P2 | Given un admin, When il va sur l'onglet Méthodologies, Then il peut CRUD les méthodologies d'entraînement |

### Epic 5: Members

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-40 | Lister membres | P0 | Given un admin, When il va sur /members, Then il voit la liste paginée (12/page) |
| FR-41 | Rechercher membre | P0 | Given des membres, When l'admin tape dans la recherche, Then la liste est filtrée |
| FR-42 | Voir fiche membre | P0 | Given un membre, When l'admin clique dessus, Then il voit les détails complets |
| FR-43 | Modifier membre | P1 | Given une fiche, When l'admin modifie et sauvegarde, Then les données sont mises à jour |
| FR-44 | Import CSV | P2 | Given un fichier CSV, When l'admin l'importe, Then les membres sont créés/mis à jour |
| FR-45 | Filtrer actifs/inactifs | P1 | Given des membres, When l'admin filtre, Then seuls les actifs/inactifs s'affichent |

### Epic 6: Calendar

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-50 | Vue calendrier | P0 | Given un admin, When il va sur /calendar, Then il voit les sessions sur un calendrier |
| FR-51 | Créer session | P1 | Given une date, When l'admin crée une session, Then elle apparaît sur le calendrier |
| FR-52 | Modifier session | P1 | Given une session, When l'admin la modifie, Then les changements sont sauvegardés |
| FR-53 | Supprimer session | P1 | Given une session, When l'admin la supprime, Then elle disparaît |
| FR-54 | Vue jour/semaine/mois | P2 | Given le calendrier, When l'admin change de vue, Then l'affichage s'adapte |

### Epic 7: Performance (Post-MVP)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-60 | Dashboard performances | P2 | Given un admin, When il va sur /performance, Then il voit les métriques globales |
| FR-61 | Pokemon Cards | P2 | Given un membre, When l'admin voit sa fiche, Then les Pokemon Cards sont affichées |

### Epic 8: Teams & CRM (Post-MVP)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-70 | Team builder | P3 | Given un admin, When il crée une équipe, Then il peut y ajouter des membres |
| FR-71 | CRM Analytics | P3 | Given un admin, When il va sur CRM, Then il voit les analytics |

### Epic 9: TV Mode (Post-MVP)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-80 | Mode TV 1080p | P3 | Given un écran TV, When l'admin active le mode TV, Then l'affichage est optimisé |

---

## 3. Non-Functional Requirements (NFR)

| ID | Category | Requirement | Target |
|----|----------|-------------|--------|
| NFR-01 | Performance | Time to Interactive | < 2s |
| NFR-02 | Performance | Lighthouse Performance Score | > 90 |
| NFR-03 | Security | Authentification | Session-based + rôles |
| NFR-04 | Security | API Keys | Stockées chiffrées dans Supabase |
| NFR-05 | Security | HTTPS | Obligatoire en production |
| NFR-06 | Accessibility | WCAG Level | AA minimum |
| NFR-07 | Compatibility | Navigateurs | Chrome, Firefox, Safari, Edge (dernières versions) |
| NFR-08 | Compatibility | Mobile | iOS Safari, Android Chrome |
| NFR-09 | Maintainability | TypeScript Coverage | 100% |
| NFR-10 | Maintainability | Linting | ESLint + Prettier, 0 erreurs |

---

## 4. Epics Summary

| Epic | Nom | Priority | Stories Estimées |
|------|-----|----------|------------------|
| E1 | Foundation | P0 | 5 |
| E2 | Settings & API Keys | P0 | 5 |
| E3 | Discord | P0 | 6 |
| E4 | Inventory | P0 | 6 |
| E5 | Members | P1 | 6 |
| E6 | Calendar | P1 | 5 |
| E7 | Performance | P2 | 2 |
| E8 | Teams & CRM | P3 | 2 |
| E9 | TV Mode | P3 | 1 |
| **Total** | | | **38 stories** |

---

## 5. User Stories (Haut niveau)

### Epic 1: Foundation

| ID | Story | Priority |
|----|-------|----------|
| US-01 | En tant qu'admin, je veux me connecter pour accéder à l'interface | P0 |
| US-02 | En tant qu'admin, je veux voir une sidebar pour naviguer entre les modules | P0 |
| US-03 | En tant que coach, je veux être redirigé si j'accède à une page interdite | P0 |
| US-04 | En tant qu'admin, je veux un thème dark pour réduire la fatigue visuelle | P1 |
| US-05 | En tant qu'admin mobile, je veux un menu hamburger pour naviguer | P1 |

### Epic 2: Settings & API Keys

| ID | Story | Priority |
|----|-------|----------|
| US-10 | En tant qu'admin, je veux voir toutes les clés API configurables | P0 |
| US-11 | En tant qu'admin, je veux modifier une clé API | P0 |
| US-12 | En tant qu'admin, je veux masquer/afficher une clé pour la sécurité | P0 |
| US-13 | En tant qu'admin, je veux tester une clé pour vérifier qu'elle fonctionne | P1 |
| US-14 | En tant qu'admin, je veux sauvegarder plusieurs clés en une fois | P1 |

### Epic 3: Discord

| ID | Story | Priority |
|----|-------|----------|
| US-20 | En tant qu'admin, je veux configurer le webhook Discord | P0 |
| US-21 | En tant qu'admin, je veux envoyer une notification test | P0 |
| US-22 | En tant qu'admin, je veux voir les membres Discord du serveur | P0 |
| US-23 | En tant qu'admin, je veux lier un membre Discord à un membre Skali | P0 |
| US-24 | En tant qu'admin, je veux configurer le Morning Coach | P1 |
| US-25 | En tant qu'admin, je veux synchroniser les membres Discord | P1 |

### Epic 4: Inventory

| ID | Story | Priority |
|----|-------|----------|
| US-30 | En tant qu'admin, je veux voir tous les équipements de la salle | P0 |
| US-31 | En tant qu'admin, je veux ajouter un nouvel équipement | P0 |
| US-32 | En tant qu'admin, je veux modifier un équipement existant | P0 |
| US-33 | En tant qu'admin, je veux supprimer un équipement | P1 |
| US-34 | En tant qu'admin, je veux filtrer les équipements par catégorie | P1 |
| US-35 | En tant qu'admin, je veux gérer les méthodologies d'entraînement | P2 |

### Epic 5: Members

| ID | Story | Priority |
|----|-------|----------|
| US-40 | En tant qu'admin, je veux voir la liste des membres | P0 |
| US-41 | En tant qu'admin, je veux rechercher un membre par nom | P0 |
| US-42 | En tant qu'admin, je veux voir les détails d'un membre | P0 |
| US-43 | En tant qu'admin, je veux modifier les informations d'un membre | P1 |
| US-44 | En tant qu'admin, je veux importer des membres depuis un CSV | P2 |
| US-45 | En tant qu'admin, je veux filtrer les membres actifs/inactifs | P1 |

### Epic 6: Calendar

| ID | Story | Priority |
|----|-------|----------|
| US-50 | En tant qu'admin, je veux voir les sessions sur un calendrier | P0 |
| US-51 | En tant qu'admin, je veux créer une nouvelle session | P1 |
| US-52 | En tant qu'admin, je veux modifier une session | P1 |
| US-53 | En tant qu'admin, je veux supprimer une session | P1 |
| US-54 | En tant qu'admin, je veux changer la vue (jour/semaine/mois) | P2 |

---

## 6. MVP Definition

### Phase 1 - MVP Core (Epics 1-4)
**Objectif:** Admin fonctionnel avec Settings, Discord, Inventory

**Included:**
- Authentification (3 rôles)
- Layout admin avec sidebar
- Gestion complète des clés API
- Discord Unified (4 onglets)
- Inventory management

**Excluded (Phase 2):**
- Members management
- Calendar
- Performance, Teams, CRM, TV Mode

### Phase 2 - MVP Extended (Epics 5-6)
**Objectif:** Gestion membres et calendrier

### Phase 3 - Post-MVP (Epics 7-9)
**Objectif:** Features avancées (Performance, Teams, CRM, TV)

---

## 7. Data Model (Résumé)

### Tables Supabase Existantes

| Table | Usage |
|-------|-------|
| `members` | Membres/athlètes |
| `sessions` | Sessions d'entraînement |
| `api_keys` | Clés API (key_name, key_value) |
| `settings` | Paramètres globaux |
| `discord_members` | Membres Discord liés |
| `equipment` | Équipements gym (à créer si n'existe pas) |

---

## 8. API Endpoints (Preview)

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | /api/auth/login | Authentification | Public |
| POST | /api/auth/logout | Déconnexion | JWT |
| GET | /api/api-keys | Liste clés API | Admin |
| POST | /api/api-keys | Sauvegarder clé | Admin |
| POST | /api/discord/webhook | Envoyer notification | Admin |
| GET | /api/discord/members | Liste membres Discord | Admin |
| POST | /api/discord/link | Lier membre | Admin |
| GET | /api/inventory | Liste équipements | Admin |
| POST | /api/inventory | Créer équipement | Admin |
| GET | /api/members | Liste membres | Admin/Coach |
| GET | /api/sessions | Liste sessions | Admin/Coach |

---

## 9. Open Questions

- [x] Modules à migrer ? → Admin, Members, Calendar, Performance, Teams, CRM, TV
- [x] Modules exclus ? → Programming Pro, Nutrition, Cardio, Reports
- [x] Design system ? → shadcn/ui
- [ ] Table `equipment` existe dans Supabase ? → À vérifier
- [ ] Structure exacte de `discord_members` ? → À vérifier
- [ ] Déploiement cible ? → Vercel (probable)

---

## 10. Validation

**⏸️ CHECKPOINT:** Ce PRD nécessite validation avant la Phase 3 (Architecture).

Questions :
1. Les FR/NFR sont-ils complets ?
2. Le découpage en phases MVP est-il correct ?
3. Les priorités (P0/P1/P2/P3) sont-elles bonnes ?

---

*PRD v1.0 - BMAD Process*
*Skali Admin Migration*
