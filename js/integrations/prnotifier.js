// Gestionnaire des notifications PR (Personal Records)
const PRNotifier = {
    config: {
        webhookUrl: '',
        sendTime: '21:00',
        enabled: false,
        daysToCheck: 7 // Nombre de jours à vérifier pour les PR
    },

    // Initialiser
    init() {
        const saved = localStorage.getItem('prNotifierConfig');
        if (saved) {
            this.config = { ...this.config, ...JSON.parse(saved) };
        }

        // Démarrer l'envoi auto si activé
        if (this.config.enabled && this.config.webhookUrl) {
            this.setupDailyCheck();
            console.log('🏆 PR Notifier activé pour', this.config.sendTime);
        }
    },

    // Sauvegarder config
    saveConfig() {
        localStorage.setItem('prNotifierConfig', JSON.stringify(this.config));
    },

    // Configurer la vérification quotidienne
    setupDailyCheck() {
        setInterval(() => {
            this.checkAndSendDaily();
        }, 60000); // Vérifier chaque minute
    },

    // Vérifier et envoyer si c'est l'heure
    async checkAndSendDaily() {
        if (!this.config.enabled) {
            return;
        }

        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const lastSent = localStorage.getItem('lastPRSent');
        const today = now.toDateString();

        if (currentTime === this.config.sendTime && lastSent !== today) {
            console.log('🏆 Envoi du bilan PR !');

            try {
                await this.sendPRReport();
                localStorage.setItem('lastPRSent', today);
            } catch (error) {
                console.error('❌ Erreur envoi PR:', error);
            }
        }
    },

    // Collecter les PR de la période
    async collectPRs(days = null) {
        const daysToCheck = days || this.config.daysToCheck;
        const prs = [];
        const today = new Date();
        const startDate = new Date(today.getTime() - daysToCheck * 24 * 60 * 60 * 1000);

        // Récupérer tous les membres et toutes les performances depuis Supabase
        const members = await SupabaseManager.getMembers();
        const allPerformances = await SupabaseManager.getPerformances();

        members.forEach(member => {
            const memberName =
                member.firstName && member.lastName
                    ? `${member.firstName} ${member.lastName}`
                    : member.firstName || member.lastName || 'Inconnu';

            // Filtrer les performances pour ce membre
            const memberPerfs = allPerformances.filter(p => p.member_id === member.id);

            memberPerfs.forEach(perf => {
                const perfDate = new Date(perf.date);
                if (perfDate >= startDate && perfDate <= today && perf.is_pr) {
                    prs.push({
                        member: memberName,
                        memberId: member.id,
                        exercise: perf.exercise_type,
                        value: perf.value,
                        oneRM: perf.one_rm,
                        date: perfDate,
                        unit: perf.unit
                    });
                }
            });
        });

        return prs.sort((a, b) => b.date - a.date);
    },

    // Construire le message Discord
    buildDiscordMessage(prs, days) {
        if (prs.length === 0) {
            return {
                embeds: [
                    {
                        title: `📊 Bilan PR - ${days} derniers jours`,
                        description: 'Aucun nouveau PR sur cette période',
                        color: 0x808080,
                        footer: {
                            text: 'Skäli Prog • Continuez à vous entraîner dur ! 💪'
                        }
                    }
                ]
            };
        }

        // Grouper par membre
        const prsByMember = {};
        prs.forEach(pr => {
            if (!prsByMember[pr.member]) {
                prsByMember[pr.member] = [];
            }
            prsByMember[pr.member].push(pr);
        });

        /*      // Top 3 des membres avec le plus de PR
        const topMembers = Object.entries(prsByMember)
            .sort((a, b) => b[1].length - a[1].length)
            .slice(0, 3);
            */

        // Créer les fields
        const fields = [];

        // Stats globales
        fields.push({
            name: '📈 Statistiques',
            value: `**${prs.length}** PR totaux\n**${Object.keys(prsByMember).length}** athlètes\n**${days}** jours analysés`,
            inline: true
        });

        /*  // Top 3
        if (topMembers.length > 0) {
            const medals = ['🥇', '🥈', '🥉'];
            fields.push({
                name: "🏆 Podium PR",
                value: topMembers.map(([member, memberPRs], idx) =>
                    `${medals[idx]} ${member} (${memberPRs.length} PR)`
                ).join('\n'),
                inline: true
            });
        }
        */

        // Détail par membre
        const sortedMembers = Object.entries(prsByMember).sort((a, b) => a[0].localeCompare(b[0])); // Tri alphabétique

        sortedMembers.forEach(([member, memberPRs]) => {
            const prList = memberPRs
                .slice(0, 5)
                .map(pr => {
                    const dateStr = pr.date.toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit'
                    });
                    if (pr.oneRM) {
                        return `• **${pr.exercise}**: ${pr.value} → ${pr.oneRM}kg 1RM (${dateStr})`;
                    }
                    return `• **${pr.exercise}**: ${pr.value} (${dateStr})`;
                })
                .join('\n');

            fields.push({
                name: `💪 ${member} (${memberPRs.length} PR)`,
                value: prList || 'Aucun détail',
                inline: false
            });
        });

        return {
            content:
                days === 7
                    ? '🎯 **BILAN HEBDOMADAIRE DES PR** 🎯'
                    : `📊 **BILAN PR - ${days} JOURS**`,
            embeds: [
                {
                    title: `🔥 ${prs.length} Records Personnels battus !`,
                    color: 0xffd700,
                    fields: fields.slice(0, 25), // Discord limite à 25 fields
                    footer: {
                        text: `Skäli Prog • ${new Date().toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long'
                        })}`
                    },
                    timestamp: new Date().toISOString()
                }
            ]
        };
    },

    // Envoyer le rapport
    async sendPRReport(manualDays = null) {
        if (!this.config.webhookUrl) {
            throw new Error('Webhook non configuré');
        }

        const days = manualDays || this.config.daysToCheck;
        const prs = this.collectPRs(days);
        const message = this.buildDiscordMessage(prs, days);

        const response = await fetch(this.config.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message)
        });

        if (!response.ok) {
            throw new Error(`Erreur Discord: ${response.status}`);
        }

        return prs.length;
    },

    // Ouvrir la modal de configuration
    openConfigModal() {
        const html = `
            <div class="fixed inset-0 modal-backdrop flex items-center justify-center z-50" onclick="Utils.closeModal(event)">
                <div class="premium-card max-w-2xl w-full mx-4" onclick="event.stopPropagation()">
                    <h3 class="text-2xl font-bold text-yellow-400 mb-6">
                        <i class="fas fa-trophy mr-3"></i>Notifications PR
                    </h3>
                    
                    <!-- Configuration -->
                    <div class="bg-wood-dark bg-opacity-50 rounded-lg p-4 mb-6">
                        <h4 class="font-semibold text-yellow-400 mb-4">⚙️ Configuration</h4>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium mb-2">Webhook Discord (canal PR)</label>
                                <input type="text" id="prWebhook" 
                                       value="${this.config.webhookUrl}"
                                       placeholder="https://discord.com/api/webhooks/..." 
                                       class="w-full rounded-lg p-3">
                                <small class="text-gray-400">Canal dédié aux records personnels</small>
                            </div>
                            
                            <div class="grid grid-cols-3 gap-4">
                                <div>
                                    <label class="block text-sm font-medium mb-2">Heure d'envoi</label>
                                    <input type="time" id="prSendTime" 
                                           value="${this.config.sendTime}"
                                           class="w-full rounded-lg p-3">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-2">Période (jours)</label>
                                    <select id="prDays" class="w-full rounded-lg p-3">
                                        <option value="1" ${this.config.daysToCheck === 1 ? 'selected' : ''}>Quotidien</option>
                                        <option value="7" ${this.config.daysToCheck === 7 ? 'selected' : ''}>Hebdomadaire</option>
                                        <option value="30" ${this.config.daysToCheck === 30 ? 'selected' : ''}>Mensuel</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-2">Activer</label>
                                    <label class="relative inline-flex items-center cursor-pointer mt-1">
                                        <input type="checkbox" id="prAutoSend" class="sr-only peer" 
                                               ${this.config.enabled ? 'checked' : ''}>
                                        <div class="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <button onclick="PRNotifier.saveSettings()" class="btn-premium btn-save-local mt-4">
                            <i class="fas fa-save mr-2"></i>Sauvegarder
                        </button>
                    </div>
                    
                    <!-- Aperçu des PR actuels -->
                    <div class="bg-wood-dark bg-opacity-50 rounded-lg p-4 mb-6">
                        <h4 class="font-semibold text-yellow-400 mb-4">🏆 PR récents</h4>
                        <div id="prPreview" class="max-h-64 overflow-y-auto">
                            ${this.generatePreview()}
                        </div>
                    </div>
                    
                    <!-- Actions -->
                    <div class="flex space-x-3">
                        <button onclick="PRNotifier.testSend(1)" class="flex-1 btn-premium btn-sync">
                            <i class="fas fa-calendar-day mr-2"></i>Test 24h
                        </button>
                        <button onclick="PRNotifier.testSend(7)" class="flex-1 btn-premium btn-sync">
                            <i class="fas fa-calendar-week mr-2"></i>Test 7j
                        </button>
                        <button onclick="PRNotifier.testSend(30)" class="flex-1 btn-premium btn-publish">
                            <i class="fas fa-calendar-alt mr-2"></i>Test 30j
                        </button>
                    </div>
                    
                    <button onclick="Utils.closeModal()" class="btn-premium btn-save-local w-full mt-4">
                        Fermer
                    </button>
                </div>
            </div>
        `;
        document.getElementById('modalContainer').innerHTML = html;
    },

    // Générer l'aperçu
    generatePreview() {
        const prs = this.collectPRs(7);

        if (prs.length === 0) {
            return '<p class="text-center text-gray-400">Aucun PR cette semaine</p>';
        }

        return (
            prs
                .slice(0, 5)
                .map(
                    pr => `
            <div class="flex justify-between items-center p-2 bg-gray-700 bg-opacity-50 rounded mb-2">
                <div>
                    <strong class="text-yellow-400">${pr.member}</strong>
                    <span class="text-sm ml-2">${pr.exercise}</span>
                </div>
                <div class="text-right">
                    <span class="font-bold">${pr.value}</span>
                    ${pr.oneRM ? `<span class="text-xs text-gray-400 ml-1">(${pr.oneRM}kg 1RM)</span>` : ''}
                </div>
            </div>
        `
                )
                .join('') +
            (prs.length > 5
                ? '<p class="text-center text-gray-400 mt-2">... et ' +
                  (prs.length - 5) +
                  ' autres PR</p>'
                : '')
        );
    },

    // Sauvegarder les paramètres
    saveSettings() {
        this.config.webhookUrl = document.getElementById('prWebhook').value;
        this.config.sendTime = document.getElementById('prSendTime').value;
        this.config.daysToCheck = parseInt(document.getElementById('prDays').value);
        this.config.enabled = document.getElementById('prAutoSend').checked;

        this.saveConfig();

        if (this.config.enabled) {
            this.setupDailyCheck();
        }

        Utils.showNotification('✅ Configuration PR sauvegardée', 'success');
    },

    // Envoyer un test
    async testSend(days) {
        try {
            const count = await this.sendPRReport(days);
            Utils.showNotification(`✅ ${count} PR envoyés sur Discord`, 'success');
        } catch (error) {
            Utils.showNotification('❌ Erreur: ' + error.message, 'error');
        }
    }
};

// Export
window.PRNotifier = PRNotifier;
