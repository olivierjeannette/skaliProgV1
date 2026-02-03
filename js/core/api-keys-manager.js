/**
 * API KEYS MANAGER - SUPABASE CENTRALISÉ
 * Gestion centralisée des clés API stockées dans Supabase
 *
 * Avantages :
 * - Accessibles depuis n'importe quel appareil
 * - Sauvegarde centralisée
 * - Cache local pour performances
 * - Fallback localStorage si Supabase indisponible
 */

const APIKeysManager = {
    keys: {},
    isLoaded: false,
    lastSync: null,
    syncInterval: 5 * 60 * 1000, // Resync toutes les 5 minutes

    /**
     * 🆕 Initialiser et charger les clés depuis Supabase
     */
    async init() {
        console.log('🔑 Initialisation API Keys Manager...');

        try {
            // Charger depuis Supabase
            const supabaseKeys = await this.loadFromSupabase();

            if (supabaseKeys && Object.keys(supabaseKeys).length > 0) {
                this.keys = supabaseKeys;
                this.isLoaded = true;
                this.lastSync = Date.now();
                console.log(`✅ ${Object.keys(supabaseKeys).length} clés chargées depuis Supabase`);

                // Sauvegarder en cache local
                this.saveCacheToLocalStorage();
                return true;
            }

            // Fallback sur cache localStorage
            console.log('⚠️ Supabase indisponible, chargement cache local...');
            const cachedKeys = this.loadCacheFromLocalStorage();

            if (cachedKeys) {
                this.keys = cachedKeys;
                this.isLoaded = true;
                console.log('✅ Clés chargées depuis cache localStorage');
                return true;
            }

            // Aucune clé disponible
            console.log('ℹ️ Aucune clé API configurée');
            this.keys = {};
            this.isLoaded = true;
            return true;
        } catch (error) {
            console.error('❌ Erreur init API Keys:', error);
            this.keys = {};
            this.isLoaded = true;
            return false;
        }
    },

    /**
     * 🆕 Charger les clés depuis Supabase
     */
    async loadFromSupabase() {
        try {
            // Vérifier que SupabaseManager est disponible
            if (!window.SupabaseManager || !SupabaseManager.client) {
                console.warn('⚠️ SupabaseManager non disponible');
                return null;
            }

            // Récupérer toutes les clés depuis la table api_keys
            const { data, error } = await SupabaseManager.client
                .from('api_keys')
                .select('key_name, key_value');

            if (error) {
                // Si la table n'existe pas
                if (error.code === '42P01' || error.code === 'PGRST116') {
                    console.log(
                        '📋 Table api_keys non trouvée. Exécutez le script SQL fourni dans supabase_api_keys_table.sql'
                    );
                    return null;
                }
                console.warn('⚠️ Erreur lecture Supabase api_keys:', error.message);
                return null;
            }

            if (!data || data.length === 0) {
                console.log('ℹ️ Aucune clé API dans Supabase');
                return {};
            }

            // Convertir le tableau en objet {key_name: key_value}
            const keysObject = {};
            data.forEach(row => {
                if (row.key_name && row.key_value) {
                    keysObject[row.key_name] = row.key_value;
                }
            });

            console.log(`✅ ${data.length} clés récupérées depuis Supabase`);
            return keysObject;
        } catch (error) {
            console.warn('⚠️ Exception loadFromSupabase:', error.message);
            return null;
        }
    },

    /**
     * 🆕 Sauvegarder une clé dans Supabase
     * @param keyName
     * @param keyValue
     */
    async saveToSupabase(keyName, keyValue) {
        try {
            if (!window.SupabaseManager || !SupabaseManager.client) {
                console.warn('⚠️ SupabaseManager non disponible');
                return false;
            }

            // Upsert (insert ou update)
            const { error } = await SupabaseManager.client.from('api_keys').upsert(
                {
                    key_name: keyName,
                    key_value: keyValue,
                    updated_at: new Date().toISOString()
                },
                {
                    onConflict: 'key_name'
                }
            );

            if (error) {
                console.error(`❌ Erreur sauvegarde ${keyName}:`, error.message);
                return false;
            }

            // Mettre à jour le cache local
            this.keys[keyName] = keyValue;
            this.saveCacheToLocalStorage();

            console.log(`✅ Clé ${keyName} sauvegardée dans Supabase`);
            return true;
        } catch (error) {
            console.error(`❌ Exception saveToSupabase ${keyName}:`, error.message);
            return false;
        }
    },

    /**
     * 🆕 Sauvegarder plusieurs clés en batch
     * @param keysObject
     */
    async saveBatchToSupabase(keysObject) {
        try {
            if (!window.SupabaseManager || !SupabaseManager.client) {
                console.warn('⚠️ SupabaseManager non disponible');
                return false;
            }

            const rows = Object.entries(keysObject).map(([key_name, key_value]) => ({
                key_name,
                key_value: key_value || '',
                updated_at: new Date().toISOString()
            }));

            if (rows.length === 0) {
                console.log('ℹ️ Aucune clé à sauvegarder');
                return true;
            }

            const { error } = await SupabaseManager.client.from('api_keys').upsert(rows, {
                onConflict: 'key_name'
            });

            if (error) {
                console.error('❌ Erreur sauvegarde batch API keys:', error);
                console.error('   Code:', error.code);
                console.error('   Message:', error.message);
                console.error('   Details:', error.details);
                console.error('   Rows tentées:', rows);
                return false;
            }

            // Mettre à jour le cache local
            this.keys = { ...this.keys, ...keysObject };
            this.saveCacheToLocalStorage();

            console.log(`✅ ${rows.length} clés sauvegardées dans Supabase`);
            return true;
        } catch (error) {
            console.error('❌ Exception saveBatchToSupabase:', error.message);
            return false;
        }
    },

    /**
     * Récupérer une clé
     * @param keyName
     * @param defaultValue
     */
    get(keyName, defaultValue = null) {
        if (!this.isLoaded) {
            console.warn('⚠️ API Keys Manager non chargé');
            return defaultValue;
        }

        return this.keys[keyName] || defaultValue;
    },

    /**
     * Définir une clé (et sauvegarder dans Supabase)
     * @param keyName
     * @param keyValue
     */
    async set(keyName, keyValue) {
        const success = await this.saveToSupabase(keyName, keyValue);
        return success;
    },

    /**
     * Sauvegarder en cache localStorage (pour usage offline)
     */
    saveCacheToLocalStorage() {
        try {
            localStorage.setItem('api_keys_cache', JSON.stringify(this.keys));
            localStorage.setItem('api_keys_cache_time', Date.now().toString());
            console.log('💾 Cache clés API mis à jour');
        } catch (error) {
            console.warn('⚠️ Erreur sauvegarde cache:', error.message);
        }
    },

    /**
     * Charger le cache depuis localStorage
     */
    loadCacheFromLocalStorage() {
        try {
            const cached = localStorage.getItem('api_keys_cache');
            if (cached) {
                return JSON.parse(cached);
            }
            return null;
        } catch (error) {
            console.warn('⚠️ Erreur lecture cache:', error.message);
            return null;
        }
    },

    /**
     * 🆕 Migrer les clés depuis ENV localStorage vers Supabase
     */
    async migrateFromENV() {
        console.log('🔄 Migration clés API : localStorage → Supabase...');

        try {
            const envConfig = localStorage.getItem('skaliprog_secure_config');
            if (!envConfig) {
                console.log('ℹ️ Aucune config ENV à migrer');
                return false;
            }

            const config = JSON.parse(envConfig);

            // Clés à migrer
            const keysToMigrate = {
                deepseekKey: config.deepseekKey || '',
                openaiKey: config.openaiKey || '',
                claudeKey: config.claudeKey || config.anthropicKey || '',
                discordBotToken: config.discordBotToken || '',
                morningCoachWebhook: config.morningCoachWebhook || ''
            };

            // Filtrer les clés vides
            const filteredKeys = {};
            Object.entries(keysToMigrate).forEach(([key, value]) => {
                if (value && value.trim()) {
                    filteredKeys[key] = value;
                }
            });

            if (Object.keys(filteredKeys).length === 0) {
                console.log('ℹ️ Aucune clé à migrer');
                return false;
            }

            // Sauvegarder dans Supabase
            const success = await this.saveBatchToSupabase(filteredKeys);

            if (success) {
                console.log(`✅ ${Object.keys(filteredKeys).length} clés migrées vers Supabase`);
                return true;
            }

            return false;
        } catch (error) {
            console.error('❌ Erreur migration:', error);
            return false;
        }
    },

    /**
     * Vérifier si une clé existe
     * @param keyName
     */
    has(keyName) {
        return !!this.keys[keyName];
    },

    /**
     * Obtenir toutes les clés (pour debug/admin uniquement)
     */
    getAllKeys() {
        return { ...this.keys };
    },

    /**
     * Nettoyer le cache
     */
    clearCache() {
        localStorage.removeItem('api_keys_cache');
        localStorage.removeItem('api_keys_cache_time');
        console.log('🗑️ Cache clés API nettoyé');
    }
};

// Exposer globalement
window.APIKeysManager = APIKeysManager;

// Auto-initialisation après SupabaseManager (avec vérification)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        // Attendre que SupabaseManager soit prêt
        let attempts = 0;
        const maxAttempts = 20; // 4 secondes max

        while (!window.SupabaseManager && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 200));
            attempts++;
        }

        if (window.SupabaseManager) {
            await APIKeysManager.init();
        } else {
            console.warn('⚠️ SupabaseManager non disponible après 4s, skip init APIKeysManager');
        }
    });
} else {
    setTimeout(async () => {
        // Attendre que SupabaseManager soit disponible
        let attempts = 0;
        const maxAttempts = 20;

        while (!window.SupabaseManager && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 200));
            attempts++;
        }

        if (window.SupabaseManager) {
            await APIKeysManager.init();
        } else {
            console.warn('⚠️ SupabaseManager non disponible, skip init APIKeysManager');
        }
    }, 500);
}
