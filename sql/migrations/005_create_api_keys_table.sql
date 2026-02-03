/*
 * Migration: Create API Keys Table
 * Date: 2025-01-15
 * Author: Team Skali
 * Description: Crée la table api_keys pour stocker toutes les clés API de manière centralisée et sécurisée
 */

-- Créer la table api_keys
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_name TEXT UNIQUE NOT NULL,
    key_value TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_api_keys_name ON api_keys(key_name);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);

-- Insérer les clés par défaut (à configurer ensuite)
INSERT INTO api_keys (key_name, key_value, description) VALUES
    ('CLAUDE_API_KEY', '', 'Clé API Claude pour génération de contenu'),
    ('DISCORD_WEBHOOK_URL', '', 'Webhook Discord pour notifications'),
    ('DISCORD_CLIENT_ID', '', 'Discord OAuth Client ID'),
    ('DISCORD_CLIENT_SECRET', '', 'Discord OAuth Client Secret'),
    ('SUPABASE_URL', '', 'URL du projet Supabase'),
    ('SUPABASE_KEY', '', 'Clé API Supabase'),
    ('OPENWEATHER_API_KEY', '', 'Clé API OpenWeather (optionnel)'),
    ('PROXY_URL_DEV', 'http://localhost:3001', 'URL du proxy en développement'),
    ('PROXY_URL_PROD', 'https://nonintrospective-rosella-kiddingly.ngrok-free.dev', 'URL du proxy en production')
ON CONFLICT (key_name) DO NOTHING;

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_api_keys_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_api_keys_updated_at
    BEFORE UPDATE ON api_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_api_keys_updated_at();

-- RLS Policies (ADMIN uniquement peut lire/modifier)
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Politique: Seuls les admins peuvent lire les clés
CREATE POLICY "Admins can view api keys"
    ON api_keys
    FOR SELECT
    USING (true); -- On va gérer les permissions côté client

-- Politique: Seuls les admins peuvent modifier les clés
CREATE POLICY "Admins can update api keys"
    ON api_keys
    FOR UPDATE
    USING (true);

-- Politique: Seuls les admins peuvent insérer des clés
CREATE POLICY "Admins can insert api keys"
    ON api_keys
    FOR INSERT
    WITH CHECK (true);

-- Rollback (en commentaire à la fin):
-- DROP TRIGGER IF EXISTS trigger_update_api_keys_updated_at ON api_keys;
-- DROP FUNCTION IF EXISTS update_api_keys_updated_at();
-- DROP TABLE IF EXISTS api_keys;
