/**
 * 📊 TABLE LEADS - Structure documentée
 *
 * Cette migration documente la structure de la table `leads` utilisée par le CRM
 * pour centraliser les formulaires de contact des 3 sites La Skàli.
 *
 * ⚠️ ATTENTION : Cette table existe déjà en production
 * Ce fichier sert uniquement de documentation de référence
 *
 * Date : 2025-01-15
 */

-- ==========================================
-- TABLE LEADS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.leads (
    -- Identifiant unique
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Informations de contact
    prenom TEXT NOT NULL,
    email TEXT NOT NULL,
    telephone TEXT NOT NULL,

    -- Type de service (fitness, pilates, coaching, teambuilding)
    service_type TEXT NOT NULL,

    -- Champs communs
    objectif TEXT,
    creneau TEXT,

    -- Champs spécifiques TEAM BUILDING
    type_evenement TEXT,           -- Type d'événement (séminaire, team building, etc.)
    nb_participants TEXT,           -- Nombre de participants attendus
    date_souhaitee TEXT,           -- Date souhaitée pour l'événement (texte libre, ex: "Fin mars 2025")
    duree TEXT,                    -- Durée de l'événement
    message TEXT,                  -- Message libre du prospect

    -- Tracking et acquisition
    source_manuelle TEXT,          -- Source saisie manuellement dans le formulaire
    source_auto TEXT,              -- Source détectée automatiquement (referrer, UTM)
    utm_source TEXT,               -- Paramètre UTM source
    utm_medium TEXT,               -- Paramètre UTM medium
    utm_campaign TEXT,             -- Paramètre UTM campaign

    -- Statut du lead
    status TEXT DEFAULT 'prospect',
    converted BOOLEAN DEFAULT false,

    -- Notes internes
    notes TEXT,

    -- Horodatage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- INDEX POUR PERFORMANCES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_leads_service_type ON public.leads(service_type);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);

-- ==========================================
-- STATUTS POSSIBLES
-- ==========================================
-- Les statuts gérés par le CRM :
-- - prospect              : Nouveau lead non contacté
-- - contacte_attente      : Lead contacté, en attente de réponse
-- - rdv_essai             : RDV pris pour séance d'essai
-- - converti_abonnement   : Converti en abonnement
-- - converti_carnets      : Converti en carnets de séances
-- - non_converti_prix     : Non converti (raison: prix)
-- - liste_rouge           : À ne plus contacter

-- ==========================================
-- SERVICES DISPONIBLES
-- ==========================================
-- Les types de services :
-- - fitness        : Cours de fitness collectifs
-- - pilates        : Cours de pilates (Eva)
-- - coaching       : Coaching personnalisé
-- - teambuilding   : Événements Team Building entreprise

-- ==========================================
-- TRIGGER : Mise à jour automatique de updated_at
-- ==========================================
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_leads_updated_at ON public.leads;
CREATE TRIGGER trigger_update_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION update_leads_updated_at();

-- ==========================================
-- RLS (Row Level Security)
-- ==========================================
-- Autoriser la lecture/écriture pour les utilisateurs authentifiés
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policy pour l'insertion (formulaires publics)
CREATE POLICY "Enable insert for anon users" ON public.leads
    FOR INSERT
    WITH CHECK (true);

-- Policy pour la lecture (CRM authentifié)
CREATE POLICY "Enable read for authenticated users" ON public.leads
    FOR SELECT
    USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Policy pour la mise à jour (CRM authentifié uniquement)
CREATE POLICY "Enable update for authenticated users" ON public.leads
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Policy pour la suppression (CRM authentifié uniquement)
CREATE POLICY "Enable delete for authenticated users" ON public.leads
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- ==========================================
-- NOTES D'UTILISATION
-- ==========================================
/*
 * INSERTION DEPUIS LES FORMULAIRES :
 * Les formulaires des sites (fitness.html, pilates.html, coaching.html, teambuilding.html)
 * utilisent le script lead-form-handler.js pour envoyer les données vers cette table.
 *
 * LECTURE DEPUIS LE CRM :
 * Le module CRM (crm-manager.js) lit cette table et affiche 2 tableaux séparés :
 * 1. Leads classiques (fitness, pilates, coaching)
 * 2. Leads Team Building (teambuilding) avec colonnes spécifiques
 *
 * COLONNES TEAM BUILDING :
 * - type_evenement : séminaire, team building, incentive, etc.
 * - nb_participants : nombre de personnes attendues
 * - date_souhaitee : date souhaitée pour l'événement
 * - duree : durée de l'événement (ex: "2 heures", "journée complète")
 * - message : message libre du prospect
 */

-- ==========================================
-- ROLLBACK
-- ==========================================
-- Pour supprimer cette table (ATTENTION : perte de données)
-- DROP TABLE IF EXISTS public.leads CASCADE;
-- DROP FUNCTION IF EXISTS update_leads_updated_at() CASCADE;
