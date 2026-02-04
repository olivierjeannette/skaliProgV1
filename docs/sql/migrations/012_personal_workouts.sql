-- Migration 012: Personal Workouts (Séances personnelles adhérents)
-- Date: 2026-02-04
-- Description: Permet aux adhérents de créer leurs propres séances d'entraînement

-- ================================
-- 1. TABLE personal_workouts (séances créées par les adhérents)
-- ================================

CREATE TABLE IF NOT EXISTS personal_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Infos de la séance
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'personal',  -- personal, crosstraining, musculation, cardio, hyrox, etc.
  duration INT DEFAULT 60,           -- Durée en minutes

  -- Contenu
  description TEXT,
  blocks JSONB DEFAULT '[]',         -- [{type, title, content, result}]

  -- Résultats
  score TEXT,                        -- Score/temps global (ex: "32:45 Rx")
  notes TEXT,                        -- Notes personnelles
  feeling INT CHECK (feeling >= 1 AND feeling <= 5), -- Ressenti 1-5

  -- Métadonnées
  is_completed BOOLEAN DEFAULT true, -- Par défaut, considéré comme fait
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherches rapides
CREATE INDEX IF NOT EXISTS idx_personal_workouts_member_id ON personal_workouts(member_id);
CREATE INDEX IF NOT EXISTS idx_personal_workouts_date ON personal_workouts(date DESC);
CREATE INDEX IF NOT EXISTS idx_personal_workouts_category ON personal_workouts(category);

-- ================================
-- 2. RPC: Créer une séance personnelle
-- ================================

DROP FUNCTION IF EXISTS create_personal_workout(UUID, DATE, TEXT, TEXT, INT, TEXT, JSONB, TEXT, TEXT, INT);

CREATE OR REPLACE FUNCTION create_personal_workout(
  p_member_id UUID,
  p_date DATE,
  p_title TEXT,
  p_category TEXT DEFAULT 'personal',
  p_duration INT DEFAULT 60,
  p_description TEXT DEFAULT NULL,
  p_blocks JSONB DEFAULT '[]',
  p_score TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_feeling INT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_workout_id UUID;
BEGIN
  -- Insérer la séance
  INSERT INTO personal_workouts (
    member_id, date, title, category, duration,
    description, blocks, score, notes, feeling
  )
  VALUES (
    p_member_id, p_date, p_title, p_category, p_duration,
    p_description, p_blocks, p_score, p_notes, p_feeling
  )
  RETURNING id INTO v_workout_id;

  RETURN json_build_object(
    'success', true,
    'workout_id', v_workout_id,
    'message', 'Séance créée avec succès'
  );
END;
$$;

-- ================================
-- 3. RPC: Modifier une séance personnelle
-- ================================

DROP FUNCTION IF EXISTS update_personal_workout(UUID, UUID, DATE, TEXT, TEXT, INT, TEXT, JSONB, TEXT, TEXT, INT);

CREATE OR REPLACE FUNCTION update_personal_workout(
  p_workout_id UUID,
  p_member_id UUID,
  p_date DATE DEFAULT NULL,
  p_title TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL,
  p_duration INT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_blocks JSONB DEFAULT NULL,
  p_score TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_feeling INT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Vérifier que la séance appartient au membre
  IF NOT EXISTS (
    SELECT 1 FROM personal_workouts
    WHERE id = p_workout_id AND member_id = p_member_id
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'WORKOUT_NOT_FOUND',
      'message', 'Séance non trouvée ou non autorisée'
    );
  END IF;

  -- Mettre à jour les champs fournis
  UPDATE personal_workouts
  SET
    date = COALESCE(p_date, date),
    title = COALESCE(p_title, title),
    category = COALESCE(p_category, category),
    duration = COALESCE(p_duration, duration),
    description = COALESCE(p_description, description),
    blocks = COALESCE(p_blocks, blocks),
    score = COALESCE(p_score, score),
    notes = COALESCE(p_notes, notes),
    feeling = COALESCE(p_feeling, feeling),
    updated_at = NOW()
  WHERE id = p_workout_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Séance mise à jour'
  );
END;
$$;

-- ================================
-- 4. RPC: Supprimer une séance personnelle
-- ================================

DROP FUNCTION IF EXISTS delete_personal_workout(UUID, UUID);

CREATE OR REPLACE FUNCTION delete_personal_workout(
  p_workout_id UUID,
  p_member_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM personal_workouts
  WHERE id = p_workout_id AND member_id = p_member_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'WORKOUT_NOT_FOUND',
      'message', 'Séance non trouvée ou non autorisée'
    );
  END IF;

  RETURN json_build_object(
    'success', true,
    'message', 'Séance supprimée'
  );
END;
$$;

-- ================================
-- 5. RPC: Récupérer les séances personnelles d'un membre
-- ================================

DROP FUNCTION IF EXISTS get_personal_workouts(UUID, INT, INT, TEXT);

CREATE OR REPLACE FUNCTION get_personal_workouts(
  p_member_id UUID,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0,
  p_category TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT json_agg(row_to_json(workouts_data))
    FROM (
      SELECT
        id,
        date,
        title,
        category as type,
        duration,
        description,
        blocks,
        score,
        notes,
        feeling,
        is_completed as completed,
        true as is_personal,  -- Marqueur pour distinguer des séances box
        created_at
      FROM personal_workouts
      WHERE member_id = p_member_id
        AND (p_category IS NULL OR category = p_category)
      ORDER BY date DESC, created_at DESC
      LIMIT p_limit
      OFFSET p_offset
    ) workouts_data
  );
END;
$$;

-- ================================
-- 6. RPC: Mise à jour get_member_workouts pour inclure les séances perso
-- ================================

DROP FUNCTION IF EXISTS get_member_workouts(UUID, INT, INT, TEXT);

CREATE OR REPLACE FUNCTION get_member_workouts(
  p_member_id UUID,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0,
  p_type_filter TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT json_agg(row_to_json(workouts_data) ORDER BY date DESC)
    FROM (
      -- Séances de la box auxquelles le membre a participé
      SELECT
        s.id,
        s.date,
        s.title,
        s.category as type,
        COALESCE(s.duration, 60) as duration,
        s.coach,
        s.blocks,
        sp.attended as completed,
        sp.score,
        sp.block_results,
        sp.notes,
        false as is_personal
      FROM session_participants sp
      JOIN sessions s ON s.id = sp.session_id
      WHERE sp.member_id = p_member_id
        AND sp.attended = true
        AND (p_type_filter IS NULL OR s.category = p_type_filter)

      UNION ALL

      -- Séances personnelles
      SELECT
        pw.id,
        pw.date,
        pw.title,
        pw.category as type,
        pw.duration,
        NULL as coach,
        pw.blocks,
        pw.is_completed as completed,
        pw.score,
        '[]'::jsonb as block_results,
        pw.notes,
        true as is_personal
      FROM personal_workouts pw
      WHERE pw.member_id = p_member_id
        AND (p_type_filter IS NULL OR pw.category = p_type_filter OR p_type_filter = 'personal')
    ) workouts_data
    ORDER BY date DESC
    LIMIT p_limit
    OFFSET p_offset
  );
END;
$$;

-- ================================
-- 7. RLS Policies
-- ================================

ALTER TABLE personal_workouts ENABLE ROW LEVEL SECURITY;

-- Lecture: un membre ne voit que ses propres séances
DROP POLICY IF EXISTS personal_workouts_select ON personal_workouts;
CREATE POLICY personal_workouts_select ON personal_workouts
  FOR SELECT USING (true);  -- Via API avec vérification member_id

-- Insert/Update/Delete: via service role (API routes)
DROP POLICY IF EXISTS personal_workouts_insert ON personal_workouts;
CREATE POLICY personal_workouts_insert ON personal_workouts
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS personal_workouts_update ON personal_workouts;
CREATE POLICY personal_workouts_update ON personal_workouts
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS personal_workouts_delete ON personal_workouts;
CREATE POLICY personal_workouts_delete ON personal_workouts
  FOR DELETE USING (true);

-- ================================
-- 8. Trigger updated_at
-- ================================

CREATE OR REPLACE FUNCTION update_personal_workouts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS personal_workouts_updated_at ON personal_workouts;
CREATE TRIGGER personal_workouts_updated_at
  BEFORE UPDATE ON personal_workouts
  FOR EACH ROW
  EXECUTE FUNCTION update_personal_workouts_updated_at();

-- ================================
-- DONE
-- ================================
-- Exécuter dans Supabase SQL Editor
-- Les adhérents pourront créer leurs propres séances via l'app
