-- =============================================
-- Migration 008: Week Templates pour le calendrier
-- =============================================
-- Description: Système de templates hebdomadaires pour pré-remplir
-- les séances avec titre + catégorie. L'utilisateur remplit ensuite le contenu.

-- Table des templates hebdomadaires
CREATE TABLE IF NOT EXISTS week_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  days JSONB NOT NULL DEFAULT '[]', -- Array de { dayOfWeek: 0-6, title: string, category: string }
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour la recherche
CREATE INDEX IF NOT EXISTS idx_week_templates_name ON week_templates(name);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_week_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS week_templates_updated_at ON week_templates;
CREATE TRIGGER week_templates_updated_at
  BEFORE UPDATE ON week_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_week_templates_updated_at();

-- RLS (Row Level Security)
ALTER TABLE week_templates ENABLE ROW LEVEL SECURITY;

-- Policy: accès public en lecture/écriture (admin only in real app)
CREATE POLICY "Allow all operations on week_templates" ON week_templates
  FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- Mise à jour de la table sessions pour les blocs
-- =============================================

-- S'assurer que la colonne blocks existe et est bien JSONB
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'blocks'
  ) THEN
    ALTER TABLE sessions ADD COLUMN blocks JSONB DEFAULT '[]';
  END IF;
END $$;

-- =============================================
-- Template par défaut: Semaine CrossFit standard
-- =============================================

INSERT INTO week_templates (name, description, days) VALUES
(
  'Semaine CrossFit Standard',
  'Template classique: Force + WOD tous les jours sauf dimanche',
  '[
    {"dayOfWeek": 0, "title": "Force + WOD", "category": "crosstraining"},
    {"dayOfWeek": 1, "title": "Skill + Metcon", "category": "crosstraining"},
    {"dayOfWeek": 2, "title": "Force + WOD", "category": "crosstraining"},
    {"dayOfWeek": 3, "title": "Cardio Long", "category": "cardio"},
    {"dayOfWeek": 4, "title": "Force + WOD", "category": "crosstraining"},
    {"dayOfWeek": 5, "title": "Team WOD", "category": "crosstraining"}
  ]'::jsonb
),
(
  'Semaine Hyrox Prep',
  'Préparation compétition Hyrox',
  '[
    {"dayOfWeek": 0, "title": "Running + Sled", "category": "hyrox"},
    {"dayOfWeek": 1, "title": "SkiErg + Burpees", "category": "hyrox"},
    {"dayOfWeek": 2, "title": "Rowing + Farmers", "category": "hyrox"},
    {"dayOfWeek": 3, "title": "Recovery", "category": "recovery"},
    {"dayOfWeek": 4, "title": "Wall Balls + Lunges", "category": "hyrox"},
    {"dayOfWeek": 5, "title": "Simulation Race", "category": "hyrox"}
  ]'::jsonb
),
(
  'Semaine Musculation',
  'Focus force et hypertrophie',
  '[
    {"dayOfWeek": 0, "title": "Upper Body Push", "category": "musculation"},
    {"dayOfWeek": 1, "title": "Lower Body", "category": "musculation"},
    {"dayOfWeek": 2, "title": "Upper Body Pull", "category": "musculation"},
    {"dayOfWeek": 3, "title": "Accessoires", "category": "musculation"},
    {"dayOfWeek": 4, "title": "Full Body", "category": "musculation"},
    {"dayOfWeek": 5, "title": "Cardio Léger", "category": "cardio"}
  ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- =============================================
-- Script pour décaler les séances d'un jour (à exécuter une fois)
-- =============================================

-- ATTENTION: Exécuter ce bloc uniquement si nécessaire (problème d'import)
-- UPDATE sessions SET date = date + INTERVAL '1 day';

COMMENT ON TABLE week_templates IS 'Templates hebdomadaires pour pré-remplir les séances du calendrier';
