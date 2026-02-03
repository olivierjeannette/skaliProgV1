/**
 * CONFIGURATION DE CHARGEMENT MODULAIRE
 * Système de lazy loading intelligent pour améliorer les performances
 *
 * Stratégie:
 * 1. CRITIQUE (chargement immédiat) : Auth, Utils, ViewManager
 * 2. ESSENTIAL (chargement après login) : Calendar, Members, Teams
 * 3. ON-DEMAND (chargement à la demande) : Nutrition, Cardio, RFID, etc.
 */

const ModuleLoaderConfig = {
    // Modules critiques - Chargés immédiatement au démarrage
    CRITICAL: [
        'js/core/performance-optimizer.js',
        'js/core/paths.js',
        'js/core/config.js',
        'js/core/env.js',
        'js/core/auth.js',
        'js/core/utils.js',
        'js/core/thememanager.js'
    ],

    // Modules essentiels - Chargés après l'authentification
    ESSENTIAL: [
        'js/managers/viewmanager.js',
        'js/managers/permissionmanager.js',
        'js/modules/calendar/calendarmanager.js',
        'js/modules/members/membermanager.js',
        'js/modules/teams/teambuilder.js'
    ],

    // Modules à la demande - Groupés par fonctionnalité
    ON_DEMAND: {
        // Managers secondaires (syncmanager et backupmanager déjà chargés)
        managers: ['js/managers/tvmode.js'],

        // Modules admin Discord
        'discord-admin': [
            'js/modules/admin/discord-members-manager.js',
            'js/modules/admin/discord-bot-controls.js',
            'js/modules/admin/discord-unified.js'
        ],

        // Import de membres
        'member-import': ['js/modules/members/memberimport.js'],

        // Performance et rapports
        reports: [
            'js/modules/performance/performancemanager.js',
            'js/modules/reports/reportmanager.js',
            'js/modules/reports/alluresmanager-v2.js'
        ],

        // Nutrition Pro - CONSOLIDÉ (5 fichiers optimisés)
        nutrition: [
            'js/modules/nutrition/nutrition-core.js', // Moteur calcul + Database
            'js/modules/nutrition/nutrition-meals-database.js', // Base de 100+ repas réels
            'js/modules/nutrition/nutrition-member-manager.js', // Gestion adhérents + PDFs
            'js/modules/nutrition/nutrition-planner.js', // Interface programmation 5 étapes
            'js/modules/nutrition/nutrition-pdf-pro.js' // Générateur PDF professionnel
        ],

        // Cardio Session Manager (Module unifié : Gestion, Monitor, TV)
        'cardio-session': [
            'js/integrations/wearables-integration.js',
            'js/modules/admin/cardio-session-manager.js'
        ],

        // Cardio Draw
        'cardio-draw': ['js/modules/cardio-draw-module.js?v=' + Date.now()],

        // Pokemon cards
        pokemon: [
            'js/modules/pokemon/performance-calculator.js',
            'js/modules/pokemon/performance-normalizer.js',
            'js/modules/pokemon/pokemoncards.js'
        ],

        // Vidéo AI
        video: ['js/modules/video/videoai.js'],

        // Portail accès + Wearables
        portal: [
            'js/integrations/wearables-integration.js',
            'js/modules/portal/wearables-connect.js',
            'js/modules/portalaccess.js'
        ],

        // Run session
        'run-session': ['js/modules/run-session-manager.js']
    },

    // Mapping des boutons UI vers les modules à charger
    BUTTON_TO_MODULE: {
        calendarBtn: [], // Déjà chargé
        membersBtn: ['member-import'],
        teamsBtn: [], // Déjà chargé
        alluresBtn: ['reports'],
        runSessionBtn: ['run-session'],
        nutritionProBtn: ['nutrition'],
        portalAccessBtn: ['portal'],
        cardioSessionBtn: ['cardio-session'], // Module unifié Cardio
        cardioDrawBtn: ['cardio-draw'],
        pokemonBtn: ['pokemon'],
        videoBtn: ['video'],
        discordBtn: ['discord-admin'],
        syncBtn: ['managers'],
        backupBtn: ['managers'],
        tvBtn: ['managers']
    }
};

// Exposer globalement
window.ModuleLoaderConfig = ModuleLoaderConfig;
