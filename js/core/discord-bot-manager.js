/**
 * DISCORD BOT MANAGER
 * Gère le bot Discord en arrière-plan via Node.js child process
 */

const DiscordBotManager = {
    botProcess: null,
    isRunning: false,
    restartAttempts: 0,
    maxRestartAttempts: 5,

    /**
     * Vérifier si le bot tourne déjà
     */
    async checkBotStatus() {
        try {
            // Vérifier via un endpoint ou fichier de statut
            const statusFile = '../discord-bot/bot-status.json';

            // TODO: Implémenter vérification réelle
            return this.isRunning;
        } catch (error) {
            console.error('Erreur vérification status bot:', error);
            return false;
        }
    },

    /**
     * Démarrer le bot Discord
     */
    async startBot() {
        if (this.isRunning) {
            console.log("⚠️ Bot déjà en cours d'exécution");
            return false;
        }

        console.log('🚀 Démarrage du bot Discord...');

        try {
            // Créer un worker pour le bot (si on utilise Web Workers)
            // Ou appeler un endpoint backend qui lance le bot

            // OPTION A: Via endpoint backend
            const response = await fetch('/api/discord-bot/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                this.isRunning = true;
                console.log('✅ Bot Discord démarré');
                return true;
            }

            throw new Error('Échec démarrage bot');
        } catch (error) {
            console.error('❌ Erreur démarrage bot:', error);

            // Retry automatique
            if (this.restartAttempts < this.maxRestartAttempts) {
                this.restartAttempts++;
                console.log(`🔄 Tentative ${this.restartAttempts}/${this.maxRestartAttempts}...`);
                setTimeout(() => this.startBot(), 5000);
            }

            return false;
        }
    },

    /**
     * Arrêter le bot Discord
     */
    async stopBot() {
        if (!this.isRunning) {
            console.log('⚠️ Bot non actif');
            return false;
        }

        console.log('⏸️ Arrêt du bot Discord...');

        try {
            const response = await fetch('/api/discord-bot/stop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                this.isRunning = false;
                console.log('✅ Bot Discord arrêté');
                return true;
            }

            throw new Error('Échec arrêt bot');
        } catch (error) {
            console.error('❌ Erreur arrêt bot:', error);
            return false;
        }
    },

    /**
     * Redémarrer le bot
     */
    async restartBot() {
        console.log('🔄 Redémarrage du bot...');
        await this.stopBot();
        await new Promise(resolve => setTimeout(resolve, 2000));
        await this.startBot();
    },

    /**
     * Synchronisation manuelle
     */
    async triggerSync() {
        try {
            const response = await fetch('/api/discord-bot/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Synchronisation terminée:', data);
                return data;
            }

            throw new Error('Échec synchronisation');
        } catch (error) {
            console.error('❌ Erreur synchronisation:', error);
            throw error;
        }
    },

    /**
     * Obtenir les stats du bot
     */
    async getBotStats() {
        try {
            const response = await fetch('/api/discord-bot/stats');

            if (response.ok) {
                return await response.json();
            }

            throw new Error('Échec récupération stats');
        } catch (error) {
            console.error('❌ Erreur stats bot:', error);
            return null;
        }
    }
};

// Export
window.DiscordBotManager = DiscordBotManager;
