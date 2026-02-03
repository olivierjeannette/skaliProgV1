/*
 * Script de Nettoyage: Suppression de la table api_keys
 * Date: 2025-01-15
 * Author: Team Skali
 * Description: Supprime complètement la table api_keys si elle existe
 *
 * ⚠️ ATTENTION : Ceci supprimera TOUTES vos clés API stockées !
 *
 * UTILISATION:
 * - Exécutez ce script UNIQUEMENT si vous rencontrez des erreurs avec la table api_keys
 * - Après l'exécution, relancez le script 005_create_api_keys_table_v2.sql
 */

-- ====================
-- SUPPRESSION COMPLÈTE
-- ====================

-- Supprimer les policies RLS
DROP POLICY IF EXISTS "Admins can view api keys" ON api_keys;
DROP POLICY IF EXISTS "Admins can update api keys" ON api_keys;
DROP POLICY IF EXISTS "Admins can insert api keys" ON api_keys;
DROP POLICY IF EXISTS "Admins can delete api keys" ON api_keys;

-- Supprimer le trigger
DROP TRIGGER IF EXISTS trigger_update_api_keys_updated_at ON api_keys;

-- Supprimer la fonction
DROP FUNCTION IF EXISTS update_api_keys_updated_at();

-- Supprimer la table
DROP TABLE IF EXISTS api_keys CASCADE;

-- ====================
-- VÉRIFICATION
-- ====================

-- Vérifier que la table n'existe plus
SELECT
    CASE
        WHEN EXISTS (
            SELECT 1
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = 'api_keys'
        )
        THEN '❌ La table api_keys existe encore'
        ELSE '✅ La table api_keys a été supprimée'
    END as status;

-- ====================
-- PROCHAINES ÉTAPES
-- ====================

/*
Maintenant, exécutez le script de création :
sql/migrations/005_create_api_keys_table_v2.sql
*/
