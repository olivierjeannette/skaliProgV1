/*
 * Migration: Create Settings Table
 * Date: 2025-01-15
 * Author: Team Skali
 * Description: Crée la table settings pour stocker TOUTES les préférences et configurations
 *              Cette table complète api_keys pour gérer tout ce qui n'est pas une clé API
 */

-- ====================
-- ÉTAPE 1 : CRÉER LA TABLE SETTINGS
-- ====================

CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type TEXT DEFAULT 'text', -- 'text', 'number', 'boolean', 'json'
    category TEXT, -- 'general', 'auth', 'crm', 'theme', 'discord', 'supabase'
    description TEXT,
    is_public BOOLEAN DEFAULT false, -- Si true, accessible à tous (ex: thème)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================
-- ÉTAPE 2 : INDEX
-- ====================

CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);

-- ====================
-- ÉTAPE 3 : TRIGGER AUTO-UPDATE
-- ====================

CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_settings_updated_at ON settings;

CREATE TRIGGER trigger_update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_settings_updated_at();

-- ====================
-- ÉTAPE 4 : INSÉRER LES SETTINGS PAR DÉFAUT
-- ====================

INSERT INTO settings (setting_key, setting_value, setting_type, category, description, is_public) VALUES
    -- GÉNÉRAL
    ('app_name', 'Skali Prog', 'text', 'general', 'Nom de l''application', true),
    ('app_version', '2.4', 'text', 'general', 'Version de l''application', true),
    ('gym_name', 'La Skàli Laval', 'text', 'general', 'Nom de la salle', true),

    -- AUTHENTIFICATION
    ('admin_password', 'skaliprog', 'text', 'auth', 'Mot de passe administrateur', false),
    ('coach_password', 'coach2024', 'text', 'auth', 'Mot de passe coach', false),
    ('athlete_password', 'athlete2024', 'text', 'auth', 'Mot de passe athlète par défaut', false),
    ('session_duration', '86400000', 'number', 'auth', 'Durée session en ms (24h)', false),

    -- CRM & ANALYTICS
    ('crm_enabled', 'true', 'boolean', 'crm', 'CRM activé', false),
    ('analytics_enabled', 'true', 'boolean', 'crm', 'Analytics activé', false),
    ('api_url', 'https://laskali.eu', 'text', 'crm', 'URL API (legacy)', false),

    -- THÈME
    ('theme', 'dark', 'text', 'theme', 'Thème par défaut (dark/light)', true),
    ('primary_color', '#3e8e41', 'text', 'theme', 'Couleur primaire', true),
    ('accent_color', '#2563eb', 'text', 'theme', 'Couleur accent', true),

    -- DISCORD
    ('discord_enabled', 'true', 'boolean', 'discord', 'Discord intégration activée', false),
    ('discord_notifications_enabled', 'true', 'boolean', 'discord', 'Notifications Discord activées', false),
    ('discord_guild_id', '1400713384546009169', 'text', 'discord', 'ID du serveur Discord', false),

    -- SUPABASE
    ('supabase_realtime_enabled', 'true', 'boolean', 'supabase', 'Realtime Supabase activé', false),
    ('supabase_cache_duration', '300000', 'number', 'supabase', 'Durée cache Supabase en ms (5min)', false),

    -- PERFORMANCES
    ('lazy_loading_enabled', 'true', 'boolean', 'performance', 'Lazy loading activé', true),
    ('cache_enabled', 'true', 'boolean', 'performance', 'Cache activé', true),
    ('offline_mode_enabled', 'true', 'boolean', 'performance', 'Mode offline activé', true),

    -- FONCTIONNALITÉS
    ('nutrition_module_enabled', 'true', 'boolean', 'features', 'Module nutrition activé', false),
    ('programming_module_enabled', 'true', 'boolean', 'features', 'Module programmation activé', false),
    ('tv_mode_enabled', 'true', 'boolean', 'features', 'Mode TV activé', false),
    ('wearables_integration_enabled', 'true', 'boolean', 'features', 'Intégration objets connectés activée', false)
ON CONFLICT (setting_key) DO NOTHING;

-- ====================
-- ÉTAPE 5 : RLS POLICIES
-- ====================

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Lecture publique pour settings publics uniquement
CREATE POLICY "Public settings viewable by all"
    ON settings FOR SELECT
    USING (is_public = true);

-- Lecture complète pour admins
CREATE POLICY "All settings viewable by admins"
    ON settings FOR SELECT
    USING (true);

-- Modification admins uniquement
CREATE POLICY "Settings modifiable by admins"
    ON settings FOR UPDATE
    USING (true);

CREATE POLICY "Settings insertable by admins"
    ON settings FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Settings deletable by admins"
    ON settings FOR DELETE
    USING (true);

-- ====================
-- VÉRIFICATION
-- ====================

SELECT category, COUNT(*) as count
FROM settings
GROUP BY category
ORDER BY category;

-- ====================
-- ROLLBACK
-- ====================

/*
DROP TRIGGER IF EXISTS trigger_update_settings_updated_at ON settings;
DROP FUNCTION IF EXISTS update_settings_updated_at();
DROP TABLE IF EXISTS settings CASCADE;
*/
