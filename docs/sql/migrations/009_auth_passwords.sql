-- Migration 009: Auth passwords in settings table
-- Date: 2026-02-04
-- Description: Stockage des mots de passe d'authentification dans la table settings
-- IMPORTANT: Changer ces mots de passe après la migration!

-- Insérer les mots de passe (à changer en production!)
INSERT INTO settings (setting_key, setting_value, setting_type, category, is_public)
VALUES
  ('auth_password_admin', 'CHANGEZ_CE_MOT_DE_PASSE_ADMIN', 'string', 'auth', false),
  ('auth_password_coach', 'CHANGEZ_CE_MOT_DE_PASSE_COACH', 'string', 'auth', false),
  ('auth_password_athlete', 'CHANGEZ_CE_MOT_DE_PASSE_ATHLETE', 'string', 'auth', false)
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  updated_at = NOW();

-- Note: Pour mettre à jour un mot de passe:
-- UPDATE settings SET setting_value = 'nouveau_mot_de_passe' WHERE setting_key = 'auth_password_admin';

-- Pour utiliser bcrypt (recommandé en production):
-- 1. Installer bcrypt côté serveur
-- 2. Générer le hash: bcrypt.hash('mot_de_passe', 10)
-- 3. Stocker le hash dans setting_value
-- Les hashes bcrypt commencent par '$2a$' ou '$2b$'
