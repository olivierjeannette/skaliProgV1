# PAUSE-STATE - Skali Prog (Next.js)

> Dernier update: 2026-02-04
> Phase actuelle: **5 - DEPLOIEMENT** (Prêt pour Vercel)
> Agent actif: **@DEV**
> Prochain: **Déploiement Vercel**

---

## RÉSUMÉ - Structure Finale

```
skaliProgV1/                    ← DÉPLOYER CE DOSSIER (racine)
├── src/                        # Code source Next.js
│   ├── app/                    # App Router (pages)
│   ├── components/             # Composants React
│   ├── config/                 # Configuration
│   ├── lib/                    # Utilitaires + Supabase client
│   ├── stores/                 # Zustand stores
│   └── types/                  # TypeScript types
├── public/                     # Assets statiques
├── docs/                       # Documentation
│   ├── PAUSE-STATE.md          # Ce fichier
│   ├── sql/                    # Migrations SQL (référence)
│   └── ...
├── package.json                # Dépendances
├── next.config.ts              # Config Next.js
├── tsconfig.json               # Config TypeScript
├── .env.local                  # Variables d'environnement
├── .env.example                # Template variables
└── CLAUDE.md                   # Instructions process
```

---

## CONNEXION SUPABASE

**OUI, le projet est lié à Supabase.**

| Élément | Valeur |
|---------|--------|
| URL | `https://dhzknhevbzdauakzbdhr.supabase.co` |
| Client | `src/lib/supabase/client.ts` |
| Config | `.env.local` |
| Discord Guild | `1400713384546009169` |

---

## DISCORD OAUTH (PWA)

**Authentification Discord pour le portail membre**

| Élément | Valeur |
|---------|--------|
| Application ID | `1401161063717666826` |
| Callback URL | `https://skali-prog-v1.vercel.app/api/auth/discord/callback` |
| Routes | `/api/auth/discord` + `/api/auth/discord/callback` |
| Scopes | `identify`, `guilds.members.read` |

**Variables Vercel requises:**
```
DISCORD_CLIENT_ID=1401161063717666826
DISCORD_CLIENT_SECRET=M0wBtMssVOvIMVj3Q9aQLyLI87kd0sVU
DISCORD_REDIRECT_URI=https://skali-prog-v1.vercel.app/api/auth/discord/callback
```

---

## DÉPLOIEMENT VERCEL

### Configuration Simplifiée

| Setting | Valeur |
|---------|--------|
| Root Directory | `.` (racine) |
| Framework Preset | Next.js (auto-détecté) |
| Build Command | `npm run build` |
| Install Command | `npm install` |

### Variables d'environnement (Vercel)

```
NEXT_PUBLIC_SUPABASE_URL=https://dhzknhevbzdauakzbdhr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
AUTH_SECRET=<générer avec: openssl rand -base64 32>
```

### Étapes

1. Connecter le repo GitHub à Vercel
2. Ajouter les variables d'environnement
3. Déployer (pas besoin de configurer Root Directory)

---

## MODULES COMPLETS

| Module | Route | Description |
|--------|-------|-------------|
| Dashboard | `/dashboard` | Page d'accueil admin |
| Discord | `/discord` | 3 onglets (Liaison Membres, Configuration, Notifications) |
| Inventory | `/inventory` | 4 onglets (Config, Inventaire, Métho, Mouvements) |
| Members | `/members` | Liste, fiche détaillée, édition |
| Calendar | `/calendar` | Vue mois, CRUD sessions |
| Performance | `/performance` | Dashboard, Pokemon cards, classement |
| Teams | `/teams` | TeamBuilder Pro |
| CRM | `/crm` | 8 onglets, gestion leads |
| TV Mode | `/tv` | Affichage 1080p/4K |
| Member Portal | `/portal` | Auth Discord 2 étapes, liaison membre, carte Epic |
| Portal Planning | `/portal/planning` | Calendrier séances + réservation (PWA) |
| Portal Workouts | `/portal/workouts` | Historique WODs + détails blocs (PWA) |
| Portal Performance | `/portal/performance` | Carte Epic, PRs, progression (PWA) |
| Portal Profile | `/portal/profile` | Profil complet + paramètres (PWA) |
| Settings | `/settings/api-keys` | Gestion clés API |
| PWA Config | `/pwa-config` | Config app mobile adhérents |
| Login | `/login` | Authentification |

---

## NAVIGATION MENU

Structure du menu sidebar (réorganisée):

```
📊 Dashboard

📌 Navigation
   ├── Planning (calendar)
   ├── Adhérents (members)
   ├── TeamBuilder (teams)
   ├── TV Mode
   └── Performance

🎯 CRM

🛠️ Outils
   ├── PWA Config
   ├── Settings
   ├── Inventory
   └── Discord
```

**Responsive:** Menu mobile avec hamburger + Sheet (< 1024px)

---

## STACK TECHNIQUE

| Layer | Technologie | Version |
|-------|-------------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| Language | TypeScript | 5.x |
| UI | shadcn/ui + Tailwind CSS | v4 |
| State | Zustand | 5.x |
| Data | TanStack Query | 5.x |
| Backend | Supabase | 2.x |
| Deploy | Vercel | - |

---

## COMMANDES

```bash
# Développement
npm run dev          # Port 3000

# Production
npm run build        # Build
npm run start        # Serveur prod

# Qualité
npm run lint         # ESLint
```

---

## SESSIONS

### Session 10 - 2026-02-03

- Audit complète du projet
- Suppression legacy (228 fichiers, 148K lignes)
- Déplacement skali-admin/ vers racine
- Build vérifié: `npm run build` ✅
- Prêt pour Vercel

### Session 11 - 2026-02-03

- **Réorganisation menu sidebar:**
  - Dashboard (seul)
  - Navigation: Planning, Adhérents, TeamBuilder, TV Mode, Performance
  - CRM (seul)
  - Outils: PWA Config, Settings, Inventory, Discord
- **Responsive mobile:** MobileNav avec Sheet, header mobile fixe
- **Page PWA Config:** Configuration complète de l'app adhérents
  - Modules à activer/désactiver
  - Branding (couleurs, nom)
  - Navigation bottom bar
  - Features (push, offline, biometric)
- Build vérifié ✅

### Session 12 - 2026-02-03

- **Refonte complète du calendrier:**
  - **Templates hebdomadaires:** Créer des semaines-type avec titre + catégorie par jour
  - **Appliquer un template:** Génère les séances pour une semaine entière
  - **Système de blocs:** Chaque séance peut avoir des blocs (Échauffement, Force, WOD, Skill, Accessoire, Cooldown, Custom)
  - **Blocs modifiables:** Déplacer, dupliquer, supprimer les blocs
  - **Duplication de séances:** Bouton copie pour dupliquer au jour suivant
- **Migration SQL:** `008_week_templates.sql` pour table `week_templates`
- **Types ajoutés:** `WeekTemplate`, `WeekTemplateDay`, `SessionBlock`, `BlockType`, `BLOCK_TYPE_CONFIG`
- Build vérifié ✅
- **À faire dans Supabase:**
  - Exécuter `docs/sql/migrations/008_week_templates.sql`
  - Décaler les séances: `UPDATE sessions SET date = date + INTERVAL '1 day';`

### Session 13 - 2026-02-04

- **Audit sécurité et nettoyage code:**
  - **Suppression passwords hardcodés:** `roles.ts` ne contient plus de mots de passe
  - **Auth sécurisée:** Login vérifie les passwords depuis Supabase (table `settings`)
  - **Suppression mock data CRM:** Plus de données fictives, uniquement Supabase
  - **Nettoyage portal-store:** Plus de mock members, recherche via API
  - **Auth-store sans localStorage:** Session uniquement via cookie httpOnly
  - **API session unifiée:** Gère admin + portal sessions
- **Migration SQL:** `009_auth_passwords.sql` pour stocker les passwords
- Build vérifié ✅
- **À faire dans Supabase:**
  - Exécuter `docs/sql/migrations/009_auth_passwords.sql`
  - **IMPORTANT:** Changer les mots de passe par défaut!
  - Ajouter `SUPABASE_SERVICE_ROLE_KEY` dans Vercel

### Session 14 - 2026-02-04

- **Refonte complète système liaison Discord ↔ Adhérents:**
  - **Flow en 2 étapes:** Discord OAuth → Recherche membre → Liaison compte
  - **Migration SQL:** `010_discord_members_linking.sql`
    - Table `discord_members` avec liaison vers `members`
    - View `discord_members_full` pour jointure complète
    - RPC `link_discord_to_member()` - lier un compte
    - RPC `unlink_discord_from_member()` - délier un compte
    - RPC `search_members_for_linking()` - rechercher membres actifs
    - RPC `get_member_for_portal()` - récupérer membre avec stats
  - **Nouvelles API routes:**
    - `/api/members/search` - recherche membres pour liaison
    - `/api/members/link-discord` - liaison Discord ↔ Membre
    - `/api/members/[id]` - récupérer détails membre
  - **PortalLogin refait:** UI 2 étapes claire, recherche avec badges
  - **Discord callback amélioré:** Vérifie liaison existante
- **Refonte page admin Discord:**
  - UI plus propre avec stats cards
  - 3 onglets: Liaison Membres, Configuration, Notifications
  - Config sauvegardée dans Supabase (table `settings`)
  - Quick link vers portail PWA
- Build vérifié ✅
- **À faire dans Supabase:**
  - Exécuter `docs/sql/migrations/010_discord_members_linking.sql`

### Session 15 - 2026-02-04

- **Refonte système de cartes - Univers Épiques:**
  - **Adieu Pokemon, bonjour héros!** Cartes basées sur LotR, Star Wars, Harry Potter, Game of Thrones
  - **Système de tiers:** Légendaire (Aragorn, Gandalf) → Épique (Luke, Obi-Wan) → Rare (Harry, Hermione) → Commun (Jon Snow) → Apprenti (méchants: Vader, Voldemort)
  - **Progression motivante:** Plus performant = héros, débutant = méchants (motivation pour progresser!)
  - **Carte 3D interactive:** Effet gyroscope au mouvement souris/touch, glow selon tier
  - **Backgrounds animés par univers:** Montagnes LotR, étoiles Star Wars, particules magiques HP, neige GoT
  - **Sélecteur d'univers:** L'utilisateur peut choisir son univers préféré
- **Nouveaux fichiers:**
  - `src/config/epic-cards.ts` - Configuration complète des personnages et tiers
  - `src/components/portal/EpicCard.tsx` - Composant carte avec animations 3D
  - `src/app/globals.css` - Animations float, twinkle, pulse-glow
- **Store mis à jour:** `portal-store.ts` supporte le nouveau système (epicCharacter, memberStats)
- **Page portal refaite:** Utilise EpicCard + sélecteur d'univers
- Build vérifié ✅

### Session 16 - 2026-02-04

- **Pages PWA Portail Membre - COMPLÈTES:**
  - **`/portal/planning`** - Calendrier des séances
    - Navigation semaine (prev/next)
    - Mini calendrier avec indicateurs de séances
    - Cartes séances par jour avec heure, type, coach, places
    - Bouton réservation + badge "Inscrit"
    - Scroll smooth vers le jour sélectionné
  - **`/portal/workouts`** - Historique des entraînements
    - Stats rapides (ce mois, temps total, total séances)
    - Filtres par type (Tous, Cross, Muscu, Hyrox)
    - Liste des WODs avec score et badge PR
    - Vue détaillée avec blocs (échauffement, force, WOD, accessoire, cooldown)
  - **`/portal/performance`** - Stats et performances
    - Onglet Carte Epic avec sélecteur d'univers
    - Onglet PRs avec liste des records personnels
    - Onglet Progrès avec stats mensuelles, niveau, XP
    - Barres de progression pour chaque stat
  - **`/portal/profile`** - Profil complet
    - Header avec avatar Discord, badges niveau/séances/PRs
    - Infos personnelles (éditable): email, tel, poids, taille
    - Paramètres notifications (rappels, PRs, actualités)
    - Paramètres confidentialité (leaderboard, partage stats)
    - Déconnexion avec confirmation
- **Nouveaux composants:**
  - `src/components/portal/PortalNav.tsx` - Navigation bottom bar
  - `src/components/portal/PortalHeader.tsx` - Header réutilisable
- **Page d'accueil portal refaite:**
  - Carte Epic Hero en vedette
  - Aperçu prochaine séance du jour
  - Accès rapides vers toutes les pages
  - Stats résumées (niveau, séances, PRs)
- Build vérifié ✅

### Session 17 - 2026-02-04

- **Refonte COMPLETE système de cartes Epic v2:**
  - **Nouveau concept:** Personnages génériques fantasy/sci-fi (pas de copyright!)
  - **Classes de héros:** Warrior, Mage, Ranger, Paladin, Assassin, Berserker, Guardian, Mystic
  - **Raretés:** Legendary (top 5%) → Epic (top 20%) → Rare (50%) → Common (80%) → Starter
  - **Thèmes visuels:** Fire, Ice, Lightning, Nature, Shadow, Light, Cosmic, Blood
- **Effets visuels INCROYABLES:**
  - **Particules animées:** Flammes qui montent, flocons de glace, éclairs dynamiques, étoiles scintillantes
  - **Effet holographique:** Rainbow shimmer + glossy reflection pour cartes Legendary/Epic
  - **Effet 3D gyroscope:** Carte qui suit le mouvement souris/touch avec perspective 3D
  - **Aura pulsante:** Glow animé autour des cartes selon leur rareté
  - **Background images:** Images Unsplash en fond avec overlays gradient
- **Nouveaux fichiers/modifiés:**
  - `src/config/epic-cards.ts` - 16 personnages avec stats, couleurs, effets
  - `src/components/portal/EpicCard.tsx` - Composant refait avec systèmes de particules
  - `src/app/globals.css` - 15+ nouvelles animations CSS (fire-rise, ice-float, holo-shimmer, etc.)
  - `src/stores/portal-store.ts` - Simplifié, utilise nouveau système
  - `next.config.ts` - Support images Unsplash
- **Pages portail mises à jour:**
  - `/portal` - Utilise nouveau EpicCard
  - `/portal/performance` - Affiche carte avec infos personnage
- Build vérifié ✅

### Session 18 - 2026-02-04

- **Connexion PWA aux vraies données Supabase - COMPLET:**
  - **Migration SQL:** `docs/sql/migrations/011_session_participants.sql`
    - Table `session_participants` pour inscriptions aux séances
    - Colonnes ajoutées à `sessions` (coach, time, duration, max_spots)
    - View `sessions_with_spots` pour places restantes
    - RPCs: `get_portal_sessions()`, `get_member_workouts()`, `get_member_prs()`
    - RPC: `calculate_member_stats()` pour stats Epic Card (force, endurance, vitesse, technique, puissance)
    - RPCs: `book_session()`, `cancel_booking()` pour réservations
  - **Nouvelles API routes:**
    - `/api/portal/sessions` - GET séances avec places + POST réservation/annulation
    - `/api/portal/workouts` - GET historique entraînements avec stats
    - `/api/portal/prs` - GET Personal Records avec amélioration calculée
    - `/api/portal/stats` - GET stats pour Epic Card (calcul depuis performances)
  - **Portal Store refactorisé:**
    - `generateMemberStats()` remplacé par `fetchMemberStats()` → API
    - Stats calculées depuis vraies données Supabase
  - **Pages PWA connectées aux vraies données:**
    - `/portal` - Séance du jour depuis API
    - `/portal/planning` - Calendrier séances + réservation réelle
    - `/portal/workouts` - Historique depuis `session_participants`
    - `/portal/performance` - PRs depuis `performances`, stats depuis API
- Build vérifié ✅
- **À faire dans Supabase:**
  - Exécuter `docs/sql/migrations/011_session_participants.sql`

### Session 19 - 2026-02-04

- **Support vidéo pour cartes Epic:**
  - **EpicCard.tsx modifié:** Support vidéo MP4 en background (autoplay, loop, muted)
  - **epic-cards.ts modifié:** Ajout `videoUrl` optionnel + `VPS_VIDEO_BASE_URL` configurable
  - **Variable d'environnement:** `NEXT_PUBLIC_VPS_VIDEO_URL` ajoutée
- **Guide VPS créé:** `docs/VPS-VIDEO-SETUP.md`
  - Installation Nginx sur Ubuntu
  - Configuration serveur statique avec CORS
  - Commandes FFmpeg pour compression vidéo (7-12MB → 500KB-1.5MB)
  - Instructions upload SCP/SFTP
  - Configuration HTTPS optionnelle (Certbot)
- Build vérifié ✅

**Configuration VPS requise:**
1. Connecter SSH au VPS Ubuntu
2. Installer Nginx: `apt install nginx -y`
3. Créer dossier: `mkdir -p /var/www/static/cards`
4. Créer config Nginx: `/etc/nginx/sites-available/static-cards`
5. Compresser vidéos avec FFmpeg (voir guide)
6. Uploader vidéos: `scp *.mp4 root@VPS_IP:/var/www/static/cards/`
7. Ajouter dans `.env.local`: `NEXT_PUBLIC_VPS_VIDEO_URL=http://VPS_IP/cards`

### Session 20 - 2026-02-04

- **Vidéos hébergées sur Vercel (plus simple que VPS):**
  - Dossier créé: `public/videos/cards/`
  - `VIDEO_BASE_URL` utilise `/videos/cards` par défaut (local)
  - Peut toujours utiliser VPS externe via `NEXT_PUBLIC_VPS_VIDEO_URL`
  - `getVideoUrl()` génère automatiquement l'URL depuis l'ID du personnage
  - `EPIC_CHARACTERS` construit dynamiquement avec `videoUrl`
- Build vérifié ✅

**Pour ajouter une vidéo:**
1. Compresser avec FFmpeg: `ffmpeg -i original.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 -vf "scale=720:-2" -an phoenix-lord.webm`
2. Placer dans `public/videos/cards/phoenix-lord.webm`
3. Le personnage avec `id: 'phoenix-lord'` utilisera automatiquement la vidéo
4. Commit + push → Vercel déploie avec les vidéos

---

*Skali Prog - Next.js 16 + Supabase*
*Prêt pour déploiement Vercel*
