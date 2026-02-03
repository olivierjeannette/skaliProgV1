/**
 * CONFIGURATION MANAGER - PAGE DÉDIÉE
 * Interface complète pour la gestion de toutes les configurations de l'application
 * Transformé de modal en page dédiée avec design Gorilla Glass Hero
 */

const ConfigManagerPage = {
    // État pour gérer les onglets
    currentTab: 'config',

    /**
     * Afficher la page de configuration
     * @param tab
     */
    async showView(tab = 'config') {
        this.currentTab = tab;
        // Vérifier les droits admin
        if (!Auth.isAdmin()) {
            Utils.showNotification('Accès réservé aux administrateurs', 'error');
            return;
        }

        // Désactiver tous les onglets de navigation
        if (typeof ViewManager !== 'undefined') {
            ViewManager.clearAllActiveStates();
        }

        // Activer le bouton de nav
        const navBtn = document.getElementById('configBtn');
        if (navBtn) {
            navBtn.classList.add('active');
        }

        // Charger la config actuelle
        await ENV.init();

        // Charger données inventaire si nécessaire
        if (
            (this.currentTab === 'inventory' ||
                this.currentTab === 'methodology' ||
                this.currentTab === 'movements') &&
            typeof GymInventoryManager !== 'undefined'
        ) {
            await GymInventoryManager.loadCategories();
            await GymInventoryManager.loadEquipment();
            await GymInventoryManager.loadMethodologies();
            await GymInventoryManager.loadExerciseCategories();
            await GymInventoryManager.loadExercises();
        }

        // Si onglet inventory/methodology/movements, utiliser le renderer du GymInventoryManager
        if ((this.currentTab === 'inventory' || this.currentTab === 'methodology' || this.currentTab === 'movements') && typeof GymInventoryManager !== 'undefined') {
            const container =
                document.getElementById('mainContent') || document.querySelector('#mainApp');
            if (container) {
                container.innerHTML = `
                    <div class="fade-in min-h-screen" style="background: var(--bg-primary);">
                        <!-- MODULE HEADER -->
                        <div class="module-header">
                            <div class="module-header-content">
                                <div>
                                    <h1 class="module-title">
                                        <i class="fas fa-cog"></i>
                                        Configuration & Inventaire
                                    </h1>
                                    <p class="module-subtitle">
                                        Paramètres de l'application et gestion de la salle
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- TABS NAVIGATION -->
                        ${this.renderTabs()}

                        <!-- MODULE CONTAINER -->
                        <div class="module-container" style="padding-top: 1rem;">
                            ${this.renderTabContent()}
                        </div>
                    </div>
                `;
            }
            return;
        }

        const html = `
            <div class="fade-in min-h-screen" style="background: var(--bg-primary);">

                <!-- MODULE HEADER -->
                <div class="module-header">
                    <div class="module-header-content">
                        <div>
                            <h1 class="module-title">
                                <i class="fas fa-cog"></i>
                                Configuration & Inventaire
                            </h1>
                            <p class="module-subtitle">
                                Paramètres de l'application et gestion de la salle
                            </p>
                        </div>
                        <div class="module-stats">
                            <div class="module-stat ${ENV.isLoaded ? 'module-stat-success' : 'module-stat-error'}">
                                <i class="fas ${ENV.isLoaded ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                                <span class="module-stat-label">${ENV.isLoaded ? 'Configuration chargée' : 'Non configuré'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- TABS NAVIGATION -->
                ${this.renderTabs()}

                <!-- MODULE CONTAINER -->
                <div class="module-container" style="padding-top: 1rem;">
                    <div class="module-grid">

                        <!-- COLONNE GAUCHE: Connexions principales -->
                        <div class="module-col-left">

                            <!-- Supabase Configuration -->
                            <div class="module-card">
                                <h3 class="module-card-title">
                                    <i class="fas fa-database"></i>
                                    Supabase Database
                                </h3>
                                <div class="module-card-content">

                                    <div class="module-form-group">
                                        <label class="module-form-label">
                                            <i class="fas fa-link"></i> URL du projet
                                        </label>
                                        <input type="url"
                                               id="configSupabaseUrl"
                                               class="module-form-input"
                                               value="${ENV.get('supabaseUrl', '')}"
                                               placeholder="https://votre-projet.supabase.co">
                                        <span class="module-form-helper">
                                            URL de votre projet Supabase
                                        </span>
                                    </div>

                                    <div class="module-form-group">
                                        <label class="module-form-label">
                                            <i class="fas fa-key"></i> Clé API (anon)
                                        </label>
                                        <div class="relative">
                                            <input type="password"
                                                   id="configSupabaseKey"
                                                   class="module-form-input"
                                                   value="${ENV.get('supabaseKey', '')}"
                                                   placeholder="eyJhbGciOiJIUzI1NiIs...">
                                            <button onclick="ConfigManagerPage.togglePassword('configSupabaseKey')"
                                                    style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-muted); cursor: pointer;">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                        </div>
                                        <span class="module-form-helper">
                                            Clé publique anonyme de Supabase
                                        </span>
                                    </div>

                                    ${this.renderConnectionStatus('supabase')}

                                </div>
                            </div>

                            <!-- Discord Configuration -->
                            <div class="module-card">
                                <h3 class="module-card-title">
                                    <i class="fab fa-discord"></i>
                                    Discord Integration
                                </h3>
                                <div class="module-card-content">

                                    <div class="module-form-group">
                                        <label class="module-form-label">
                                            <i class="fas fa-robot"></i> Bot Token
                                        </label>
                                        <input type="password"
                                               id="configDiscordBotToken"
                                               class="module-form-input"
                                               value="${ENV.get('discordBotToken', '')}"
                                               placeholder="MTQwMT...">
                                        <span class="module-form-helper">
                                            Token du bot Discord
                                        </span>
                                    </div>

                                    <div class="module-form-group">
                                        <label class="module-form-label">
                                            <i class="fas fa-server"></i> Guild ID (Serveur)
                                        </label>
                                        <input type="text"
                                               id="configDiscordGuildId"
                                               class="module-form-input"
                                               value="${ENV.get('discordGuildId', '')}"
                                               placeholder="1400713384546009169">
                                        <span class="module-form-helper">
                                            ID du serveur Discord
                                        </span>
                                    </div>

                                    <div class="module-form-group">
                                        <label class="module-form-label">
                                            <i class="fas fa-sun"></i> Morning Coach Webhook
                                        </label>
                                        <input type="url"
                                               id="configMorningCoachWebhook"
                                               class="module-form-input"
                                               value="${ENV.get('morningCoachWebhook', '')}"
                                               placeholder="https://discord.com/api/webhooks/...">
                                        <span class="module-form-helper">
                                            Webhook pour les notifications matinales
                                        </span>
                                    </div>

                                </div>
                            </div>

                            <!-- CRM & Analytics -->
                            <div class="module-card">
                                <h3 class="module-card-title">
                                    <i class="fas fa-chart-bar"></i>
                                    CRM & Analytics
                                </h3>
                                <div class="module-card-content">

                                    <div class="module-form-group">
                                        <label class="module-form-label">
                                            <i class="fas fa-link"></i> URL du site (optionnel)
                                        </label>
                                        <input type="url"
                                               id="configApiUrl"
                                               class="module-form-input"
                                               value="${ENV.get('apiUrl', 'https://laskali.eu')}"
                                               placeholder="https://laskali.eu">
                                        <span class="module-form-helper">
                                            ℹ️ CRM Analytics utilise directement Supabase (pas besoin d'API backend)
                                        </span>
                                    </div>

                                </div>
                            </div>

                            <!-- Authentification -->
                            <div class="module-card">
                                <h3 class="module-card-title">
                                    <i class="fas fa-user-shield"></i>
                                    Authentification
                                </h3>
                                <div class="module-card-content">

                                    <div class="module-form-group">
                                        <label class="module-form-label">
                                            <i class="fas fa-crown"></i> Mot de passe Admin
                                        </label>
                                        <input type="password"
                                               id="configAdminPassword"
                                               class="module-form-input"
                                               value="${ENV.get('adminPassword', '')}"
                                               placeholder="Mot de passe administrateur">
                                    </div>

                                    <div class="module-form-group">
                                        <label class="module-form-label">
                                            <i class="fas fa-user-tie"></i> Mot de passe Coach
                                        </label>
                                        <input type="password"
                                               id="configCoachPassword"
                                               class="module-form-input"
                                               value="${ENV.get('coachPassword', 'coach2024')}"
                                               placeholder="Mot de passe coach">
                                    </div>

                                </div>
                            </div>

                        </div>

                        <!-- COLONNE DROITE: API Keys et actions -->
                        <div class="module-col-right">

                            <!-- API Keys -->
                            <div class="module-card">
                                <h3 class="module-card-title">
                                    <i class="fas fa-brain"></i>
                                    Clés API IA
                                </h3>
                                <div class="module-card-content">

                                    <div class="module-form-group">
                                        <label class="module-form-label">
                                            <i class="fas fa-robot"></i> Claude AI (Anthropic)
                                        </label>
                                        <input type="password"
                                               id="configAnthropicKey"
                                               class="module-form-input"
                                               value="${ENV.get('anthropicKey', '')}"
                                               placeholder="sk-ant-api03-...">
                                        <span class="module-form-helper">
                                            Clé API pour Claude (Anthropic)
                                        </span>
                                    </div>

                                    <div class="module-form-group">
                                        <label class="module-form-label">
                                            <i class="fas fa-lightbulb"></i> DeepSeek AI
                                        </label>
                                        <input type="password"
                                               id="configDeepseekKey"
                                               class="module-form-input"
                                               value="${ENV.get('deepseekKey', '')}"
                                               placeholder="sk-...">
                                        <span class="module-form-helper">
                                            Clé API pour DeepSeek
                                        </span>
                                    </div>

                                    <div class="module-form-group">
                                        <label class="module-form-label">
                                            <i class="fas fa-brain"></i> OpenAI API
                                        </label>
                                        <input type="password"
                                               id="configOpenaiKey"
                                               class="module-form-input"
                                               value="${ENV.get('openaiKey', '')}"
                                               placeholder="sk-...">
                                        <span class="module-form-helper">
                                            Clé API pour OpenAI (optionnel)
                                        </span>
                                    </div>

                                </div>
                            </div>

                            <!-- Préférences -->
                            <div class="module-card">
                                <h3 class="module-card-title">
                                    <i class="fas fa-sliders-h"></i>
                                    Préférences
                                </h3>
                                <div class="module-card-content">

                                    <div class="module-form-group">
                                        <label class="module-form-label">
                                            <i class="fas fa-palette"></i> Thème d'affichage
                                        </label>
                                        <div class="flex gap-2">
                                            <button onclick="ConfigManagerPage.switchTheme('light')"
                                                    id="theme-light-btn"
                                                    class="module-btn module-btn-secondary flex-1 ${ThemeManager.getCurrentTheme() === 'light' ? 'module-btn-primary' : ''}">
                                                <i class="fas fa-sun"></i>
                                                Clair
                                            </button>
                                            <button onclick="ConfigManagerPage.switchTheme('dark')"
                                                    id="theme-dark-btn"
                                                    class="module-btn module-btn-secondary flex-1 ${ThemeManager.getCurrentTheme() === 'dark' ? 'module-btn-primary' : ''}">
                                                <i class="fas fa-moon"></i>
                                                Sombre
                                            </button>
                                        </div>
                                        <span class="module-form-helper">
                                            Choisissez le thème de l'application (Clair: fond blanc/texte noir, Sombre: fond noir/texte blanc)
                                        </span>
                                    </div>

                                    <div class="module-form-group">
                                        <label class="module-form-label">
                                            <i class="fas fa-clock"></i> Durée du cache (ms)
                                        </label>
                                        <input type="number"
                                               id="configCacheDuration"
                                               class="module-form-input"
                                               value="${ENV.get('cacheDuration', 300000)}"
                                               placeholder="300000">
                                        <span class="module-form-helper">
                                            Temps de conservation des données en cache (défaut: 5 minutes)
                                        </span>
                                    </div>

                                </div>
                            </div>

                            <!-- Actions -->
                            <div class="module-card">
                                <h3 class="module-card-title">
                                    <i class="fas fa-bolt"></i>
                                    Actions
                                </h3>
                                <div class="module-card-content">
                                    <div class="module-btn-group">
                                        <button onclick="ConfigManagerPage.saveConfig()"
                                                class="module-btn module-btn-success module-btn-lg w-full">
                                            <i class="fas fa-save"></i>
                                            Sauvegarder la configuration
                                        </button>

                                        <!-- ✨ Nouveau: Migration Supabase -->
                                        <button onclick="ConfigManagerPage.migrateAllToSupabase()"
                                                class="module-btn module-btn-primary module-btn-lg w-full"
                                                style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none;">
                                            <i class="fas fa-cloud-upload-alt"></i>
                                            Migrer vers Supabase
                                        </button>

                                        <button onclick="ConfigManagerPage.testConnections()"
                                                class="module-btn module-btn-primary w-full">
                                            <i class="fas fa-vial"></i>
                                            Tester les connexions
                                        </button>
                                        <button onclick="ConfigManagerPage.exportConfig()"
                                                class="module-btn module-btn-secondary w-full">
                                            <i class="fas fa-download"></i>
                                            Exporter configuration
                                        </button>
                                        <button onclick="ConfigManagerPage.importConfig()"
                                                class="module-btn module-btn-secondary w-full">
                                            <i class="fas fa-upload"></i>
                                            Importer configuration
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Statut des connexions -->
                            <div class="module-card">
                                <h3 class="module-card-title">
                                    <i class="fas fa-heartbeat"></i>
                                    Statut des services
                                </h3>
                                <div class="module-card-content">
                                    <div id="configConnectionStatus" class="space-y-2">
                                        ${this.renderAllConnectionStatuses()}
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>

            </div>
        `;

        document.getElementById('mainContent').innerHTML = html;
    },

    /**
     * Render connection status for a service
     * @param service
     */
    renderConnectionStatus(service) {
        const statuses = {
            supabase: {
                icon: 'fa-database',
                label: 'Supabase',
                connected: ENV.get('supabaseUrl') && ENV.get('supabaseKey')
            },
            discord: {
                icon: 'fa-discord',
                label: 'Discord',
                connected: ENV.get('discordBotToken') && ENV.get('discordGuildId')
            },
            claude: {
                icon: 'fa-robot',
                label: 'Claude AI',
                connected: ENV.get('anthropicKey') || ENV.get('claudeKey')
            },
            deepseek: {
                icon: 'fa-lightbulb',
                label: 'DeepSeek',
                connected: ENV.get('deepseekKey')
            }
        };

        const status = statuses[service];
        if (!status) {
            return '';
        }

        return `
            <div class="module-alert ${status.connected ? 'module-alert-success' : 'module-alert-warning'}" style="margin-top: 1rem;">
                <i class="fas ${status.icon} module-alert-icon"></i>
                <div class="module-alert-content">
                    <div class="module-alert-title">${status.label}</div>
                    <div class="module-alert-message">
                        ${status.connected ? 'Configuré' : 'Non configuré'}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render all connection statuses
     */
    renderAllConnectionStatuses() {
        const services = [
            {
                key: 'supabase',
                icon: 'fa-database',
                label: 'Supabase',
                check: () => ENV.get('supabaseUrl') && ENV.get('supabaseKey')
            },
            {
                key: 'discord',
                icon: 'fa-discord',
                label: 'Discord',
                check: () => ENV.get('discordBotToken')
            },
            {
                key: 'claude',
                icon: 'fa-robot',
                label: 'Claude AI',
                check: () => ENV.get('anthropicKey')
            },
            {
                key: 'deepseek',
                icon: 'fa-lightbulb',
                label: 'DeepSeek',
                check: () => ENV.get('deepseekKey')
            }
        ];

        return services
            .map(service => {
                const connected = service.check();
                return `
                <div class="flex items-center justify-between p-3 rounded-lg" style="background: var(--surface-2);">
                    <div class="flex items-center gap-3">
                        <i class="fab ${service.icon} ${connected ? 'text-success' : 'text-muted'}"></i>
                        <span class="text-secondary">${service.label}</span>
                    </div>
                    <span class="module-badge ${connected ? 'module-badge-success' : 'module-badge-warning'}">
                        <i class="fas ${connected ? 'fa-check' : 'fa-times'}"></i>
                        ${connected ? 'OK' : 'Non configuré'}
                    </span>
                </div>
            `;
            })
            .join('');
    },

    /**
     * Toggle password visibility
     * @param inputId
     */
    togglePassword(inputId) {
        const input = document.getElementById(inputId);
        if (!input) {
            return;
        }

        const button = event.target.closest('button');
        if (input.type === 'password') {
            input.type = 'text';
            if (button) {
                button.innerHTML = '<i class="fas fa-eye-slash"></i>';
            }
        } else {
            input.type = 'password';
            if (button) {
                button.innerHTML = '<i class="fas fa-eye"></i>';
            }
        }
    },

    /**
     * Sauvegarder la configuration
     */
    async saveConfig() {
        try {
            const btn = event?.target?.closest('button');
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sauvegarde...';
            }

            // Récupérer toutes les valeurs
            const config = {
                supabaseUrl: document.getElementById('configSupabaseUrl')?.value || '',
                supabaseKey: document.getElementById('configSupabaseKey')?.value || '',
                discordBotToken: document.getElementById('configDiscordBotToken')?.value || '',
                discordGuildId: document.getElementById('configDiscordGuildId')?.value || '',
                morningCoachWebhook:
                    document.getElementById('configMorningCoachWebhook')?.value || '',
                apiUrl: document.getElementById('configApiUrl')?.value || 'https://laskali.eu',
                adminPassword: document.getElementById('configAdminPassword')?.value || '',
                coachPassword: document.getElementById('configCoachPassword')?.value || '',
                anthropicKey: document.getElementById('configAnthropicKey')?.value || '',
                claudeKey: document.getElementById('configAnthropicKey')?.value || '', // Alias
                deepseekKey: document.getElementById('configDeepseekKey')?.value || '',
                openaiKey: document.getElementById('configOpenaiKey')?.value || '',
                cacheDuration:
                    parseInt(document.getElementById('configCacheDuration')?.value) || 300000
            };

            // Sauvegarder dans ENV
            Object.entries(config).forEach(([key, value]) => {
                if (value) {
                    ENV.set(key, value);
                }
            });

            ENV.save();
            ENV.saveMobileCredentials();

            Utils.showNotification('Configuration sauvegardée avec succès !', 'success');

            // Rafraîchir la vue
            setTimeout(() => this.showView(), 500);
        } catch (error) {
            console.error('Erreur sauvegarde config:', error);
            Utils.showNotification('Erreur: ' + error.message, 'error');
        }
    },

    /**
     * Tester les connexions
     */
    async testConnections() {
        try {
            Utils.showNotification('Test des connexions en cours...', 'info');

            const results = [];

            // Test Supabase
            if (ENV.get('supabaseUrl') && ENV.get('supabaseKey')) {
                try {
                    await SupabaseManager.init();
                    results.push({ service: 'Supabase', success: true });
                } catch (e) {
                    results.push({ service: 'Supabase', success: false, error: e.message });
                }
            }

            // Test Discord (simple vérification de présence des clés)
            if (ENV.get('discordBotToken')) {
                results.push({ service: 'Discord', success: true });
            }

            // Test API Keys
            if (ENV.get('anthropicKey')) {
                results.push({ service: 'Claude AI', success: true });
            }
            if (ENV.get('deepseekKey')) {
                results.push({ service: 'DeepSeek', success: true });
            }

            // Afficher les résultats
            const message = results
                .map(r => `${r.service}: ${r.success ? '✅' : '❌'} ${r.error || ''}`)
                .join('\n');

            console.log('Résultats des tests:', results);
            Utils.showNotification('Tests terminés - Voir console', 'success');
        } catch (error) {
            console.error('Erreur test connexions:', error);
            Utils.showNotification('Erreur lors des tests', 'error');
        }
    },

    /**
     * Exporter la configuration
     */
    exportConfig() {
        try {
            const config = ENV.config;
            const dataStr = JSON.stringify(config, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `skaliprog-config-${new Date().toISOString().split('T')[0]}.json`;
            link.click();

            URL.revokeObjectURL(url);

            Utils.showNotification('Configuration exportée !', 'success');
        } catch (error) {
            console.error('Erreur export:', error);
            Utils.showNotification("Erreur lors de l'export", 'error');
        }
    },

    /**
     * Importer une configuration
     */
    importConfig() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = async e => {
            try {
                const file = e.target.files[0];
                if (!file) {
                    return;
                }

                const text = await file.text();
                const config = JSON.parse(text);

                // Demander confirmation
                if (
                    !confirm(
                        'Voulez-vous vraiment importer cette configuration ? Cela remplacera la configuration actuelle.'
                    )
                ) {
                    return;
                }

                // Appliquer la config
                ENV.config = config;
                ENV.save();

                Utils.showNotification('Configuration importée avec succès !', 'success');

                // Rafraîchir
                setTimeout(() => this.showView(), 500);
            } catch (error) {
                console.error('Erreur import:', error);
                Utils.showNotification("Erreur lors de l'import: " + error.message, 'error');
            }
        };

        input.click();
    },

    /**
     * Migrer toute la configuration vers Supabase
     * Sauvegarde tous les paramètres et clés API actuels dans Supabase
     */
    async migrateAllToSupabase() {
        const btn = event?.target?.closest('button');

        try {
            // Désactiver bouton immédiatement
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Initialisation...';
            }

            // ÉTAPE 0: FORCER l'initialisation de Supabase
            console.log('🔧 [MIGRATION] Vérification Supabase...');

            if (!window.SupabaseManager) {
                throw new Error('SupabaseManager non chargé. Rechargez la page.');
            }

            // Si pas de client, initialiser maintenant
            if (!SupabaseManager.client) {
                console.log('⚙️ [MIGRATION] Supabase non initialisé, initialisation...');

                const supabaseUrl = ENV.get('supabaseUrl', '');
                const supabaseKey = ENV.get('supabaseKey', '');

                console.log('   URL présente:', !!supabaseUrl);
                console.log('   Key présente:', !!supabaseKey);

                if (!supabaseUrl || !supabaseKey) {
                    throw new Error(
                        'Configuration Supabase manquante !\n\n' +
                        'Veuillez remplir:\n' +
                        '1. Supabase URL (https://xxx.supabase.co)\n' +
                        '2. Supabase Key (eyJ...)\n\n' +
                        'Puis cliquez sur "Sauvegarder" et rechargez la page (F5).'
                    );
                }

                // Initialiser Supabase
                try {
                    await SupabaseManager.init();
                } catch (initError) {
                    console.error('❌ [MIGRATION] Erreur lors de SupabaseManager.init():', initError);
                    throw new Error(`Échec initialisation Supabase: ${initError.message}`);
                }

                if (!SupabaseManager.client) {
                    throw new Error('Échec initialisation Supabase. Client non créé malgré init() réussi.');
                }

                console.log('✅ [MIGRATION] Supabase initialisé avec succès');
            } else {
                console.log('✅ [MIGRATION] Supabase déjà initialisé');
            }

            // Vérifier que les managers sont disponibles
            if (!window.SettingsManager) {
                throw new Error('SettingsManager non chargé');
            }
            if (!window.APIKeysManager) {
                throw new Error('APIKeysManager non chargé');
            }

            if (btn) {
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Migration en cours...';
            }
            Utils.showNotification('🚀 Migration vers Supabase...', 'info');

            // 1. Récupérer config actuelle depuis ENV
            const currentConfig = {
                // Auth
                admin_password: ENV.get('adminPassword', 'skaliprog'),
                coach_password: ENV.get('coachPassword', 'coach2024'),

                // Discord
                discord_bot_token: ENV.get('discordBotToken', ''),
                discord_guild_id: ENV.get('discordGuildId', ''),
                morning_coach_webhook: ENV.get('morningCoachWebhook', ''),

                // CRM
                crm_enabled: 'true',
                api_url: ENV.get('apiUrl', 'https://laskali.eu'),

                // Thème
                theme: 'dark',
                primary_color: '#3e8e41',
                accent_color: '#2563eb',

                // Cache
                cache_duration: ENV.get('cacheDuration', '300000')
            };

            console.log('📦 [MIGRATION] Configuration à migrer:', currentConfig);

            // 2. Sauvegarder dans Supabase via SettingsManager
            console.log('🔄 Sauvegarde des settings...');
            const settingsSaved = await SettingsManager.saveBatchToSupabase(currentConfig, 'general');

            console.log('📊 Résultat sauvegarde settings:', settingsSaved);

            if (!settingsSaved) {
                throw new Error('Échec sauvegarde settings - Vérifiez la console pour plus de détails');
            }

            console.log('✅ Settings sauvegardés dans Supabase');

            // 3. Migrer aussi les clés API
            const apiKeys = {
                CLAUDE_API_KEY: ENV.get('claudeKey', '') || ENV.get('anthropicKey', ''),
                DEEPSEEK_API_KEY: ENV.get('deepseekKey', ''),
                OPENAI_API_KEY: ENV.get('openaiKey', ''),
                DISCORD_BOT_TOKEN: ENV.get('discordBotToken', ''),
                DISCORD_GUILD_ID: ENV.get('discordGuildId', ''),
                MORNING_COACH_WEBHOOK: ENV.get('morningCoachWebhook', ''),
                SUPABASE_URL: ENV.get('supabaseUrl', ''),
                SUPABASE_KEY: ENV.get('supabaseKey', '')
            };

            // Filtrer les clés vides
            const filteredKeys = {};
            Object.entries(apiKeys).forEach(([key, value]) => {
                if (value && value.trim()) {
                    filteredKeys[key] = value;
                }
            });

            console.log('🔑 Clés API à migrer:', Object.keys(filteredKeys));

            if (Object.keys(filteredKeys).length > 0) {
                const keysSaved = await APIKeysManager.saveBatchToSupabase(filteredKeys);

                if (!keysSaved) {
                    throw new Error('Échec sauvegarde API keys');
                }

                console.log('✅ Clés API sauvegardées dans Supabase');
            }

            Utils.showNotification('✅ Migration terminée ! Toutes les données sont dans Supabase.', 'success');

            // Recharger la page après 2 secondes
            setTimeout(() => {
                location.reload();
            }, 2000);

        } catch (error) {
            console.error('❌ Erreur migration:', error);
            Utils.showNotification('❌ Erreur: ' + error.message, 'error');

            // Réactiver le bouton
            const btn = event?.target?.closest('button');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Migrer vers Supabase';
            }
        }
    },

    /**
     * Render les onglets
     */
    renderTabs() {
        return `
            <div class="module-tabs">
                <button class="module-tab ${this.currentTab === 'config' ? 'active' : ''}"
                        onclick="ConfigManagerPage.switchTab('config')">
                    <span class="module-tab-icon">⚙️</span>
                    <span class="module-tab-label">Config App</span>
                </button>
                <button class="module-tab ${this.currentTab === 'apikeys' ? 'active' : ''}"
                        onclick="ConfigManagerPage.switchTab('apikeys')">
                    <span class="module-tab-icon">🔑</span>
                    <span class="module-tab-label">Clés API</span>
                </button>
                <button class="module-tab ${this.currentTab === 'inventory' ? 'active' : ''}"
                        onclick="ConfigManagerPage.switchTab('inventory')">
                    <span class="module-tab-icon">📦</span>
                    <span class="module-tab-label">Inventaire Salle</span>
                </button>
                <button class="module-tab ${this.currentTab === 'methodology' ? 'active' : ''}"
                        onclick="ConfigManagerPage.switchTab('methodology')">
                    <span class="module-tab-icon">📚</span>
                    <span class="module-tab-label">Méthodologie</span>
                </button>
                <button class="module-tab ${this.currentTab === 'movements' ? 'active' : ''}"
                        onclick="ConfigManagerPage.switchTab('movements')">
                    <span class="module-tab-icon">🏋️</span>
                    <span class="module-tab-label">Mouvements</span>
                </button>
            </div>
        `;
    },

    /**
     * Changer d'onglet
     * @param tab
     */
    switchTab(tab) {
        this.currentTab = tab;

        // Pour l'onglet config, recharger toute la vue (car le HTML est complexe)
        if (tab === 'config') {
            this.showView('config');
            return;
        }

        // Pour les autres onglets, mise à jour dynamique
        const container =
            document.getElementById('mainContent') || document.querySelector('#mainApp');
        if (!container) {
            return;
        }

        // Mettre à jour les onglets actifs
        const tabs = container.querySelectorAll('.module-tab');
        tabs.forEach(tabEl => {
            const isActive = tabEl.getAttribute('onclick')?.includes(`'${tab}'`);
            if (isActive) {
                tabEl.classList.add('active');
            } else {
                tabEl.classList.remove('active');
            }
        });

        // Mettre à jour uniquement le contenu du tab
        const contentContainer = container.querySelector('.module-container');
        if (contentContainer) {
            contentContainer.innerHTML = this.renderTabContent();
        }
    },

    /**
     * Render contenu selon onglet actif
     */
    renderTabContent() {
        switch (this.currentTab) {
            case 'apikeys':
                // Réinitialiser puis initialiser le module API Keys UI
                requestAnimationFrame(() => {
                    if (typeof SettingsAPIKeysUI !== 'undefined') {
                        // Réinitialiser pour permettre un nouveau chargement
                        SettingsAPIKeysUI.reset();
                        // Initialiser
                        SettingsAPIKeysUI.init('api-keys-settings-container');
                    }
                });
                return '<div id="api-keys-settings-container"><div class="glass-card p-6 text-center"><i class="fas fa-spinner fa-spin text-3xl text-green-500 mb-3"></i><p class="text-white">Chargement interface clés API...</p></div></div>';

            case 'inventory':
                if (typeof GymInventoryManager !== 'undefined') {
                    return GymInventoryManager.renderInventoryTab();
                }
                return '<p>Module Inventaire non chargé</p>';

            case 'methodology':
                if (typeof GymInventoryManager !== 'undefined') {
                    return GymInventoryManager.renderMethodologyTab();
                }
                return '<p>Module Méthodologie non chargé</p>';

            case 'movements':
                if (typeof GymInventoryManager !== 'undefined') {
                    return GymInventoryManager.renderMovementsTab();
                }
                return '<p>Module Mouvements non chargé</p>';

            case 'config':
            default:
                return ''; // Contenu config existant
        }
    },

    /**
     * Changer le thème de l'application
     * @param theme
     */
    switchTheme(theme) {
        if (typeof ThemeManager === 'undefined') {
            console.error('ThemeManager non disponible');
            return;
        }

        ThemeManager.applyTheme(theme);

        // Mettre à jour les boutons
        const lightBtn = document.getElementById('theme-light-btn');
        const darkBtn = document.getElementById('theme-dark-btn');

        if (lightBtn && darkBtn) {
            if (theme === 'light') {
                lightBtn.classList.remove('module-btn-secondary');
                lightBtn.classList.add('module-btn-primary');
                darkBtn.classList.remove('module-btn-primary');
                darkBtn.classList.add('module-btn-secondary');
            } else {
                darkBtn.classList.remove('module-btn-secondary');
                darkBtn.classList.add('module-btn-primary');
                lightBtn.classList.remove('module-btn-primary');
                lightBtn.classList.add('module-btn-secondary');
            }
        }

        Utils.showNotification(
            `Thème ${theme === 'light' ? 'Clair' : 'Sombre'} appliqué`,
            'success'
        );
    }
};

// Exposer globalement
window.ConfigManagerPage = ConfigManagerPage;
window.ConfigManager = ConfigManagerPage; // Alias pour compatibilité
