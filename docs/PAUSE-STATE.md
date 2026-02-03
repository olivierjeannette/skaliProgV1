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
| Login | `/login` | Authentification |

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

---

*Skali Prog - Next.js 16 + Supabase*
*Prêt pour déploiement Vercel*
