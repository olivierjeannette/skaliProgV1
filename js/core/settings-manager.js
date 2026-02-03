/**
 * SETTINGS MANAGER - SUPABASE CENTRALISÉ
 * Gestion centralisée des paramètres stockés dans Supabase
 *
 * Similaire à APIKeysManager mais pour tous les paramètres de l'application
 * (mots de passe, thème, préférences, etc.)
 */

const SettingsManager = {
    settings: {},
    isLoaded: false,
    lastSync: null,

    /**
     * Initialiser et charger depuis Supabase
     */
    async init() {
        console.log('⚙️ Initialisation Settings Manager...');

        try {
            // Charger depuis Supabase
            const supabaseSettings = await this.loadFromSupabase();

            if (supabaseSettings && Object.keys(supabaseSettings).length > 0) {
                this.settings = supabaseSettings;
                this.isLoaded = true;
                this.lastSync = Date.now();
                console.log(`✅ ${Object.keys(supabaseSettings).length} paramètres chargés`);

                // Cache local
                this.saveToCache();
                return true;
            }

            // Fallback cache
            const cached = this.loadFromCache();
            if (cached) {
                this.settings = cached;
                this.isLoaded = true;
                console.log('✅ Paramètres chargés depuis cache');
                return true;
            }

            console.log('ℹ️ Aucun paramètre configuré');
            this.settings = {};
            this.isLoaded = true;
            return true;
        } catch (error) {
            console.error('❌ Erreur init Settings:', error);
            this.settings = {};
            this.isLoaded = true;
            return false;
        }
    },

    /**
     * Charger depuis Supabase
     */
    async loadFromSupabase() {
        try {
            if (!window.SupabaseManager || !SupabaseManager.client) {
                console.warn('⚠️ SupabaseManager non disponible');
                return null;
            }

            const { data, error } = await SupabaseManager.client
                .from('settings')
                .select('setting_key, setting_value, setting_type');

            if (error) {
                if (error.code === '42P01' || error.code === 'PGRST116') {
                    console.log('📋 Table settings non trouvée. Exécutez 006_create_settings_table.sql');
                    return null;
                }
                console.warn('⚠️ Erreur lecture settings:', error.message);
                return null;
            }

            if (!data || data.length === 0) {
                return {};
            }

            // Convertir en objet {key: value} avec parsing du type
            const settingsObject = {};
            data.forEach(row => {
                if (row.setting_key && row.setting_value !== null) {
                    settingsObject[row.setting_key] = this.parseValue(
                        row.setting_value,
                        row.setting_type
                    );
                }
            });

            return settingsObject;
        } catch (error) {
            console.warn('⚠️ Exception loadFromSupabase:', error.message);
            return null;
        }
    },

    /**
     * Parser une valeur selon son type
     */
    parseValue(value, type) {
        switch (type) {
            case 'boolean':
                return value === 'true' || value === true;
            case 'number':
                return parseFloat(value);
            case 'json':
                try {
                    return JSON.parse(value);
                } catch {
                    return value;
                }
            default:
                return value;
        }
    },

    /**
     * Formater une valeur pour Supabase
     */
    formatValue(value) {
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }
        return String(value);
    },

    /**
     * Détecter le type d'une valeur
     */
    detectType(value) {
        if (typeof value === 'boolean') return 'boolean';
        if (typeof value === 'number') return 'number';
        if (typeof value === 'object') return 'json';
        return 'text';
    },

    /**
     * Sauvegarder un paramètre dans Supabase
     */
    async saveToSupabase(key, value, category = 'general', description = '', isPublic = false) {
        try {
            if (!window.SupabaseManager || !SupabaseManager.client) {
                console.warn('⚠️ SupabaseManager non disponible');
                return false;
            }

            const { error } = await SupabaseManager.client.from('settings').upsert(
                {
                    setting_key: key,
                    setting_value: this.formatValue(value),
                    setting_type: this.detectType(value),
                    category: category,
                    description: description,
                    is_public: isPublic,
                    updated_at: new Date().toISOString()
                },
                {
                    onConflict: 'setting_key'
                }
            );

            if (error) {
                console.error(`❌ Erreur sauvegarde ${key}:`, error.message);
                return false;
            }

            // Mettre à jour cache
            this.settings[key] = value;
            this.saveToCache();

            console.log(`✅ Paramètre ${key} sauvegardé`);
            return true;
        } catch (error) {
            console.error(`❌ Exception saveToSupabase ${key}:`, error.message);
            return false;
        }
    },

    /**
     * Sauvegarder plusieurs paramètres en batch
     */
    async saveBatchToSupabase(settingsObject, category = 'general') {
        try {
            if (!window.SupabaseManager || !SupabaseManager.client) {
                console.error('❌ SupabaseManager ou client non disponible');
                console.error('   SupabaseManager exists:', !!window.SupabaseManager);
                console.error('   SupabaseManager.client exists:', !!window.SupabaseManager?.client);
                return false;
            }

            const rows = Object.entries(settingsObject).map(([key, value]) => ({
                setting_key: key,
                setting_value: this.formatValue(value),
                setting_type: this.detectType(value),
                category: category,
                updated_at: new Date().toISOString()
            }));

            if (rows.length === 0) return true;

            const { error } = await SupabaseManager.client.from('settings').upsert(rows, {
                onConflict: 'setting_key'
            });

            if (error) {
                console.error('❌ Erreur sauvegarde batch settings:', error);
                console.error('   Code:', error.code);
                console.error('   Message:', error.message);
                console.error('   Details:', error.details);
                console.error('   Rows tentées:', rows);
                return false;
            }

            // Mettre à jour cache
            this.settings = { ...this.settings, ...settingsObject };
            this.saveToCache();

            console.log(`✅ ${rows.length} paramètres sauvegardés`);
            return true;
        } catch (error) {
            console.error('❌ Exception saveBatchToSupabase:', error.message);
            return false;
        }
    },

    /**
     * Récupérer un paramètre
     */
    get(key, defaultValue = null) {
        if (!this.isLoaded) {
            console.warn('⚠️ Settings Manager non chargé');
            return defaultValue;
        }
        return this.settings[key] !== undefined ? this.settings[key] : defaultValue;
    },

    /**
     * Définir un paramètre (et sauvegarder)
     */
    async set(key, value, category = 'general') {
        return await this.saveToSupabase(key, value, category);
    },

    /**
     * Vérifier si un paramètre existe
     */
    has(key) {
        return this.settings[key] !== undefined;
    },

    /**
     * Obtenir tous les paramètres
     */
    getAll() {
        return { ...this.settings };
    },

    /**
     * Obtenir les paramètres d'une catégorie
     */
    getByCategory(category) {
        // Note: Nécessite de stocker la catégorie avec chaque setting
        // Pour l'instant, retourne tous les settings
        return this.getAll();
    },

    /**
     * Cache localStorage
     */
    saveToCache() {
        try {
            localStorage.setItem('settings_cache', JSON.stringify(this.settings));
            localStorage.setItem('settings_cache_time', Date.now().toString());
        } catch (error) {
            console.warn('⚠️ Erreur sauvegarde cache:', error.message);
        }
    },

    loadFromCache() {
        try {
            const cached = localStorage.getItem('settings_cache');
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.warn('⚠️ Erreur lecture cache:', error.message);
            return null;
        }
    },

    clearCache() {
        localStorage.removeItem('settings_cache');
        localStorage.removeItem('settings_cache_time');
        console.log('🗑️ Cache settings nettoyé');
    }
};

// Exposer globalement
window.SettingsManager = SettingsManager;

// Auto-initialisation après SupabaseManager
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        let attempts = 0;
        const maxAttempts = 20;

        while (!window.SupabaseManager && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 200));
            attempts++;
        }

        if (window.SupabaseManager) {
            await SettingsManager.init();
        } else {
            console.warn('⚠️ SupabaseManager non disponible, skip init SettingsManager');
        }
    });
} else {
    setTimeout(async () => {
        let attempts = 0;
        const maxAttempts = 20;

        while (!window.SupabaseManager && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 200));
            attempts++;
        }

        if (window.SupabaseManager) {
            await SettingsManager.init();
        } else {
            console.warn('⚠️ SupabaseManager non disponible, skip init SettingsManager');
        }
    }, 500);
}
