// Gestionnaire des notifications Discord pour les séances quotidiennes - VERSION AMELIOREE
const DiscordNotifier = {
    config: {
        webhookUrl: '',
        weatherApiKey: '',
        weatherCity: 'Laval,FR',
        sendTime: '07:00',
        enabled: false,
        messageTemplates: {
            title: '💪 {sessionTitle}',
            description: '🏋️ **{categoryName}**',
            program: '📋 **Programme:**\n{programBlocks}',
            weather: '{weatherIcon} **Météo:** {weatherDescription}\n🌡️ **{weatherTemp}°C**',
            schedule: '⏰ **Horaires:**\n**9H - 20H**\nSalle ouverte',
            footer: 'Skäli Prog • Bon entraînement !',
            restDay: "💤 **Jour de repos**\nPas de séance programmée aujourd'hui"
        }
    },

    intervalId: null,
    currentTab: 'config',
    currentPreviewDate: null,

    // Initialiser
    init() {
        const saved = localStorage.getItem('discordNotifierConfig');
        if (saved) {
            this.config = { ...this.config, ...JSON.parse(saved) };
        }

        if (this.config.enabled && this.config.webhookUrl) {
            this.setupDailyCheck();
            console.log('📢 Discord Notifier activé pour', this.config.sendTime);
        }
    },

    // Sauvegarder config
    saveConfig() {
        localStorage.setItem('discordNotifierConfig', JSON.stringify(this.config));
    },

    // Configurer la vérification quotidienne
    setupDailyCheck() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        this.intervalId = setInterval(() => {
            this.checkAndSendDaily();
        }, 60000);

        console.log('✅ Nouvel intervalle Discord créé');
    },

    // Vérifier et envoyer si c'est l'heure
    async checkAndSendDaily() {
        if (!this.config.enabled) {
            return;
        }

        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const lastSent = localStorage.getItem('lastDiscordDailySent');
        const today = now.toDateString();

        if (currentTime === this.config.sendTime && lastSent !== today) {
            console.log('📢 Envoi de la séance du jour !');

            try {
                await this.sendDailyProgram();
                localStorage.setItem('lastDiscordDailySent', today);
            } catch (error) {
                console.error('❌ Erreur envoi Discord:', error);
            }
        }
    },

    // Récupérer la météo
    async getWeather() {
        if (!this.config.weatherApiKey) {
            return null;
        }

        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${this.config.weatherCity}&appid=${this.config.weatherApiKey}&units=metric&lang=fr`;
            const response = await fetch(url);

            if (!response.ok) {
                return null;
            }

            const data = await response.json();
            return {
                temp: Math.round(data.main.temp),
                description: data.weather[0].description,
                icon: this.getWeatherEmoji(data.weather[0].main)
            };
        } catch (error) {
            console.error('Erreur météo:', error);
            return null;
        }
    },

    // Helper emoji météo
    getWeatherEmoji(condition) {
        const emojis = {
            Clear: '☀️',
            Clouds: '☁️',
            Rain: '🌧️',
            Snow: '❄️',
            Thunderstorm: '⛈️',
            Drizzle: '🌦️',
            Mist: '🌫️',
            Fog: '🌫️'
        };
        return emojis[condition] || '🌤️';
    },

    // Construire le message Discord
    async buildDiscordMessage(sessions, weather, customMessage = null, targetDate = null) {
        const dateToFormat = targetDate || new Date();

        const dateFormatted = dateToFormat.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const dateCapitalized = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);

        // Si pas de séance
        if (!sessions || sessions.length === 0) {
            const restDayMessage = customMessage || this.config.messageTemplates.restDay;
            return {
                content: `📅 **${dateCapitalized}**`,
                embeds: [
                    {
                        title: '💤 Jour de repos',
                        description: restDayMessage,
                        color: 0x808080,
                        footer: {
                            text: this.config.messageTemplates.footer
                        }
                    }
                ]
            };
        }

        const session = sessions[0];
        const category = CONFIG.SESSION_CATEGORIES[session.category];

        const variables = {
            sessionTitle: session.title || 'Séance du jour',
            categoryName: category?.name || '',
            programBlocks:
                session.blocks && session.blocks.length > 0
                    ? session.blocks.map(b => `• **${b.name}**`).join('\n')
                    : 'Programme à venir',
            weatherIcon: weather?.icon || '🌤️',
            weatherDescription: weather?.description || 'Météo indisponible',
            weatherTemp: weather?.temp || '--'
        };

        const fields = [];

        const programMessage =
            customMessage || this.replaceVariables(this.config.messageTemplates.program, variables);
        fields.push({
            name: '\u200b',
            value: programMessage,
            inline: false
        });

        if (weather) {
            const weatherMessage = this.replaceVariables(
                this.config.messageTemplates.weather,
                variables
            );
            fields.push({
                name: '\u200b',
                value: weatherMessage,
                inline: false
            });
        }

        const titleMessage = this.replaceVariables(this.config.messageTemplates.title, variables);
        const descriptionMessage = this.replaceVariables(
            this.config.messageTemplates.description,
            variables
        );

        return {
            content: `📅 **${dateCapitalized}**`,
            embeds: [
                {
                    title: titleMessage,
                    description: descriptionMessage,
                    color: parseInt(category?.color?.replace('#', ''), 16) || 0x52c759,
                    fields: fields,
                    footer: {
                        text: this.config.messageTemplates.footer
                    },
                    timestamp: new Date().toISOString()
                }
            ]
        };
    },

    // Remplacer les variables dans les templates
    replaceVariables(template, variables) {
        let result = template;
        Object.keys(variables).forEach(key => {
            const regex = new RegExp(`{${key}}`, 'g');
            result = result.replace(regex, variables[key]);
        });
        return result;
    },

    // Envoyer le programme quotidien
    async sendDailyProgram(dateKey = null) {
        if (!this.config.webhookUrl) {
            throw new Error('Webhook non configuré');
        }

        // Construire la date cible
        const targetDate = dateKey || Utils.formatDateKey(new Date());

        console.log('📅 Récupération de la séance pour:', targetDate);

        // Récupérer les sessions pour cette date spécifique (force refresh pour s'assurer d'avoir les données à jour)
        const sessions = await SupabaseManager.getSessions(targetDate, true);

        console.log('📊 Séances trouvées:', sessions ? sessions.length : 0);
        if (sessions && sessions.length > 0) {
            console.log('🔍 Détails première séance:', sessions[0]);
        }

        const weather = await this.getWeather();

        // Construire l'objet Date pour l'affichage
        const displayDate = dateKey ? this.parseDateKey(dateKey) : new Date();
        const message = await this.buildDiscordMessage(sessions, weather, null, displayDate);

        const response = await fetch(this.config.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message)
        });

        if (!response.ok) {
            throw new Error(`Erreur Discord: ${response.status}`);
        }

        console.log('✅ Message Discord envoyé avec succès');
    },

    // Helper pour parser une dateKey (YYYY-MM-DD) vers Date
    parseDateKey(dateKey) {
        const [year, month, day] = dateKey.split('-').map(Number);
        return new Date(year, month - 1, day);
    },

    // ========================================
    // NOUVELLE INTERFACE AVEC ONGLETS
    // ========================================

    // Ouvrir la modal avec onglets
    async openConfigModal(defaultTab = 'config') {
        this.currentTab = defaultTab;
        const today = Utils.formatDateKey(new Date());
        this.currentPreviewDate = today;

        const html = `
            <div class="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4" onclick="Utils.closeModal(event)">
                <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onclick="event.stopPropagation()">
                    <!-- En-tête -->
                    <div class="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-4">
                                <div class="bg-white bg-opacity-20 p-3 rounded-xl">
                                    <i class="fab fa-discord text-3xl text-white"></i>
                                </div>
                                <div>
                                    <h2 class="text-2xl font-bold text-white">Notifications Discord</h2>
                                    <p class="text-indigo-200 text-sm">Configuration et envoi des notifications</p>
                                </div>
                            </div>
                            <button onclick="Utils.closeModal()" class="text-white hover:text-gray-300 transition-colors">
                                <i class="fas fa-times text-2xl"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Onglets -->
                    <div class="bg-gray-800 border-b border-gray-700">
                        <div class="flex space-x-1 px-6">
                            <button onclick="DiscordNotifier.switchTab('config')"
                                    id="tab-config"
                                    class="px-6 py-3 font-semibold transition-colors ${this.currentTab === 'config' ? 'text-white border-b-2 border-indigo-500' : 'text-gray-400 hover:text-white'}">
                                <i class="fas fa-cog mr-2"></i>Configuration
                            </button>
                            <button onclick="DiscordNotifier.switchTab('preview')"
                                    id="tab-preview"
                                    class="px-6 py-3 font-semibold transition-colors ${this.currentTab === 'preview' ? 'text-white border-b-2 border-indigo-500' : 'text-gray-400 hover:text-white'}">
                                <i class="fas fa-eye mr-2"></i>Aperçu du jour
                            </button>
                            <button onclick="DiscordNotifier.switchTab('send')"
                                    id="tab-send"
                                    class="px-6 py-3 font-semibold transition-colors ${this.currentTab === 'send' ? 'text-white border-b-2 border-indigo-500' : 'text-gray-400 hover:text-white'}">
                                <i class="fas fa-paper-plane mr-2"></i>Envoi manuel
                            </button>
                        </div>
                    </div>

                    <!-- Contenu des onglets -->
                    <div class="overflow-y-auto p-6" style="max-height: calc(90vh - 200px);">
                        <div id="tab-content-config" class="${this.currentTab === 'config' ? '' : 'hidden'}">
                            ${await this.generateConfigTab()}
                        </div>
                        <div id="tab-content-preview" class="${this.currentTab === 'preview' ? '' : 'hidden'}">
                            ${await this.generatePreviewTab()}
                        </div>
                        <div id="tab-content-send" class="${this.currentTab === 'send' ? '' : 'hidden'}">
                            ${await this.generateSendTab()}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('modalContainer').innerHTML = html;

        // Activer les événements
        const toggleCheckbox = document.getElementById('discordAutoSend');
        if (toggleCheckbox) {
            toggleCheckbox.addEventListener('change', e => {
                const label = e.target.nextElementSibling?.nextElementSibling;
                if (label) {
                    label.textContent = e.target.checked ? 'Activé' : 'Désactivé';
                }
            });
        }
    },

    // Changer d'onglet
    switchTab(tabName) {
        this.currentTab = tabName;

        // Mettre à jour les boutons d'onglets
        ['config', 'preview', 'send'].forEach(tab => {
            const button = document.getElementById(`tab-${tab}`);
            const content = document.getElementById(`tab-content-${tab}`);

            if (tab === tabName) {
                button.className =
                    'px-6 py-3 font-semibold transition-colors text-white border-b-2 border-indigo-500';
                content.classList.remove('hidden');
            } else {
                button.className =
                    'px-6 py-3 font-semibold transition-colors text-gray-400 hover:text-white';
                content.classList.add('hidden');
            }
        });

        // Recharger le contenu si nécessaire
        if (tabName === 'preview') {
            this.refreshPreviewTab();
        }
    },

    // Générer l'onglet de configuration
    async generateConfigTab() {
        return `
            <div class="space-y-6">
                <div class="bg-gray-800 bg-opacity-50 rounded-xl p-6 border border-gray-700">
                    <div class="flex items-center mb-4">
                        <i class="fas fa-cog text-green-400 text-xl mr-3"></i>
                        <h3 class="text-lg font-semibold text-white">Configuration</h3>
                    </div>

                    <div class="space-y-4">
                        <!-- Webhook URL -->
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">
                                <i class="fab fa-discord text-indigo-400 mr-2"></i>Webhook Discord
                            </label>
                            <input type="text" id="discordWebhook"
                                   value="${this.config.webhookUrl}"
                                   placeholder="https://discord.com/api/webhooks/..."
                                   class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none border border-gray-600">
                            <p class="text-xs text-gray-400 mt-1">Créez un webhook dans les paramètres de votre canal Discord</p>
                        </div>

                        <!-- Météo -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">
                                    <i class="fas fa-cloud-sun text-yellow-400 mr-2"></i>Clé API OpenWeatherMap
                                </label>
                                <input type="text" id="weatherApiKey"
                                       value="${this.config.weatherApiKey}"
                                       placeholder="Clé API"
                                       class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none border border-gray-600">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">
                                    <i class="fas fa-map-marker-alt text-red-400 mr-2"></i>Ville
                                </label>
                                <input type="text" id="weatherCity"
                                       value="${this.config.weatherCity}"
                                       placeholder="Laval,FR"
                                       class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none border border-gray-600">
                            </div>
                        </div>

                        <!-- Planification -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">
                                    <i class="fas fa-clock text-blue-400 mr-2"></i>Heure d'envoi quotidien
                                </label>
                                <input type="time" id="discordSendTime"
                                       value="${this.config.sendTime}"
                                       class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none border border-gray-600">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">
                                    <i class="fas fa-power-off text-green-400 mr-2"></i>Envoi automatique
                                </label>
                                <label class="relative inline-flex items-center cursor-pointer mt-2">
                                    <input type="checkbox" id="discordAutoSend" class="sr-only peer"
                                           ${this.config.enabled ? 'checked' : ''}>
                                    <div class="w-14 h-7 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                                    <span class="ml-3 text-sm font-medium text-gray-300">
                                        ${this.config.enabled ? 'Activé' : 'Désactivé'}
                                    </span>
                                </label>
                            </div>
                        </div>

                        <button onclick="DiscordNotifier.saveSettings()" class="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg">
                            <i class="fas fa-save mr-2"></i>Sauvegarder la configuration
                        </button>
                    </div>
                </div>

                <!-- Actions rapides -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onclick="DiscordNotifier.testWeather()" class="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg">
                        <i class="fas fa-cloud-sun mr-2"></i>Test Météo
                    </button>
                    <button onclick="DiscordNotifier.testSend()" class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg">
                        <i class="fab fa-discord mr-2"></i>Envoyer Test (Aujourd'hui)
                    </button>
                </div>
            </div>
        `;
    },

    // Générer l'onglet d'aperçu
    async generatePreviewTab() {
        const today = Utils.formatDateKey(new Date());
        const sessions = await SupabaseManager.getSessions(today, true); // Force refresh
        const weather = await this.getWeather();
        const message = await this.buildDiscordMessage(sessions, weather, null, new Date());

        return `
            <div class="space-y-6">
                <div class="bg-gray-800 bg-opacity-50 rounded-xl p-6 border border-gray-700">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center">
                            <i class="fas fa-eye text-purple-400 text-xl mr-3"></i>
                            <h3 class="text-lg font-semibold text-white">Aperçu du message d'aujourd'hui</h3>
                        </div>
                        <button onclick="DiscordNotifier.refreshPreviewTab()" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white text-sm">
                            <i class="fas fa-sync mr-2"></i>Actualiser
                        </button>
                    </div>

                    <!-- Aperçu Discord -->
                    <div id="discord-preview-container" class="bg-gray-900 rounded-lg p-6 border border-gray-700">
                        ${this.generateDiscordPreview(message, sessions)}
                    </div>
                </div>

                <!-- Action d'envoi -->
                <button onclick="DiscordNotifier.sendFromPreview()" class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 rounded-lg transition-all transform hover:scale-105 shadow-lg">
                    <i class="fab fa-discord mr-2"></i>Envoyer ce message sur Discord maintenant
                </button>
            </div>
        `;
    },

    // Générer l'onglet d'envoi manuel
    async generateSendTab() {
        const today = new Date().toISOString().split('T')[0];
        const todayKey = Utils.formatDateKey(new Date());
        const sessions = await SupabaseManager.getSessions(todayKey, true); // Force refresh

        return `
            <div class="space-y-6">
                <div class="bg-gray-800 bg-opacity-50 rounded-xl p-6 border border-gray-700">
                    <div class="flex items-center mb-4">
                        <i class="fas fa-calendar text-blue-400 text-xl mr-3"></i>
                        <h3 class="text-lg font-semibold text-white">Sélectionner une date</h3>
                    </div>

                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">Date de la séance</label>
                            <input type="date" id="manualDate"
                                   value="${today}"
                                   onchange="DiscordNotifier.loadSessionForManualDate()"
                                   class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none border border-gray-600">
                        </div>
                    </div>
                </div>

                <div id="manual-preview-container">
                    ${await this.generateManualPreviewSection(sessions, todayKey)}
                </div>
            </div>
        `;
    },

    // Générer la section d'aperçu manuel
    async generateManualPreviewSection(sessions, dateKey) {
        const weather = await this.getWeather();
        const date = this.parseDateKey(dateKey);
        const message = await this.buildDiscordMessage(sessions, weather, null, date);

        return `
            <div class="bg-gray-800 bg-opacity-50 rounded-xl p-6 border border-gray-700">
                <div class="flex items-center mb-4">
                    <i class="fas fa-eye text-purple-400 text-xl mr-3"></i>
                    <h3 class="text-lg font-semibold text-white">Aperçu du message</h3>
                </div>

                <!-- Aperçu Discord -->
                <div class="bg-gray-900 rounded-lg p-6 border border-gray-700 mb-4">
                    ${this.generateDiscordPreview(message, sessions)}
                </div>

                <!-- Bouton d'envoi -->
                <button onclick="DiscordNotifier.sendFromManualDate()" class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 rounded-lg transition-all transform hover:scale-105 shadow-lg">
                    <i class="fab fa-discord mr-2"></i>Envoyer ce message sur Discord
                </button>
            </div>
        `;
    },

    // Générer l'aperçu visuel du message Discord
    generateDiscordPreview(message, sessions) {
        const embed = message.embeds[0];
        const session = sessions && sessions[0];
        const category = session ? CONFIG.SESSION_CATEGORIES[session.category] : null;
        const color = category?.color || '#52c759';

        return `
            <div class="space-y-3">
                <div class="text-gray-300 font-semibold">${message.content}</div>
                <div style="border-left: 4px solid ${color}; background: rgba(47, 49, 54, 0.8);" class="pl-4 pr-4 py-3 rounded-r-lg">
                    <div class="text-lg font-bold mb-2" style="color: ${color}">
                        ${embed.title}
                    </div>
                    <div class="text-gray-300 mb-3">
                        ${embed.description}
                    </div>
                    ${embed.fields
                        .map(
                            field => `
                        <div class="text-sm text-gray-300 mb-2 whitespace-pre-line">
                            ${field.value}
                        </div>
                    `
                        )
                        .join('')}
                    <div class="text-xs text-gray-500 mt-3">
                        ${embed.footer.text}
                    </div>
                </div>
            </div>
        `;
    },

    // Charger la séance pour la date manuelle
    async loadSessionForManualDate() {
        const dateInput = document.getElementById('manualDate');
        const dateKey = Utils.formatDateKey(new Date(dateInput.value));
        console.log('🔄 Chargement séance pour date:', dateKey);

        const sessions = await SupabaseManager.getSessions(dateKey, true); // Force refresh

        console.log('📊 Sessions trouvées:', sessions ? sessions.length : 0);

        const container = document.getElementById('manual-preview-container');
        container.innerHTML = await this.generateManualPreviewSection(sessions, dateKey);

        if (sessions && sessions.length > 0) {
            Utils.showNotification(
                `✅ Séance du ${new Date(dateInput.value).toLocaleDateString('fr-FR')} chargée`,
                'success'
            );
        } else {
            Utils.showNotification(
                `ℹ️ Aucune séance pour le ${new Date(dateInput.value).toLocaleDateString('fr-FR')}`,
                'info'
            );
        }
    },

    // Actualiser l'onglet d'aperçu
    async refreshPreviewTab() {
        const content = await this.generatePreviewTab();
        document.getElementById('tab-content-preview').innerHTML = content;
        Utils.showNotification('✅ Aperçu actualisé', 'success');
    },

    // Envoyer depuis l'aperçu
    async sendFromPreview() {
        if (!this.config.webhookUrl) {
            Utils.showNotification('❌ Webhook Discord non configuré', 'error');
            return;
        }

        try {
            await this.sendDailyProgram();
            Utils.showNotification('✅ Message envoyé sur Discord', 'success');
        } catch (error) {
            Utils.showNotification('❌ Erreur: ' + error.message, 'error');
        }
    },

    // Envoyer depuis la date manuelle
    async sendFromManualDate() {
        if (!this.config.webhookUrl) {
            Utils.showNotification('❌ Webhook Discord non configuré', 'error');
            return;
        }

        const dateInput = document.getElementById('manualDate');
        const dateKey = Utils.formatDateKey(new Date(dateInput.value));

        try {
            await this.sendDailyProgram(dateKey);
            Utils.showNotification('✅ Message envoyé sur Discord', 'success');
        } catch (error) {
            Utils.showNotification('❌ Erreur: ' + error.message, 'error');
        }
    },

    // Sauvegarder les paramètres
    saveSettings() {
        this.config.webhookUrl = document.getElementById('discordWebhook').value;
        this.config.weatherApiKey = document.getElementById('weatherApiKey').value;
        this.config.weatherCity = document.getElementById('weatherCity').value;
        this.config.sendTime = document.getElementById('discordSendTime').value;
        this.config.enabled = document.getElementById('discordAutoSend').checked;

        this.saveConfig();

        if (this.config.enabled) {
            this.setupDailyCheck();
        }

        Utils.showNotification('✅ Configuration Discord sauvegardée', 'success');
    },

    // Tester la météo
    async testWeather() {
        const weather = await this.getWeather();
        if (weather) {
            Utils.showNotification(
                `${weather.icon} ${weather.description} - ${weather.temp}°C à ${this.config.weatherCity}`,
                'success'
            );
        } else {
            Utils.showNotification('❌ Erreur météo - Vérifiez la clé API', 'error');
        }
    },

    // Envoyer un test
    async testSend() {
        try {
            await this.sendDailyProgram();
            Utils.showNotification('✅ Message envoyé sur Discord', 'success');
        } catch (error) {
            Utils.showNotification('❌ Erreur: ' + error.message, 'error');
        }
    }
};

// Export
window.DiscordNotifier = DiscordNotifier;
