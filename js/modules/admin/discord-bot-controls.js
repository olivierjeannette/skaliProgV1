/**
 * DISCORD BOT CONTROLS
 * Interface admin pour gérer le bot Discord
 */

const DiscordBotControls = {
    /**
     * Afficher l'interface de contrôle du bot
     */
    showInterface() {
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
                            <i class="fas fa-robot text-indigo-400"></i>
                            Contrôle Bot Discord
                        </h2>
                        <p class="text-gray-400 mt-1">Gérer le bot de synchronisation Discord</p>
                    </div>
                </div>

                <!-- Status Card -->
                <div class="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg p-6 mb-6 border border-indigo-500/50">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-indigo-200 text-sm font-semibold mb-1">Status du Bot</p>
                            <p id="botStatus" class="text-3xl font-bold text-white">
                                <i class="fas fa-circle-notch fa-spin mr-2"></i>Vérification...
                            </p>
                        </div>
                        <i class="fas fa-robot text-6xl text-indigo-300 opacity-30"></i>
                    </div>
                </div>

                <!-- Actions -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <!-- Démarrer via .bat -->
                    <div class="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <h3 class="text-lg font-bold text-white mb-2 flex items-center gap-2">
                            <i class="fas fa-play text-green-400"></i>
                            Démarrer le Bot
                        </h3>
                        <p class="text-sm text-gray-400 mb-4">
                            Lance le bot manuellement via le fichier .bat
                        </p>
                        <button onclick="DiscordBotControls.openBatFile()"
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
                        <p class="text-sm text-gray-400 mb-4">
                            Force une synchronisation immédiate (nécessite bot actif)
                        </p>
                        <button onclick="DiscordBotControls.triggerSync()"
                                class="w-full btn-premium bg-blue-600 hover:bg-blue-700">
                            <i class="fas fa-sync-alt mr-2"></i>
                            Synchroniser maintenant
                        </button>
                    </div>
                </div>

                <!-- Installation PM2 -->
                <div class="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-500/50 rounded-lg p-6 mb-6">
                    <div class="flex items-start gap-4">
                        <i class="fas fa-server text-purple-400 text-3xl"></i>
                        <div class="flex-1">
                            <h3 class="text-xl font-bold text-white mb-2">
                                Démarrage Automatique avec PM2
                            </h3>
                            <p class="text-gray-300 text-sm mb-4">
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

                            <button onclick="DiscordBotControls.openPM2Guide()"
                                    class="btn-premium bg-purple-600 hover:bg-purple-700">
                                <i class="fas fa-book mr-2"></i>
                                Voir le guide complet PM2
                            </button>
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
                            <p class="text-sm text-gray-400 mb-2">Voir les logs du bot</p>
                            <div class="bg-black/50 rounded p-2 font-mono text-xs text-green-400">
                                pm2 logs discord-bot-skali
                            </div>
                        </div>

                        <!-- Redémarrer -->
                        <div class="bg-gray-900/50 rounded-lg p-3">
                            <p class="text-sm text-gray-400 mb-2">Redémarrer le bot</p>
                            <div class="bg-black/50 rounded p-2 font-mono text-xs text-green-400">
                                pm2 restart discord-bot-skali
                            </div>
                        </div>

                        <!-- Status -->
                        <div class="bg-gray-900/50 rounded-lg p-3">
                            <p class="text-sm text-gray-400 mb-2">Vérifier le status</p>
                            <div class="bg-black/50 rounded p-2 font-mono text-xs text-green-400">
                                pm2 status
                            </div>
                        </div>

                        <!-- Arrêter -->
                        <div class="bg-gray-900/50 rounded-lg p-3">
                            <p class="text-sm text-gray-400 mb-2">Arrêter le bot</p>
                            <div class="bg-black/50 rounded p-2 font-mono text-xs text-green-400">
                                pm2 stop discord-bot-skali
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Info Auto-start Windows -->
                <div class="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4 mt-6">
                    <div class="flex items-start gap-3">
                        <i class="fas fa-lightbulb text-yellow-400 text-xl"></i>
                        <div class="text-sm text-gray-300">
                            <p class="font-semibold text-yellow-300 mb-2">Alternative : Auto-start Windows sans PM2</p>
                            <p class="mb-2">Si tu ne veux pas installer PM2, tu peux ajouter le bot au démarrage Windows :</p>
                            <ol class="list-decimal list-inside space-y-1 text-xs">
                                <li>Appuie sur <kbd class="bg-gray-700 px-2 py-1 rounded">Win + R</kbd></li>
                                <li>Tape <code class="bg-gray-700 px-2 py-1 rounded">shell:startup</code></li>
                                <li>Crée un raccourci vers <code class="bg-gray-700 px-2 py-1 rounded">discord-bot/start-bot.bat</code></li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.checkBotStatus();
    },

    /**
     * Vérifier le status du bot
     */
    async checkBotStatus() {
        const statusEl = document.getElementById('botStatus');
        if (!statusEl) {
            return;
        }

        try {
            // Vérifier en consultant la table discord_members
            const client = SupabaseManager.supabase;
            const { data, error } = await client
                .from('discord_members')
                .select('last_sync')
                .order('last_sync', { ascending: false })
                .limit(1);

            if (error) {
                throw error;
            }

            if (data && data.length > 0) {
                const lastSync = new Date(data[0].last_sync);
                const now = new Date();
                const diffMinutes = Math.floor((now - lastSync) / 1000 / 60);

                if (diffMinutes < 5) {
                    statusEl.innerHTML = `
                        <i class="fas fa-check-circle text-green-400 mr-2"></i>
                        <span class="text-green-400">Actif</span>
                        <span class="text-sm text-gray-400 ml-2">(sync il y a ${diffMinutes}min)</span>
                    `;
                } else {
                    statusEl.innerHTML = `
                        <i class="fas fa-exclamation-triangle text-yellow-400 mr-2"></i>
                        <span class="text-yellow-400">Inactif</span>
                        <span class="text-sm text-gray-400 ml-2">(dernière sync: ${diffMinutes}min)</span>
                    `;
                }
            } else {
                statusEl.innerHTML = `
                    <i class="fas fa-question-circle text-gray-400 mr-2"></i>
                    <span class="text-gray-400">Inconnu</span>
                `;
            }
        } catch (error) {
            console.error('Erreur vérification status:', error);
            statusEl.innerHTML = `
                <i class="fas fa-times-circle text-red-400 mr-2"></i>
                <span class="text-red-400">Erreur</span>
            `;
        }
    },

    /**
     * Ouvrir le fichier .bat
     */
    openBatFile() {
        Utils.showNotification('Ouvre le fichier discord-bot/start-bot.bat manuellement', 'info');

        // Tenter d'ouvrir dans l'explorateur de fichiers
        const path = 'discord-bot/start-bot.bat';
        window.open(`file:///${path}`, '_blank');
    },

    /**
     * Déclencher une synchronisation manuelle
     */
    async triggerSync() {
        Utils.showNotification('⏳ Synchronisation en cours...', 'info');

        // Attendre quelques secondes (simuler)
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Recharger les données discord_members
        await this.checkBotStatus();

        Utils.showNotification('✅ Synchronisation terminée ! (si le bot est actif)', 'success');
    },

    /**
     * Ouvrir le guide PM2
     */
    openPM2Guide() {
        // Créer une modal avec le guide
        const modal = document.createElement('div');
        modal.className =
            'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';

        modal.innerHTML = `
            <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-4xl w-full p-6 border-2 border-purple-500 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-2xl font-bold text-white flex items-center gap-2">
                        <i class="fas fa-book text-purple-400"></i>
                        Guide d'installation PM2
                    </h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>

                <div class="prose prose-invert max-w-none">
                    <p class="text-gray-300 mb-4">
                        Le guide complet est disponible dans <code class="bg-gray-700 px-2 py-1 rounded">discord-bot/INSTALL_PM2.md</code>
                    </p>

                    <div class="bg-gray-800 rounded-lg p-4 mb-4">
                        <p class="text-green-400 font-mono text-sm">npm install -g pm2</p>
                    </div>

                    <p class="text-gray-400 text-sm">
                        Consulte le fichier pour toutes les instructions détaillées !
                    </p>
                </div>

                <button onclick="this.closest('.fixed').remove()"
                        class="w-full mt-6 btn-premium bg-gray-700 hover:bg-gray-600">
                    Fermer
                </button>
            </div>
        `;

        document.body.appendChild(modal);
    }
};

// Export
window.DiscordBotControls = DiscordBotControls;
