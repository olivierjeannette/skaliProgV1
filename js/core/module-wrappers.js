/**
 * MODULE WRAPPERS
 * Fonctions wrapper pour charger les modules à la demande
 * Permet de garder les onclick simples dans le HTML
 */

window.ModuleWrappers = {
    /**
     * Wrapper générique pour charger un module et exécuter une fonction
     * @param moduleName
     * @param objectName
     * @param methodName
     * @param {...any} args
     */
    async loadAndExecute(moduleName, objectName, methodName, ...args) {
        try {
            // Vérifier si le module est déjà chargé
            if (window[objectName] && typeof window[objectName][methodName] === 'function') {
                // Module déjà chargé, exécuter directement
                return await window[objectName][methodName](...args);
            }

            // Afficher le loader
            if (window.SmartButtonLoader) {
                window.SmartButtonLoader.showLoading();
            }

            // Charger le module
            console.log(`📦 Chargement du module ${moduleName} pour ${objectName}.${methodName}()`);
            await window.LazyLoader.loadModule(moduleName);

            // Vérifier que l'objet existe maintenant
            if (!window[objectName] || typeof window[objectName][methodName] !== 'function') {
                throw new Error(
                    `${objectName}.${methodName} n'existe pas après chargement du module`
                );
            }

            // Exécuter la fonction
            return await window[objectName][methodName](...args);
        } catch (error) {
            console.error(`❌ Erreur lors de l'exécution de ${objectName}.${methodName}():`, error);
            alert(
                `Erreur lors du chargement du module. Veuillez rafraîchir la page.\n\nDétails: ${error.message}`
            );
        } finally {
            // Cacher le loader
            if (window.SmartButtonLoader) {
                window.SmartButtonLoader.hideLoading();
            }
        }
    },

    // Wrappers spécifiques pour chaque module

    async CardioDraw_showCardioDraw() {
        return this.loadAndExecute('cardio-draw', 'CardioDraw', 'showCardioDraw');
    },

    async AlluresManager_showAlluresView() {
        return this.loadAndExecute('reports', 'AlluresManager', 'showAlluresView');
    },

    async RunSessionManager_open() {
        return this.loadAndExecute('run-session', 'RunSessionManager', 'open');
    },

    async NutritionPro_init() {
        // Charger le module nutrition CONSOLIDÉ (nouveau système)
        try {
            if (window.SmartButtonLoader) {
                window.SmartButtonLoader.showLoading();
            }

            console.log('🍎 Chargement Nutrition Pro (système consolidé)...');
            await window.LazyLoader.loadModule('nutrition');

            // Utiliser le nouveau système consolidé
            if (
                window.NutritionMemberManager &&
                typeof window.NutritionMemberManager.init === 'function'
            ) {
                await window.NutritionMemberManager.init();
                console.log('✅ Nutrition Pro chargé et initialisé (4 fichiers consolidés)');
            } else {
                throw new Error('NutritionMemberManager non disponible après chargement');
            }
        } catch (error) {
            console.error('❌ Erreur chargement nutrition:', error);
            if (window.Utils && window.Utils.showNotification) {
                Utils.showNotification(
                    'Erreur',
                    `Impossible de charger le module nutrition: ${error.message}`,
                    'error'
                );
            } else {
                alert(`❌ Erreur: ${error.message}`);
            }
        } finally {
            if (window.SmartButtonLoader) {
                window.SmartButtonLoader.hideLoading();
            }
        }
    },

    async RFIDRunning_showRFIDView() {
        return this.loadAndExecute('rfid', 'RFIDRunning', 'showRFIDView');
    },

    async PortalAccess_showPortalAccessView() {
        return this.loadAndExecute('portal', 'PortalAccess', 'showPortalAccessView');
    },

    async CardioSessionManager_show() {
        // Module unifié pour gestion cardio (Gestion, Monitor, TV)
        try {
            if (window.SmartButtonLoader) {
                window.SmartButtonLoader.showLoading();
            }

            await window.LazyLoader.loadModule('cardio-session');

            if (!window.CardioSessionManager) {
                throw new Error('CardioSessionManager non disponible après chargement du module');
            }

            await window.CardioSessionManager.show();

            console.log('✅ Cardio Session Manager affiché');
        } catch (error) {
            console.error('❌ Erreur CardioSessionManager:', error);
            alert('Erreur lors du chargement du Cardio Session Manager');
        } finally {
            if (window.SmartButtonLoader) {
                window.SmartButtonLoader.hideLoading();
            }
        }
    },

    async PokemonCards_showPokemonView() {
        return this.loadAndExecute('pokemon', 'PokemonCards', 'showPokemonView');
    },

    async VideoAI_init() {
        return this.loadAndExecute('video', 'VideoAI', 'init');
    },

    async DiscordMembersManager_init() {
        return this.loadAndExecute('discord-admin', 'DiscordMembersManager', 'init');
    },

    async SyncManager_showSyncOptions() {
        return this.loadAndExecute('managers', 'SyncManager', 'showSyncOptions');
    },

    async BackupManager_showBackupManager() {
        return this.loadAndExecute('managers', 'BackupManager', 'showBackupManager');
    },

    async TVMode_init() {
        return this.loadAndExecute('managers', 'TVMode', 'init');
    },

    async MemberImport_showImportDialog() {
        return this.loadAndExecute('member-import', 'MemberImport', 'showImportDialog');
    },

    async PerformanceManager_showPerformanceView() {
        return this.loadAndExecute('reports', 'PerformanceManager', 'showPerformanceView');
    },

    async ReportManager_showReportsMenu() {
        return this.loadAndExecute('reports', 'ReportManager', 'showReportsMenu');
    },

    async DiscordUnified_initAndShow() {
        // Charger le module discord-admin et initialiser DiscordUnified
        try {
            if (window.SmartButtonLoader) {
                window.SmartButtonLoader.showLoading();
            }

            await window.LazyLoader.loadModule('discord-admin');

            if (!window.DiscordUnified) {
                throw new Error('DiscordUnified non disponible après chargement du module');
            }

            // Initialiser puis afficher l'interface
            await window.DiscordUnified.init();
            await window.DiscordUnified.showInterface();

            console.log('✅ DiscordUnified initialisé et affiché');
        } catch (error) {
            console.error('❌ Erreur DiscordUnified:', error);
            alert('Erreur lors du chargement du module Discord Configuration');
        } finally {
            if (window.SmartButtonLoader) {
                window.SmartButtonLoader.hideLoading();
            }
        }
    },

    async HRSimulator_open() {
        // Ouvrir le simulateur multi-adhérents dans une nouvelle fenêtre
        try {
            const width = 1400;
            const height = 900;
            const left = Math.max(0, (screen.width - width) / 2);
            const top = Math.max(0, (screen.height - height) / 2);

            window.open(
                'hr-simulator-multi.html',
                'HRSimulator',
                `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no`
            );

            console.log('✅ Simulateur HR Multi-Adhérents ouvert');
        } catch (error) {
            console.error('❌ Erreur ouverture simulateur:', error);
            alert("Erreur lors de l'ouverture du simulateur HR");
        }
    },

    async ProgrammingPro_init() {
        try {
            if (window.SmartButtonLoader) {
                window.SmartButtonLoader.showLoading();
            }

            // Le module est déjà chargé directement dans index.html
            if (window.ProgrammingPro && typeof window.ProgrammingPro.init === 'function') {
                await window.ProgrammingPro.init();
                console.log('✅ Module Programming Pro initialisé');
            } else {
                throw new Error('ProgrammingPro non disponible');
            }
        } catch (error) {
            console.error('❌ Erreur chargement Programming Pro:', error);
            alert(`Erreur: ${error.message}`);
        } finally {
            if (window.SmartButtonLoader) {
                window.SmartButtonLoader.hideLoading();
            }
        }
    }
};

// Exposer les wrappers comme fonctions globales pour les onclick
window.CardioDraw_showCardioDraw = () => window.ModuleWrappers.CardioDraw_showCardioDraw();
window.AlluresManager_showAlluresView = () =>
    window.ModuleWrappers.AlluresManager_showAlluresView();
window.RunSessionManager_open = () => window.ModuleWrappers.RunSessionManager_open();
window.NutritionPro_init = () => window.ModuleWrappers.NutritionPro_init();
window.PortalAccess_showPortalAccessView = () =>
    window.ModuleWrappers.PortalAccess_showPortalAccessView();
window.CardioSessionManager_show = () => window.ModuleWrappers.CardioSessionManager_show();
window.PokemonCards_showPokemonView = () => window.ModuleWrappers.PokemonCards_showPokemonView();
window.VideoAI_init = () => window.ModuleWrappers.VideoAI_init();
window.DiscordMembersManager_init = () => window.ModuleWrappers.DiscordMembersManager_init();
window.SyncManager_showSyncOptions = () => window.ModuleWrappers.SyncManager_showSyncOptions();
window.BackupManager_showBackupManager = () =>
    window.ModuleWrappers.BackupManager_showBackupManager();
window.TVMode_init = () => window.ModuleWrappers.TVMode_init();
window.MemberImport_showImportDialog = () => window.ModuleWrappers.MemberImport_showImportDialog();
window.DiscordUnified_initAndShow = () => window.ModuleWrappers.DiscordUnified_initAndShow();
window.HRSimulator_open = () => window.ModuleWrappers.HRSimulator_open();
window.ProgrammingPro_init = () => window.ModuleWrappers.ProgrammingPro_init();

console.log('✅ Module Wrappers chargés');
