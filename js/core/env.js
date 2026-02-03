// ========================================
// GESTIONNAIRE DE VARIABLES D'ENVIRONNEMENT
// Skaliprog 2.2 - Sécurité
// ========================================

const ENV = {
    // Configuration chargée
    config: {},
    isLoaded: false,

    /**
     * Initialiser la configuration
     * Charge les variables depuis localStorage (configuré via interface admin)
     */
    async init() {
        console.log('🔐 Initialisation configuration sécurisée...');

        try {
            // Tenter de charger depuis localStorage (configuré une fois)
            const storedConfig = localStorage.getItem('skaliprog_secure_config');

            if (storedConfig) {
                this.config = JSON.parse(storedConfig);
                this.isLoaded = true;
                console.log('✅ Configuration chargée depuis localStorage');
            } else {
                // Configuration par défaut (DEV uniquement - à retirer en production)
                console.warn('⚠️ Aucune configuration trouvée - utilisation config par défaut');
                this.loadDefaultConfig();
            }

            return true;
        } catch (error) {
            console.error('❌ Erreur chargement configuration:', error);
            return false;
        }
    },

    /**
     * Configuration par défaut (DEV ONLY)
     * EN PRODUCTION: Configurer via interface admin (Paramètres → Configuration Sécurisée)
     */
    loadDefaultConfig() {
        // ⚠️ SÉCURITÉ : Configuration par défaut avec anon key (safe pour frontend)
        // Les autres clés sensibles doivent être configurées via l'interface admin
        this.config = {
            supabaseUrl: 'https://dhzknhevbzdauakzbdhr.supabase.co',
            supabaseKey:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoemtuaGV2YnpkYXVha3piZGhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTgxMDksImV4cCI6MjA3MTI3NDEwOX0.5L-qsdi8a5Ov7RufgXQQgG27rtAlvIvbG6mZ_fVOk2k', // ✅ Anon key (safe pour Netlify)
            adminPassword: 'skaliprog', // 🔐 Mot de passe admin par défaut
            discordBotToken: '', // 🔐 À configurer via interface admin
            discordGuildId: '1400713384546009169',
            claudeApiKey: localStorage.getItem('anthropic_api_key') || '',
            anthropicKey: '', // 🔐 À configurer via interface admin
            claudeKey: '', // 🔐 À configurer via interface admin
            deepseekKey: '', // 🔐 À configurer via interface admin
            morningCoachWebhook: '', // 🔐 À configurer via interface admin
            apiUrl: 'https://laskali.eu', // ⚠️ NON UTILISÉ - CRM Analytics utilise directement Supabase
            cacheDuration: 300000 // 5 minutes
        };

        // Avertissement si aucune configuration stockée
        const storedConfig = localStorage.getItem('skaliprog_secure_config');
        if (!storedConfig) {
            console.warn(
                '🔐 CONFIGURATION REQUISE : Aller dans Paramètres → Configuration Sécurisée pour configurer les clés API'
            );
        }

        this.isLoaded = true;
    },

    /**
     * 🆕 Obtenir une valeur de configuration (VERSION AVEC API KEYS MANAGER)
     * Cherche d'abord dans APIKeysManager (Supabase), puis fallback sur config locale
     * @param key
     * @param defaultValue
     */
    get(key, defaultValue = null) {
        if (!this.isLoaded) {
            console.warn("⚠️ Configuration non chargée - appeler ENV.init() d'abord");
            return defaultValue;
        }

        // 🆕 Pour les clés API, checker APIKeysManager en priorité
        const apiKeyNames = [
            'deepseekKey',
            'openaiKey',
            'claudeKey',
            'anthropicKey',
            'discordBotToken',
            'morningCoachWebhook'
        ];

        if (apiKeyNames.includes(key) && window.APIKeysManager && APIKeysManager.isLoaded) {
            const apiKey = APIKeysManager.get(key);
            if (apiKey) {
                return apiKey;
            }
        }

        // Fallback sur config locale
        return this.config[key] || defaultValue;
    },

    /**
     * Définir une valeur de configuration (et sauvegarder)
     * @param key
     * @param value
     */
    set(key, value) {
        this.config[key] = value;
        this.save();
    },

    /**
     * Sauvegarder credentials pour page mobile
     */
    saveMobileCredentials() {
        try {
            localStorage.setItem('supabase_url', this.config.supabaseUrl);
            localStorage.setItem('supabase_key', this.config.supabaseKey);
            console.log('✅ Credentials Supabase sauvegardés pour mobile');
        } catch (error) {
            console.error('❌ Erreur sauvegarde credentials mobile:', error);
        }
    },

    /**
     * Sauvegarder la configuration
     */
    save() {
        try {
            localStorage.setItem('skaliprog_secure_config', JSON.stringify(this.config));
            console.log('✅ Configuration sauvegardée');
            return true;
        } catch (error) {
            console.error('❌ Erreur sauvegarde configuration:', error);
            return false;
        }
    },

    /**
     * Ouvrir l'interface de configuration sécurisée
     * Accessible uniquement en mode admin
     */
    async openConfigModal() {
        if (!Auth.isAdmin()) {
            Utils.showNotification('Accès réservé aux administrateurs', 'error');
            return;
        }

        const html = `
            <div class="fixed inset-0 modal-backdrop flex items-center justify-center z-50 fade-in-premium" onclick="Utils.closeModal(event)">
                <div class="premium-card max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
                    <!-- Header -->
                    <div class="flex items-center justify-between mb-8">
                        <div>
                            <h3 class="text-3xl font-bold text-green-400 flex items-center gap-3">
                                <i class="fas fa-shield-alt"></i>
                                Configuration Sécurisée
                            </h3>
                            <p class="text-gray-400 text-sm mt-1">Paramètres avancés de l'application</p>
                        </div>
                        <button onclick="Utils.closeModal()" class="text-gray-400 hover:text-white transition">
                            <i class="fas fa-times text-2xl"></i>
                        </button>
                    </div>

                    <!-- Grid 2 colonnes -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <!-- SUPABASE -->
                        <div class="bg-wood-dark bg-opacity-50 rounded-lg p-5 border border-wood-accent border-opacity-30 hover:border-opacity-50 transition">
                            <h4 class="text-xl font-bold mb-4 text-green-400 flex items-center gap-2">
                                <i class="fas fa-database"></i>
                                Supabase
                            </h4>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-semibold text-gray-300 mb-2">
                                        <i class="fas fa-link text-xs mr-1"></i> URL du projet
                                    </label>
                                    <input type="text" id="configSupabaseUrl"
                                           value="${this.get('supabaseUrl', '')}"
                                           class="w-full bg-skali-darker border border-wood-accent border-opacity-20 rounded-lg px-4 py-3 text-sm focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition"
                                           placeholder="https://votre-projet.supabase.co">
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-gray-300 mb-2">
                                        <i class="fas fa-key text-xs mr-1"></i> Clé API (anon)
                                    </label>
                                    <div class="relative">
                                        <input type="password" id="configSupabaseKey"
                                               value="${this.get('supabaseKey', '')}"
                                               class="w-full bg-skali-darker border border-wood-accent border-opacity-20 rounded-lg px-4 py-3 pr-12 text-sm focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition"
                                               placeholder="eyJhbGciOiJIUzI1NiIs...">
                                        <button onclick="const input = document.getElementById('configSupabaseKey'); input.type = input.type === 'password' ? 'text' : 'password'"
                                                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-400 transition">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- AUTHENTIFICATION -->
                        <div class="bg-wood-dark bg-opacity-50 rounded-lg p-5 border border-wood-accent border-opacity-30 hover:border-opacity-50 transition">
                            <h4 class="text-xl font-bold mb-4 text-green-400 flex items-center gap-2">
                                <i class="fas fa-user-shield"></i>
                                Authentification
                            </h4>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-semibold text-gray-300 mb-2">
                                        <i class="fas fa-crown text-xs mr-1 text-yellow-400"></i> Mot de passe Admin
                                    </label>
                                    <input type="password" id="configAdminPassword"
                                           value="${this.get('adminPassword', '')}"
                                           class="w-full bg-skali-darker border border-wood-accent border-opacity-20 rounded-lg px-4 py-3 text-sm focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition">
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-gray-300 mb-2">
                                        <i class="fas fa-user-tie text-xs mr-1"></i> Mot de passe Coach
                                    </label>
                                    <input type="password" id="configCoachPassword"
                                           value="${this.get('coachPassword', 'coach2024')}"
                                           class="w-full bg-skali-darker border border-wood-accent border-opacity-20 rounded-lg px-4 py-3 text-sm focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition">
                                </div>
                            </div>
                        </div>

                        <!-- DISCORD -->
                        <div class="bg-wood-dark bg-opacity-50 rounded-lg p-5 border border-wood-accent border-opacity-30 hover:border-opacity-50 transition">
                            <h4 class="text-xl font-bold mb-4 text-green-400 flex items-center gap-2">
                                <i class="fab fa-discord"></i>
                                Discord
                            </h4>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-semibold text-gray-300 mb-2">
                                        <i class="fas fa-robot text-xs mr-1"></i> Bot Token
                                    </label>
                                    <div class="relative">
                                        <input type="password" id="configDiscordBotToken"
                                               value="${this.get('discordBotToken', '')}"
                                               class="w-full bg-skali-darker border border-wood-accent border-opacity-20 rounded-lg px-4 py-3 pr-12 text-sm focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition"
                                               placeholder="MTQwMTE2MTA2MzcxNzY2NjgyNg...">
                                        <button onclick="const input = document.getElementById('configDiscordBotToken'); input.type = input.type === 'password' ? 'text' : 'password'"
                                                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-400 transition">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </div>
                                    <small class="text-xs text-gray-500 mt-1 block">
                                        <i class="fas fa-info-circle mr-1"></i>
                                        Token pour la vérification d'appartenance au serveur Discord
                                    </small>
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-gray-300 mb-2">
                                        <i class="fas fa-server text-xs mr-1"></i> Server ID (Guild ID)
                                    </label>
                                    <input type="text" id="configDiscordGuildId"
                                           value="${this.get('discordGuildId', '1400713384546009169')}"
                                           class="w-full bg-skali-darker border border-wood-accent border-opacity-20 rounded-lg px-4 py-3 text-sm focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition"
                                           placeholder="1400713384546009169">
                                    <small class="text-xs text-gray-500 mt-1 block">
                                        <i class="fas fa-info-circle mr-1"></i>
                                        ID du serveur Discord Skàli
                                    </small>
                                </div>
                            </div>
                        </div>

                        <!-- IA (Optionnel) -->
                        <div class="bg-wood-dark bg-opacity-50 rounded-lg p-5 border border-wood-accent border-opacity-30 hover:border-opacity-50 transition">
                            <h4 class="text-xl font-bold mb-4 text-green-400 flex items-center gap-2">
                                <i class="fas fa-robot"></i>
                                Intelligence Artificielle
                                <span class="text-xs bg-green-400/20 text-green-400 px-2 py-1 rounded">Optionnel</span>
                            </h4>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-semibold text-gray-300 mb-2">
                                        <i class="fas fa-star text-xs mr-1 text-yellow-400"></i> DeepSeek API Key
                                        <span class="text-xs text-green-400">(Recommandé - Moins cher)</span>
                                    </label>
                                    <input type="password" id="configDeepSeekKey"
                                           value="${this.get('deepseekKey', '')}"
                                           class="w-full bg-skali-darker border border-wood-accent border-opacity-20 rounded-lg px-4 py-3 text-sm focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition"
                                           placeholder="sk-...">
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-gray-300 mb-2">
                                        <i class="fab fa-openai text-xs mr-1"></i> OpenAI API Key
                                    </label>
                                    <input type="password" id="configOpenAIKey"
                                           value="${this.get('openaiKey', '')}"
                                           class="w-full bg-skali-darker border border-wood-accent border-opacity-20 rounded-lg px-4 py-3 text-sm focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition"
                                           placeholder="sk-...">
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-gray-300 mb-2">
                                        <i class="fas fa-brain text-xs mr-1"></i> Claude API Key
                                    </label>
                                    <input type="password" id="configClaudeKey"
                                           value="${this.get('claudeKey', '')}"
                                           class="w-full bg-skali-darker border border-wood-accent border-opacity-20 rounded-lg px-4 py-3 text-sm focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition"
                                           placeholder="sk-ant-...">
                                </div>
                            </div>
                        </div>

                        <!-- PARAMÈTRES -->
                        <div class="bg-wood-dark bg-opacity-50 rounded-lg p-5 border border-wood-accent border-opacity-30 hover:border-opacity-50 transition">
                            <h4 class="text-xl font-bold mb-4 text-green-400 flex items-center gap-2">
                                <i class="fas fa-sliders-h"></i>
                                Paramètres système
                            </h4>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-semibold text-gray-300 mb-2">
                                        <i class="fas fa-chart-bar text-xs mr-1"></i> URL API Analytics
                                    </label>
                                    <input type="text" id="configApiUrl"
                                           value="${this.get('apiUrl', 'https://api.laskali.eu')}"
                                           class="w-full bg-skali-darker border border-wood-accent border-opacity-20 rounded-lg px-4 py-3 text-sm focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition"
                                           placeholder="https://api.laskali.eu">
                                    <small class="text-xs text-gray-500 mt-1 block">
                                        <i class="fas fa-info-circle mr-1"></i>
                                        URL de l'API pour le dashboard CRM Analytics (endpoint: /stats)
                                    </small>
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-gray-300 mb-2">
                                        <i class="fas fa-palette text-xs mr-1"></i> Thème de l'application
                                    </label>
                                    <select id="configTheme"
                                            class="w-full bg-skali-darker border border-wood-accent border-opacity-20 rounded-lg px-4 py-3 text-sm focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition">
                                        ${this.getThemeOptions()}
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-gray-300 mb-2">
                                        <i class="fas fa-font text-xs mr-1"></i> Couleur du texte principal
                                    </label>
                                    <div class="flex items-center gap-3">
                                        <input type="color" id="configTextColor"
                                               value="${this.get('customTextColor', '#1a1a1a')}"
                                               class="h-12 w-16 bg-skali-darker border border-wood-accent border-opacity-20 rounded-lg cursor-pointer">
                                        <input type="text" id="configTextColorHex"
                                               value="${this.get('customTextColor', '#1a1a1a')}"
                                               class="flex-1 bg-skali-darker border border-wood-accent border-opacity-20 rounded-lg px-4 py-3 text-sm focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition"
                                               placeholder="#1a1a1a">
                                    </div>
                                    <small class="text-xs text-gray-500 mt-1 block">
                                        <i class="fas fa-info-circle mr-1"></i>
                                        Personnalise la couleur du texte pour une meilleure lisibilité
                                    </small>
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-gray-300 mb-2">
                                        <i class="fas fa-fill-drip text-xs mr-1"></i> Couleur de fond principale
                                    </label>
                                    <div class="flex items-center gap-3">
                                        <input type="color" id="configBgColor"
                                               value="${this.get('customBgColor', '#f8fdf9')}"
                                               class="h-12 w-16 bg-skali-darker border border-wood-accent border-opacity-20 rounded-lg cursor-pointer">
                                        <input type="text" id="configBgColorHex"
                                               value="${this.get('customBgColor', '#f8fdf9')}"
                                               class="flex-1 bg-skali-darker border border-wood-accent border-opacity-20 rounded-lg px-4 py-3 text-sm focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition"
                                               placeholder="#f8fdf9">
                                    </div>
                                    <small class="text-xs text-gray-500 mt-1 block">
                                        <i class="fas fa-info-circle mr-1"></i>
                                        Couleur de fond de l'application (blanc cassé vert par défaut)
                                    </small>
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-gray-300 mb-2">
                                        <i class="fas fa-clock text-xs mr-1"></i> Durée du cache
                                    </label>
                                    <input type="number" id="configCacheDuration"
                                           value="${this.get('cacheDuration', 300000)}"
                                           class="w-full bg-skali-darker border border-wood-accent border-opacity-20 rounded-lg px-4 py-3 text-sm focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition"
                                           placeholder="300000">
                                    <small class="text-xs text-gray-500 mt-1 block">
                                        <i class="fas fa-info-circle mr-1"></i>
                                        300000 ms = 5 minutes
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Warning Banner -->
                    <div class="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border border-yellow-600/50 rounded-lg p-4 mb-6">
                        <div class="flex items-start gap-3">
                            <i class="fas fa-exclamation-triangle text-yellow-400 text-xl mt-1"></i>
                            <div>
                                <p class="font-semibold text-yellow-300 mb-1">Informations sensibles</p>
                                <p class="text-sm text-gray-300">
                                    Ces données sont confidentielles et stockées localement dans votre navigateur.
                                    La page sera automatiquement rechargée après la sauvegarde.
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-4">
                        <button onclick="Utils.closeModal()"
                                class="flex-1 btn-premium bg-gray-700 hover:bg-gray-600 border-gray-600">
                            <i class="fas fa-times mr-2"></i>
                            Annuler
                        </button>
                        <button onclick="ENV.saveConfigFromModal()"
                                class="flex-1 btn-premium btn-publish">
                            <i class="fas fa-save mr-2"></i>
                            Enregistrer la configuration
                        </button>
                    </div>
                </div>
            </div>

            <script>
                // Synchroniser le color picker TEXTE avec le champ hex
                document.getElementById('configTextColor').addEventListener('input', (e) => {
                    document.getElementById('configTextColorHex').value = e.target.value;
                });
                document.getElementById('configTextColorHex').addEventListener('input', (e) => {
                    const color = e.target.value;
                    if (/^#[0-9A-F]{6}$/i.test(color)) {
                        document.getElementById('configTextColor').value = color;
                    }
                });

                // Synchroniser le color picker FOND avec le champ hex
                document.getElementById('configBgColor').addEventListener('input', (e) => {
                    document.getElementById('configBgColorHex').value = e.target.value;
                });
                document.getElementById('configBgColorHex').addEventListener('input', (e) => {
                    const color = e.target.value;
                    if (/^#[0-9A-F]{6}$/i.test(color)) {
                        document.getElementById('configBgColor').value = color;
                    }
                });
            </script>
        `;

        document.getElementById('modalContainer').innerHTML = html;
    },

    /**
     * Générer les options de thème pour le select
     */
    getThemeOptions() {
        const currentTheme = ThemeManager.getCurrentTheme();
        const themes = ThemeManager.getAvailableThemes();

        return themes
            .map(theme => {
                const selected = theme.id === currentTheme ? 'selected' : '';
                return `<option value="${theme.id}" ${selected}>
                <i class="fas ${theme.icon}"></i> ${theme.name} - ${theme.description}
            </option>`;
            })
            .join('');
    },

    /**
     * 🆕 Sauvegarder depuis la modal (VERSION SUPABASE)
     */
    async saveConfigFromModal() {
        // Sauvegarder config locale
        this.set('supabaseUrl', document.getElementById('configSupabaseUrl').value.trim());
        this.set('supabaseKey', document.getElementById('configSupabaseKey').value.trim());
        this.set('adminPassword', document.getElementById('configAdminPassword').value);
        this.set('coachPassword', document.getElementById('configCoachPassword').value);
        this.set('apiUrl', document.getElementById('configApiUrl').value.trim());
        this.set('cacheDuration', parseInt(document.getElementById('configCacheDuration').value));
        this.set('discordGuildId', document.getElementById('configDiscordGuildId').value.trim());

        // 🆕 Sauvegarder les clés API dans Supabase via APIKeysManager
        if (window.APIKeysManager && APIKeysManager.isLoaded) {
            console.log('💾 Sauvegarde clés API dans Supabase...');

            const apiKeys = {
                deepseekKey: document.getElementById('configDeepSeekKey').value.trim(),
                openaiKey: document.getElementById('configOpenAIKey').value.trim(),
                claudeKey: document.getElementById('configClaudeKey').value.trim(),
                discordBotToken: document.getElementById('configDiscordBotToken').value.trim()
            };

            // Sauvegarder en batch dans Supabase
            await APIKeysManager.saveBatchToSupabase(apiKeys);

            // Garder aussi en localStorage (fallback)
            this.set('deepseekKey', apiKeys.deepseekKey);
            this.set('openaiKey', apiKeys.openaiKey);
            this.set('claudeKey', apiKeys.claudeKey);
            this.set('discordBotToken', apiKeys.discordBotToken);
        } else {
            // Fallback : sauvegarder seulement en localStorage
            console.warn('⚠️ APIKeysManager non disponible, sauvegarde locale uniquement');
            this.set('deepseekKey', document.getElementById('configDeepSeekKey').value.trim());
            this.set('openaiKey', document.getElementById('configOpenAIKey').value.trim());
            this.set('claudeKey', document.getElementById('configClaudeKey').value.trim());
            this.set(
                'discordBotToken',
                document.getElementById('configDiscordBotToken').value.trim()
            );
        }

        // Sauvegarder le thème sélectionné
        const selectedTheme = document.getElementById('configTheme').value;
        ThemeManager.changeTheme(selectedTheme);

        Utils.showNotification(
            'Configuration sauvegardée dans Supabase ! Rechargement...',
            'success'
        );

        // Recharger la page pour appliquer
        setTimeout(() => {
            location.reload();
        }, 1500);
    },

    /**
     * Getters spécifiques pour les clés IA
     */
    getClaudeKey() {
        return this.get('claudeKey') || this.get('anthropicKey') || '';
    },

    getDeepSeekKey() {
        return this.get('deepseekKey') || '';
    },

    getOpenAIKey() {
        return this.get('openaiKey') || '';
    },

    /**
     * Vérifier si la configuration est valide
     */
    isValid() {
        return !!(this.get('supabaseUrl') && this.get('supabaseKey') && this.get('adminPassword'));
    },

    /**
     * Réinitialiser la configuration
     */
    reset() {
        if (confirm('⚠️ Êtes-vous sûr de vouloir réinitialiser la configuration ?')) {
            localStorage.removeItem('skaliprog_secure_config');
            this.config = {};
            this.isLoaded = false;
            Utils.showNotification('Configuration réinitialisée', 'success');
            location.reload();
        }
    }
};

// Exposer globalement
window.ENV = ENV;
