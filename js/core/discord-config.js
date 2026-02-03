/**
 * CONFIGURATION DISCORD SKÀLI
 * Configuration centralisée pour le serveur Discord
 */

const DiscordConfig = {
    // ID du serveur Discord Skàli (par défaut)
    GUILD_ID: '1400713384546009169',

    // URL de base de l'API Discord
    API_BASE: 'https://discord.com/api/v10',

    // Configuration OAuth (à remplir dans ENV pour sécurité)
    clientId: null,
    clientSecret: null,
    botToken: null,

    /**
     * Initialiser depuis ENV
     */
    async init() {
        if (ENV.isLoaded) {
            this.clientId = ENV.get('discordClientId', '');
            this.clientSecret = ENV.get('discordClientSecret', '');
            this.botToken = ENV.get('discordBotToken', '');
            // Charger le Guild ID depuis ENV s'il est configuré
            this.GUILD_ID = ENV.get('discordGuildId', '1400713384546009169');
        }

        console.log('✅ DiscordConfig initialisé - Guild ID:', this.GUILD_ID);
    },

    /**
     * Vérifier si un utilisateur est membre du serveur Skàli
     * NOTE: Nécessite un bot Discord avec les permissions appropriées
     * @param userId
     */
    async isUserInGuild(userId) {
        console.log('🔍 Vérification appartenance serveur Discord:', userId);

        // Si pas de bot token configuré, on accepte par défaut
        if (!this.botToken) {
            console.warn('⚠️ Pas de bot token Discord configuré, vérification désactivée');
            return true;
        }

        try {
            const response = await fetch(
                `${this.API_BASE}/guilds/${this.GUILD_ID}/members/${userId}`,
                {
                    headers: {
                        Authorization: `Bot ${this.botToken}`
                    }
                }
            );

            if (response.status === 200) {
                const member = await response.json();
                console.log('✅ Utilisateur trouvé sur le serveur:', member.user.username);
                return true;
            } else if (response.status === 404) {
                console.log('❌ Utilisateur pas membre du serveur');
                return false;
            } else {
                console.error('❌ Erreur API Discord:', response.status);
                // En cas d'erreur, on accepte pour ne pas bloquer
                return true;
            }
        } catch (error) {
            console.error('❌ Erreur vérification serveur Discord:', error);
            // En cas d'erreur, on accepte pour ne pas bloquer
            return true;
        }
    },

    /**
     * Obtenir les informations d'un utilisateur Discord
     * @param userId
     */
    async getUserInfo(userId) {
        console.log('📋 Récupération infos utilisateur Discord:', userId);

        if (!this.botToken) {
            console.warn('⚠️ Pas de bot token Discord configuré');
            return null;
        }

        try {
            const response = await fetch(`${this.API_BASE}/users/${userId}`, {
                headers: {
                    Authorization: `Bot ${this.botToken}`
                }
            });

            if (response.ok) {
                const user = await response.json();
                console.log('✅ Infos utilisateur récupérées:', user.username);
                return {
                    id: user.id,
                    username: user.username,
                    discriminator: user.discriminator,
                    avatar: user.avatar,
                    displayName: user.global_name || user.username
                };
            } else {
                console.error('❌ Erreur récupération utilisateur:', response.status);
                return null;
            }
        } catch (error) {
            console.error('❌ Erreur API Discord:', error);
            return null;
        }
    },

    /**
     * Obtenir le pseudo d'un membre du serveur
     * @param userId
     */
    async getMemberDisplayName(userId) {
        console.log('👤 Récupération pseudo membre:', userId);

        if (!this.botToken) {
            return `User${userId.slice(-4)}`;
        }

        try {
            const response = await fetch(
                `${this.API_BASE}/guilds/${this.GUILD_ID}/members/${userId}`,
                {
                    headers: {
                        Authorization: `Bot ${this.botToken}`
                    }
                }
            );

            if (response.ok) {
                const member = await response.json();
                // Priorité: nick du serveur > global_name > username
                return member.nick || member.user.global_name || member.user.username;
            } else {
                // Fallback
                return `User${userId.slice(-4)}`;
            }
        } catch (error) {
            console.error('❌ Erreur récupération pseudo:', error);
            return `User${userId.slice(-4)}`;
        }
    }
};

// Export
window.DiscordConfig = DiscordConfig;
