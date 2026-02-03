// Configuration des chemins des modules
const MODULE_PATHS = {
    // Core modules
    core: {
        config: 'js/core/config.js',
        dataManager: 'js/core/datamanager.js',
        auth: 'js/core/auth.js',
        utils: 'js/core/utils.js'
    },

    // Managers
    managers: {
        viewManager: 'js/managers/viewmanager.js',
        syncManager: 'js/managers/syncmanager.js',
        permissionManager: 'js/managers/permissionmanager.js',
        userManager: 'js/managers/userManager.js',
        backupManager: 'js/managers/backupmanager.js',
        tvMode: 'js/managers/tvmode.js',
        tvModeNavigation: 'js/managers/tvmodeNavigation.js'
    },

    // Modules métier
    modules: {
        calendar: {
            calendarManager: 'js/modules/calendar/calendarmanager.js'
        },
        members: {
            memberManager: 'js/modules/members/membermanager.js',
            memberImport: 'js/modules/members/memberimport.js',
            fitnessCalculator: 'js/modules/members/indiceperf.js'
        },
        performance: {
            performanceManager: 'js/modules/performance/performancemanager.js'
        },
        teams: {
            teamBuilder: 'js/modules/teams/teambuilder.js'
        },
        reports: {
            reportManager: 'js/modules/reports/reportmanager.js',
            alluresManager: 'js/modules/reports/alluresmanager.js'
        }
    },

    // Intégrations
    integrations: {
        supabase: 'js/integrations/supabasemanager.js',
        discord: 'js/integrations/discordnotifier.js',
        prNotifier: 'js/integrations/prnotifier.js'
    }
};

// Fonction pour charger un module dynamiquement
function loadModule(path) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = path;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load module: ${path}`));
        document.head.appendChild(script);
    });
}

// Fonction pour charger plusieurs modules
async function loadModules(paths) {
    const promises = paths.map(path => loadModule(path));
    return Promise.all(promises);
}

// Exposer globalement
window.MODULE_PATHS = MODULE_PATHS;
window.loadModule = loadModule;
window.loadModules = loadModules;
