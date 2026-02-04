# Audit Sécurité Supabase - Skàli Prog

**Date:** 2026-02-04
**Auditeur:** Claude AI (@QA)
**Criticité globale:** HAUTE

---

## Résumé Exécutif

L'audit révèle **plusieurs vulnérabilités critiques** dans la configuration Supabase:
- **11 tables analysées** avec des politiques RLS
- **9 tables avec RLS trop permissives** (USING(true))
- **20+ fonctions SECURITY DEFINER** sans restrictions
- **Données sensibles exposées** (clés API, mots de passe)

---

## 1. Vulnérabilités Critiques

### 1.1 Table `api_keys` - CRITIQUE

**Fichier:** [005c_create_api_keys_table_v2.sql](sql/migrations/005c_create_api_keys_table_v2.sql)

```sql
-- PROBLÈME: Tout le monde peut lire/écrire les clés API !
CREATE POLICY "Admins can view api keys" ON api_keys FOR SELECT USING (true);
CREATE POLICY "Admins can update api keys" ON api_keys FOR UPDATE USING (true);
CREATE POLICY "Admins can insert api keys" ON api_keys FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can delete api keys" ON api_keys FOR DELETE USING (true);
```

**Impact:** N'importe qui avec la clé `anon` peut:
- Lire toutes les clés API (Claude, Discord, Supabase service_role)
- Modifier ou supprimer les clés
- Injection de fausses clés

**Correction:**
```sql
-- Supprimer les policies existantes
DROP POLICY IF EXISTS "Admins can view api keys" ON api_keys;
DROP POLICY IF EXISTS "Admins can update api keys" ON api_keys;
DROP POLICY IF EXISTS "Admins can insert api keys" ON api_keys;
DROP POLICY IF EXISTS "Admins can delete api keys" ON api_keys;

-- AUCUNE policy pour anon/authenticated
-- Accès UNIQUEMENT via service_role ou fonctions SECURITY DEFINER avec vérification
```

---

### 1.2 Table `settings` - CRITIQUE

**Fichier:** [006_create_settings_table.sql](sql/migrations/006_create_settings_table.sql)

```sql
-- PROBLÈME: Mots de passe stockés en clair et accessibles !
INSERT INTO settings (setting_key, setting_value, ...) VALUES
    ('admin_password', 'skaliprog', ...),
    ('coach_password', 'coach2024', ...),
    ('athlete_password', 'athlete2024', ...),
```

```sql
-- PROBLÈME: Policies trop permissives
CREATE POLICY "All settings viewable by admins" ON settings FOR SELECT USING (true);
CREATE POLICY "Settings modifiable by admins" ON settings FOR UPDATE USING (true);
```

**Impact:**
- Mots de passe en clair lisibles par tous
- Possibilité de modifier les mots de passe
- Accès à toutes les configurations sensibles

**Correction:**
```sql
-- 1. Ne JAMAIS stocker de mots de passe dans settings
-- 2. Utiliser bcrypt pour hasher les mots de passe
-- 3. Restreindre l'accès

DROP POLICY IF EXISTS "All settings viewable by admins" ON settings;
DROP POLICY IF EXISTS "Settings modifiable by admins" ON settings;

-- Lecture des settings publics seulement
CREATE POLICY "Public settings only" ON settings
    FOR SELECT USING (is_public = true);

-- Aucune modification depuis le client
-- Utiliser service_role côté serveur
```

---

### 1.3 Table `leads` - HAUTE

**Fichier:** [007_leads_table_structure.sql](sql/migrations/007_leads_table_structure.sql)

```sql
-- PROBLÈME: anon peut lire TOUS les leads !
CREATE POLICY "Enable read for authenticated users" ON public.leads
    FOR SELECT
    USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
```

**Impact:**
- Fuite de données personnelles (emails, téléphones)
- Violation RGPD potentielle
- Données commerciales exposées

**Correction:**
```sql
DROP POLICY IF EXISTS "Enable read for authenticated users" ON leads;

-- Lecture uniquement pour authenticated (pas anon)
CREATE POLICY "Authenticated can read leads" ON leads
    FOR SELECT TO authenticated
    USING (true);

-- Garder insert pour anon (formulaires publics)
-- MAIS ajouter rate limiting côté API
```

---

### 1.4 Tables avec USING(true) - Globalement Ouvertes

| Table | SELECT | INSERT | UPDATE | DELETE | Risque |
|-------|--------|--------|--------|--------|--------|
| `api_keys` | true | true | true | true | CRITIQUE |
| `settings` | true | true | true | true | CRITIQUE |
| `week_templates` | true | true | true | true | HAUTE |
| `discord_members` | true | true | true | - | MOYENNE |
| `session_participants` | true | true | true | true | MOYENNE |
| `personal_workouts` | true | true | true | true | MOYENNE |
| `app_errors` | true* | true | true | true | BASSE |
| `tasks` | true | true | true | true | BASSE |
| `peppy_sessions` | true | true | true | - | BASSE |

*Les tables avec `USING(true)` ou `WITH CHECK(true)` sont **ouvertes à tous**.

---

## 2. Fonctions SECURITY DEFINER Sans Vérification

Les fonctions `SECURITY DEFINER` s'exécutent avec les droits du créateur (généralement `postgres`), contournant RLS.

### Fonctions à risque:

| Fonction | Fichier | Risque |
|----------|---------|--------|
| `log_error()` | 013 | BASSE - OK pour logging |
| `get_dashboard_stats()` | 013 | HAUTE - Expose stats sensibles |
| `get_today_sessions()` | 013 | MOYENNE |
| `get_recent_prs()` | 013 | MOYENNE |
| `link_discord_to_member()` | 010 | HAUTE - Peut lier n'importe qui |
| `unlink_discord_from_member()` | 010 | HAUTE |
| `search_members_for_linking()` | 010 | HAUTE - Expose liste membres |
| `get_member_for_portal()` | 010 | HAUTE - Expose données membres |
| `book_session()` | 011 | MOYENNE - Peut réserver pour autrui |
| `cancel_booking()` | 011 | MOYENNE |
| `calculate_member_stats()` | 011 | MOYENNE |
| `create_personal_workout()` | 012 | MOYENNE |
| `update_personal_workout()` | 012 | BASSE - Vérifie ownership |
| `delete_personal_workout()` | 012 | BASSE - Vérifie ownership |

**Problème commun:** Aucune vérification de l'identité de l'appelant.

**Correction type:**
```sql
CREATE OR REPLACE FUNCTION link_discord_to_member(
  p_discord_id TEXT,
  p_member_id UUID,
  p_linked_by TEXT DEFAULT 'portal'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller_role TEXT;
BEGIN
  -- Vérifier le rôle de l'appelant
  v_caller_role := current_setting('request.jwt.claims', true)::json->>'role';

  IF v_caller_role NOT IN ('service_role', 'authenticated') THEN
    RETURN json_build_object('success', false, 'error', 'UNAUTHORIZED');
  END IF;

  -- ... reste de la logique
END;
$$;
```

---

## 3. Problèmes d'Architecture

### 3.1 Pas d'authentification Supabase Auth

Le projet utilise une authentification custom basée sur des mots de passe simples stockés dans `settings`:
- Pas de tokens JWT sécurisés
- Pas de sessions Supabase
- `auth.role()` retourne toujours `anon` ou `authenticated` sans distinction user

### 3.2 Client Anon Key Exposée

```typescript
// src/lib/supabase/client.ts
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!  // Visible côté client
  );
}
```

C'est normal pour Supabase, MAIS les policies RLS doivent être restrictives car la clé anon est publique.

### 3.3 Tables Sans Migrations (Probablement Existantes)

Ces tables sont utilisées dans le code mais n'ont pas de migrations visibles:
- `members` - Données personnelles membres
- `sessions` - Planning des séances
- `performances` - PRs et performances
- `equipment` - Inventaire

**Risque:** Si elles n'ont pas de RLS, elles sont complètement ouvertes.

---

## 4. Recommandations Par Priorité

### P0 - Critique (À faire immédiatement)

1. **Verrouiller `api_keys`**
   ```sql
   -- Supprimer TOUTES les policies
   DROP POLICY IF EXISTS "Admins can view api keys" ON api_keys;
   DROP POLICY IF EXISTS "Admins can update api keys" ON api_keys;
   DROP POLICY IF EXISTS "Admins can insert api keys" ON api_keys;
   DROP POLICY IF EXISTS "Admins can delete api keys" ON api_keys;

   -- Table accessible uniquement via service_role
   ```

2. **Supprimer les mots de passe de `settings`**
   ```sql
   DELETE FROM settings WHERE setting_key LIKE 'auth_password%';
   DELETE FROM settings WHERE setting_key LIKE '%_password';
   ```

3. **Restreindre `settings`**
   ```sql
   DROP POLICY IF EXISTS "All settings viewable by admins" ON settings;
   DROP POLICY IF EXISTS "Settings modifiable by admins" ON settings;
   DROP POLICY IF EXISTS "Settings insertable by admins" ON settings;
   DROP POLICY IF EXISTS "Settings deletable by admins" ON settings;

   -- Lecture settings publics seulement
   CREATE POLICY "Read public settings" ON settings
       FOR SELECT USING (is_public = true);
   ```

4. **Corriger `leads` - Retirer anon du SELECT**
   ```sql
   DROP POLICY IF EXISTS "Enable read for authenticated users" ON leads;

   CREATE POLICY "Authenticated read leads" ON leads
       FOR SELECT TO authenticated USING (true);
   ```

### P1 - Haute (Cette semaine)

5. **Vérifier/Créer RLS pour `members`, `sessions`, `performances`**
   ```sql
   -- Pour chaque table, vérifier:
   SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

   -- Si RLS non activé:
   ALTER TABLE members ENABLE ROW LEVEL SECURITY;
   -- Puis créer des policies restrictives
   ```

6. **Ajouter vérifications dans les fonctions SECURITY DEFINER**
   - Vérifier le JWT ou un token d'authentification
   - Logger les appels sensibles

7. **Restreindre `week_templates`**
   ```sql
   DROP POLICY IF EXISTS "Allow all operations on week_templates" ON week_templates;

   CREATE POLICY "Read templates" ON week_templates FOR SELECT USING (true);
   CREATE POLICY "Admin write templates" ON week_templates
       FOR ALL TO authenticated USING (true) WITH CHECK (true);
   ```

### P2 - Moyenne (Ce mois)

8. **Migrer vers Supabase Auth**
   - Créer des utilisateurs Supabase réels
   - Utiliser les metadata pour les rôles (admin, coach, athlete)
   - Les policies pourront utiliser `auth.uid()` et `auth.jwt()`

9. **Restreindre les tables de données utilisateur**
   ```sql
   -- Exemple pour personal_workouts
   DROP POLICY IF EXISTS personal_workouts_select ON personal_workouts;

   CREATE POLICY "Users see own workouts" ON personal_workouts
       FOR SELECT USING (
           member_id IN (
               SELECT id FROM members
               WHERE discord_id = current_setting('request.jwt.claims', true)::json->>'discord_id'
           )
       );
   ```

10. **Audit logging**
    - Logger tous les accès aux tables sensibles
    - Alerter sur les patterns suspects

---

## 5. Script de Correction Immédiate

Créer et exécuter cette migration:

```sql
-- Migration 014: Security Hardening
-- Date: 2026-02-04
-- CRITIQUE: Exécuter immédiatement

-- ========================================
-- 1. VERROUILLER api_keys
-- ========================================

DROP POLICY IF EXISTS "Admins can view api keys" ON api_keys;
DROP POLICY IF EXISTS "Admins can update api keys" ON api_keys;
DROP POLICY IF EXISTS "Admins can insert api keys" ON api_keys;
DROP POLICY IF EXISTS "Admins can delete api keys" ON api_keys;

-- Aucune policy = service_role uniquement

-- ========================================
-- 2. NETTOYER settings
-- ========================================

-- Supprimer les mots de passe (seront dans variables d'env)
DELETE FROM settings WHERE setting_key IN (
    'admin_password', 'coach_password', 'athlete_password',
    'auth_password_admin', 'auth_password_coach', 'auth_password_athlete'
);

-- Reconfigurer les policies
DROP POLICY IF EXISTS "Public settings viewable by all" ON settings;
DROP POLICY IF EXISTS "All settings viewable by admins" ON settings;
DROP POLICY IF EXISTS "Settings modifiable by admins" ON settings;
DROP POLICY IF EXISTS "Settings insertable by admins" ON settings;
DROP POLICY IF EXISTS "Settings deletable by admins" ON settings;

-- Seuls les settings publics sont lisibles
CREATE POLICY "Read public settings only" ON settings
    FOR SELECT USING (is_public = true);

-- ========================================
-- 3. CORRIGER leads
-- ========================================

DROP POLICY IF EXISTS "Enable read for authenticated users" ON leads;

CREATE POLICY "Authenticated read leads" ON leads
    FOR SELECT TO authenticated
    USING (true);

-- ========================================
-- 4. RESTREINDRE week_templates
-- ========================================

DROP POLICY IF EXISTS "Allow all operations on week_templates" ON week_templates;

CREATE POLICY "Anyone can read templates" ON week_templates
    FOR SELECT USING (true);

CREATE POLICY "Authenticated can manage templates" ON week_templates
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update templates" ON week_templates
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated can delete templates" ON week_templates
    FOR DELETE TO authenticated USING (true);

-- ========================================
-- VÉRIFICATION
-- ========================================

SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

## 6. Checklist de Validation

Après corrections, vérifier:

- [ ] `api_keys` inaccessible depuis le client (erreur RLS)
- [ ] `settings` ne retourne que les settings publics
- [ ] `leads` inaccessible en mode anon
- [ ] Les fonctions SECURITY DEFINER vérifient l'authentification
- [ ] Aucun mot de passe en clair dans la base
- [ ] Toutes les tables ont RLS activé

---

## 7. Ressources

- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/going-into-prod)
- [OWASP API Security](https://owasp.org/www-project-api-security/)

---

*Rapport généré par Claude AI - Session 23*
