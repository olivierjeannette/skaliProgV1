-- Table pour stocker les sessions Peppy
CREATE TABLE IF NOT EXISTS peppy_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  day_of_week TEXT,
  start_time TEXT NOT NULL,
  end_time TEXT,
  session_name TEXT,
  total_places INTEGER DEFAULT 0,
  participant_count INTEGER DEFAULT 0,
  participants JSONB DEFAULT '[]'::jsonb,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint pour éviter les doublons
  UNIQUE(date, start_time)
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_peppy_sessions_date ON peppy_sessions(date);
CREATE INDEX IF NOT EXISTS idx_peppy_sessions_scraped_at ON peppy_sessions(scraped_at);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_peppy_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_peppy_sessions_updated_at ON peppy_sessions;
CREATE TRIGGER trigger_peppy_sessions_updated_at
  BEFORE UPDATE ON peppy_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_peppy_sessions_updated_at();

-- RLS (Row Level Security)
ALTER TABLE peppy_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: tout le monde peut lire
CREATE POLICY "Anyone can read peppy_sessions"
  ON peppy_sessions FOR SELECT
  USING (true);

-- Policy: seul le service role peut écrire
CREATE POLICY "Service role can insert peppy_sessions"
  ON peppy_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update peppy_sessions"
  ON peppy_sessions FOR UPDATE
  USING (true);
