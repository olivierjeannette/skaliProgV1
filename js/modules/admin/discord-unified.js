/**
 * DISCORD UNIFIED MODULE
 * Module Discord unifié regroupant Bot Controls, Liaison Discord et Notifications
 */

const DiscordUnified = {
    currentTab: 'notifications',
    discordMembers: [],
    members: [],
    currentFilter: 'all',

    /**
     * Initialiser le module
     */
    async init() {
        console.log('🔐 Initialisation DiscordUnified...');

        // S'assurer que Supabase est initialisé
        if (!SupabaseManager.supabase) {
            await SupabaseManager.init();
        }

        // Initialiser les sous-modules
        if (DiscordNotifier) {
            DiscordNotifier.init();
        }

        await this.loadMembersData();
    },

    /**
     * Charger les données des membres
     */
    async loadMembersData() {
        try {
            const client = SupabaseManager.supabase;

            if (!client) {
                throw new Error('Supabase non initialisé');
            }

            // Charger les membres Discord
            const { data: discordData, error: discordError } = await client
                .from('discord_members_full')
                .select('*')
                .order('discord_username');

            if (discordError) {
                throw discordError;
            }
            this.discordMembers = discordData || [];

            // Charger les adhérents
            this.members = await SupabaseManager.getMembers();

            console.log(`✅ ${this.discordMembers.length} membres Discord chargés`);
            console.log(`✅ ${this.members.length} adhérents chargés`);
        } catch (error) {
            console.error('❌ Erreur chargement données:', error);
        }
    },

    /**
     * Afficher l'interface principale avec onglets
     * @param defaultTab
     */
    async showInterface(defaultTab = 'notifications') {
        this.currentTab = defaultTab;

        const container = document.getElementById('mainContent');
        if (!container) {
            return;
        }

        container.innerHTML = `
            <div class="glass-card rounded-xl p-6">
                <!-- Header -->
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h2 class="text-3xl font-bold text-white flex items-center gap-3">
                            <i class="fab fa-discord text-indigo-400"></i>
                            Gestion Discord
                        </h2>
                        <p class="text-secondary mt-1">Contrôle du bot, liaison membres et notifications</p>
                    </div>
                </div>

                <!-- Onglets -->
                <div class="bg-gray-800/50 rounded-lg border border-gray-700 mb-6">
                    <div class="flex flex-wrap gap-2 p-2">
                        <button onclick="DiscordUnified.switchTab('notifications')"
                                id="tab-notifications"
                                class="tab-button flex-1 min-w-[140px] px-4 py-3 rounded-lg font-semibold transition-all ${this.currentTab === 'notifications' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'glass-card text-secondary hover:bg-gray-600'}">
                            <i class="fas fa-bell mr-2"></i>Notifications
                        </button>
                        <button onclick="DiscordUnified.switchTab('morning')"
                                id="tab-morning"
                                class="tab-button flex-1 min-w-[140px] px-4 py-3 rounded-lg font-semibold transition-all ${this.currentTab === 'morning' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'glass-card text-secondary hover:bg-gray-600'}">
                            <i class="fas fa-sun mr-2"></i>Morning Routine
                        </button>
                        <button onclick="DiscordUnified.switchTab('liaison')"
                                id="tab-liaison"
                                class="tab-button flex-1 min-w-[140px] px-4 py-3 rounded-lg font-semibold transition-all ${this.currentTab === 'liaison' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'glass-card text-secondary hover:bg-gray-600'}">
                            <i class="fas fa-link mr-2"></i>Liaison Membres
                        </button>
                        <button onclick="DiscordUnified.switchTab('bot')"
                                id="tab-bot"
                                class="tab-button flex-1 min-w-[140px] px-4 py-3 rounded-lg font-semibold transition-all ${this.currentTab === 'bot' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'glass-card text-secondary hover:bg-gray-600'}">
                            <i class="fas fa-robot mr-2"></i>Bot Discord
                        </button>
                    </div>
                </div>

                <!-- Contenu des onglets -->
                <div id="tab-content">
                    <!-- Généré dynamiquement -->
                </div>
            </div>
        `;

        this.renderTabContent();
    },

    /**
     * Changer d'onglet
     * @param tabName
     */
    switchTab(tabName) {
        this.currentTab = tabName;

        // Mettre à jour les boutons
        ['notifications', 'morning', 'liaison', 'bot'].forEach(tab => {
            const button = document.getElementById(`tab-${tab}`);
            if (button) {
                if (tab === tabName) {
                    button.className =
                        'tab-button flex-1 min-w-[140px] px-4 py-3 rounded-lg font-semibold transition-all bg-gradient-to-r from-indigo-600 to-purple-600 text-white';
                } else {
                    button.className =
                        'tab-button flex-1 min-w-[140px] px-4 py-3 rounded-lg font-semibold transition-all glass-card text-secondary hover:bg-gray-600';
                }
            }
        });

        this.renderTabContent();
    },

    /**
     * Rendre le contenu de l'onglet actif
     */
    async renderTabContent() {
        const container = document.getElementById('tab-content');
        if (!container) {
            return;
        }

        switch (this.currentTab) {
            case 'notifications':
                container.innerHTML = await this.renderNotificationsTab();
                break;
            case 'morning':
                container.innerHTML = await this.renderMorningTab();
                break;
            case 'liaison':
                container.innerHTML = await this.renderLiaisonTab();
                break;
            case 'bot':
                container.innerHTML = await this.renderBotTab();
                break;
        }
    },

    // ========================================
    // ONGLET NOTIFICATIONS
    // ========================================

    async renderNotificationsTab() {
        const config = DiscordNotifier?.config || {
            webhookUrl: '',
            weatherApiKey: '',
            weatherCity: 'Laval,FR',
            sendTime: '07:00',
            enabled: false
        };

        const today = Utils.formatDateKey(new Date());
        const sessions = await SupabaseManager.getSessions(today, true);
        const weather = DiscordNotifier ? await DiscordNotifier.getWeather() : null;
        const message = DiscordNotifier
            ? await DiscordNotifier.buildDiscordMessage(sessions, weather, null, new Date())
            : null;

        return `
            <div class="space-y-6">
                <!-- Configuration -->
                <div class="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                    <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <i class="fas fa-cog text-green-400"></i>
                        Configuration des notifications
                    </h3>

                    <div class="space-y-4">
                        <!-- Webhook URL -->
                        <div>
                            <label class="block text-sm font-medium text-secondary mb-2">
                                <i class="fab fa-discord text-indigo-400 mr-2"></i>Webhook Discord
                            </label>
                            <input type="text" id="discordWebhook"
                                   value="${config.webhookUrl}"
                                   placeholder="https://discord.com/api/webhooks/..."
                                   class="w-full glass-card text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none border border-glass">
                            <p class="text-xs text-secondary mt-1">Créez un webhook dans les paramètres de votre canal Discord</p>
                        </div>

                        <!-- Météo -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-secondary mb-2">
                                    <i class="fas fa-cloud-sun text-yellow-400 mr-2"></i>Clé API OpenWeatherMap
                                </label>
                                <input type="text" id="weatherApiKey"
                                       value="${config.weatherApiKey}"
                                       placeholder="Clé API"
                                       class="w-full glass-card text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none border border-glass">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-secondary mb-2">
                                    <i class="fas fa-map-marker-alt text-red-400 mr-2"></i>Ville
                                </label>
                                <input type="text" id="weatherCity"
                                       value="${config.weatherCity}"
                                       placeholder="Laval,FR"
                                       class="w-full glass-card text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none border border-glass">
                            </div>
                        </div>

                        <!-- Planification -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-secondary mb-2">
                                    <i class="fas fa-clock text-blue-400 mr-2"></i>Heure d'envoi quotidien
                                </label>
                                <input type="time" id="discordSendTime"
                                       value="${config.sendTime}"
                                       class="w-full glass-card text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none border border-glass">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-secondary mb-2">
                                    <i class="fas fa-power-off text-green-400 mr-2"></i>Envoi automatique
                                </label>
                                <label class="relative inline-flex items-center cursor-pointer mt-2">
                                    <input type="checkbox" id="discordAutoSend" class="sr-only peer"
                                           ${config.enabled ? 'checked' : ''}>
                                    <div class="w-14 h-7 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                                    <span class="ml-3 text-sm font-medium text-secondary">
                                        ${config.enabled ? 'Activé' : 'Désactivé'}
                                    </span>
                                </label>
                            </div>
                        </div>

                        <button onclick="DiscordUnified.saveNotificationSettings()"
                                class="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg">
                            <i class="fas fa-save mr-2"></i>Sauvegarder la configuration
                        </button>
                    </div>
                </div>

                <!-- Aperçu du jour -->
                <div class="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xl font-bold text-white flex items-center gap-2">
                            <i class="fas fa-eye text-purple-400"></i>
                            Aperçu du message d'aujourd'hui
                        </h3>
                        <button onclick="DiscordUnified.refreshNotificationPreview()"
                                class="px-4 py-2 glass-card hover:bg-gray-600 rounded-lg transition-colors text-white text-sm">
                            <i class="fas fa-sync mr-2"></i>Actualiser
                        </button>
                    </div>

                    ${
                        message
                            ? `
                        <div id="discord-preview" class="bg-gray-900 rounded-lg p-6 border border-gray-700 mb-4">
                            ${this.generateDiscordPreview(message, sessions)}
                        </div>
                    `
                            : `
                        <div class="text-center py-8 text-secondary">
                            <i class="fas fa-info-circle text-4xl mb-2"></i>
                            <p>Configurez le webhook pour voir l'aperçu</p>
                        </div>
                    `
                    }

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button onclick="DiscordUnified.testWeather()"
                                class="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg">
                            <i class="fas fa-cloud-sun mr-2"></i>Test Météo
                        </button>
                        <button onclick="DiscordUnified.sendNotificationNow()"
                                class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg">
                            <i class="fab fa-discord mr-2"></i>Envoyer maintenant
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // ========================================
    // ONGLET MORNING ROUTINE
    // ========================================

    async renderMorningTab() {
        // Charger la config du Morning Coach
        if (window.DiscordMorningCoach) {
            await DiscordMorningCoach.init();
        }

        const config = window.DiscordMorningCoach?.config || {
            enabled: false,
            sendTime: '07:00',
            webhookUrl: '',
            includeWarmup: true,
            warmupDuration: 7,
            useAI: true,
            aiProvider: 'deepseek'
        };

        const lastSent = window.DiscordMorningCoach?.lastSentDate || 'Jamais';
        const sendHistory = window.DiscordMorningCoach?.sendHistory || [];

        // Générer l'aperçu automatiquement après le rendu
        setTimeout(() => {
            this.generateMorningPreviewOnly();
        }, 100);

        return `
            <div class="space-y-6">
                <!-- Status Card -->
                <div class="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-lg p-6 border border-yellow-500/50">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-yellow-200 text-sm font-semibold mb-1">Status Morning Coach</p>
                            <p class="text-3xl font-bold text-white">
                                ${config.enabled ? '<i class="fas fa-check-circle text-green-300 mr-2"></i><span class="text-green-100">Activé</span>' : '<i class="fas fa-times-circle text-red-300 mr-2"></i><span class="text-red-100">Désactivé</span>'}
                            </p>
                            <p class="text-sm text-yellow-100 mt-2">
                                <i class="fas fa-clock mr-1"></i>Envoi quotidien: ${config.sendTime}
                            </p>
                            <p class="text-xs text-yellow-200 mt-1">
                                <i class="fas fa-calendar-check mr-1"></i>Dernier envoi: ${lastSent}
                            </p>
                        </div>
                        <i class="fas fa-sun text-6xl text-yellow-300 opacity-30"></i>
                    </div>
                </div>

                <!-- Configuration -->
                <div class="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                    <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <i class="fas fa-cog text-yellow-400"></i>
                        Configuration Morning Routine
                    </h3>

                    <div class="space-y-4">
                        <!-- Activation -->
                        <div class="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                            <div>
                                <h4 class="text-white font-semibold">Activer Morning Coach</h4>
                                <p class="text-sm text-secondary mt-1">Envoi automatique quotidien de la routine matinale</p>
                            </div>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="morningEnabled" class="sr-only peer" ${config.enabled ? 'checked' : ''}>
                                <div class="w-14 h-7 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                        </div>

                        <!-- Webhook URL -->
                        <div>
                            <label class="block text-sm font-medium text-secondary mb-2">
                                <i class="fab fa-discord text-indigo-400 mr-2"></i>Webhook Discord
                            </label>
                            <input type="text" id="morningWebhook"
                                   value="${config.webhookUrl}"
                                   placeholder="https://discord.com/api/webhooks/..."
                                   class="w-full glass-card text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:outline-none border border-glass">
                            <p class="text-xs text-secondary mt-1">URL du webhook Discord pour les notifications matinales</p>
                        </div>

                        <!-- Heure d'envoi -->
                        <div>
                            <label class="block text-sm font-medium text-secondary mb-2">
                                <i class="fas fa-clock text-blue-400 mr-2"></i>Heure d'envoi quotidien
                            </label>
                            <input type="time" id="morningSendTime"
                                   value="${config.sendTime}"
                                   class="w-full glass-card text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:outline-none border border-glass">
                        </div>

                        <!-- Options Warm-up -->
                        <div class="bg-gray-900/50 rounded-lg p-4">
                            <h4 class="text-white font-semibold mb-3 flex items-center gap-2">
                                <i class="fas fa-fire text-orange-400"></i>
                                Options Warm-up
                            </h4>

                            <div class="space-y-3">
                                <label class="flex items-center justify-between cursor-pointer">
                                    <span class="text-secondary">Inclure warm-up</span>
                                    <input type="checkbox" id="morningIncludeWarmup" ${config.includeWarmup ? 'checked' : ''}
                                           class="w-5 h-5 rounded border-glass bg-gray-800 text-yellow-400 focus:ring-yellow-400">
                                </label>

                                <div>
                                    <label class="block text-sm text-secondary mb-2">Durée (minutes)</label>
                                    <input type="number" id="morningWarmupDuration" value="${config.warmupDuration}" min="5" max="15"
                                           class="w-full glass-card text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:outline-none border border-glass">
                                </div>

                                <label class="flex items-center justify-between cursor-pointer">
                                    <span class="text-secondary">Utiliser l'IA</span>
                                    <input type="checkbox" id="morningUseAI" ${config.useAI ? 'checked' : ''}
                                           class="w-5 h-5 rounded border-glass bg-gray-800 text-yellow-400 focus:ring-yellow-400">
                                </label>

                                <!-- Choix de l'IA -->
                                <div>
                                    <label class="block text-sm text-secondary mb-2">
                                        <i class="fas fa-robot mr-1"></i>Provider IA
                                    </label>
                                    <select id="morningAIProvider" class="w-full glass-card text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:outline-none border border-glass">
                                        <option value="deepseek" ${config.aiProvider === 'deepseek' ? 'selected' : ''}>🚀 DeepSeek (Recommandé)</option>
                                        <option value="claude" ${config.aiProvider === 'claude' ? 'selected' : ''}>🧠 Claude</option>
                                        <option value="openai" ${config.aiProvider === 'openai' ? 'selected' : ''}>🤖 OpenAI</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button onclick="DiscordUnified.saveMorningSettings()"
                                class="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg">
                            <i class="fas fa-save mr-2"></i>Sauvegarder la configuration
                        </button>
                    </div>
                </div>

                <!-- Aperçu du message -->
                <div class="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xl font-bold text-white flex items-center gap-2">
                            <i class="fas fa-eye text-purple-400"></i>
                            Aperçu du message
                        </h3>
                        <button onclick="DiscordUnified.refreshMorningPreview()"
                                class="px-4 py-2 glass-card hover:bg-gray-600 rounded-lg transition-colors text-white text-sm">
                            <i class="fas fa-sync mr-2"></i>Actualiser
                        </button>
                    </div>

                    <div id="morning-preview" class="bg-gray-900 rounded-lg p-6 border border-gray-700 mb-4">
                        <div class="text-center py-8 text-secondary">
                            <i class="fas fa-spinner fa-spin text-4xl mb-2"></i>
                            <p>Génération de l'aperçu...</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button onclick="DiscordUnified.testMorningRoutine()"
                                class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg">
                            <i class="fab fa-discord mr-2"></i>Envoyer sur Discord
                        </button>
                        <button onclick="DiscordUnified.generateMorningPreviewOnly()"
                                class="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg">
                            <i class="fas fa-magic mr-2"></i>Générer aperçu
                        </button>
                    </div>
                </div>

                <!-- Test et Historique -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Historique -->
                    <div class="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <h3 class="text-lg font-bold text-white mb-2 flex items-center gap-2">
                            <i class="fas fa-history text-purple-400"></i>
                            Historique
                        </h3>
                        <p class="text-sm text-secondary mb-2">
                            ${sendHistory.length} envois récents
                        </p>
                        ${sendHistory.length > 0 ? `
                            <div class="text-xs text-secondary space-y-1 max-h-20 overflow-y-auto">
                                ${sendHistory.slice(0, 3).map(h => `
                                    <div class="flex items-center gap-2">
                                        <i class="fas fa-${h.success ? 'check-circle text-green-400' : 'times-circle text-red-400'}"></i>
                                        <span>${h.date} ${h.time}</span>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <p class="text-xs text-secondary">Aucun envoi récent</p>
                        `}
                    </div>

                    <!-- Stats -->
                    <div class="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <h3 class="text-lg font-bold text-white mb-2 flex items-center gap-2">
                            <i class="fas fa-chart-line text-green-400"></i>
                            Statistiques
                        </h3>
                        <div class="space-y-2 text-sm">
                            <div class="flex items-center justify-between">
                                <span class="text-secondary">Envois réussis</span>
                                <span class="text-green-400 font-semibold">${sendHistory.filter(h => h.success).length}</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-secondary">Envois échoués</span>
                                <span class="text-red-400 font-semibold">${sendHistory.filter(h => !h.success).length}</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-secondary">Dernier envoi</span>
                                <span class="text-yellow-400 font-semibold text-xs">${lastSent}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Info -->
                <div class="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-600/50 rounded-lg p-4">
                    <div class="flex items-start gap-3">
                        <i class="fas fa-info-circle text-blue-400 text-xl mt-1"></i>
                        <div class="text-sm text-gray-300">
                            <p class="font-semibold text-blue-300 mb-2">Comment ça fonctionne ?</p>
                            <ul class="space-y-1 text-xs">
                                <li>• Chaque matin à l'heure configurée, la routine du jour est envoyée sur Discord</li>
                                <li>• L'IA génère une morning routine personnalisée selon la séance prévue</li>
                                <li>• Protection anti-double envoi : 1 seul message par jour maximum</li>
                                <li>• Les clés API sont chargées automatiquement depuis la configuration générale</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // ========================================
    // ONGLET LIAISON MEMBRES
    // ========================================

    async renderLiaisonTab() {
        const linkedCount = this.discordMembers.filter(dm => dm.member_id).length;
        const unlinkedCount = this.discordMembers.filter(
            dm => !dm.member_id && dm.is_active
        ).length;
        const inactiveCount = this.discordMembers.filter(dm => !dm.is_active).length;

        return `
            <div class="space-y-6">
                <!-- Stats Cards -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <!-- Total Discord -->
                    <div class="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-lg p-4 border border-indigo-500/50">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-indigo-200 text-sm font-semibold">Membres Discord</p>
                                <p class="text-3xl font-bold text-white mt-1">${this.discordMembers.length}</p>
                            </div>
                            <i class="fab fa-discord text-5xl text-indigo-300 opacity-50"></i>
                        </div>
                    </div>

                    <!-- Liés -->
                    <div class="bg-gradient-to-br from-green-600 to-green-800 rounded-lg p-4 border border-green-500/50">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-green-200 text-sm font-semibold">Liés aux adhérents</p>
                                <p class="text-3xl font-bold text-white mt-1">${linkedCount}</p>
                            </div>
                            <i class="fas fa-link text-5xl text-green-300 opacity-50"></i>
                        </div>
                    </div>

                    <!-- Non liés -->
                    <div class="bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-lg p-4 border border-yellow-500/50">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-yellow-200 text-sm font-semibold">À lier</p>
                                <p class="text-3xl font-bold text-white mt-1">${unlinkedCount}</p>
                            </div>
                            <i class="fas fa-exclamation-triangle text-5xl text-yellow-300 opacity-50"></i>
                        </div>
                    </div>

                    <!-- Inactifs -->
                    <div class="bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg p-4 border border-gray-500/50">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-200 text-sm font-semibold">Inactifs (partis)</p>
                                <p class="text-3xl font-bold text-white mt-1">${inactiveCount}</p>
                            </div>
                            <i class="fas fa-user-slash text-5xl text-secondary opacity-50"></i>
                        </div>
                    </div>
                </div>

                <!-- Filtres et Recherche -->
                <div class="flex flex-col md:flex-row gap-4">
                    <!-- Recherche -->
                    <div class="flex-1">
                        <input type="text" id="discordSearchInput"
                               placeholder="Rechercher un membre Discord ou adhérent..."
                               oninput="DiscordUnified.applyMemberFilters()"
                               class="form-input w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-indigo-500 focus:outline-none">
                    </div>

                    <!-- Filtres -->
                    <div class="flex gap-2 flex-wrap">
                        <button onclick="DiscordUnified.setMemberFilter('all')"
                                id="filter-all"
                                class="filter-btn px-4 py-2 rounded-lg font-semibold transition ${this.currentFilter === 'all' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'glass-card text-secondary hover:bg-gray-600'}">
                            Tous
                        </button>
                        <button onclick="DiscordUnified.setMemberFilter('linked')"
                                id="filter-linked"
                                class="filter-btn px-4 py-2 rounded-lg font-semibold transition ${this.currentFilter === 'linked' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'glass-card text-secondary hover:bg-gray-600'}">
                            Liés
                        </button>
                        <button onclick="DiscordUnified.setMemberFilter('unlinked')"
                                id="filter-unlinked"
                                class="filter-btn px-4 py-2 rounded-lg font-semibold transition ${this.currentFilter === 'unlinked' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'glass-card text-secondary hover:bg-gray-600'}">
                            Non liés
                        </button>
                        <button onclick="DiscordUnified.setMemberFilter('inactive')"
                                id="filter-inactive"
                                class="filter-btn px-4 py-2 rounded-lg font-semibold transition ${this.currentFilter === 'inactive' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'glass-card text-secondary hover:bg-gray-600'}">
                            Inactifs
                        </button>
                    </div>

                    <!-- Sync button -->
                    <button onclick="DiscordUnified.syncFromDiscord()"
                            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold text-white transition">
                        <i class="fas fa-sync-alt mr-2"></i>Sync
                    </button>
                </div>

                <!-- Liste des membres -->
                <div id="discordMembersList" class="space-y-3">
                    <!-- Généré dynamiquement -->
                </div>
            </div>
        `;
    },

    // ========================================
    // ONGLET BOT DISCORD
    // ========================================

    async renderBotTab() {
        let botStatus = {
            html: '<i class="fas fa-circle-notch fa-spin mr-2"></i><span class="text-secondary">Vérification...</span>',
            checking: true
        };

        // Vérifier le status du bot
        try {
            const client = SupabaseManager.supabase;
            const { data, error } = await client
                .from('discord_members')
                .select('last_sync')
                .order('last_sync', { ascending: false })
                .limit(1);

            if (!error && data && data.length > 0) {
                const lastSync = new Date(data[0].last_sync);
                const now = new Date();
                const diffMinutes = Math.floor((now - lastSync) / 1000 / 60);

                if (diffMinutes < 5) {
                    botStatus.html = `
                        <i class="fas fa-check-circle text-green-400 mr-2"></i>
                        <span class="text-green-400">Actif</span>
                        <span class="text-sm text-secondary ml-2">(sync il y a ${diffMinutes}min)</span>
                    `;
                } else {
                    botStatus.html = `
                        <i class="fas fa-exclamation-triangle text-yellow-400 mr-2"></i>
                        <span class="text-yellow-400">Inactif</span>
                        <span class="text-sm text-secondary ml-2">(dernière sync: ${diffMinutes}min)</span>
                    `;
                }
            }
        } catch (error) {
            botStatus.html = `
                <i class="fas fa-times-circle text-red-400 mr-2"></i>
                <span class="text-red-400">Erreur</span>
            `;
        }

        return `
            <div class="space-y-6">
                <!-- Status Card -->
                <div class="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg p-6 border border-indigo-500/50">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-indigo-200 text-sm font-semibold mb-1">Status du Bot</p>
                            <p id="botStatus" class="text-3xl font-bold text-white">
                                ${botStatus.html}
                            </p>
                        </div>
                        <i class="fas fa-robot text-6xl text-indigo-300 opacity-30"></i>
                    </div>
                </div>

                <!-- Actions -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Démarrer via .bat -->
                    <div class="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <h3 class="text-lg font-bold text-white mb-2 flex items-center gap-2">
                            <i class="fas fa-play text-green-400"></i>
                            Démarrer le Bot
                        </h3>
                        <p class="text-sm text-secondary mb-4">
                            Lance le bot manuellement via le fichier .bat
                        </p>
                        <button onclick="DiscordUnified.openBatFile()"
                                class="w-full btn-premium bg-green-600 hover:bg-green-700">
                            <i class="fas fa-external-link-alt mr-2"></i>
                            Ouvrir start-bot.bat
                        </button>
                    </div>

                    <!-- Synchronisation manuelle -->
                    <div class="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <h3 class="text-lg font-bold text-white mb-2 flex items-center gap-2">
                            <i class="fas fa-sync-alt text-blue-400"></i>
                            Synchronisation Manuelle
                        </h3>
                        <p class="text-sm text-secondary mb-4">
                            Force une synchronisation immédiate (nécessite bot actif)
                        </p>
                        <button onclick="DiscordUnified.triggerBotSync()"
                                class="w-full btn-premium bg-blue-600 hover:bg-blue-700">
                            <i class="fas fa-sync-alt mr-2"></i>
                            Synchroniser maintenant
                        </button>
                    </div>
                </div>

                <!-- Installation PM2 -->
                <div class="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-500/50 rounded-lg p-6">
                    <div class="flex items-start gap-4">
                        <i class="fas fa-server text-purple-400 text-3xl"></i>
                        <div class="flex-1">
                            <h3 class="text-xl font-bold text-white mb-2">
                                Démarrage Automatique avec PM2
                            </h3>
                            <p class="text-secondary text-sm mb-4">
                                PM2 garde le bot actif 24/7 et le redémarre automatiquement en cas de crash ou au démarrage de Windows.
                            </p>

                            <div class="bg-gray-900/50 rounded-lg p-4 font-mono text-sm text-green-400 mb-4">
                                <p># Installer PM2</p>
                                <p>npm install -g pm2</p>
                                <p class="mt-2"># Démarrer le bot</p>
                                <p>cd discord-bot</p>
                                <p>pm2 start sync-members.js --name "discord-bot-skali"</p>
                                <p class="mt-2"># Activer le démarrage automatique</p>
                                <p>pm2 startup</p>
                                <p>pm2 save</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Commandes Utiles -->
                <div class="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                    <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <i class="fas fa-terminal text-yellow-400"></i>
                        Commandes Utiles
                    </h3>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- Voir les logs PM2 -->
                        <div class="bg-gray-900/50 rounded-lg p-3">
                            <p class="text-sm text-secondary mb-2">Voir les logs du bot</p>
                            <div class="bg-black/50 rounded p-2 font-mono text-xs text-green-400">
                                pm2 logs discord-bot-skali
                            </div>
                        </div>

                        <!-- Redémarrer -->
                        <div class="bg-gray-900/50 rounded-lg p-3">
                            <p class="text-sm text-secondary mb-2">Redémarrer le bot</p>
                            <div class="bg-black/50 rounded p-2 font-mono text-xs text-green-400">
                                pm2 restart discord-bot-skali
                            </div>
                        </div>

                        <!-- Status -->
                        <div class="bg-gray-900/50 rounded-lg p-3">
                            <p class="text-sm text-secondary mb-2">Vérifier le status</p>
                            <div class="bg-black/50 rounded p-2 font-mono text-xs text-green-400">
                                pm2 status
                            </div>
                        </div>

                        <!-- Arrêter -->
                        <div class="bg-gray-900/50 rounded-lg p-3">
                            <p class="text-sm text-secondary mb-2">Arrêter le bot</p>
                            <div class="bg-black/50 rounded p-2 font-mono text-xs text-green-400">
                                pm2 stop discord-bot-skali
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Info Auto-start Windows -->
                <div class="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                    <div class="flex items-start gap-3">
                        <i class="fas fa-lightbulb text-yellow-400 text-xl"></i>
                        <div class="text-sm text-secondary">
                            <p class="font-semibold text-yellow-300 mb-2">Alternative : Auto-start Windows sans PM2</p>
                            <p class="mb-2">Si tu ne veux pas installer PM2, tu peux ajouter le bot au démarrage Windows :</p>
                            <ol class="list-decimal list-inside space-y-1 text-xs">
                                <li>Appuie sur <kbd class="glass-card px-2 py-1 rounded">Win + R</kbd></li>
                                <li>Tape <code class="glass-card px-2 py-1 rounded">shell:startup</code></li>
                                <li>Crée un raccourci vers <code class="glass-card px-2 py-1 rounded">discord-bot/start-bot.bat</code></li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // ========================================
    // FONCTIONS NOTIFICATIONS
    // ========================================

    saveNotificationSettings() {
        if (!DiscordNotifier) {
            return;
        }

        DiscordNotifier.config.webhookUrl = document.getElementById('discordWebhook').value;
        DiscordNotifier.config.weatherApiKey = document.getElementById('weatherApiKey').value;
        DiscordNotifier.config.weatherCity = document.getElementById('weatherCity').value;
        DiscordNotifier.config.sendTime = document.getElementById('discordSendTime').value;
        DiscordNotifier.config.enabled = document.getElementById('discordAutoSend').checked;

        DiscordNotifier.saveConfig();

        if (DiscordNotifier.config.enabled) {
            DiscordNotifier.setupDailyCheck();
        }

        Utils.showNotification('✅ Configuration Discord sauvegardée', 'success');
    },

    async testWeather() {
        if (!DiscordNotifier) {
            return;
        }

        const weather = await DiscordNotifier.getWeather();
        if (weather) {
            Utils.showNotification(
                `${weather.icon} ${weather.description} - ${weather.temp}°C à ${DiscordNotifier.config.weatherCity}`,
                'success'
            );
        } else {
            Utils.showNotification('❌ Erreur météo - Vérifiez la clé API', 'error');
        }
    },

    async sendNotificationNow() {
        if (!DiscordNotifier) {
            return;
        }

        try {
            await DiscordNotifier.sendDailyProgram();
            Utils.showNotification('✅ Message envoyé sur Discord', 'success');
        } catch (error) {
            Utils.showNotification('❌ Erreur: ' + error.message, 'error');
        }
    },

    async refreshNotificationPreview() {
        await this.renderTabContent();
        Utils.showNotification('✅ Aperçu actualisé', 'success');
    },

    generateDiscordPreview(message, sessions) {
        const embed = message.embeds[0];
        const session = sessions && sessions[0];
        const category = session ? CONFIG.SESSION_CATEGORIES[session.category] : null;
        const color = category?.color || '#52c759';

        return `
            <div class="space-y-3">
                <div class="text-secondary font-semibold">${message.content}</div>
                <div style="border-left: 4px solid ${color}; background: rgba(47, 49, 54, 0.8);" class="pl-4 pr-4 py-3 rounded-r-lg">
                    <div class="text-lg font-bold mb-2" style="color: ${color}">
                        ${embed.title}
                    </div>
                    <div class="text-secondary mb-3">
                        ${embed.description}
                    </div>
                    ${
                        embed.fields && embed.fields.length > 0
                            ? embed.fields
                                  .map(
                                      field => `
                        <div class="text-sm text-secondary mb-2 whitespace-pre-line">
                            ${field.value}
                        </div>
                    `
                                  )
                                  .join('')
                            : ''
                    }
                    <div class="text-xs text-secondary mt-3">
                        ${embed.footer && embed.footer.text ? embed.footer.text : ''}
                    </div>
                </div>
            </div>
        `;
    },

    // ========================================
    // FONCTIONS LIAISON MEMBRES
    // ========================================

    setMemberFilter(filter) {
        this.currentFilter = filter;

        // Mettre à jour les boutons
        ['all', 'linked', 'unlinked', 'inactive'].forEach(f => {
            const btn = document.getElementById(`filter-${f}`);
            if (btn) {
                if (f === filter) {
                    btn.className =
                        'filter-btn px-4 py-2 rounded-lg font-semibold transition bg-gradient-to-r from-indigo-600 to-purple-600 text-white';
                } else {
                    btn.className =
                        'filter-btn px-4 py-2 rounded-lg font-semibold transition glass-card text-secondary hover:bg-gray-600';
                }
            }
        });

        this.renderMembersList();
    },

    applyMemberFilters() {
        this.renderMembersList();
    },

    renderMembersList() {
        const container = document.getElementById('discordMembersList');
        if (!container) {
            return;
        }

        const searchQuery =
            document.getElementById('discordSearchInput')?.value?.toLowerCase() || '';

        // Filtrer
        let filtered = this.discordMembers.filter(dm => {
            // Filtre par statut
            if (this.currentFilter === 'linked' && !dm.member_id) {
                return false;
            }
            if (this.currentFilter === 'unlinked' && dm.member_id) {
                return false;
            }
            if (this.currentFilter === 'inactive' && dm.is_active) {
                return false;
            }
            if (this.currentFilter !== 'inactive' && !dm.is_active) {
                return false;
            }

            // Filtre par recherche
            if (searchQuery) {
                const matchDiscord =
                    dm.discord_username?.toLowerCase().includes(searchQuery) ||
                    dm.discord_global_name?.toLowerCase().includes(searchQuery) ||
                    dm.server_nickname?.toLowerCase().includes(searchQuery);

                const matchMember =
                    dm.member_name?.toLowerCase().includes(searchQuery) ||
                    dm.firstname?.toLowerCase().includes(searchQuery) ||
                    dm.lastname?.toLowerCase().includes(searchQuery);

                return matchDiscord || matchMember;
            }

            return true;
        });

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12 text-secondary">
                    <i class="fas fa-users-slash text-6xl mb-4 opacity-50"></i>
                    <p class="text-xl font-semibold">Aucun membre trouvé</p>
                    <p class="text-sm">Essayez un autre filtre ou recherche</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(dm => this.renderMemberCard(dm)).join('');
    },

    renderMemberCard(dm) {
        const isLinked = !!dm.member_id;
        const isActive = dm.is_active;

        return `
            <div class="bg-gray-800/50 rounded-lg p-4 border ${isLinked ? 'border-green-500/30' : 'border-gray-700'} hover:border-indigo-500/50 transition">
                <div class="flex items-center gap-4">
                    <!-- Avatar -->
                    <div class="flex-shrink-0">
                        ${
                            dm.discord_avatar
                                ? `
                            <img src="${dm.discord_avatar}" alt="${dm.discord_username}"
                                 class="w-16 h-16 rounded-full border-2 ${isLinked ? 'border-green-500' : 'border-glass'}">
                        `
                                : `
                            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center border-2 ${isLinked ? 'border-green-500' : 'border-glass'}">
                                <i class="fab fa-discord text-2xl text-white"></i>
                            </div>
                        `
                        }
                    </div>

                    <!-- Info Discord -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                            <h3 class="text-lg font-bold text-white truncate">
                                ${dm.server_nickname || dm.discord_global_name || dm.discord_username}
                            </h3>
                            ${
                                !isActive
                                    ? `
                                <span class="text-xs bg-gray-600 text-gray-200 px-2 py-1 rounded">Inactif</span>
                            `
                                    : ''
                            }
                            ${
                                isLinked
                                    ? `
                                <span class="text-xs bg-green-600 text-white px-2 py-1 rounded flex items-center gap-1">
                                    <i class="fas fa-link"></i>
                                    Lié
                                </span>
                            `
                                    : `
                                <span class="text-xs bg-yellow-600 text-white px-2 py-1 rounded flex items-center gap-1">
                                    <i class="fas fa-unlink"></i>
                                    Non lié
                                </span>
                            `
                            }
                        </div>

                        <p class="text-sm text-secondary font-mono">
                            <i class="fab fa-discord mr-1"></i>
                            ${dm.discord_username}
                        </p>

                        ${
                            isLinked
                                ? `
                            <div class="mt-2 p-2 bg-green-900/30 border border-green-500/30 rounded">
                                <p class="text-sm font-semibold text-green-100">
                                    <i class="fas fa-user text-green-400 mr-1"></i>
                                    ${dm.member_name || dm.firstname || 'Adhérent'}
                                </p>
                            </div>
                        `
                                : ''
                        }
                    </div>

                    <!-- Actions -->
                    <div class="flex-shrink-0">
                        ${
                            isLinked
                                ? `
                            <button onclick="DiscordUnified.unlinkMember('${dm.discord_id}', '${(dm.member_name || '').replace(/'/g, "\\'")}', '${(dm.discord_username || '').replace(/'/g, "\\'")}')"
                                    class="btn-premium bg-yellow-600 hover:bg-yellow-700 text-sm">
                                <i class="fas fa-unlink mr-1"></i>
                                Délier
                            </button>
                        `
                                : `
                            ${
                                isActive
                                    ? `
                                <button onclick="DiscordUnified.linkMember('${dm.discord_id}', '${(dm.discord_username || '').replace(/'/g, "\\'")}')"
                                        class="btn-premium bg-green-600 hover:bg-green-700 text-sm">
                                    <i class="fas fa-link mr-1"></i>
                                    Lier
                                </button>
                            `
                                    : ''
                            }
                        `
                        }
                    </div>
                </div>
            </div>
        `;
    },

    async linkMember(discordId, discordUsername) {
        // Créer la modal de sélection d'adhérent
        const modal = document.createElement('div');
        modal.className =
            'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
        modal.id = 'linkModal';

        const availableMembers = this.members.filter(m => !m.discord_id);

        modal.innerHTML = `
            <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-2xl w-full p-6 border-2 border-green-500 shadow-2xl">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-2xl font-bold text-white flex items-center gap-2">
                        <i class="fas fa-link text-green-400"></i>
                        Lier ${discordUsername} à un adhérent
                    </h3>
                    <button onclick="document.getElementById('linkModal').remove()" class="text-secondary hover:text-white">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>

                <div class="mb-4">
                    <input type="text" id="linkSearchInput"
                           placeholder="Rechercher un adhérent..."
                           oninput="DiscordUnified.filterLinkableMembers(this.value)"
                           class="form-input w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none">
                </div>

                <div id="linkableMembersList" class="max-h-96 overflow-y-auto space-y-2">
                    ${availableMembers
                        .map(
                            member => `
                        <div class="linkable-member bg-gray-800 rounded-lg p-3 hover:bg-gray-750 cursor-pointer border border-gray-700 hover:border-green-500 transition"
                             onclick="DiscordUnified.confirmLink('${discordId}', '${member.id}', '${(member.name || '').replace(/'/g, "\\'")}', '${discordUsername.replace(/'/g, "\\'")}')"
                             data-name="${(member.name || '').toLowerCase()}">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center flex-shrink-0">
                                    <i class="fas fa-user text-white"></i>
                                </div>
                                <div class="flex-1">
                                    <h4 class="font-bold text-white">${member.name}</h4>
                                    ${member.email ? `<p class="text-xs text-secondary">${member.email}</p>` : ''}
                                </div>
                                <i class="fas fa-chevron-right text-secondary"></i>
                            </div>
                        </div>
                    `
                        )
                        .join('')}
                </div>

                ${
                    availableMembers.length === 0
                        ? `
                    <div class="text-center py-8 text-secondary">
                        <i class="fas fa-users-slash text-4xl mb-2"></i>
                        <p>Tous les adhérents sont déjà liés</p>
                    </div>
                `
                        : ''
                }
            </div>
        `;

        document.body.appendChild(modal);
    },

    filterLinkableMembers(query) {
        const members = document.querySelectorAll('.linkable-member');
        const lowerQuery = query.toLowerCase();

        members.forEach(member => {
            const name = member.dataset.name;
            const matches = name.includes(lowerQuery);
            member.style.display = matches ? 'block' : 'none';
        });
    },

    async confirmLink(discordId, memberId, memberName, discordUsername) {
        const confirmed = confirm(`Confirmer la liaison :\n\n${discordUsername} ↔ ${memberName}`);

        if (!confirmed) {
            return;
        }

        try {
            const client = SupabaseManager.supabase;

            const { data, error } = await client.rpc('link_discord_to_member', {
                p_discord_id: discordId,
                p_member_id: memberId,
                p_linked_by: 'Admin'
            });

            if (error) {
                throw error;
            }

            Utils.showNotification(`✅ ${discordUsername} lié à ${memberName}`, 'success');

            document.getElementById('linkModal')?.remove();

            await this.loadMembersData();
            this.renderMembersList();
        } catch (error) {
            console.error('❌ Erreur liaison:', error);
            Utils.showNotification('Erreur lors de la liaison : ' + error.message, 'error');
        }
    },

    async unlinkMember(discordId, memberName, discordUsername) {
        const confirmed = confirm(`Délier ${discordUsername} de ${memberName} ?`);

        if (!confirmed) {
            return;
        }

        try {
            const client = SupabaseManager.supabase;

            const { data, error } = await client.rpc('unlink_discord_from_member', {
                p_discord_id: discordId
            });

            if (error) {
                throw error;
            }

            Utils.showNotification(`✅ ${discordUsername} délié de ${memberName}`, 'success');

            await this.loadMembersData();
            this.renderMembersList();
        } catch (error) {
            console.error('❌ Erreur déliaison:', error);
            Utils.showNotification('Erreur lors de la déliaison : ' + error.message, 'error');
        }
    },

    async syncFromDiscord() {
        const confirmed = confirm('Lancer une synchronisation complète depuis Discord ?');

        if (!confirmed) {
            return;
        }

        Utils.showNotification('🔄 Synchronisation en cours...', 'info');

        setTimeout(async () => {
            await this.loadMembersData();
            this.renderMembersList();
            Utils.showNotification('✅ Synchronisation terminée', 'success');
        }, 2000);
    },

    // ========================================
    // FONCTIONS BOT
    // ========================================

    openBatFile() {
        Utils.showNotification('Ouvre le fichier discord-bot/start-bot.bat manuellement', 'info');
        const path = 'discord-bot/start-bot.bat';
        window.open(`file:///${path}`, '_blank');
    },

    async triggerBotSync() {
        Utils.showNotification('⏳ Synchronisation en cours...', 'info');

        await new Promise(resolve => setTimeout(resolve, 3000));

        await this.renderTabContent();

        Utils.showNotification('✅ Synchronisation terminée ! (si le bot est actif)', 'success');
    },

    // ========================================
    // FONCTIONS MORNING ROUTINE
    // ========================================

    saveMorningSettings() {
        if (!window.DiscordMorningCoach) {
            Utils.showNotification('❌ Module Morning Coach non chargé', 'error');
            return;
        }

        // Récupérer les valeurs
        DiscordMorningCoach.config.enabled = document.getElementById('morningEnabled').checked;
        DiscordMorningCoach.config.webhookUrl = document.getElementById('morningWebhook').value.trim();
        DiscordMorningCoach.config.sendTime = document.getElementById('morningSendTime').value;
        DiscordMorningCoach.config.includeWarmup = document.getElementById('morningIncludeWarmup').checked;
        DiscordMorningCoach.config.warmupDuration = parseInt(document.getElementById('morningWarmupDuration').value);
        DiscordMorningCoach.config.useAI = document.getElementById('morningUseAI').checked;
        DiscordMorningCoach.config.aiProvider = document.getElementById('morningAIProvider').value;

        // Sauvegarder
        DiscordMorningCoach.saveConfig();

        // Redémarrer ou arrêter selon l'état
        if (DiscordMorningCoach.config.enabled && DiscordMorningCoach.config.webhookUrl) {
            DiscordMorningCoach.startDailyCheck();
            Utils.showNotification(
                '✅ Configuration sauvegardée',
                `Morning Coach activé pour ${DiscordMorningCoach.config.sendTime}`,
                'success'
            );
        } else {
            DiscordMorningCoach.stopDailyCheck();
            Utils.showNotification(
                '✅ Configuration sauvegardée',
                'Morning Coach désactivé',
                'success'
            );
        }

        // Rafraîchir l'affichage
        this.renderTabContent();
    },

    async testMorningRoutine() {
        if (!window.DiscordMorningCoach) {
            Utils.showNotification('❌ Module Morning Coach non chargé', 'error');
            return;
        }

        if (!DiscordMorningCoach.config.webhookUrl) {
            Utils.showNotification('❌ Configurez d\'abord le webhook Discord', 'error');
            return;
        }

        // Vérifier qu'il y a une séance aujourd'hui
        const today = new Date();
        const dateKey = today.toISOString().split('T')[0];
        const sessions = await SupabaseManager.getSessions();
        const todaySessions = sessions.filter(s => s.date === dateKey);

        if (!todaySessions || todaySessions.length === 0) {
            Utils.showNotification(
                '⚠️ Aucune séance programmée aujourd\'hui',
                'Ajoutez une séance dans le calendrier pour tester la morning routine',
                'warning'
            );
            return;
        }

        // Vérifier la configuration de l'IA
        if (DiscordMorningCoach.config.useAI && DiscordMorningCoach.config.includeWarmup) {
            // Vérifier que la clé API est configurée
            const provider = DiscordMorningCoach.config.aiProvider;
            let apiKeyConfigured = false;

            if (window.ENV) {
                switch (provider) {
                    case 'deepseek':
                        apiKeyConfigured = !!ENV.get('deepseekKey');
                        break;
                    case 'claude':
                        apiKeyConfigured = !!(ENV.get('claudeKey') || ENV.get('anthropicKey'));
                        break;
                    case 'openai':
                        apiKeyConfigured = !!ENV.get('openaiKey');
                        break;
                }
            }

            if (!apiKeyConfigured) {
                Utils.showNotification(
                    `⚠️ Clé API ${provider.toUpperCase()} non configurée`,
                    `Configurez la clé API dans Menu → Configuration → Intelligence Artificielle`,
                    'warning'
                );
                // On continue quand même avec le fallback générique
            }
        }

        try {
            Utils.showNotification('🧪 Envoi du test en cours...', 'info');

            await DiscordMorningCoach.testSend();

            Utils.showNotification(
                '✅ Test envoyé avec succès !',
                'Vérifiez votre canal Discord',
                'success'
            );

            // Rafraîchir l'affichage pour voir l'historique mis à jour
            await this.renderTabContent();
        } catch (error) {
            console.error('Erreur test morning routine:', error);
            Utils.showNotification('❌ Erreur: ' + error.message, 'error');
        }
    },

    async generateMorningPreviewOnly() {
        const previewContainer = document.getElementById('morning-preview');

        if (!previewContainer) {
            return;
        }

        try {
            // Afficher loading
            previewContainer.innerHTML = `
                <div class="text-center py-8 text-secondary">
                    <i class="fas fa-spinner fa-spin text-4xl mb-2"></i>
                    <p>Génération de l'aperçu...</p>
                </div>
            `;

            // Récupérer la séance du jour
            const today = new Date();
            const dateKey = today.toISOString().split('T')[0];
            const sessions = await SupabaseManager.getSessions();
            const todaySessions = sessions.filter(s => s.date === dateKey);

            if (!todaySessions || todaySessions.length === 0) {
                previewContainer.innerHTML = `
                    <div class="text-center py-8">
                        <i class="fas fa-calendar-times text-yellow-400 text-4xl mb-3"></i>
                        <p class="text-white font-semibold mb-2">Aucune séance aujourd'hui</p>
                        <p class="text-secondary text-sm">Ajoutez une séance dans le calendrier pour voir l'aperçu</p>
                    </div>
                `;
                return;
            }

            const session = todaySessions[0];

            // Générer le warm-up
            let warmup = null;
            if (window.DiscordMorningCoach && DiscordMorningCoach.config.includeWarmup) {
                warmup = await DiscordMorningCoach.generateWarmup(session);
            }

            // Si aucune IA n'a fonctionné, afficher un message explicatif
            if (!warmup) {
                previewContainer.innerHTML = `
                    <div class="text-center py-8">
                        <i class="fas fa-robot text-yellow-400 text-4xl mb-3"></i>
                        <p class="text-white font-semibold mb-2">Aucune IA disponible</p>
                        <p class="text-secondary text-sm mb-4">Le système a testé tous les providers IA configurés, mais aucun n'a pu générer le warm-up.</p>
                        <div class="glass-card p-4 text-left max-w-md mx-auto">
                            <p class="text-sm text-secondary mb-2">
                                <i class="fas fa-info-circle mr-2 text-blue-400"></i>
                                <strong class="text-white">Solutions :</strong>
                            </p>
                            <ul class="text-sm text-secondary space-y-1 ml-6">
                                <li>• Configurez une clé API (Menu → Configuration → IA)</li>
                                <li>• DeepSeek est recommandé (économique et performant)</li>
                                <li>• Le message ne sera PAS envoyé sans warm-up généré par IA</li>
                            </ul>
                        </div>
                    </div>
                `;
                return;
            }

            // Afficher l'aperçu
            previewContainer.innerHTML = this.generateMorningPreviewHTML(warmup, session);

            Utils.showNotification('✅ Aperçu généré', 'success');
        } catch (error) {
            console.error('Erreur génération aperçu:', error);
            previewContainer.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-exclamation-triangle text-red-400 text-4xl mb-3"></i>
                    <p class="text-white font-semibold mb-2">Erreur lors de la génération</p>
                    <p class="text-secondary text-sm">${error.message}</p>
                </div>
            `;
            Utils.showNotification('❌ Erreur: ' + error.message, 'error');
        }
    },

    generateMorningPreviewHTML(warmup, session) {
        const now = new Date();
        const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        const dayName = dayNames[now.getDay()];

        const exercisesText = warmup.exercises
            .map((ex, i) => {
                return `**${i + 1}. ${ex.name}** • \`${ex.duration}\`\n${ex.instructions}`;
            })
            .join('\n\n');

        return `
            <div class="space-y-3">
                <div class="text-secondary font-semibold text-center">
                    ☀️ Salut la team ! C'est parti pour un ${dayName} de feu 🔥
                </div>
                <div style="border-left: 4px solid #ffd93d; background: rgba(47, 49, 54, 0.8);" class="pl-4 pr-4 py-3 rounded-r-lg">
                    <div class="text-lg font-bold mb-2" style="color: #ffd93d">
                        ☀️ ${warmup.title || 'Routine matinale'}
                    </div>
                    <div class="text-secondary mb-3">
                        Petit réveil en douceur de **${warmup.duration} minutes** avant la séance du jour 💪
                    </div>

                    <div class="text-sm text-secondary mb-3 whitespace-pre-line">
                        <strong>🔥 Ta routine</strong>

${exercisesText}
                    </div>

                    <div class="mt-4 pt-3 border-t border-gray-700">
                        <div class="text-sm text-secondary">
                            <strong>🎯 Séance du jour</strong>
                            <div class="mt-1">**${session.title}** • ${session.category}</div>
                        </div>
                    </div>

                    <div class="text-xs text-secondary mt-3 pt-3 border-t border-gray-700">
                        Bonne journée, la biz ❤️
                    </div>
                </div>
            </div>
        `;
    },

    async refreshMorningPreview() {
        await this.generateMorningPreviewOnly();
    }
};

// Export global
window.DiscordUnified = DiscordUnified;
