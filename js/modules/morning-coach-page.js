/**
 * MORNING COACH - PAGE DÉDIÉE (VERSION REFONTE)
 * Interface claire et complète pour la configuration du Morning Coach
 * - Design simplifié et organisé
 * - Tous les paramètres accessibles
 * - Statut en temps réel
 * - Historique clair
 */

const MorningCoachPage = {
    /**
     * Afficher la page Morning Coach
     */
    async showView() {
        // Désactiver tous les onglets de navigation
        if (typeof ViewManager !== 'undefined') {
            ViewManager.clearAllActiveStates();
        }

        // Activer le bouton de nav
        const navBtn = document.getElementById('morningCoachBtn');
        if (navBtn) {
            navBtn.classList.add('active');
        }

        // Charger la config actuelle
        await DiscordMorningCoach.init();
        const config = DiscordMorningCoach.config;

        // Calculer le statut
        const canSend = DiscordMorningCoach.canSendToday();
        const nextSend = this.calculateNextSendTime(config.sendTime);

        const html = `
            <div class="fade-in min-h-screen" style="background: var(--bg-primary);">

                <!-- MODULE HEADER -->
                <div class="module-header">
                    <div class="module-header-content">
                        <div>
                            <h1 class="module-title">
                                <i class="fas fa-sun"></i>
                                Morning Coach IA
                            </h1>
                            <p class="module-subtitle">
                                Notifications matinales automatiques avec séance + warm-up généré par IA
                            </p>
                        </div>
                        <div class="module-stats">
                            <div class="module-stat ${config.enabled ? 'module-stat-success' : 'module-stat-muted'}">
                                <i class="fas ${config.enabled ? 'fa-check-circle' : 'fa-pause-circle'}"></i>
                                <span class="module-stat-label">${config.enabled ? 'Actif' : 'Inactif'}</span>
                            </div>
                            <div class="module-stat-divider"></div>
                            <div class="module-stat">
                                <i class="fas fa-clock"></i>
                                <span class="module-stat-label">Envoi à ${config.sendTime}</span>
                            </div>
                            ${
                                DiscordMorningCoach.lastSentDate
                                    ? `
                                <div class="module-stat-divider"></div>
                                <div class="module-stat ${canSend ? 'module-stat-success' : 'module-stat-warning'}">
                                    <i class="fas ${canSend ? 'fa-check' : 'fa-hourglass-half'}"></i>
                                    <span class="module-stat-label">${canSend ? 'Prêt' : "Déjà envoyé aujourd'hui"}</span>
                                </div>
                            `
                                    : ''
                            }
                        </div>
                    </div>
                </div>

                <!-- MODULE CONTAINER -->
                <div class="module-container">
                    <div class="module-grid">

                        <!-- COLONNE GAUCHE: Configuration -->
                        <div class="module-col-left">

                            <!-- Configuration système -->
                            <div class="module-card">
                                <h3 class="module-card-title">
                                    <i class="fas fa-power-off"></i>
                                    Système
                                </h3>
                                <div class="module-card-content">

                                    <!-- Enable/Disable -->
                                    <div class="module-checkbox-group">
                                        <input type="checkbox"
                                               id="morningCoachEnabled"
                                               class="module-checkbox-input"
                                               ${config.enabled ? 'checked' : ''}
                                               onchange="MorningCoachPage.updateConfig()">
                                        <label for="morningCoachEnabled" class="module-checkbox-label">
                                            <strong>Activer Morning Coach</strong> - Envoi automatique quotidien
                                        </label>
                                    </div>

                                    <!-- Webhook Discord -->
                                    <div class="module-form-group">
                                        <label class="module-form-label">
                                            <i class="fab fa-discord"></i> Webhook Discord
                                        </label>
                                        <input type="url"
                                               id="morningCoachWebhook"
                                               class="module-form-input"
                                               value="${config.webhookUrl || ''}"
                                               placeholder="https://discord.com/api/webhooks/..."
                                               onchange="MorningCoachPage.updateConfig()">
                                        <span class="module-form-helper">
                                            Créez un webhook dans les paramètres de votre canal Discord
                                        </span>
                                    </div>

                                </div>
                            </div>

                            <!-- Planning & Timing -->
                            <div class="module-card">
                                <h3 class="module-card-title">
                                    <i class="fas fa-calendar-alt"></i>
                                    Planning & Horaire
                                </h3>
                                <div class="module-card-content">

                                    <!-- Heure d'envoi -->
                                    <div class="module-form-group">
                                        <label class="module-form-label">
                                            <i class="fas fa-clock"></i> Heure d'envoi quotidien
                                        </label>
                                        <input type="time"
                                               id="morningCoachTime"
                                               class="module-form-input"
                                               value="${config.sendTime || '07:00'}"
                                               onchange="MorningCoachPage.updateConfig()">
                                        <span class="module-form-helper">
                                            ${nextSend ? `Prochain envoi: ${nextSend}` : 'Format 24h'}
                                        </span>
                                    </div>

                                    <!-- Durée routine -->
                                    <div class="module-form-group">
                                        <label class="module-form-label">
                                            <i class="fas fa-stopwatch"></i> Durée de la Morning Routine
                                        </label>
                                        <div class="flex items-center gap-4">
                                            <input type="range"
                                                   id="morningCoachDuration"
                                                   class="flex-1"
                                                   min="5"
                                                   max="15"
                                                   step="1"
                                                   value="${config.warmupDuration || 7}"
                                                   oninput="document.getElementById('durationValue').textContent = this.value"
                                                   onchange="MorningCoachPage.updateConfig()">
                                            <span id="durationValue" class="font-bold text-lg" style="min-width: 50px;">${config.warmupDuration || 7}</span>
                                            <span class="text-secondary">min</span>
                                        </div>
                                        <span class="module-form-helper">
                                            Durée recommandée: 7-10 minutes
                                        </span>
                                    </div>

                                </div>
                            </div>

                            <!-- Personnalisation des Routines -->
                            <div class="module-card">
                                <h3 class="module-card-title">
                                    <i class="fas fa-sliders-h"></i>
                                    Personnalisation des Routines
                                </h3>
                                <div class="module-card-content">

                                    <!-- Niveau de difficulté -->
                                    <div class="module-form-group">
                                        <label class="module-form-label">
                                            <i class="fas fa-chart-line"></i> Niveau de difficulté
                                        </label>
                                        <select id="morningCoachDifficulty"
                                                class="module-form-select"
                                                onchange="MorningCoachPage.updateConfig()">
                                            <option value="easy" ${config.difficultyLevel === 'easy' ? 'selected' : ''}>
                                                Facile - Réveil en douceur
                                            </option>
                                            <option value="moderate" ${config.difficultyLevel === 'moderate' ? 'selected' : ''}>
                                                Modéré - Équilibré (recommandé)
                                            </option>
                                            <option value="challenging" ${config.difficultyLevel === 'challenging' ? 'selected' : ''}>
                                                Tonique - Plus dynamique
                                            </option>
                                        </select>
                                    </div>

                                    <!-- Niveau de variété -->
                                    <div class="module-form-group">
                                        <label class="module-form-label">
                                            <i class="fas fa-random"></i> Variété des routines
                                        </label>
                                        <select id="morningCoachVariety"
                                                class="module-form-select"
                                                onchange="MorningCoachPage.updateConfig()">
                                            <option value="low" ${config.routineVariety === 'low' ? 'selected' : ''}>
                                                Faible - Routines similaires
                                            </option>
                                            <option value="medium" ${config.routineVariety === 'medium' ? 'selected' : ''}>
                                                Moyenne - Quelques variations
                                            </option>
                                            <option value="high" ${config.routineVariety === 'high' ? 'selected' : ''}>
                                                Élevée - Maximum de diversité (recommandé)
                                            </option>
                                        </select>
                                        <span class="module-form-helper">
                                            Plus la variété est élevée, plus les routines seront différentes chaque jour
                                        </span>
                                    </div>

                                    <!-- Environnement -->
                                    <div class="module-form-group">
                                        <label class="module-form-label">
                                            <i class="fas fa-map-marker-alt"></i> Environnement
                                        </label>
                                        <select id="morningCoachEnvironment"
                                                class="module-form-select"
                                                onchange="MorningCoachPage.updateConfig()">
                                            <option value="bedroom" ${config.environment === 'bedroom' ? 'selected' : ''}>
                                                Au lit / Chambre
                                            </option>
                                            <option value="anywhere" ${config.environment === 'anywhere' ? 'selected' : ''}>
                                                N'importe où
                                            </option>
                                            <option value="outdoor" ${config.environment === 'outdoor' ? 'selected' : ''}>
                                                Extérieur (si possible)
                                            </option>
                                        </select>
                                    </div>

                                    <!-- Options d'inclusion -->
                                    <div class="module-form-group">
                                        <label class="module-form-label mb-3">
                                            <i class="fas fa-list-check"></i> Éléments à inclure
                                        </label>
                                        <div class="space-y-2">
                                            <div class="module-checkbox-group">
                                                <input type="checkbox"
                                                       id="includeBreathing"
                                                       class="module-checkbox-input"
                                                       ${config.includeBreathing !== false ? 'checked' : ''}
                                                       onchange="MorningCoachPage.updateConfig()">
                                                <label for="includeBreathing" class="module-checkbox-label">
                                                    Exercices de respiration
                                                </label>
                                            </div>
                                            <div class="module-checkbox-group">
                                                <input type="checkbox"
                                                       id="includeMobility"
                                                       class="module-checkbox-input"
                                                       ${config.includeMobility !== false ? 'checked' : ''}
                                                       onchange="MorningCoachPage.updateConfig()">
                                                <label for="includeMobility" class="module-checkbox-label">
                                                    Mobilité articulaire
                                                </label>
                                            </div>
                                            <div class="module-checkbox-group">
                                                <input type="checkbox"
                                                       id="includeActivation"
                                                       class="module-checkbox-input"
                                                       ${config.includeActivation !== false ? 'checked' : ''}
                                                       onchange="MorningCoachPage.updateConfig()">
                                                <label for="includeActivation" class="module-checkbox-label">
                                                    Activation musculaire
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <!-- Statut clé API -->
                            <div class="module-card">
                                <h3 class="module-card-title">
                                    <i class="fas fa-key"></i>
                                    Clé API DeepSeek
                                </h3>
                                <div class="module-card-content">
                                    ${this.renderAPIKeyStatus()}
                                </div>
                            </div>

                            <!-- Actions rapides -->
                            <div class="module-card">
                                <h3 class="module-card-title">
                                    <i class="fas fa-bolt"></i>
                                    Actions rapides
                                </h3>
                                <div class="module-card-content">
                                    <div class="module-btn-group">
                                        <button onclick="MorningCoachPage.testSend()"
                                                class="module-btn module-btn-primary module-btn-lg w-full">
                                            <i class="fas fa-paper-plane"></i>
                                            Envoyer test maintenant
                                        </button>
                                        <button onclick="MorningCoachPage.previewMessage()"
                                                class="module-btn module-btn-secondary w-full">
                                            <i class="fas fa-eye"></i>
                                            Prévisualiser le message
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <!-- COLONNE DROITE: Historique et Preview -->
                        <div class="module-col-right">

                            <!-- Statut actuel -->
                            <div class="module-card">
                                <h3 class="module-card-title">
                                    <i class="fas fa-info-circle"></i>
                                    Statut actuel
                                </h3>
                                <div class="module-card-content">
                                    <div id="morningCoachStatus" class="space-y-3">
                                        ${this.renderStatus(config)}
                                    </div>
                                </div>
                            </div>

                            <!-- Prévisualisation -->
                            <div class="module-card">
                                <h3 class="module-card-title">
                                    <i class="fas fa-eye"></i>
                                    Prévisualisation
                                </h3>
                                <div class="module-card-content">
                                    <div id="morningCoachPreview" class="text-center py-8">
                                        <i class="fas fa-comment-dots text-6xl opacity-30 mb-4"></i>
                                        <p class="text-secondary">
                                            Cliquez sur "Prévisualiser le message" pour voir le rendu
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <!-- Historique des envois -->
                            <div class="module-card">
                                <h3 class="module-card-title">
                                    <i class="fas fa-history"></i>
                                    Historique récent
                                </h3>
                                <div class="module-card-content">
                                    <div id="morningCoachHistory">
                                        ${this.renderHistory()}
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
     * Render status section
     * @param config
     */
    renderStatus(config) {
        const statusItems = [
            {
                icon: config.enabled ? 'fa-check-circle' : 'fa-pause-circle',
                label: 'Système',
                value: config.enabled ? 'Activé' : 'Désactivé',
                color: config.enabled ? 'success' : 'muted'
            },
            {
                icon: 'fa-clock',
                label: "Heure d'envoi",
                value: config.sendTime || '07:00',
                color: 'info'
            },
            {
                icon: 'fa-discord',
                label: 'Webhook',
                value: config.webhookUrl ? 'Configuré' : 'Non configuré',
                color: config.webhookUrl ? 'success' : 'error'
            },
            {
                icon: 'fa-robot',
                label: 'Warm-up IA',
                value: config.includeWarmup ? 'Activé' : 'Désactivé',
                color: config.includeWarmup ? 'success' : 'muted'
            }
        ];

        return statusItems
            .map(
                item => `
            <div class="flex items-center justify-between p-3 rounded-lg" style="background: var(--surface-2);">
                <div class="flex items-center gap-3">
                    <i class="fas ${item.icon} text-${item.color}"></i>
                    <span class="text-secondary">${item.label}</span>
                </div>
                <span class="font-semibold text-${item.color}">${item.value}</span>
            </div>
        `
            )
            .join('');
    },

    /**
     * 🆕 Render API key status
     */
    renderAPIKeyStatus() {
        // Vérifier si la clé DeepSeek est disponible
        const deepseekKey = ENV.get('deepseekKey');
        const hasKey = !!deepseekKey;

        if (hasKey) {
            // Masquer la clé (afficher seulement les 8 premiers caractères)
            const maskedKey =
                deepseekKey.substring(0, 8) + '...' + deepseekKey.substring(deepseekKey.length - 4);

            return `
                <div class="module-alert module-alert-success">
                    <i class="fas fa-check-circle module-alert-icon"></i>
                    <div class="module-alert-content">
                        <div class="module-alert-title">Clé API configurée</div>
                        <div class="module-alert-message">
                            Clé détectée : <code>${maskedKey}</code>
                            <br>
                            <small class="text-xs opacity-75">Chargée automatiquement depuis ENV</small>
                        </div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="module-alert module-alert-warning">
                    <i class="fas fa-exclamation-triangle module-alert-icon"></i>
                    <div class="module-alert-content">
                        <div class="module-alert-title">Clé API manquante</div>
                        <div class="module-alert-message">
                            Les routines seront générées en mode générique (pré-définies).
                            <br><br>
                            <strong>Pour activer l'IA :</strong>
                            <br>
                            Menu → <strong>Configuration</strong> → Intelligence Artificielle → <strong>DeepSeek API Key</strong>
                            <br>
                            <small class="text-xs opacity-75 mt-2 block">
                                Obtenir une clé sur : <a href="https://platform.deepseek.com/" target="_blank" class="text-blue-400 hover:underline">platform.deepseek.com</a>
                            </small>
                        </div>
                    </div>
                </div>
            `;
        }
    },

    /**
     * Render history
     */
    renderHistory() {
        const history = JSON.parse(localStorage.getItem('morningCoachHistory') || '[]');

        if (history.length === 0) {
            return `
                <div class="module-empty-state">
                    <i class="fas fa-inbox module-empty-icon"></i>
                    <p class="module-empty-text">Aucun envoi enregistré</p>
                </div>
            `;
        }

        return `
            <div class="module-list">
                ${history
                    .slice(0, 10)
                    .map(
                        entry => `
                    <div class="module-list-item">
                        <div class="module-list-item-content">
                            <div class="module-list-item-icon">
                                <i class="fas fa-paper-plane"></i>
                            </div>
                            <div class="module-list-item-text">
                                <div class="module-list-item-title">${entry.date}</div>
                                <div class="module-list-item-subtitle">
                                    ${entry.sessionTitle || 'Séance du jour'} - ${entry.status}
                                </div>
                            </div>
                        </div>
                        <span class="module-badge ${entry.success ? 'module-badge-success' : 'module-badge-error'}">
                            <i class="fas ${entry.success ? 'fa-check' : 'fa-times'}"></i>
                        </span>
                    </div>
                `
                    )
                    .join('')}
            </div>
        `;
    },

    /**
     * 🆕 Mettre à jour la configuration (VERSION REFONTE)
     */
    updateConfig() {
        const config = {
            // Système
            enabled: document.getElementById('morningCoachEnabled')?.checked || false,
            webhookUrl: document.getElementById('morningCoachWebhook')?.value?.trim() || '',

            // Planning
            sendTime: document.getElementById('morningCoachTime')?.value || '07:00',
            warmupDuration: parseInt(document.getElementById('morningCoachDuration')?.value) || 7,

            // IA
            includeWarmup: true,
            useAI: true,
            aiProvider: 'deepseek',

            // 🆕 Personnalisation
            difficultyLevel: document.getElementById('morningCoachDifficulty')?.value || 'moderate',
            routineVariety: document.getElementById('morningCoachVariety')?.value || 'high',
            environment: document.getElementById('morningCoachEnvironment')?.value || 'bedroom',

            // 🆕 Options d'inclusion
            includeBreathing: document.getElementById('includeBreathing')?.checked !== false,
            includeMobility: document.getElementById('includeMobility')?.checked !== false,
            includeActivation: document.getElementById('includeActivation')?.checked !== false
        };

        // Sauvegarder
        DiscordMorningCoach.config = config;
        DiscordMorningCoach.saveConfig();

        // Redémarrer le système si activé
        if (config.enabled && config.webhookUrl) {
            DiscordMorningCoach.startDailyCheck();
            Utils.showNotification('Configuration sauvegardée et système redémarré', 'success');
        } else {
            DiscordMorningCoach.stopDailyCheck();
            Utils.showNotification('Configuration sauvegardée', 'success');
        }

        // Rafraîchir l'affichage (sans recharger toute la page)
        setTimeout(() => this.showView(), 300);
    },

    /**
     * Tester l'envoi immédiat
     */
    async testSend() {
        try {
            const btn = event.target.closest('button');
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi...';
            }

            // 🔒 Utiliser la méthode testSend() qui a la protection anti-double envoi
            await DiscordMorningCoach.testSend();

            // Rafraîchir
            setTimeout(() => this.showView(), 500);
        } catch (error) {
            console.error('Erreur test envoi:', error);
            Utils.showNotification('Erreur: ' + error.message, 'error');

            if (event.target.closest('button')) {
                event.target.closest('button').disabled = false;
                event.target.closest('button').innerHTML =
                    '<i class="fas fa-paper-plane"></i> Envoyer test maintenant';
            }
        }
    },

    /**
     * 🆕 Calculer le prochain envoi
     * @param sendTime
     */
    calculateNextSendTime(sendTime) {
        const now = new Date();
        const [hours, minutes] = sendTime.split(':').map(Number);

        const nextSend = new Date();
        nextSend.setHours(hours, minutes, 0, 0);

        // Si l'heure est déjà passée aujourd'hui, c'est pour demain
        if (nextSend <= now) {
            nextSend.setDate(nextSend.getDate() + 1);
        }

        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };

        return nextSend.toLocaleDateString('fr-FR', options);
    },

    /**
     * Prévisualiser le message
     */
    async previewMessage() {
        const previewDiv = document.getElementById('morningCoachPreview');
        if (!previewDiv) {
            return;
        }

        try {
            previewDiv.innerHTML =
                '<div class="module-loading"><div class="module-spinner"></div></div>';

            // Récupérer la séance du jour
            const session = await DiscordMorningCoach.getTodaySession();

            if (!session) {
                previewDiv.innerHTML = `
                    <div class="module-alert module-alert-warning">
                        <i class="fas fa-exclamation-triangle module-alert-icon"></i>
                        <div class="module-alert-content">
                            <div class="module-alert-title">Aucune séance aujourd'hui</div>
                            <div class="module-alert-message">Pas de séance programmée pour le jour actuel</div>
                        </div>
                    </div>
                `;
                return;
            }

            // Afficher preview
            previewDiv.innerHTML = `
                <div class="text-left space-y-4" style="background: var(--surface-2); padding: 1.5rem; border-radius: var(--radius-lg);">
                    <h4 class="font-bold text-lg flex items-center gap-2">
                        <i class="fas fa-sun text-yellow-400"></i>
                        ${session.title}
                    </h4>
                    <div class="text-sm text-secondary space-y-2">
                        <p><strong>Catégorie:</strong> ${session.category || 'Non définie'}</p>
                        <p><strong>Blocs:</strong> ${session.blocks?.length || 0} exercices</p>
                    </div>
                    ${
                        DiscordMorningCoach.config.includeWarmup
                            ? `
                        <div class="module-alert module-alert-info">
                            <i class="fas fa-robot module-alert-icon"></i>
                            <div class="module-alert-content">
                                <div class="module-alert-title">Warm-up IA inclus</div>
                                <div class="module-alert-message">
                                    Mini-séance de réveil de ${DiscordMorningCoach.config.warmupDuration}min générée
                                </div>
                            </div>
                        </div>
                    `
                            : ''
                    }
                </div>
            `;
        } catch (error) {
            console.error('Erreur preview:', error);
            previewDiv.innerHTML = `
                <div class="module-alert module-alert-error">
                    <i class="fas fa-times-circle module-alert-icon"></i>
                    <div class="module-alert-content">
                        <div class="module-alert-title">Erreur</div>
                        <div class="module-alert-message">${error.message}</div>
                    </div>
                </div>
            `;
        }
    }
};

// Exposer globalement
window.MorningCoachPage = MorningCoachPage;
window.MorningCoach = MorningCoachPage; // Alias pour compatibilité
