-- Migration 011: Session Participants & Portal Stats
-- Date: 2026-02-04
-- Description: Gestion des inscriptions aux séances + calcul stats pour cartes Epic

-- ================================
-- 1. TABLE session_participants (inscriptions aux séances)
-- ================================

CREATE TABLE IF NOT EXISTS session_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  is_booked BOOLEAN DEFAULT true,      -- Réservé
  attended BOOLEAN DEFAULT false,       -- A assisté (confirmation)
  score TEXT,                          -- Score/temps du WOD (ex: "32:45 Rx")
  notes TEXT,                          -- Notes perso sur la séance
  block_results JSONB DEFAULT '[]',    -- Résultats par bloc [{block_id, result}]
  booked_at TIMESTAMPTZ DEFAULT NOW(),
  attended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Contrainte: un membre ne peut s'inscrire qu'une fois par séance
  UNIQUE(session_id, member_id)
);

-- Index pour recherches rapides
CREATE INDEX IF NOT EXISTS idx_session_participants_session_id ON session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_session_participants_member_id ON session_participants(member_id);
CREATE INDEX IF NOT EXISTS idx_session_participants_attended ON session_participants(attended);

-- ================================
-- 2. AJOUTER COLONNES À sessions (si manquantes)
-- ================================

-- Coach de la séance
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'coach'
  ) THEN
    ALTER TABLE sessions ADD COLUMN coach TEXT;
  END IF;
END $$;

-- Heure de la séance (format HH:MM)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'time'
  ) THEN
    ALTER TABLE sessions ADD COLUMN time TEXT DEFAULT '09:00';
  END IF;
END $$;

-- Durée en minutes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'duration'
  ) THEN
    ALTER TABLE sessions ADD COLUMN duration INT DEFAULT 60;
  END IF;
END $$;

-- Places maximum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'max_spots'
  ) THEN
    ALTER TABLE sessions ADD COLUMN max_spots INT DEFAULT 12;
  END IF;
END $$;

-- ================================
-- 3. VIEW sessions_with_spots (séances avec places restantes)
-- ================================

DROP VIEW IF EXISTS sessions_with_spots;

CREATE VIEW sessions_with_spots AS
SELECT
  s.*,
  COALESCE(s.max_spots, 12) - COALESCE(booked.count, 0) as available_spots,
  COALESCE(booked.count, 0) as booked_count
FROM sessions s
LEFT JOIN (
  SELECT session_id, COUNT(*) as count
  FROM session_participants
  WHERE is_booked = true
  GROUP BY session_id
) booked ON booked.session_id = s.id;

-- ================================
-- 4. RPC: Récupérer les séances pour le portail (avec statut réservation)
-- ================================

DROP FUNCTION IF EXISTS get_portal_sessions(UUID, DATE, DATE);

CREATE OR REPLACE FUNCTION get_portal_sessions(
  p_member_id UUID,
  p_date_from DATE,
  p_date_to DATE
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT json_agg(row_to_json(sessions_data))
    FROM (
      SELECT
        s.id,
        s.date,
        COALESCE(s.time, '09:00') as time,
        s.title,
        s.category as type,
        s.coach,
        COALESCE(s.duration, 60) as duration,
        s.description,
        s.blocks,
        COALESCE(s.max_spots, 12) as max_spots,
        COALESCE(s.max_spots, 12) - COALESCE(booked.count, 0) as spots,
        CASE WHEN sp.id IS NOT NULL THEN true ELSE false END as is_booked,
        sp.score,
        sp.attended
      FROM sessions s
      LEFT JOIN (
        SELECT session_id, COUNT(*) as count
        FROM session_participants
        WHERE is_booked = true
        GROUP BY session_id
      ) booked ON booked.session_id = s.id
      LEFT JOIN session_participants sp ON sp.session_id = s.id AND sp.member_id = p_member_id
      WHERE s.date BETWEEN p_date_from AND p_date_to
      ORDER BY s.date ASC, s.time ASC
    ) sessions_data
  );
END;
$$;

-- ================================
-- 5. RPC: Récupérer l'historique des workouts d'un membre
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
    SELECT json_agg(row_to_json(workouts_data))
    FROM (
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
        sp.notes
      FROM session_participants sp
      JOIN sessions s ON s.id = sp.session_id
      WHERE sp.member_id = p_member_id
        AND sp.attended = true
        AND (p_type_filter IS NULL OR s.category = p_type_filter)
      ORDER BY s.date DESC
      LIMIT p_limit
      OFFSET p_offset
    ) workouts_data
  );
END;
$$;

-- ================================
-- 6. RPC: Récupérer les PRs d'un membre
-- ================================

DROP FUNCTION IF EXISTS get_member_prs(UUID, INT);

CREATE OR REPLACE FUNCTION get_member_prs(
  p_member_id UUID,
  p_limit INT DEFAULT 20
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT json_agg(row_to_json(prs_data))
    FROM (
      SELECT
        p.id,
        p.exercise_type as exercise,
        p.value::TEXT as value,
        p.unit,
        p.reps,
        p.date,
        p.category,
        p.notes,
        -- Calculer l'amélioration par rapport au PR précédent
        (
          SELECT p2.value::TEXT
          FROM performances p2
          WHERE p2.member_id = p.member_id
            AND p2.exercise_type = p.exercise_type
            AND p2.is_pr = true
            AND p2.date < p.date
          ORDER BY p2.date DESC
          LIMIT 1
        ) as previous_value
      FROM performances p
      WHERE p.member_id = p_member_id
        AND p.is_pr = true
      ORDER BY p.date DESC
      LIMIT p_limit
    ) prs_data
  );
END;
$$;

-- ================================
-- 7. RPC: Calculer les stats Epic Card d'un membre
-- ================================

DROP FUNCTION IF EXISTS calculate_member_stats(UUID);

CREATE OR REPLACE FUNCTION calculate_member_stats(
  p_member_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_strength FLOAT := 0;
  v_endurance FLOAT := 0;
  v_speed FLOAT := 0;
  v_technique FLOAT := 0;
  v_power FLOAT := 0;
  v_session_count INT := 0;
  v_pr_count INT := 0;
  v_level INT := 1;
  v_xp INT := 0;
  v_percentile INT := 50;
  v_total_members INT;
  v_rank INT;
BEGIN
  -- 1. Force (moyenne des 1RM en kg, normalisé sur 100)
  SELECT COALESCE(AVG(
    CASE
      WHEN value > 0 THEN LEAST(value / 150.0 * 100, 100)
      ELSE 0
    END
  ), 30) INTO v_strength
  FROM performances
  WHERE member_id = p_member_id
    AND unit = 'kg'
    AND exercise_type ILIKE ANY(ARRAY['%squat%', '%deadlift%', '%bench%', '%snatch%', '%clean%', '%press%']);

  -- 2. Endurance (basé sur temps cardio, inversé car moins = mieux)
  SELECT COALESCE(AVG(
    CASE
      WHEN value > 0 AND unit = 'seconds' THEN GREATEST(100 - (value / 600.0 * 100), 0) -- 10min = 0pts
      ELSE 50
    END
  ), 30) INTO v_endurance
  FROM performances
  WHERE member_id = p_member_id
    AND (exercise_type ILIKE ANY(ARRAY['%run%', '%row%', '%bike%', '%skierg%', '%assault%'])
         OR category = 'Endurance');

  -- 3. Vitesse (basé sur sprints courts)
  SELECT COALESCE(AVG(
    CASE
      WHEN value > 0 AND unit = 'seconds' THEN GREATEST(100 - (value / 120.0 * 100), 0) -- 2min = 0pts
      ELSE 50
    END
  ), 30) INTO v_speed
  FROM performances
  WHERE member_id = p_member_id
    AND exercise_type ILIKE ANY(ARRAY['%400m%', '%600m%', '%800m%', '%sprint%']);

  -- 4. Technique (mouvements gymnastiques)
  SELECT COALESCE(AVG(
    CASE
      WHEN value > 0 AND unit = 'reps' THEN LEAST(value / 30.0 * 100, 100) -- 30 reps = 100pts
      ELSE 50
    END
  ), 30) INTO v_technique
  FROM performances
  WHERE member_id = p_member_id
    AND (exercise_type ILIKE ANY(ARRAY['%pullup%', '%pull-up%', '%dip%', '%handstand%', '%muscle%', '%toes%', '%kipping%'])
         OR category = 'Gymnastique');

  -- 5. Puissance (watts)
  SELECT COALESCE(AVG(
    CASE
      WHEN value > 0 THEN LEAST(value / 1000.0 * 100, 100) -- 1000w = 100pts
      ELSE 50
    END
  ), 30) INTO v_power
  FROM performances
  WHERE member_id = p_member_id
    AND (exercise_type ILIKE ANY(ARRAY['%watts%', '%pic%', '%power%'])
         OR (unit = 'reps' AND exercise_type ILIKE '%jump%'));

  -- 6. Nombre de séances assistées
  SELECT COUNT(*) INTO v_session_count
  FROM session_participants
  WHERE member_id = p_member_id AND attended = true;

  -- 7. Nombre de PRs
  SELECT COUNT(*) INTO v_pr_count
  FROM performances
  WHERE member_id = p_member_id AND is_pr = true;

  -- 8. Calcul du niveau (1 niveau tous les 6 séances)
  v_level := GREATEST(1, LEAST(50, v_session_count / 6 + 1));

  -- 9. XP pour progression visuelle
  v_xp := (v_session_count % 6) * 100 + v_pr_count * 50;

  -- 10. Percentile (position relative)
  SELECT COUNT(*) INTO v_total_members FROM members WHERE is_active = true;
  IF v_total_members > 1 THEN
    SELECT COUNT(*) + 1 INTO v_rank
    FROM (
      SELECT member_id, COUNT(*) as sessions
      FROM session_participants
      WHERE attended = true
      GROUP BY member_id
      HAVING COUNT(*) > v_session_count
    ) better;
    v_percentile := GREATEST(1, 100 - (v_rank * 100 / v_total_members));
  END IF;

  RETURN json_build_object(
    'strength', ROUND(v_strength)::INT,
    'endurance', ROUND(v_endurance)::INT,
    'speed', ROUND(v_speed)::INT,
    'technique', ROUND(v_technique)::INT,
    'power', ROUND(v_power)::INT,
    'level', v_level,
    'xp', v_xp,
    'xpToNextLevel', 600, -- 6 séances * 100
    'percentile', v_percentile,
    'sessionCount', v_session_count,
    'prCount', v_pr_count
  );
END;
$$;

-- ================================
-- 8. RPC: Réserver une séance
-- ================================

DROP FUNCTION IF EXISTS book_session(UUID, UUID);

CREATE OR REPLACE FUNCTION book_session(
  p_session_id UUID,
  p_member_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_available INT;
  v_existing UUID;
BEGIN
  -- 1. Vérifier si déjà inscrit
  SELECT id INTO v_existing
  FROM session_participants
  WHERE session_id = p_session_id AND member_id = p_member_id;

  IF v_existing IS NOT NULL THEN
    -- Réactiver si était annulé
    UPDATE session_participants
    SET is_booked = true, booked_at = NOW(), updated_at = NOW()
    WHERE id = v_existing;

    RETURN json_build_object(
      'success', true,
      'message', 'Réservation réactivée'
    );
  END IF;

  -- 2. Vérifier places disponibles
  SELECT COALESCE(s.max_spots, 12) - COALESCE(booked.count, 0) INTO v_available
  FROM sessions s
  LEFT JOIN (
    SELECT session_id, COUNT(*) as count
    FROM session_participants
    WHERE session_id = p_session_id AND is_booked = true
    GROUP BY session_id
  ) booked ON true
  WHERE s.id = p_session_id;

  IF v_available <= 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'NO_SPOTS_AVAILABLE',
      'message', 'Plus de places disponibles'
    );
  END IF;

  -- 3. Créer la réservation
  INSERT INTO session_participants (session_id, member_id, is_booked)
  VALUES (p_session_id, p_member_id, true);

  RETURN json_build_object(
    'success', true,
    'message', 'Réservation confirmée'
  );
END;
$$;

-- ================================
-- 9. RPC: Annuler une réservation
-- ================================

DROP FUNCTION IF EXISTS cancel_booking(UUID, UUID);

CREATE OR REPLACE FUNCTION cancel_booking(
  p_session_id UUID,
  p_member_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE session_participants
  SET is_booked = false, updated_at = NOW()
  WHERE session_id = p_session_id AND member_id = p_member_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'BOOKING_NOT_FOUND',
      'message', 'Réservation non trouvée'
    );
  END IF;

  RETURN json_build_object(
    'success', true,
    'message', 'Réservation annulée'
  );
END;
$$;

-- ================================
-- 10. RLS Policies
-- ================================

ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;

-- Lecture: tout le monde peut voir (pour compter les places)
DROP POLICY IF EXISTS session_participants_select ON session_participants;
CREATE POLICY session_participants_select ON session_participants
  FOR SELECT USING (true);

-- Insert/Update: via service role (API routes)
DROP POLICY IF EXISTS session_participants_insert ON session_participants;
CREATE POLICY session_participants_insert ON session_participants
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS session_participants_update ON session_participants;
CREATE POLICY session_participants_update ON session_participants
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS session_participants_delete ON session_participants;
CREATE POLICY session_participants_delete ON session_participants
  FOR DELETE USING (true);

-- ================================
-- 11. Trigger updated_at
-- ================================

CREATE OR REPLACE FUNCTION update_session_participants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS session_participants_updated_at ON session_participants;
CREATE TRIGGER session_participants_updated_at
  BEFORE UPDATE ON session_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_session_participants_updated_at();

-- ================================
-- DONE
-- ================================
-- Exécuter dans Supabase SQL Editor
-- Les pages portail pourront ensuite utiliser les RPCs pour récupérer les données
