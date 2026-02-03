# Architecture - Skali Admin

> Version: 1.0
> Date: 2026-02-03
> Agent: @ARCH (Alex)
> Status: **EN ATTENTE VALIDATION**
> Basé sur: [prd.md](prd.md)

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Next.js App (skali-admin)                   │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │   │
│  │  │  Pages   │  │Components│  │  Stores  │  │  Hooks  │ │   │
│  │  │ (App     │  │(shadcn/ui│  │ (Zustand)│  │(Custom) │ │   │
│  │  │  Router) │  │+ custom) │  │          │  │         │ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Next.js API Routes                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────────┐ │
│  │  /auth   │  │/api-keys │  │ /discord │  │  /inventory     │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│    Supabase      │ │   Discord API    │ │   Claude API     │
│  (PostgreSQL)    │ │   (Webhooks)     │ │   (AI Gen)       │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

---

## 2. Tech Stack

### Frontend

| Layer | Technology | Version | Justification |
|-------|------------|---------|---------------|
| Framework | Next.js | 14+ | App Router, SSR, API routes intégrées |
| Language | TypeScript | 5+ | Type safety, meilleure DX |
| Styling | Tailwind CSS | 3.4+ | Utility-first, déjà utilisé |
| UI Components | shadcn/ui | latest | Accessible, customisable, moderne |
| Icons | Lucide React | latest | Cohérent avec shadcn/ui |
| State Management | Zustand | 4.4+ | Léger, simple, pattern existant |
| Data Fetching | TanStack Query | 5+ | Caching, mutations, invalidation |
| Forms | React Hook Form | 7+ | Performance, validation |
| Validation | Zod | 3+ | Type-safe schema validation |

### Backend

| Layer | Technology | Version | Justification |
|-------|------------|---------|---------------|
| API | Next.js API Routes | 14+ | Intégré, serverless |
| Database | Supabase | v2 | Existant, PostgreSQL |
| Auth | Custom + Supabase | - | Reproduire système 3 rôles existant |
| External APIs | Discord, Claude | - | Intégrations existantes |

### Infrastructure

| Service | Provider | Purpose |
|---------|----------|---------|
| Hosting | Vercel | Frontend + API routes |
| Database | Supabase Cloud | PostgreSQL + Realtime |
| CDN | Vercel Edge | Assets statiques |
| Monitoring | Vercel Analytics | Performance |

---

## 3. Project Structure

```
skali-admin/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Route group: Auth
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (admin)/                  # Route group: Admin (protégé)
│   │   │   ├── layout.tsx            # Layout avec sidebar
│   │   │   ├── page.tsx              # Redirect → dashboard
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx          # Settings overview
│   │   │   │   └── api-keys/
│   │   │   │       └── page.tsx
│   │   │   ├── discord/
│   │   │   │   └── page.tsx          # 4 onglets (tabs)
│   │   │   ├── inventory/
│   │   │   │   └── page.tsx
│   │   │   ├── members/
│   │   │   │   ├── page.tsx          # Liste
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Détail
│   │   │   └── calendar/
│   │   │       └── page.tsx
│   │   │
│   │   ├── api/                      # API Routes
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── logout/route.ts
│   │   │   │   └── session/route.ts
│   │   │   ├── api-keys/
│   │   │   │   └── route.ts
│   │   │   ├── discord/
│   │   │   │   ├── webhook/route.ts
│   │   │   │   ├── members/route.ts
│   │   │   │   └── link/route.ts
│   │   │   ├── inventory/
│   │   │   │   └── route.ts
│   │   │   ├── members/
│   │   │   │   └── route.ts
│   │   │   └── sessions/
│   │   │       └── route.ts
│   │   │
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home → redirect
│   │   ├── globals.css
│   │   └── not-found.tsx
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── table.tsx
│   │   │   ├── badge.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── AdminHeader.tsx
│   │   │   ├── MobileMenu.tsx
│   │   │   └── RoleIndicator.tsx
│   │   │
│   │   ├── forms/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── APIKeyForm.tsx
│   │   │   ├── EquipmentForm.tsx
│   │   │   └── MemberForm.tsx
│   │   │
│   │   └── features/
│   │       ├── api-keys/
│   │       │   ├── APIKeyCard.tsx
│   │       │   └── APIKeyList.tsx
│   │       ├── discord/
│   │       │   ├── NotificationsTab.tsx
│   │       │   ├── MorningCoachTab.tsx
│   │       │   ├── LiaisonTab.tsx
│   │       │   ├── BotControlsTab.tsx
│   │       │   └── DiscordMemberCard.tsx
│   │       ├── inventory/
│   │       │   ├── EquipmentList.tsx
│   │       │   └── CategoryTabs.tsx
│   │       └── members/
│   │           ├── MemberCard.tsx
│   │           └── MemberTable.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # Browser client
│   │   │   ├── server.ts             # Server client
│   │   │   └── middleware.ts         # Auth middleware
│   │   │
│   │   ├── auth/
│   │   │   ├── session.ts            # Session management
│   │   │   ├── permissions.ts        # Role-based permissions
│   │   │   └── constants.ts          # Roles config
│   │   │
│   │   ├── discord/
│   │   │   ├── webhook.ts            # Send notifications
│   │   │   └── api.ts                # Discord API calls
│   │   │
│   │   └── utils/
│   │       ├── cn.ts                 # Tailwind merge
│   │       ├── format.ts             # Date/number formatting
│   │       └── validation.ts         # Zod schemas
│   │
│   ├── stores/
│   │   ├── auth-store.ts
│   │   ├── settings-store.ts
│   │   ├── discord-store.ts
│   │   ├── inventory-store.ts
│   │   └── ui-store.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── usePermissions.ts
│   │   ├── useAPIKeys.ts
│   │   └── useDiscord.ts
│   │
│   ├── types/
│   │   ├── index.ts
│   │   ├── auth.ts
│   │   ├── member.ts
│   │   ├── session.ts
│   │   ├── discord.ts
│   │   ├── inventory.ts
│   │   └── api.ts
│   │
│   └── config/
│       ├── navigation.ts             # Sidebar items
│       ├── api-keys.ts               # API keys config
│       └── roles.ts                  # Permissions
│
├── public/
│   ├── images/
│   │   └── logo-skali.svg
│   └── fonts/
│
├── .env.local                        # Variables environnement
├── .env.example                      # Template
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 4. Data Model

### Tables Existantes (Supabase)

```
[members]
├── id: UUID (PK)
├── name: TEXT
├── email: TEXT
├── weight: DECIMAL
├── body_fat_percentage: DECIMAL
├── phone: TEXT
├── is_active: BOOLEAN
├── created_at: TIMESTAMP
└── updated_at: TIMESTAMP

[sessions]
├── id: UUID (PK)
├── date: DATE
├── type: TEXT
├── category: TEXT
├── duration: INTEGER
├── exercises: JSONB
├── created_by: UUID (FK → members)
└── created_at: TIMESTAMP

[api_keys]
├── id: UUID (PK)
├── key_name: TEXT (UNIQUE)
├── key_value: TEXT
├── created_at: TIMESTAMP
└── updated_at: TIMESTAMP

[settings]
├── id: UUID (PK)
├── setting_key: TEXT (UNIQUE)
├── setting_value: TEXT
├── setting_type: TEXT
├── category: TEXT
├── is_public: BOOLEAN
└── updated_at: TIMESTAMP

[discord_members]
├── id: UUID (PK)
├── discord_id: TEXT (UNIQUE)
├── discord_username: TEXT
├── discord_avatar: TEXT
├── member_id: UUID (FK → members, NULLABLE)
├── is_active: BOOLEAN
├── last_sync: TIMESTAMP
└── created_at: TIMESTAMP
```

### Tables À Créer

```sql
-- Equipment table (si n'existe pas)
CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    condition TEXT DEFAULT 'good',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Methodologies table (si n'existe pas)
CREATE TABLE IF NOT EXISTS methodologies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 5. Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Login     │     │  API Route  │     │  Supabase   │
│   Page      │────▶│  /auth/login│────▶│  (verify)   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           │ Set Cookie
                           ▼
                    ┌─────────────┐
                    │  Session    │
                    │  Cookie     │
                    │  (httpOnly) │
                    └─────────────┘
                           │
                           │ On each request
                           ▼
                    ┌─────────────┐
                    │ Middleware  │
                    │ (verify     │
                    │  session)   │
                    └─────────────┘
```

### Session Structure

```typescript
interface Session {
  isAuthenticated: boolean;
  role: 'ADMIN' | 'COACH' | 'ATHLETE';
  userId?: string;
  expiresAt: number;
}
```

### Permissions Config

```typescript
// src/config/roles.ts
export const ROLES = {
  ADMIN: {
    label: 'Administrateur',
    color: '#dc2626',
    permissions: ['all'],
    canAccess: ['/admin/*'],
  },
  COACH: {
    label: 'Coach',
    color: '#2563eb',
    permissions: [
      'view_members',
      'edit_members',
      'view_sessions',
      'edit_sessions',
      'view_calendar',
    ],
    canAccess: ['/admin/members', '/admin/calendar', '/admin/dashboard'],
  },
  ATHLETE: {
    label: 'Athlète',
    color: '#059669',
    permissions: ['view_own_data'],
    canAccess: [], // No admin access
  },
} as const;
```

---

## 6. API Design

### Authentication

| Method | Route | Description | Body | Response |
|--------|-------|-------------|------|----------|
| POST | /api/auth/login | Login | `{ role, password }` | `{ success, session }` |
| POST | /api/auth/logout | Logout | - | `{ success }` |
| GET | /api/auth/session | Get session | - | `{ session }` |

### API Keys

| Method | Route | Description | Body | Response |
|--------|-------|-------------|------|----------|
| GET | /api/api-keys | List all | - | `{ keys: Record<string, string> }` |
| POST | /api/api-keys | Save key | `{ name, value }` | `{ success }` |
| POST | /api/api-keys/test | Test key | `{ name }` | `{ success, message }` |

### Discord

| Method | Route | Description | Body | Response |
|--------|-------|-------------|------|----------|
| POST | /api/discord/webhook | Send notification | `{ message, embed? }` | `{ success }` |
| GET | /api/discord/members | List Discord members | - | `{ members[] }` |
| POST | /api/discord/link | Link member | `{ discordId, memberId }` | `{ success }` |
| POST | /api/discord/sync | Sync from Discord | - | `{ added, updated }` |

### Inventory

| Method | Route | Description | Body | Response |
|--------|-------|-------------|------|----------|
| GET | /api/inventory | List equipment | `?category=` | `{ equipment[] }` |
| POST | /api/inventory | Create | `{ name, category, ... }` | `{ equipment }` |
| PUT | /api/inventory/[id] | Update | `{ name, ... }` | `{ equipment }` |
| DELETE | /api/inventory/[id] | Delete | - | `{ success }` |

### Members

| Method | Route | Description | Body | Response |
|--------|-------|-------------|------|----------|
| GET | /api/members | List | `?search=&active=` | `{ members[], total }` |
| GET | /api/members/[id] | Get one | - | `{ member }` |
| PUT | /api/members/[id] | Update | `{ name, ... }` | `{ member }` |
| POST | /api/members/import | Import CSV | FormData | `{ created, updated }` |

---

## 7. State Management

### Stores Zustand

```typescript
// src/stores/auth-store.ts
interface AuthState {
  session: Session | null;
  isLoading: boolean;
  login: (role: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

// src/stores/settings-store.ts
interface SettingsState {
  apiKeys: Record<string, string>;
  isLoading: boolean;
  loadAPIKeys: () => Promise<void>;
  saveAPIKey: (name: string, value: string) => Promise<boolean>;
  testAPIKey: (name: string) => Promise<TestResult>;
}

// src/stores/discord-store.ts
interface DiscordState {
  members: DiscordMember[];
  currentTab: 'notifications' | 'morning' | 'liaison' | 'bot';
  loadMembers: () => Promise<void>;
  linkMember: (discordId: string, memberId: string) => Promise<boolean>;
  sendNotification: (message: string) => Promise<boolean>;
}

// src/stores/inventory-store.ts
interface InventoryState {
  equipment: Equipment[];
  categories: string[];
  currentCategory: string | null;
  loadEquipment: () => Promise<void>;
  createEquipment: (data: CreateEquipmentDTO) => Promise<Equipment>;
  updateEquipment: (id: string, data: UpdateEquipmentDTO) => Promise<Equipment>;
  deleteEquipment: (id: string) => Promise<boolean>;
}
```

---

## 8. Security Considerations

| Concern | Solution |
|---------|----------|
| Auth | Session cookie httpOnly, secure, sameSite=strict |
| API Protection | Middleware vérifie session sur /api/* |
| Role-based access | Permissions vérifiées côté serveur |
| API Keys storage | Chiffrées dans Supabase (RLS) |
| XSS | React escaping par défaut |
| CSRF | SameSite cookies |
| Input validation | Zod schemas côté serveur |

---

## 9. Deployment

### Vercel Configuration

```json
// vercel.json
{
  "framework": "nextjs",
  "regions": ["cdg1"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-role-key"
  }
}
```

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Auth
AUTH_SECRET=random-secret-for-session-encryption

# Discord
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
DISCORD_BOT_TOKEN=...

# Claude (pour Morning Coach AI)
CLAUDE_API_KEY=sk-ant-...
```

---

## 10. Technical Decisions Log

| Decision | Options | Choice | Rationale |
|----------|---------|--------|-----------|
| Auth | NextAuth vs Custom | **Custom** | Reproduire système 3 rôles existant |
| State | Redux vs Zustand | **Zustand** | Plus simple, pattern existant |
| UI | MUI vs shadcn/ui | **shadcn/ui** | Choix utilisateur, moderne |
| Forms | Formik vs RHF | **React Hook Form** | Performance, moins de re-renders |
| Validation | Yup vs Zod | **Zod** | Type inference, moderne |

---

## 11. Risks & Mitigations

| Risk | Level | Mitigation |
|------|-------|------------|
| Session sync ancien/nouveau code | Medium | Cookie partagé, même domaine |
| Tables manquantes Supabase | Low | Scripts migration SQL |
| Performance avec beaucoup de membres | Low | Pagination, virtualization |
| Discord API rate limits | Low | Queue de notifications |

---

## Validation

**⏸️ CHECKPOINT:** Cette architecture nécessite validation avant de générer les stories.

Questions :
1. La structure de dossiers est-elle claire ?
2. L'auth custom (vs NextAuth) est-elle OK ?
3. Les tables Supabase existantes correspondent-elles ?

---

*Architecture v1.0 - BMAD Process*
*Skali Admin Migration*
