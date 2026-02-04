-- Migration 014: Security Hardening
-- Date: 2026-02-04
-- Description: Correction des vulnérabilités RLS critiques
-- CRITIQUE: Exécuter immédiatement !

-- ========================================
-- 1. VERROUILLER api_keys (CRITIQUE)
-- ========================================
-- Les clés API ne doivent JAMAIS être accessibles depuis le client

DROP POLICY IF EXISTS "Admins can view api keys" ON api_keys;
DROP POLICY IF EXISTS "Admins can update api keys" ON api_keys;
DROP POLICY IF EXISTS "Admins can insert api keys" ON api_keys;
DROP POLICY IF EXISTS "Admins can delete api keys" ON api_keys;

-- Sans policy, seul service_role peut accéder
-- C'est le comportement voulu pour les clés API

-- ========================================
-- 2. NETTOYER settings (CRITIQUE)
-- ========================================
-- Supprimer les mots de passe stockés en clair

DELETE FROM settings WHERE setting_key IN (
    'admin_password',
    'coach_password',
    'athlete_password',
    'auth_password_admin',
    'auth_password_coach',
    'auth_password_athlete'
);

-- Reconfigurer les policies - seuls les settings publics sont lisibles
DROP POLICY IF EXISTS "Public settings viewable by all" ON settings;
DROP POLICY IF EXISTS "All settings viewable by admins" ON settings;
DROP POLICY IF EXISTS "Settings modifiable by admins" ON settings;
DROP POLICY IF EXISTS "Settings insertable by admins" ON settings;
DROP POLICY IF EXISTS "Settings deletable by admins" ON settings;

-- Nouvelle policy restrictive
CREATE POLICY "Read public settings only" ON settings
    FOR SELECT USING (is_public = true);

-- ========================================
-- 3. CORRIGER leads (HAUTE)
-- ========================================
-- Les leads ne doivent pas être lisibles par anon

DROP POLICY IF EXISTS "Enable read for authenticated users" ON leads;

-- Seuls les utilisateurs authentifiés peuvent lire
CREATE POLICY "Authenticated read leads" ON leads
    FOR SELECT TO authenticated
    USING (true);

-- Garder insert pour anon (formulaires publics)
-- Policy existante: "Enable insert for anon users"

-- ========================================
-- 4. RESTREINDRE week_templates (MOYENNE)
-- ========================================

DROP POLICY IF EXISTS "Allow all operations on week_templates" ON week_templates;

-- Lecture publique OK
CREATE POLICY "Anyone can read templates" ON week_templates
    FOR SELECT USING (true);

-- Écriture réservée aux authentifiés
CREATE POLICY "Authenticated can insert templates" ON week_templates
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update templates" ON week_templates
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated can delete templates" ON week_templates
    FOR DELETE TO authenticated USING (true);

-- ========================================
-- 5. VÉRIFIER members, sessions, performances
-- ========================================
-- Ces tables existent probablement déjà - vérifier leur RLS

DO $$
BEGIN
    -- members
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'members' AND schemaname = 'public') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'members' AND rowsecurity = true) THEN
            ALTER TABLE members ENABLE ROW LEVEL SECURITY;
            RAISE NOTICE 'RLS activé sur members';
        END IF;
    END IF;

    -- sessions
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'sessions' AND schemaname = 'public') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'sessions' AND rowsecurity = true) THEN
            ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
            RAISE NOTICE 'RLS activé sur sessions';
        END IF;
    END IF;

    -- performances
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'performances' AND schemaname = 'public') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'performances' AND rowsecurity = true) THEN
            ALTER TABLE performances ENABLE ROW LEVEL SECURITY;
            RAISE NOTICE 'RLS activé sur performances';
        END IF;
    END IF;

    -- equipment
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'equipment' AND schemaname = 'public') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'equipment' AND rowsecurity = true) THEN
            ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
            RAISE NOTICE 'RLS activé sur equipment';
        END IF;
    END IF;
END $$;

-- ========================================
-- 6. POLICIES POUR TABLES EXISTANTES
-- ========================================

-- members - lecture publique, écriture authentifiée
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'members' AND schemaname = 'public') THEN
        -- Supprimer policies existantes si présentes
        DROP POLICY IF EXISTS "Anyone can read members" ON members;
        DROP POLICY IF EXISTS "Authenticated can manage members" ON members;

        -- Nouvelles policies
        CREATE POLICY "Anyone can read members" ON members
            FOR SELECT USING (true);

        CREATE POLICY "Authenticated can manage members" ON members
            FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;

-- sessions - lecture publique, écriture authentifiée
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'sessions' AND schemaname = 'public') THEN
        DROP POLICY IF EXISTS "Anyone can read sessions" ON sessions;
        DROP POLICY IF EXISTS "Authenticated can manage sessions" ON sessions;

        CREATE POLICY "Anyone can read sessions" ON sessions
            FOR SELECT USING (true);

        CREATE POLICY "Authenticated can manage sessions" ON sessions
            FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;

-- performances - lecture publique, écriture authentifiée
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'performances' AND schemaname = 'public') THEN
        DROP POLICY IF EXISTS "Anyone can read performances" ON performances;
        DROP POLICY IF EXISTS "Authenticated can manage performances" ON performances;

        CREATE POLICY "Anyone can read performances" ON performances
            FOR SELECT USING (true);

        CREATE POLICY "Authenticated can manage performances" ON performances
            FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;

-- equipment - lecture publique, écriture authentifiée
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'equipment' AND schemaname = 'public') THEN
        DROP POLICY IF EXISTS "Anyone can read equipment" ON equipment;
        DROP POLICY IF EXISTS "Authenticated can manage equipment" ON equipment;

        CREATE POLICY "Anyone can read equipment" ON equipment
            FOR SELECT USING (true);

        CREATE POLICY "Authenticated can manage equipment" ON equipment
            FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;

-- ========================================
-- 7. VÉRIFICATION FINALE
-- ========================================

SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Lister toutes les policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ========================================
-- NOTES IMPORTANTES
-- ========================================

/*
APRÈS CETTE MIGRATION:

1. Les clés API sont inaccessibles depuis le client
   → Utiliser uniquement via API routes avec service_role

2. Les mots de passe sont supprimés de la base
   → Utiliser des variables d'environnement:
   - AUTH_PASSWORD_ADMIN
   - AUTH_PASSWORD_COACH
   - AUTH_PASSWORD_ATHLETE

3. Les leads ne sont plus lisibles en mode anonyme
   → OK pour la sécurité des données personnelles

4. Vérifier que l'app fonctionne toujours:
   - [ ] Dashboard admin
   - [ ] CRM (leads)
   - [ ] Calendar (sessions)
   - [ ] Performances
   - [ ] Portal membre

5. Pour les API routes qui lisent api_keys/settings:
   → Créer un client avec service_role:

   import { createClient } from '@supabase/supabase-js';
   const supabaseAdmin = createClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.SUPABASE_SERVICE_ROLE_KEY!
   );
*/

-- ========================================
-- ROLLBACK (si problème)
-- ========================================

/*
-- Restaurer api_keys (DÉCONSEILLÉ)
CREATE POLICY "Admins can view api keys" ON api_keys FOR SELECT USING (true);
CREATE POLICY "Admins can update api keys" ON api_keys FOR UPDATE USING (true);
CREATE POLICY "Admins can insert api keys" ON api_keys FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can delete api keys" ON api_keys FOR DELETE USING (true);

-- Restaurer settings (DÉCONSEILLÉ)
DROP POLICY IF EXISTS "Read public settings only" ON settings;
CREATE POLICY "All settings viewable by admins" ON settings FOR SELECT USING (true);
CREATE POLICY "Settings modifiable by admins" ON settings FOR UPDATE USING (true);

-- Restaurer leads (DÉCONSEILLÉ)
DROP POLICY IF EXISTS "Authenticated read leads" ON leads;
CREATE POLICY "Enable read for authenticated users" ON public.leads
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
*/
