/*
 * Migration: Create API Keys Table (Version 2 - Simplifiée)
 * Date: 2025-01-15
 * Author: Team Skali
 * Description: Crée la table api_keys pour stocker toutes les clés API de manière centralisée et sécurisée
 *
 * INSTRUCTIONS:
 * 1. Si la table api_keys existe déjà, exécutez d'abord le rollback en bas de ce fichier
 * 2. Puis exécutez ce script complet
 */

-- ====================
-- ÉTAPE 1 : CRÉER LA TABLE
-- ====================

CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_name TEXT UNIQUE NOT NULL,
    key_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================
-- ÉTAPE 2 : CRÉER LES INDEX
-- ====================

CREATE INDEX IF NOT EXISTS idx_api_keys_name ON api_keys(key_name);

-- ====================
-- ÉTAPE 3 : CRÉER LA FONCTION DE MISE À JOUR AUTOMATIQUE
-- ====================

CREATE OR REPLACE FUNCTION update_api_keys_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================
-- ÉTAPE 4 : CRÉER LE TRIGGER
-- ====================

DROP TRIGGER IF EXISTS trigger_update_api_keys_updated_at ON api_keys;

CREATE TRIGGER trigger_update_api_keys_updated_at
    BEFORE UPDATE ON api_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_api_keys_updated_at();

-- ====================
-- ÉTAPE 5 : INSÉRER LES CLÉS PAR DÉFAUT
-- ====================

INSERT INTO api_keys (key_name, key_value, description) VALUES
    ('CLAUDE_API_KEY', '', 'Clé API Claude pour génération de contenu'),
    ('DEEPSEEK_API_KEY', '', 'Clé API DeepSeek (optionnel)'),
    ('OPENAI_API_KEY', '', 'Clé API OpenAI (optionnel)'),
    ('DISCORD_BOT_TOKEN', '', 'Token du bot Discord complet'),
    ('DISCORD_GUILD_ID', '1400713384546009169', 'ID du serveur Discord'),
    ('DISCORD_WEBHOOK_URL', '', 'Webhook Discord pour notifications'),
    ('MORNING_COACH_WEBHOOK', '', 'Webhook spécifique pour Morning Coach'),
    ('DISCORD_CLIENT_ID', '', 'Discord OAuth Client ID'),
    ('DISCORD_CLIENT_SECRET', '', 'Discord OAuth Client Secret'),
    ('SUPABASE_URL', '', 'URL du projet Supabase'),
    ('SUPABASE_KEY', '', 'Clé API Supabase'),
    ('OPENWEATHER_API_KEY', '', 'Clé API OpenWeather (optionnel)'),
    ('PROXY_URL_DEV', 'http://localhost:3001', 'URL du proxy en développement'),
    ('PROXY_URL_PROD', 'https://nonintrospective-rosella-kiddingly.ngrok-free.dev', 'URL du proxy en production')
ON CONFLICT (key_name) DO NOTHING;

-- ====================
-- ÉTAPE 6 : ACTIVER ROW LEVEL SECURITY (RLS)
-- ====================

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Admins can view api keys" ON api_keys;
DROP POLICY IF EXISTS "Admins can update api keys" ON api_keys;
DROP POLICY IF EXISTS "Admins can insert api keys" ON api_keys;
DROP POLICY IF EXISTS "Admins can delete api keys" ON api_keys;

-- Créer les nouvelles policies
CREATE POLICY "Admins can view api keys"
    ON api_keys
    FOR SELECT
    USING (true);

CREATE POLICY "Admins can update api keys"
    ON api_keys
    FOR UPDATE
    USING (true);

CREATE POLICY "Admins can insert api keys"
    ON api_keys
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can delete api keys"
    ON api_keys
    FOR DELETE
    USING (true);

-- ====================
-- VÉRIFICATION
-- ====================

-- Afficher les clés créées
SELECT key_name, description,
       CASE
           WHEN LENGTH(key_value) > 0 THEN '✅ Configurée'
           ELSE '⚠️ À configurer'
       END as status
FROM api_keys
ORDER BY key_name;

-- ====================
-- ROLLBACK (À exécuter UNIQUEMENT si vous voulez supprimer la table)
-- ====================

/*
-- ⚠️ ATTENTION : Ceci supprimera toutes vos clés API !
-- Décommentez et exécutez uniquement si vous êtes sûr

DROP TRIGGER IF EXISTS trigger_update_api_keys_updated_at ON api_keys;
DROP FUNCTION IF EXISTS update_api_keys_updated_at();
DROP TABLE IF EXISTS api_keys CASCADE;
*/
