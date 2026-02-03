/**
 * SETTINGS API KEYS UI MODULE
 *
 * Interface de gestion des clés API stockées dans Supabase
 *
 * Responsabilités:
 * - Afficher les clés API configurables
 * - Permettre la modification et sauvegarde dans Supabase
 * - Masquer/afficher les clés pour sécurité
 * - Tester les clés API
 *
 * Dépendances:
 * - APIKeysManager (js/core/api-keys-manager.js)
 * - SupabaseManager (js/integrations/supabasemanager.js)
 * - PermissionManager (js/managers/permissionmanager.js)
 */

const SettingsAPIKeysUI = {
    isInitialized: false,
    containerElement: null,

    /**
     * Configuration des clés API à afficher
     */
    apiKeysConfig: [
        {
            name: 'CLAUDE_API_KEY',
            label: 'Claude AI API Key',
            description: 'Clé pour la génération de programmes et contenus IA',
            placeholder: 'sk-ant-api03-...',
            type: 'password',
            testable: true,
            required: true
        },
        {
            name: 'DEEPSEEK_API_KEY',
            label: 'DeepSeek AI API Key',
            description: 'Clé API DeepSeek (optionnel)',
            placeholder: 'sk-...',
            type: 'password',
            testable: false,
            required: false
        },
        {
            name: 'OPENAI_API_KEY',
            label: 'OpenAI API Key',
            description: 'Clé API OpenAI (optionnel)',
            placeholder: 'sk-...',
            type: 'password',
            testable: false,
            required: false
        },
        {
            name: 'DISCORD_BOT_TOKEN',
            label: 'Discord Bot Token',
            description: 'Token du bot Discord complet',
            placeholder: 'MTQwMT...',
            type: 'password',
            testable: false,
            required: false
        },
        {
            name: 'DISCORD_GUILD_ID',
            label: 'Discord Guild ID (Serveur)',
            description: 'ID du serveur Discord',
            placeholder: '1400713384546009169',
            type: 'text',
            testable: false,
            required: false
        },
        {
            name: 'DISCORD_WEBHOOK_URL',
            label: 'Discord Webhook URL',
            description: 'URL du webhook Discord pour les notifications',
            placeholder: 'https://discord.com/api/webhooks/...',
            type: 'text',
            testable: true,
            required: false
        },
        {
            name: 'MORNING_COACH_WEBHOOK',
            label: 'Morning Coach Webhook',
            description: 'Webhook spécifique pour Morning Coach',
            placeholder: 'https://discord.com/api/webhooks/...',
            type: 'text',
            testable: true,
            required: false
        },
        {
            name: 'DISCORD_CLIENT_ID',
            label: 'Discord OAuth Client ID',
            description: 'Client ID pour OAuth Discord',
            placeholder: '1234567890',
            type: 'text',
            testable: false,
            required: false
        },
        {
            name: 'DISCORD_CLIENT_SECRET',
            label: 'Discord OAuth Client Secret',
            description: 'Secret pour OAuth Discord',
            placeholder: 'votre_secret_ici',
            type: 'password',
            testable: false,
            required: false
        },
        {
            name: 'SUPABASE_URL',
            label: 'Supabase URL',
            description: 'URL de votre projet Supabase',
            placeholder: 'https://[project].supabase.co',
            type: 'text',
            testable: true,
            required: true
        },
        {
            name: 'SUPABASE_KEY',
            label: 'Supabase Anon Key',
            description: 'Clé API publique Supabase',
            placeholder: 'eyJhbGciOiJIUzI1NiI...',
            type: 'password',
            testable: false,
            required: true
        },
        {
            name: 'OPENWEATHER_API_KEY',
            label: 'OpenWeather API Key',
            description: 'Clé API OpenWeather (optionnel)',
            placeholder: 'votre_clé_openweather',
            type: 'password',
            testable: true,
            required: false
        },
        {
            name: 'PROXY_URL_DEV',
            label: 'Proxy URL (Développement)',
            description: 'URL du proxy API en développement',
            placeholder: 'http://localhost:3001',
            type: 'text',
            testable: true,
            required: true
        },
        {
            name: 'PROXY_URL_PROD',
            label: 'Proxy URL (Production)',
            description: 'URL du proxy API en production',
            placeholder: 'https://[ngrok].ngrok-free.dev',
            type: 'text',
            testable: true,
            required: true
        }
    ],

    /**
     * Initialiser le module
     */
    async init(containerId = 'api-keys-settings-container') {
        if (this.isInitialized) {
            console.warn('⚠️ SettingsAPIKeysUI déjà initialisé');
            return;
        }

        // Vérifier que l'utilisateur est admin
        if (typeof Auth !== 'undefined' && !Auth.isAdmin()) {
            console.error('❌ Accès réservé aux administrateurs');
            return;
        }

        // Vérifier que APIKeysManager est disponible
        if (!window.APIKeysManager) {
            console.error('❌ APIKeysManager non disponible');
            return;
        }

        this.containerElement = document.getElementById(containerId);
        if (!this.containerElement) {
            console.error(`❌ Container #${containerId} non trouvé`);
            return;
        }

        await this.render();
        this.attachEventListeners();

        this.isInitialized = true;
        console.log('✅ SettingsAPIKeysUI initialisé');
    },

    /**
     * Générer le HTML de l'interface
     */
    async render() {
        const html = `
            <div class="api-keys-settings">
                <!-- En-tête -->
                <div class="glass-card p-6 mb-6">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <h2 class="text-2xl font-bold text-white flex items-center">
                                <i class="fas fa-key text-green-500 mr-3"></i>
                                Gestion des Clés API
                            </h2>
                            <p class="text-gray-400 mt-2">
                                Configurez vos clés API une fois pour toutes.
                                Elles sont stockées de manière sécurisée dans Supabase.
                            </p>
                        </div>
                        <button id="refresh-api-keys-btn" class="glass-button">
                            <i class="fas fa-sync-alt mr-2"></i>
                            Recharger
                        </button>
                    </div>

                    <!-- Statut de synchronisation -->
                    <div id="api-keys-sync-status" class="glass-card bg-blue-500/10 border-blue-500 p-3 text-sm">
                        <i class="fas fa-info-circle text-blue-500 mr-2"></i>
                        Chargement des clés depuis Supabase...
                    </div>
                </div>

                <!-- Formulaire de configuration -->
                <form id="api-keys-form" class="space-y-4">
                    ${this.apiKeysConfig
                        .map(
                            key => `
                        <div class="glass-card p-5 api-key-field" data-key-name="${key.name}">
                            <div class="flex items-start justify-between mb-3">
                                <div class="flex-1">
                                    <label class="block text-white font-semibold mb-1">
                                        ${key.label}
                                        ${key.required ? '<span class="text-red-500 ml-1">*</span>' : '<span class="text-gray-500 text-xs ml-2">(optionnel)</span>'}
                                    </label>
                                    <p class="text-gray-400 text-sm">${key.description}</p>
                                </div>
                                ${
                                    key.testable
                                        ? `
                                    <button type="button" class="test-api-key-btn glass-button text-xs" data-key-name="${key.name}">
                                        <i class="fas fa-vial mr-1"></i>
                                        Tester
                                    </button>
                                `
                                        : ''
                                }
                            </div>

                            <div class="flex gap-2">
                                <div class="flex-1 relative">
                                    <input
                                        type="${key.type}"
                                        id="api-key-${key.name}"
                                        name="${key.name}"
                                        class="glass-input w-full pr-10"
                                        placeholder="${key.placeholder}"
                                        ${key.required ? 'required' : ''}
                                    >
                                    ${
                                        key.type === 'password'
                                            ? `
                                        <button type="button" class="toggle-visibility-btn absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                                data-input-id="api-key-${key.name}">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    `
                                            : ''
                                    }
                                </div>
                            </div>

                            <!-- Statut de test -->
                            <div id="test-status-${key.name}" class="mt-2 hidden"></div>
                        </div>
                    `
                        )
                        .join('')}

                    <!-- Boutons d'action -->
                    <div class="glass-card p-5">
                        <div class="flex gap-3 justify-end">
                            <button type="button" id="import-from-env-btn" class="glass-button">
                                <i class="fas fa-file-import mr-2"></i>
                                Importer depuis .env
                            </button>
                            <button type="button" id="reset-api-keys-btn" class="glass-button bg-red-500/20 border-red-500">
                                <i class="fas fa-undo mr-2"></i>
                                Réinitialiser
                            </button>
                            <button type="submit" id="save-api-keys-btn" class="glass-button bg-green-500/20 border-green-500">
                                <i class="fas fa-save mr-2"></i>
                                Enregistrer dans Supabase
                            </button>
                        </div>
                    </div>
                </form>

                <!-- Message de succès/erreur -->
                <div id="api-keys-message" class="mt-4"></div>
            </div>
        `;

        this.containerElement.innerHTML = html;

        // Charger les valeurs existantes
        await this.loadCurrentValues();
    },

    /**
     * Charger les valeurs actuelles depuis APIKeysManager
     */
    async loadCurrentValues() {
        try {
            // Attendre que APIKeysManager soit initialisé (avec timeout)
            let waitCount = 0;
            while (!APIKeysManager.isLoaded && waitCount < 10) {
                await new Promise(resolve => setTimeout(resolve, 200));
                waitCount++;
            }

            if (!APIKeysManager.isLoaded) {
                console.warn('⚠️ APIKeysManager non initialisé après 2s, chargement...');
                await APIKeysManager.init();
            }

            const allKeys = APIKeysManager.getAllKeys();

            // Utiliser DocumentFragment pour optimiser les modifications DOM
            this.apiKeysConfig.forEach(keyConfig => {
                const input = document.getElementById(`api-key-${keyConfig.name}`);
                if (input) {
                    const value = allKeys[keyConfig.name] || '';
                    input.value = value;

                    // Indicateur visuel si clé configurée
                    if (value) {
                        input.classList.add('border-green-500');
                    }
                }
            });

            // Afficher statut
            this.showSyncStatus('success', `${Object.keys(allKeys).length} clés chargées depuis Supabase`);
        } catch (error) {
            console.error('❌ Erreur chargement valeurs:', error);
            this.showSyncStatus('error', 'Erreur chargement des clés');
        }
    },

    /**
     * Attacher les event listeners
     */
    attachEventListeners() {
        // Formulaire de sauvegarde
        const form = document.getElementById('api-keys-form');
        form?.addEventListener('submit', e => {
            e.preventDefault();
            this.handleSave();
        });

        // Bouton rafraîchir
        document.getElementById('refresh-api-keys-btn')?.addEventListener('click', () => {
            this.handleRefresh();
        });

        // Bouton réinitialiser
        document.getElementById('reset-api-keys-btn')?.addEventListener('click', () => {
            this.handleReset();
        });

        // Bouton importer depuis ENV
        document.getElementById('import-from-env-btn')?.addEventListener('click', () => {
            this.handleImportFromEnv();
        });

        // Boutons toggle visibility
        document.querySelectorAll('.toggle-visibility-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                const inputId = e.currentTarget.dataset.inputId;
                const input = document.getElementById(inputId);
                const icon = e.currentTarget.querySelector('i');

                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        });

        // Boutons de test
        document.querySelectorAll('.test-api-key-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                const keyName = e.currentTarget.dataset.keyName;
                this.handleTestKey(keyName);
            });
        });
    },

    /**
     * Sauvegarder les clés dans Supabase
     */
    async handleSave() {
        const saveBtn = document.getElementById('save-api-keys-btn');
        const originalText = saveBtn.innerHTML;

        try {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sauvegarde...';

            // Récupérer toutes les valeurs du formulaire
            const formData = new FormData(document.getElementById('api-keys-form'));
            const keysToSave = {};

            for (const [key, value] of formData.entries()) {
                if (value && value.trim()) {
                    keysToSave[key] = value.trim();
                }
            }

            // Sauvegarder en batch dans Supabase
            const success = await APIKeysManager.saveBatchToSupabase(keysToSave);

            if (success) {
                this.showMessage('success', `✅ ${Object.keys(keysToSave).length} clés sauvegardées dans Supabase`);
                this.showSyncStatus('success', 'Clés synchronisées avec Supabase');

                // Mettre à jour les bordures
                Object.keys(keysToSave).forEach(keyName => {
                    const input = document.getElementById(`api-key-${keyName}`);
                    if (input) {
                        input.classList.add('border-green-500');
                    }
                });
            } else {
                this.showMessage('error', '❌ Erreur lors de la sauvegarde dans Supabase');
            }
        } catch (error) {
            console.error('❌ Erreur sauvegarde:', error);
            this.showMessage('error', `❌ Erreur: ${error.message}`);
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalText;
        }
    },

    /**
     * Rafraîchir les clés depuis Supabase
     */
    async handleRefresh() {
        try {
            this.showSyncStatus('info', 'Rechargement depuis Supabase...');

            await APIKeysManager.init();
            await this.loadCurrentValues();

            this.showMessage('success', '✅ Clés rechargées depuis Supabase');
        } catch (error) {
            console.error('❌ Erreur refresh:', error);
            this.showMessage('error', '❌ Erreur rechargement');
        }
    },

    /**
     * Réinitialiser le formulaire
     */
    handleReset() {
        if (confirm('⚠️ Réinitialiser tous les champs ? (Les valeurs ne seront pas supprimées de Supabase)')) {
            document.getElementById('api-keys-form').reset();
            this.showMessage('info', 'ℹ️ Formulaire réinitialisé');
        }
    },

    /**
     * Importer depuis l'ancien système ENV
     */
    async handleImportFromEnv() {
        try {
            this.showMessage('info', '🔄 Import depuis ENV...');

            const success = await APIKeysManager.migrateFromENV();

            if (success) {
                await this.loadCurrentValues();
                this.showMessage('success', '✅ Clés importées depuis ENV');
            } else {
                this.showMessage('warning', '⚠️ Aucune clé à importer');
            }
        } catch (error) {
            console.error('❌ Erreur import:', error);
            this.showMessage('error', '❌ Erreur import');
        }
    },

    /**
     * Tester une clé API
     */
    async handleTestKey(keyName) {
        const statusDiv = document.getElementById(`test-status-${keyName}`);
        const testBtn = document.querySelector(`.test-api-key-btn[data-key-name="${keyName}"]`);
        const input = document.getElementById(`api-key-${keyName}`);

        const value = input.value.trim();
        if (!value) {
            this.showTestStatus(keyName, 'warning', 'Veuillez entrer une valeur');
            return;
        }

        const originalText = testBtn.innerHTML;
        testBtn.disabled = true;
        testBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Test...';

        try {
            let testResult = false;

            // Tests selon le type de clé
            switch (keyName) {
                case 'CLAUDE_API_KEY':
                    testResult = await this.testClaudeAPI(value);
                    break;
                case 'DISCORD_WEBHOOK_URL':
                case 'MORNING_COACH_WEBHOOK':
                    testResult = await this.testDiscordWebhook(value);
                    break;
                case 'SUPABASE_URL':
                    testResult = await this.testSupabaseURL(value);
                    break;
                case 'PROXY_URL_DEV':
                case 'PROXY_URL_PROD':
                    testResult = await this.testProxyURL(value);
                    break;
                case 'OPENWEATHER_API_KEY':
                    testResult = await this.testOpenWeatherAPI(value);
                    break;
                default:
                    this.showTestStatus(keyName, 'info', 'Test non implémenté pour cette clé');
                    return;
            }

            if (testResult) {
                this.showTestStatus(keyName, 'success', '✅ Clé valide');
            } else {
                this.showTestStatus(keyName, 'error', '❌ Clé invalide');
            }
        } catch (error) {
            this.showTestStatus(keyName, 'error', `❌ Erreur: ${error.message}`);
        } finally {
            testBtn.disabled = false;
            testBtn.innerHTML = originalText;
        }
    },

    /**
     * Test Claude API
     * Note: Test basique de format uniquement (pas d'appel API réel pour éviter CORS)
     * La validation réelle se fera lors de l'utilisation normale via le proxy
     */
    async testClaudeAPI(apiKey) {
        try {
            // Validation du format de la clé
            if (!apiKey || !apiKey.startsWith('sk-ant-api03-')) {
                return false;
            }

            // Vérifier longueur minimale (les clés Claude font généralement ~100+ caractères)
            if (apiKey.length < 50) {
                return false;
            }

            // ✅ Format valide (test réel se fera automatiquement lors de l'utilisation)
            return true;

            /* Note: Pour un test réel, il faudrait:
             * 1. Démarrer le proxy server (node server.js)
             * 2. Utiliser le code ci-dessous:
             *
             * const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
             * const proxyUrl = isLocal ? 'http://localhost:3001' : 'https://[ngrok].ngrok-free.dev';
             * const response = await fetch(`${proxyUrl}/api/chat`, {
             *     method: 'POST',
             *     headers: { 'Content-Type': 'application/json' },
             *     body: JSON.stringify({
             *         messages: [{ role: 'user', content: 'Test' }],
             *         model: 'claude-3-haiku-20240307',
             *         max_tokens: 10,
             *         apiKey: apiKey
             *     })
             * });
             * return response.ok;
             */
        } catch (error) {
            console.error('Test Claude API error:', error);
            return false;
        }
    },

    /**
     * Test Discord Webhook
     */
    async testDiscordWebhook(webhookUrl) {
        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: '🧪 Test webhook depuis Skali Prog',
                    username: 'Skali Prog Test'
                })
            });

            return response.ok;
        } catch (error) {
            console.error('Test Discord webhook error:', error);
            return false;
        }
    },

    /**
     * Test Supabase URL
     */
    async testSupabaseURL(url) {
        try {
            const response = await fetch(`${url}/rest/v1/`, {
                headers: { 'Content-Type': 'application/json' }
            });

            // Supabase renvoie 401 si non authentifié, mais l'URL est valide
            return response.status === 401 || response.ok;
        } catch (error) {
            console.error('Test Supabase URL error:', error);
            return false;
        }
    },

    /**
     * Test Proxy URL
     */
    async testProxyURL(url) {
        try {
            const response = await fetch(`${url}/health`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            return response.ok;
        } catch (error) {
            console.error('Test Proxy URL error:', error);
            return false;
        }
    },

    /**
     * Test OpenWeather API
     */
    async testOpenWeatherAPI(apiKey) {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=Paris&appid=${apiKey}`
            );

            return response.ok;
        } catch (error) {
            console.error('Test OpenWeather API error:', error);
            return false;
        }
    },

    /**
     * Afficher un message de statut
     */
    showMessage(type, message) {
        const messageDiv = document.getElementById('api-keys-message');
        if (!messageDiv) return;

        const colors = {
            success: 'bg-green-500/20 border-green-500 text-green-400',
            error: 'bg-red-500/20 border-red-500 text-red-400',
            warning: 'bg-orange-500/20 border-orange-500 text-orange-400',
            info: 'bg-blue-500/20 border-blue-500 text-blue-400'
        };

        messageDiv.innerHTML = `
            <div class="glass-card ${colors[type]} p-4 animate-fade-in">
                ${message}
            </div>
        `;

        setTimeout(() => {
            messageDiv.innerHTML = '';
        }, 5000);
    },

    /**
     * Afficher statut de sync
     */
    showSyncStatus(type, message) {
        const statusDiv = document.getElementById('api-keys-sync-status');
        if (!statusDiv) return;

        const colors = {
            success: 'bg-green-500/10 border-green-500 text-green-400',
            error: 'bg-red-500/10 border-red-500 text-red-400',
            warning: 'bg-orange-500/10 border-orange-500 text-orange-400',
            info: 'bg-blue-500/10 border-blue-500 text-blue-400'
        };

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        statusDiv.className = `glass-card ${colors[type]} p-3 text-sm`;
        statusDiv.innerHTML = `
            <i class="fas ${icons[type]} mr-2"></i>
            ${message}
        `;
    },

    /**
     * Afficher statut de test d'une clé
     */
    showTestStatus(keyName, type, message) {
        const statusDiv = document.getElementById(`test-status-${keyName}`);
        if (!statusDiv) return;

        const colors = {
            success: 'bg-green-500/10 border-green-500 text-green-400',
            error: 'bg-red-500/10 border-red-500 text-red-400',
            warning: 'bg-orange-500/10 border-orange-500 text-orange-400',
            info: 'bg-blue-500/10 border-blue-500 text-blue-400'
        };

        statusDiv.className = `glass-card ${colors[type]} p-2 text-xs mt-2`;
        statusDiv.classList.remove('hidden');
        statusDiv.textContent = message;

        setTimeout(() => {
            statusDiv.classList.add('hidden');
        }, 5000);
    },

    /**
     * Réinitialiser le module (pour permettre plusieurs initialisations)
     */
    reset() {
        this.isInitialized = false;
        this.containerElement = null;
    },

    /**
     * Détruire le module
     */
    destroy() {
        if (this.containerElement) {
            this.containerElement.innerHTML = '';
        }
        this.reset();
    }
};

// Exposer globalement
window.SettingsAPIKeysUI = SettingsAPIKeysUI;
