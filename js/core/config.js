// Configuration globale de l'application
const CONFIG = {
    // Mots de passe par rôle
    PASSWORDS: {
        ADMIN: 'skaliprog', // Mot de passe administrateur
        COACH: 'coach2024', // Mot de passe par défaut pour les coachs
        ATHLETE: 'athlete2024' // Mot de passe par défaut pour les athlètes
    },

    // Rôles et permissions
    ROLES: {
        ADMIN: {
            name: 'Administrateur',
            permissions: ['all'],
            canCreate: ['coach', 'athlete'],
            color: '#dc2626',
            icon: 'fas fa-crown'
        },
        COACH: {
            name: 'Coach',
            permissions: [
                'view_calendar',
                'create_sessions',
                'edit_sessions',
                'view_members',
                'create_athlete',
                'view_performances',
                'edit_performances',
                'import_csv',
                'backup',
                'export_pdf',
                'notifications',
                'tv_mode'
            ],
            canCreate: ['athlete'],
            color: '#2563eb',
            icon: 'fas fa-user-tie'
        },
        ATHLETE: {
            name: 'Athlète',
            permissions: [
                'view_calendar',
                'view_sessions',
                'view_own_performances',
                'auto_sync',
                'export_pdf',
                'tv_mode'
            ],
            canCreate: [],
            color: '#059669',
            icon: 'fas fa-running',
            restrictions: [
                'no_session_modification',
                'no_manual_sync',
                'no_manual_backup',
                'no_notifications',
                'no_member_management',
                'no_user_creation'
            ]
        }
    },

    // Catégories de séances avec couleurs et icônes
    SESSION_CATEGORIES: {
        crosstraining: { name: 'CrossTraining', color: '#ef4444', icon: 'fas fa-fire' },
        musculation: { name: 'Musculation', color: '#3b82f6', icon: 'fas fa-dumbbell' },
        cardio: { name: 'Cardio', color: '#10b981', icon: 'fas fa-heart' },
        hyrox: { name: 'Hyrox', color: '#f59e0b', icon: 'fas fa-running' },
        recovery: { name: 'Récupération', color: '#8b5cf6', icon: 'fas fa-leaf' }
    },

    // Exercices par catégorie
    DEFAULT_EXERCISES: {
        Crosstraining: [
            'Clean',
            'Snatch',
            'StrictPress',
            'PushPress',
            'Jerk',
            'OVH squat',
            'Traction',
            'Thrusters'
        ],
        Musculation: ['Développé Couché', 'Deadlift', 'Back squat', 'front squat', 'Ring Dips'],
        Cardio: [
            'Run 600m',
            'Run 1200m',
            '500m Rameur',
            '1km Rameur',
            '500m skierg',
            '1km Ski Erg',
            '500m bikerg',
            '1km bikerg'
        ]
    },

    // Clés de stockage localStorage
    STORAGE_KEYS: {
        DATA: 'skaliWorkoutData',
        AUTH: 'skaliAuth',
        USER_ROLE: 'skaliUserRole',
        COACH_PASSWORDS: 'skaliCoachPasswords',
        ATHLETE_PASSWORDS: 'skaliAthletePasswords',
        LAST_BACKUP: 'skaliLastBackup',
        AUTO_BACKUP: 'skaliAutoBackup'
    }
};
// Exposer globalement
window.CONFIG = CONFIG;

console.log('✅ Module CONFIG chargé');
