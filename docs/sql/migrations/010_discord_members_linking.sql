-- Migration 010: Discord Members Linking System
-- Date: 2026-02-04
-- Description: Gestion complète liaison Discord ↔ Adhérents pour le PWA Portal

-- ================================
-- 1. TABLE discord_members (upsert si existe)
-- ================================

-- Créer la table si elle n'existe pas
CREATE TABLE IF NOT EXISTS discord_members (
  discord_id TEXT PRIMARY KEY,
  discord_username TEXT NOT NULL,
  discord_global_name TEXT,
  discord_avatar TEXT,
  server_nickname TEXT,
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  last_sync TIMESTAMPTZ DEFAULT NOW(),
  linked_at TIMESTAMPTZ,
  linked_by TEXT, -- 'portal' | 'admin' | null
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_discord_members_member_id ON discord_members(member_id);
CREATE INDEX IF NOT EXISTS idx_discord_members_is_active ON discord_members(is_active);

-- ================================
-- 2. AJOUTER discord_id à members (si manquant)
-- ================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'members' AND column_name = 'discord_id'
  ) THEN
    ALTER TABLE members ADD COLUMN discord_id TEXT;
  END IF;
END $$;

-- Index pour recherche par discord_id sur members
CREATE INDEX IF NOT EXISTS idx_members_discord_id ON members(discord_id);

-- ================================
-- 3. VIEW discord_members_full (liaison complète)
-- ================================

DROP VIEW IF EXISTS discord_members_full;

CREATE VIEW discord_members_full AS
SELECT
  dm.discord_id,
  dm.discord_username,
  dm.discord_global_name,
  dm.discord_avatar,
  dm.server_nickname,
  dm.member_id,
  dm.is_active,
  dm.last_sync,
  dm.linked_at,
  dm.linked_by,
  dm.created_at,
  -- Champs membres
  m.name as member_name,
  SPLIT_PART(m.name, ' ', 1) as first_name,
  SPLIT_PART(m.name, ' ', 2) as last_name,
  m.email as member_email,
  m.is_active as member_is_active
FROM discord_members dm
LEFT JOIN members m ON dm.member_id = m.id;

-- ================================
-- 4. RPC: Lier un Discord à un Membre (depuis Portal ou Admin)
-- ================================

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
  v_result JSON;
  v_member RECORD;
  v_existing_discord TEXT;
BEGIN
  -- 1. Vérifier que le membre existe
  SELECT * INTO v_member FROM members WHERE id = p_member_id;
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'MEMBER_NOT_FOUND',
      'message', 'Membre non trouvé'
    );
  END IF;

  -- 2. Vérifier que le membre n'est pas déjà lié à un autre Discord
  SELECT discord_id INTO v_existing_discord FROM discord_members
  WHERE member_id = p_member_id AND discord_id != p_discord_id;

  IF v_existing_discord IS NOT NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'MEMBER_ALREADY_LINKED',
      'message', 'Ce membre est déjà lié à un autre compte Discord'
    );
  END IF;

  -- 3. Mettre à jour discord_members
  UPDATE discord_members
  SET
    member_id = p_member_id,
    linked_at = NOW(),
    linked_by = p_linked_by,
    updated_at = NOW()
  WHERE discord_id = p_discord_id;

  -- 4. Mettre à jour le champ discord_id dans members
  UPDATE members
  SET discord_id = p_discord_id
  WHERE id = p_member_id;

  -- 5. Retourner le membre avec infos Discord
  SELECT json_build_object(
    'success', true,
    'member', json_build_object(
      'id', m.id,
      'name', m.name,
      'first_name', SPLIT_PART(m.name, ' ', 1),
      'last_name', COALESCE(NULLIF(SPLIT_PART(m.name, ' ', 2), ''), SPLIT_PART(m.name, ' ', 1)),
      'email', m.email,
      'phone', m.phone,
      'gender', m.gender,
      'birthdate', m.birthdate,
      'weight', m.weight,
      'height', m.height,
      'is_active', m.is_active,
      'discord_id', p_discord_id,
      'discord_username', dm.discord_username,
      'discord_avatar', dm.discord_avatar
    )
  ) INTO v_result
  FROM members m
  JOIN discord_members dm ON dm.discord_id = p_discord_id
  WHERE m.id = p_member_id;

  RETURN v_result;
END;
$$;

-- ================================
-- 5. RPC: Délier un Discord d'un Membre
-- ================================

CREATE OR REPLACE FUNCTION unlink_discord_from_member(
  p_discord_id TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_member_id UUID;
BEGIN
  -- 1. Récupérer le member_id actuel
  SELECT member_id INTO v_member_id
  FROM discord_members
  WHERE discord_id = p_discord_id;

  IF v_member_id IS NULL THEN
    RETURN json_build_object(
      'success', true,
      'message', 'Aucune liaison existante'
    );
  END IF;

  -- 2. Mettre à jour discord_members
  UPDATE discord_members
  SET
    member_id = NULL,
    linked_at = NULL,
    linked_by = NULL,
    updated_at = NOW()
  WHERE discord_id = p_discord_id;

  -- 3. Supprimer le discord_id du membre
  UPDATE members
  SET discord_id = NULL
  WHERE id = v_member_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Liaison supprimée avec succès'
  );
END;
$$;

-- ================================
-- 6. RPC: Rechercher des membres (pour liaison)
-- ================================

CREATE OR REPLACE FUNCTION search_members_for_linking(
  p_query TEXT,
  p_limit INT DEFAULT 10
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT json_agg(row_to_json(m))
    FROM (
      SELECT
        id,
        name,
        SPLIT_PART(name, ' ', 1) as first_name,
        COALESCE(NULLIF(SPLIT_PART(name, ' ', 2), ''), '') as last_name,
        email,
        discord_id,
        is_active,
        CASE WHEN discord_id IS NOT NULL THEN true ELSE false END as is_linked
      FROM members
      WHERE
        is_active = true
        AND (
          name ILIKE '%' || p_query || '%'
          OR email ILIKE '%' || p_query || '%'
        )
      ORDER BY
        CASE WHEN discord_id IS NULL THEN 0 ELSE 1 END, -- Non liés en premier
        name ASC
      LIMIT p_limit
    ) m
  );
END;
$$;

-- ================================
-- 7. RPC: Obtenir un membre par ID avec stats (pour Portal)
-- ================================

CREATE OR REPLACE FUNCTION get_member_for_portal(
  p_member_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_member JSON;
  v_stats JSON;
BEGIN
  -- 1. Récupérer le membre
  SELECT json_build_object(
    'id', m.id,
    'name', m.name,
    'first_name', SPLIT_PART(m.name, ' ', 1),
    'last_name', COALESCE(NULLIF(SPLIT_PART(m.name, ' ', 2), ''), ''),
    'email', m.email,
    'phone', m.phone,
    'gender', m.gender,
    'birthdate', m.birthdate,
    'weight', m.weight,
    'height', m.height,
    'body_fat_percentage', m.body_fat_percentage,
    'lean_mass', m.lean_mass,
    'photo', m.photo,
    'is_active', m.is_active,
    'discord_id', m.discord_id,
    'created_at', m.created_at
  ) INTO v_member
  FROM members m
  WHERE m.id = p_member_id;

  IF v_member IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'MEMBER_NOT_FOUND'
    );
  END IF;

  -- 2. Calculer les stats Pokemon (basées sur performances)
  -- TODO: Implémenter le calcul réel basé sur la table performances
  SELECT json_build_object(
    'cardio', 50,
    'force', 50,
    'gym', 50,
    'puissance', 50,
    'niveau', 1
  ) INTO v_stats;

  RETURN json_build_object(
    'success', true,
    'member', v_member,
    'stats', v_stats
  );
END;
$$;

-- ================================
-- 8. RLS Policies
-- ================================

-- Enable RLS
ALTER TABLE discord_members ENABLE ROW LEVEL SECURITY;

-- Policy: Lecture publique pour les membres actifs
DROP POLICY IF EXISTS discord_members_select ON discord_members;
CREATE POLICY discord_members_select ON discord_members
  FOR SELECT
  USING (true);

-- Policy: Insert/Update via service role uniquement
DROP POLICY IF EXISTS discord_members_insert ON discord_members;
CREATE POLICY discord_members_insert ON discord_members
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS discord_members_update ON discord_members;
CREATE POLICY discord_members_update ON discord_members
  FOR UPDATE
  USING (true);

-- ================================
-- 9. Trigger updated_at
-- ================================

CREATE OR REPLACE FUNCTION update_discord_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS discord_members_updated_at ON discord_members;
CREATE TRIGGER discord_members_updated_at
  BEFORE UPDATE ON discord_members
  FOR EACH ROW
  EXECUTE FUNCTION update_discord_members_updated_at();

-- ================================
-- DONE
-- ================================
-- Exécuter dans Supabase SQL Editor
