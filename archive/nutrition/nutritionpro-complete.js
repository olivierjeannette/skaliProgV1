/**
 * NUTRITION PRO - Complete Integration
 * Connexion finale : IA + PDF + Discord
 */

// Extension de NutritionPro avec les fonctions complètes
Object.assign(NutritionPro, {
    /**
     * Générer les repas et créer le PDF
     * @param mealPlan
     * @param macros
     * @param planData
     * @param days
     */
    async generatePDF(mealPlan, macros, planData, days) {
        try {
            // Afficher un loader
            this.showPDFGenerationLoader();

            // Délai important pour s'assurer que le modal est bien affiché et rendu
            await new Promise(resolve => setTimeout(resolve, 300));

            // Callback de progression
            const onProgress = async (percent, message, stepId) => {
                this.updateProgress(percent, message, stepId);
                // Forcer le navigateur à rafraîchir l'affichage
                await new Promise(resolve => setTimeout(resolve, 0));
            };

            // Générer le PDF avec callback de progression
            const pdf = await NutritionPDF.generatePDF(
                mealPlan,
                macros,
                planData,
                this.currentMember,
                days,
                onProgress
            );

            // Compléter la progression à 100%
            this.updateProgress(100, 'PDF généré avec succès !', null);

            // Petit délai pour voir la progression à 100%
            await new Promise(resolve => setTimeout(resolve, 800));

            // Fermer le loader
            Utils.closeModal();

            // Proposer téléchargement + envoi Discord
            this.showPDFActions(pdf, mealPlan, macros, planData, days);

        } catch (error) {
            console.error('Erreur génération PDF:', error);
            Utils.closeModal();
            Utils.showNotification('Erreur', error.message, 'error');
        }
    },

    /**
     * Afficher le loader de génération
     */
    showPDFGenerationLoader() {
        const html = `
            <div class="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
                <div class="premium-card max-w-lg w-full mx-4">
                    <!-- Icône animée -->
                    <div class="text-center mb-6">
                        <div class="relative inline-block">
                            <div class="absolute inset-0 bg-green-400 opacity-20 rounded-full blur-xl animate-pulse"></div>
                            <i class="fas fa-file-pdf text-7xl text-green-400 relative animate-bounce"></i>
                        </div>
                    </div>

                    <!-- Titre -->
                    <h3 class="text-2xl font-bold text-white text-center mb-2">
                        Génération du PDF Nutrition
                    </h3>
                    <p class="text-secondary text-center mb-6" id="progressMessage">
                        Initialisation...
                    </p>

                    <!-- Barre de progression moderne -->
                    <div class="relative mb-4">
                        <!-- Fond de la barre -->
                        <div class="w-full h-4 glass-card rounded-full overflow-hidden shadow-inner">
                            <!-- Barre de progression avec gradient -->
                            <div id="progressBar"
                                 class="h-full bg-gradient-to-r from-green-500 via-green-400 to-emerald-400 rounded-full transition-all duration-300 ease-out relative overflow-hidden w-0">
                                <!-- Animation de brillance -->
                                <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
                            </div>
                        </div>

                        <!-- Pourcentage -->
                        <div class="flex justify-between items-center mt-2">
                            <span class="text-xs text-secondary">0%</span>
                            <span id="progressPercent" class="text-lg font-bold text-green-400">0%</span>
                            <span class="text-xs text-secondary">100%</span>
                        </div>
                    </div>

                    <!-- Étapes de progression -->
                    <div class="bg-gray-800 bg-opacity-50 rounded-lg p-4 space-y-2">
                        <div id="step1" class="flex items-center text-sm text-secondary">
                            <i class="fas fa-circle text-xs mr-3"></i>
                            <span>Préparation des données</span>
                        </div>
                        <div id="step2" class="flex items-center text-sm text-secondary">
                            <i class="fas fa-circle text-xs mr-3"></i>
                            <span>Création de la page de couverture</span>
                        </div>
                        <div id="step3" class="flex items-center text-sm text-secondary">
                            <i class="fas fa-circle text-xs mr-3"></i>
                            <span>Génération des repas</span>
                        </div>
                        <div id="step4" class="flex items-center text-sm text-secondary">
                            <i class="fas fa-circle text-xs mr-3"></i>
                            <span>Ajout de la liste de courses</span>
                        </div>
                        <div id="step5" class="flex items-center text-sm text-secondary">
                            <i class="fas fa-circle text-xs mr-3"></i>
                            <span>Finalisation du document</span>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
            </style>
        `;

        document.getElementById('modalContainer').innerHTML = html;
    },

    /**
     * Mettre à jour la progression en temps réel
     * @param percent
     * @param message
     * @param stepId
     */
    updateProgress(percent, message, stepId) {
        const progressBar = document.getElementById('progressBar');
        const progressPercent = document.getElementById('progressPercent');
        const progressMessage = document.getElementById('progressMessage');

        if (progressBar && progressPercent && progressMessage) {
            progressBar.style.width = percent + '%';
            progressPercent.textContent = percent + '%';
            progressMessage.textContent = message;

            // Marquer l'étape comme complétée
            if (stepId) {
                const stepElement = document.getElementById(stepId);
                if (stepElement) {
                    stepElement.classList.remove('text-secondary');
                    stepElement.classList.add('text-green-400');
                    const icon = stepElement.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-circle');
                        icon.classList.add('fa-check-circle');
                    }
                }
            }

            // Si 100%, marquer toutes les étapes comme complétées
            if (percent >= 100) {
                ['step1', 'step2', 'step3', 'step4', 'step5'].forEach(id => {
                    const stepElement = document.getElementById(id);
                    if (stepElement) {
                        stepElement.classList.remove('text-secondary');
                        stepElement.classList.add('text-green-400');
                        const icon = stepElement.querySelector('i');
                        if (icon) {
                            icon.classList.remove('fa-circle');
                            icon.classList.add('fa-check-circle');
                        }
                    }
                });
            }
        }
    },

    /**
     * Afficher les actions possibles avec le PDF
     * @param pdf
     * @param mealPlan
     * @param macros
     * @param planData
     * @param days
     */
    showPDFActions(pdf, mealPlan, macros, planData, days) {
        const filename = `Plan_Nutrition_${this.currentMember.name.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

        const html = `
            <div class="fixed inset-0 modal-backdrop flex items-center justify-center z-50 fade-in-premium" onclick="Utils.closeModal(event)">
                <div class="premium-card max-w-2xl w-full mx-4" onclick="event.stopPropagation()">
                    <div class="text-center mb-6">
                        <i class="fas fa-check-circle text-6xl text-green-400 mb-4"></i>
                        <h3 class="text-3xl font-bold text-white mb-2">PDF Généré !</h3>
                        <p class="text-secondary">
                            Plan nutritionnel de ${days} jour(s) pour ${this.currentMember.name}
                        </p>
                    </div>

                    <div class="bg-wood-dark bg-opacity-50 rounded-lg p-6 mb-6 border border-wood-accent border-opacity-30">
                        <h4 class="font-bold text-white mb-3">Résumé du plan</h4>
                        <div class="grid grid-cols-2 gap-4 text-sm text-secondary">
                            <div>
                                <strong class="text-green-400">Objectif:</strong><br>
                                ${NutritionPro.OBJECTIVES[planData.objective].name}
                            </div>
                            <div>
                                <strong class="text-green-400">Durée:</strong><br>
                                ${planData.duration} semaines (${days} jours)
                            </div>
                            <div>
                                <strong class="text-green-400">Calories/jour:</strong><br>
                                ${macros.targetCalories} kcal
                            </div>
                            <div>
                                <strong class="text-green-400">Repas total:</strong><br>
                                ${mealPlan.days.reduce((sum, d) => sum + d.meals.length, 0)} repas
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <button onclick="NutritionPro.downloadPDF(${JSON.stringify({ filename }).replace(/"/g, '&quot;')})"
                                class="btn-premium btn-save-local">
                            <i class="fas fa-download mr-2"></i>
                            Télécharger le PDF
                        </button>

                        <button onclick="NutritionPro.showDiscordSelector(${JSON.stringify({ filename }).replace(/"/g, '&quot;')})"
                                class="btn-premium btn-publish">
                            <i class="fab fa-discord mr-2"></i>
                            Envoyer sur Discord
                        </button>
                    </div>

                    <button onclick="Utils.closeModal(); NutritionPro.showMainView()" class="w-full btn-premium glass-card hover:bg-gray-600">
                        <i class="fas fa-times mr-2"></i>
                        Fermer
                    </button>
                </div>
            </div>
        `;

        // Stocker le PDF en mémoire temporairement
        this._currentPDF = pdf;
        this._currentFilename = filename;

        document.getElementById('modalContainer').innerHTML = html;
    },

    /**
     * Télécharger le PDF
     * @param root0
     * @param root0.filename
     */
    async downloadPDF({ filename }) {
        if (!this._currentPDF) {
            Utils.showNotification('Erreur', 'PDF non disponible', 'error');
            return;
        }

        try {
            await NutritionPDF.save(this._currentPDF, filename || this._currentFilename);
            Utils.showNotification('Téléchargement', 'PDF téléchargé avec succès', 'success');
        } catch (error) {
            console.error('Erreur téléchargement:', error);
            Utils.showNotification('Erreur', error.message, 'error');
        }
    },

    /**
     * Afficher le sélecteur de destinataire Discord
     * @param root0
     * @param root0.filename
     */
    async showDiscordSelector({ filename }) {
        const discordMembers = DiscordNutrition.getConfiguredMembers();

        if (discordMembers.length === 0) {
            Utils.showNotification(
                'Configuration requise',
                'Configurez d\'abord vos membres Discord dans Config Discord',
                'warning'
            );
            return;
        }

        const html = `
            <div class="fixed inset-0 modal-backdrop flex items-center justify-center z-50 fade-in-premium" onclick="Utils.closeModal(event)">
                <div class="premium-card max-w-2xl w-full mx-4" onclick="event.stopPropagation()">
                    <h3 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <i class="fab fa-discord text-purple-400"></i>
                        Envoyer le PDF sur Discord
                    </h3>

                    <div class="mb-4">
                        <input type="text"
                               id="discordMemberSearch"
                               placeholder="Rechercher un membre..."
                               oninput="NutritionPro.filterDiscordMembers()"
                               class="w-full bg-skali-darker border border-wood-accent border-opacity-20 rounded-lg px-4 py-3 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition">
                    </div>

                    <div class="mb-6 max-h-96 overflow-y-auto space-y-2" id="discordMembersList">
                        ${discordMembers.map((m, i) => `
                            <label class="discord-member-item flex items-center gap-3 p-4 bg-wood-dark bg-opacity-50 rounded-lg border border-wood-accent border-opacity-30 hover:border-opacity-50 cursor-pointer transition"
                                   data-member-name="${m.name.toLowerCase()}">
                                <input type="radio" name="discordRecipient" value="${i}"
                                       ${i === 0 ? 'checked' : ''}
                                       class="w-4 h-4 text-green-400">
                                <div class="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                                    ${m.name.charAt(0).toUpperCase()}
                                </div>
                                <div class="flex-1">
                                    <div class="font-bold text-white">${m.name}</div>
                                    <div class="text-xs text-secondary">ID: ${m.id}</div>
                                </div>
                            </label>
                        `).join('')}
                    </div>

                    <div class="flex gap-3">
                        <button onclick="Utils.closeModal(); NutritionPro.showPDFActions(NutritionPro._currentPDF)"
                                class="flex-1 btn-premium glass-card hover:bg-gray-600">
                            <i class="fas fa-arrow-left mr-2"></i>
                            Retour
                        </button>
                        <button onclick="NutritionPro.sendToDiscordConfirm('${filename}')"
                                class="flex-1 btn-premium btn-publish">
                            <i class="fas fa-paper-plane mr-2"></i>
                            Envoyer
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('modalContainer').innerHTML = html;
    },

    /**
     * Filtrer les membres Discord
     */
    filterDiscordMembers() {
        const search = document.getElementById('discordMemberSearch')?.value.toLowerCase() || '';
        const items = document.querySelectorAll('.discord-member-item');

        items.forEach(item => {
            const memberName = item.getAttribute('data-member-name') || '';
            if (memberName.includes(search)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    },

    /**
     * Envoyer le PDF sur Discord après sélection
     * @param filename
     */
    async sendToDiscordConfirm(filename) {
        if (!this._currentPDF) {
            Utils.showNotification('Erreur', 'PDF non disponible', 'error');
            return;
        }

        const selectedIndex = document.querySelector('input[name="discordRecipient"]:checked')?.value;
        if (selectedIndex === undefined) {
            Utils.showNotification('Erreur', 'Sélectionnez un destinataire', 'error');
            return;
        }

        const recipient = DiscordNutrition.getConfiguredMembers()[selectedIndex];

        try {
            Utils.showNotification('Envoi...', 'Envoi du PDF sur Discord...', 'info');

            // Obtenir le blob du PDF
            const pdfBlob = await NutritionPDF.getBlob(this._currentPDF);

            // Envoyer via Discord
            await DiscordNutrition.sendPDF(
                this.currentMember,
                pdfBlob,
                filename || this._currentFilename,
                recipient
            );

            Utils.closeModal();
            Utils.showNotification(
                'Envoyé !',
                `PDF envoyé à ${recipient.name} sur Discord`,
                'success'
            );

        } catch (error) {
            console.error('Erreur envoi Discord:', error);
            Utils.showNotification('Erreur', error.message, 'error');
        }
    }
});

/**
 * Discord Nutrition - Envoi des PDFs via Webhook Discord
 */
const DiscordNutrition = {
    config: {
        webhookUrl: '',
        members: []
    },

    /**
     * Charger la configuration
     */
    loadConfig() {
        const saved = localStorage.getItem('discordNutritionConfig');
        if (saved) {
            this.config = { ...this.config, ...JSON.parse(saved) };
        }
    },

    /**
     * Sauvegarder la configuration
     */
    saveConfig() {
        localStorage.setItem('discordNutritionConfig', JSON.stringify(this.config));
    },

    /**
     * Récupérer les membres Discord configurés
     */
    getConfiguredMembers() {
        this.loadConfig();
        return this.config.members || [];
    },

    /**
     * Ouvrir la configuration Discord
     */
    async openMembersConfig() {
        this.loadConfig();

        const html = `
            <div class="fixed inset-0 modal-backdrop flex items-center justify-center z-50 fade-in-premium" onclick="Utils.closeModal(event)">
                <div class="premium-card max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
                    <h3 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <i class="fab fa-discord text-purple-400"></i>
                        Configuration Discord Nutrition
                    </h3>

                    <div class="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                        <div class="flex items-start gap-3">
                            <i class="fas fa-info-circle text-blue-400 text-xl mt-1"></i>
                            <div class="text-sm text-secondary">
                                <p class="font-semibold text-blue-300 mb-2">Configuration simple avec Webhook :</p>
                                <ol class="list-decimal list-inside space-y-1 text-xs">
                                    <li>Sur Discord, créez un salon dédié (ex: #nutrition-pdf)</li>
                                    <li>Paramètres du salon > Intégrations > Webhooks > Nouveau Webhook</li>
                                    <li>Copiez l'URL du webhook et collez-la ci-dessous</li>
                                    <li>Ajoutez les membres avec leur ID Discord (clic droit > Copier l'ID utilisateur)</li>
                                    <li>Les PDFs seront envoyés avec une mention @utilisateur</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    <!-- Webhook URL -->
                    <div class="mb-6">
                        <label class="block text-sm font-semibold text-secondary mb-2">
                            <i class="fas fa-link text-xs mr-1"></i> URL du Webhook Discord
                        </label>
                        <input type="text" id="discordWebhookUrl"
                               value="${this.config.webhookUrl}"
                               class="w-full bg-skali-darker border border-wood-accent border-opacity-20 rounded-lg px-4 py-3 text-sm"
                               placeholder="https://discord.com/api/webhooks/...">
                        <small class="text-xs text-secondary mt-1 block">
                            <i class="fas fa-info-circle mr-1"></i>
                            Un seul webhook suffit pour tout le monde
                        </small>
                    </div>

                    <!-- Liste des membres -->
                    <div class="mb-6">
                        <div class="flex items-center justify-between mb-3">
                            <label class="text-sm font-semibold text-secondary">
                                <i class="fas fa-users text-xs mr-1"></i> Membres Discord
                            </label>
                            <button onclick="DiscordNutrition.addMember()"
                                    class="btn-premium bg-green-600 hover:bg-green-500 text-sm py-2">
                                <i class="fas fa-plus mr-2"></i>
                                Ajouter
                            </button>
                        </div>

                        <div id="discordMembersList" class="space-y-3">
                            ${this.config.members.map((m, i) => `
                                <div class="bg-wood-dark bg-opacity-50 rounded-lg p-4 border border-wood-accent border-opacity-30">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label class="block text-xs font-semibold text-secondary mb-1">Nom</label>
                                            <input type="text" id="memberName${i}" value="${m.name}"
                                                   class="w-full bg-skali-darker border border-wood-accent border-opacity-20 rounded px-3 py-2 text-sm"
                                                   placeholder="Jean Dupont">
                                        </div>
                                        <div>
                                            <label class="block text-xs font-semibold text-secondary mb-1">
                                                ID Discord
                                                <a href="https://support.discord.com/hc/fr/articles/206346498" target="_blank" class="text-blue-400 hover:underline ml-1">
                                                    <i class="fas fa-question-circle"></i>
                                                </a>
                                            </label>
                                            <input type="text" id="memberId${i}" value="${m.id}"
                                                   class="w-full bg-skali-darker border border-wood-accent border-opacity-20 rounded px-3 py-2 text-sm"
                                                   placeholder="123456789012345678">
                                        </div>
                                    </div>
                                    <button onclick="DiscordNutrition.removeMember(${i})"
                                            class="mt-2 text-xs text-red-400 hover:text-red-300">
                                        <i class="fas fa-trash mr-1"></i> Supprimer
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="flex gap-3">
                        <button onclick="Utils.closeModal()"
                                class="flex-1 btn-premium glass-card hover:bg-gray-600">
                            <i class="fas fa-times mr-2"></i>
                            Annuler
                        </button>
                        <button onclick="DiscordNutrition.saveConfigFromModal()"
                                class="flex-1 btn-premium btn-publish">
                            <i class="fas fa-save mr-2"></i>
                            Sauvegarder
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('modalContainer').innerHTML = html;
    },

    /**
     * Ajouter un membre
     */
    addMember() {
        this.loadConfig();
        this.config.members.push({ name: '', id: '' });
        this.saveConfig();
        this.openMembersConfig();
    },

    /**
     * Supprimer un membre
     * @param index
     */
    removeMember(index) {
        this.loadConfig();
        this.config.members.splice(index, 1);
        this.saveConfig();
        this.openMembersConfig();
    },

    /**
     * Sauvegarder la configuration depuis la modal
     */
    saveConfigFromModal() {
        const webhookUrl = document.getElementById('discordWebhookUrl').value.trim();

        if (!webhookUrl) {
            Utils.showNotification('Erreur', 'URL du webhook requise', 'error');
            return;
        }

        this.config.webhookUrl = webhookUrl;

        // Récupérer tous les membres
        const members = [];
        let i = 0;
        while (document.getElementById(`memberName${i}`)) {
            const name = document.getElementById(`memberName${i}`).value.trim();
            const id = document.getElementById(`memberId${i}`).value.trim();

            if (name && id) {
                members.push({ name, id });
            }
            i++;
        }

        this.config.members = members;
        this.saveConfig();

        Utils.closeModal();
        Utils.showNotification(
            'Sauvegardé',
            `Configuration Discord : ${members.length} membre(s)`,
            'success'
        );
    },

    /**
     * Envoyer un PDF via Webhook Discord
     * @param member
     * @param pdfBlob
     * @param filename
     * @param recipient
     */
    async sendPDF(member, pdfBlob, filename, recipient) {
        this.loadConfig();

        if (!this.config.webhookUrl) {
            throw new Error('Webhook Discord non configuré. Allez dans Config Discord.');
        }

        if (!recipient || !recipient.id) {
            throw new Error('Destinataire Discord invalide.');
        }

        try {
            // Créer FormData pour l'upload
            const formData = new FormData();

            formData.append('files[0]', pdfBlob, filename);
            formData.append('payload_json', JSON.stringify({
                content: `🥗 **Plan Nutritionnel Personnalisé**\n\n<@${recipient.id}> Voici le plan nutritionnel pour **${member.name}** généré par Skäli Prog.\n\nBon appétit ! 💪`,
                username: 'Skäli Nutrition Pro',
                avatar_url: 'https://i.imgur.com/4M34hi2.png'
            }));

            // Envoyer via le webhook
            const response = await fetch(this.config.webhookUrl, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Erreur envoi Discord: ${response.status} - ${error}`);
            }

            console.log('✅ PDF envoyé sur Discord avec mention');
            return true;

        } catch (error) {
            console.error('Erreur sendPDF:', error);
            throw error;
        }
    }
};
