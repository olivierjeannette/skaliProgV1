/**
 * LAZY LOADER - Chargement différé des modules AMÉLIORÉ
 * Réduit le temps de chargement initial de 17s à < 2s
 * Charge les modules uniquement quand nécessaire
 */

const LazyLoader = {
    // Modules déjà chargés
    loadedModules: new Set(),

    // Modules en cours de chargement
    loadingModules: new Map(),

    // Modules groupés chargés
    loadedGroups: new Set(),

    // Configuration importée depuis module-loader-config.js
    get modules() {
        return window.ModuleLoaderConfig?.ON_DEMAND || {};
    },

    /**
     * Charger un script de manière asynchrone
     * @param src
     */
    loadScript(src) {
        // Si déjà chargé, retourner immédiatement
        if (this.loadedModules.has(src)) {
            return Promise.resolve();
        }

        // Si en cours de chargement, retourner la promesse existante
        if (this.loadingModules.has(src)) {
            return this.loadingModules.get(src);
        }

        // Créer une nouvelle promesse de chargement
        const promise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;

            script.onload = () => {
                this.loadedModules.add(src);
                this.loadingModules.delete(src);
                console.log(`✅ Module chargé: ${src}`);
                resolve();
            };

            script.onerror = () => {
                this.loadingModules.delete(src);
                console.error(`❌ Erreur chargement: ${src}`);
                reject(new Error(`Failed to load ${src}`));
            };

            document.body.appendChild(script);
        });

        this.loadingModules.set(src, promise);
        return promise;
    },

    /**
     * Charger un groupe de modules
     * @param moduleName
     */
    async loadModule(moduleName) {
        // Si déjà chargé, retourner immédiatement
        if (this.loadedGroups.has(moduleName)) {
            console.log(`ℹ️ Module ${moduleName} déjà chargé`);
            return;
        }

        if (!this.modules[moduleName]) {
            console.warn(`⚠️ Module inconnu: ${moduleName}`);
            return;
        }

        console.log(`🔄 Chargement du module: ${moduleName}...`);
        const startTime = performance.now();

        try {
            // Charger tous les scripts du module en parallèle
            const scripts = this.modules[moduleName];
            await Promise.all(scripts.map(src => this.loadScript(src)));

            this.loadedGroups.add(moduleName);
            const loadTime = (performance.now() - startTime).toFixed(0);
            console.log(`✅ Module ${moduleName} chargé en ${loadTime}ms`);
        } catch (error) {
            console.error(`❌ Erreur chargement module ${moduleName}:`, error);
            throw error;
        }
    },

    /**
     * Charger plusieurs modules en parallèle
     * @param moduleNames
     */
    async loadModules(moduleNames) {
        const promises = moduleNames.map(name => this.loadModule(name));
        await Promise.all(promises);
    },

    /**
     * Charger les modules requis pour un bouton
     * @param buttonId
     */
    async loadForButton(buttonId) {
        const config = window.ModuleLoaderConfig;
        if (!config || !config.BUTTON_TO_MODULE[buttonId]) {
            console.warn(`⚠️ Pas de configuration pour le bouton: ${buttonId}`);
            return;
        }

        const modulesToLoad = config.BUTTON_TO_MODULE[buttonId];
        console.log(`📦 Chargement des modules pour ${buttonId}:`, modulesToLoad);
        await this.loadModules(modulesToLoad);
    },

    /**
     * Marquer un script comme déjà chargé (pour les scripts essentiels)
     * @param src
     */
    markAsLoaded(src) {
        this.loadedModules.add(src);
    }
};

// Exposer globalement
window.LazyLoader = LazyLoader;
