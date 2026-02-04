-- Migration 013: Dashboard - Errors Log & Tasks
-- Date: 2026-02-04
-- Description: Tables pour le logging des erreurs et la gestion des tâches/idées

-- ================================
-- TABLE: app_errors
-- ================================
-- Log des erreurs de l'application pour debug

CREATE TABLE IF NOT EXISTS app_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    error_type VARCHAR(50) NOT NULL DEFAULT 'error', -- 'error', 'warning', 'info'
    message TEXT NOT NULL,
    stack TEXT,
    url VARCHAR(500),
    user_agent VARCHAR(500),
    user_role VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolved_by VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_app_errors_created_at ON app_errors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_errors_resolved ON app_errors(resolved);
CREATE INDEX IF NOT EXISTS idx_app_errors_type ON app_errors(error_type);

-- ================================
-- TABLE: tasks
-- ================================
-- Tâches et idées pour le dashboard admin

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    status VARCHAR(20) DEFAULT 'todo', -- 'todo', 'in_progress', 'done', 'cancelled'
    category VARCHAR(50) DEFAULT 'task', -- 'task', 'idea', 'bug', 'feature'
    due_date DATE,
    completed_at TIMESTAMPTZ,
    created_by VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);

-- ================================
-- RPC: log_error
-- ================================
-- Fonction pour logger une erreur depuis l'application

CREATE OR REPLACE FUNCTION log_error(
    p_message TEXT,
    p_error_type VARCHAR(50) DEFAULT 'error',
    p_stack TEXT DEFAULT NULL,
    p_url VARCHAR(500) DEFAULT NULL,
    p_user_agent VARCHAR(500) DEFAULT NULL,
    p_user_role VARCHAR(50) DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_error_id UUID;
BEGIN
    INSERT INTO app_errors (
        error_type,
        message,
        stack,
        url,
        user_agent,
        user_role,
        metadata
    )
    VALUES (
        p_error_type,
        p_message,
        p_stack,
        p_url,
        p_user_agent,
        p_user_role,
        p_metadata
    )
    RETURNING id INTO v_error_id;

    RETURN v_error_id;
END;
$$;

-- ================================
-- RPC: get_dashboard_stats
-- ================================
-- Statistiques pour le dashboard

CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSONB;
    v_week_start DATE;
    v_month_start DATE;
BEGIN
    v_week_start := date_trunc('week', CURRENT_DATE)::DATE;
    v_month_start := date_trunc('month', CURRENT_DATE)::DATE;

    SELECT jsonb_build_object(
        -- Membres
        'members_total', (SELECT COUNT(*) FROM members WHERE is_active = true),
        'members_new_month', (SELECT COUNT(*) FROM members WHERE created_at >= v_month_start),

        -- Sessions
        'sessions_today', (SELECT COUNT(*) FROM sessions WHERE date = CURRENT_DATE),
        'sessions_week', (SELECT COUNT(*) FROM sessions WHERE date >= v_week_start AND date <= CURRENT_DATE + INTERVAL '6 days'),

        -- PRs
        'prs_week', (SELECT COUNT(*) FROM performances WHERE is_pr = true AND date >= v_week_start),
        'prs_month', (SELECT COUNT(*) FROM performances WHERE is_pr = true AND date >= v_month_start),
        'prs_total', (SELECT COUNT(*) FROM performances WHERE is_pr = true),

        -- CRM
        'leads_prospect', (SELECT COUNT(*) FROM leads WHERE status = 'prospect'),
        'leads_contacted', (SELECT COUNT(*) FROM leads WHERE status = 'contacte_attente'),
        'leads_converted_month', (SELECT COUNT(*) FROM leads WHERE status IN ('converti_abonnement', 'converti_carnets') AND converted_at >= v_month_start),
        'leads_total_month', (SELECT COUNT(*) FROM leads WHERE created_at >= v_month_start),

        -- Errors
        'errors_unresolved', (SELECT COUNT(*) FROM app_errors WHERE resolved = false),
        'errors_today', (SELECT COUNT(*) FROM app_errors WHERE created_at >= CURRENT_DATE),

        -- Tasks
        'tasks_todo', (SELECT COUNT(*) FROM tasks WHERE status = 'todo'),
        'tasks_in_progress', (SELECT COUNT(*) FROM tasks WHERE status = 'in_progress'),

        -- Discord
        'discord_linked', (SELECT COUNT(*) FROM discord_members WHERE member_id IS NOT NULL),
        'discord_unlinked', (SELECT COUNT(*) FROM discord_members WHERE member_id IS NULL)
    ) INTO v_result;

    RETURN v_result;
END;
$$;

-- ================================
-- RPC: get_today_sessions
-- ================================
-- Récupère les séances du jour avec détails

CREATE OR REPLACE FUNCTION get_today_sessions()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', s.id,
            'title', s.title,
            'category', s.category,
            'time', s.time,
            'duration', s.duration,
            'coach', s.coach,
            'max_spots', s.max_spots,
            'blocks', s.blocks
        )
        ORDER BY s.time NULLS LAST
    ), '[]'::jsonb)
    FROM sessions s
    WHERE s.date = CURRENT_DATE
    INTO v_result;

    RETURN v_result;
END;
$$;

-- ================================
-- RPC: get_recent_prs
-- ================================
-- Récupère les derniers PRs

CREATE OR REPLACE FUNCTION get_recent_prs(p_limit INT DEFAULT 10)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', p.id,
            'member_id', p.member_id,
            'member_name', m.name,
            'exercise_type', p.exercise_type,
            'category', p.category,
            'value', p.value,
            'unit', p.unit,
            'reps', p.reps,
            'date', p.date
        )
        ORDER BY p.date DESC, p.created_at DESC
    ), '[]'::jsonb)
    FROM performances p
    JOIN members m ON m.id = p.member_id
    WHERE p.is_pr = true
    LIMIT p_limit
    INTO v_result;

    RETURN v_result;
END;
$$;

-- ================================
-- GRANT PERMISSIONS
-- ================================

GRANT ALL ON app_errors TO authenticated;
GRANT ALL ON tasks TO authenticated;
GRANT EXECUTE ON FUNCTION log_error TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_today_sessions TO authenticated;
GRANT EXECUTE ON FUNCTION get_recent_prs TO authenticated;

-- ================================
-- RLS POLICIES
-- ================================

ALTER TABLE app_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policies pour app_errors (tout le monde peut lire/écrire pour le logging)
CREATE POLICY "Anyone can insert errors" ON app_errors FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can read errors" ON app_errors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can update errors" ON app_errors FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete errors" ON app_errors FOR DELETE TO authenticated USING (true);

-- Policies pour tasks
CREATE POLICY "Authenticated can manage tasks" ON tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
