# PAUSE-STATE - Skali Prog (Next.js)

> Dernier update: 2026-02-03
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
| Discord | `/discord` | 4 onglets (Notifs, Morning, Liaison, Bot) |
| Inventory | `/inventory` | 4 onglets (Config, Inventaire, Métho, Mouvements) |
| Members | `/members` | Liste, fiche détaillée, édition |
| Calendar | `/calendar` | Vue mois, CRUD sessions |
| Performance | `/performance` | Dashboard, Pokemon cards, classement |
| Teams | `/teams` | TeamBuilder Pro |
| CRM | `/crm` | 8 onglets, gestion leads |
| TV Mode | `/tv` | Affichage 1080p/4K |
| Member Portal | `/portal` | Auth Discord, carte Pokemon |
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

---

*Skali Prog - Next.js 16 + Supabase*
*Prêt pour déploiement Vercel*
