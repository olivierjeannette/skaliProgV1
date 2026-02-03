/**
 * DISCORD OAUTH V1 - Authentification automatique via Discord
 * Pas de saisie manuelle, connexion directe avec le compte Discord
 */

const DiscordOAuth = {
    // CONFIGURATION À REMPLIR
    CLIENT_ID: '1401161063717666826', // À remplacer par ton Discord Application Client ID
    REDIRECT_URI: 'https://skaliprog.netlify.app/member-portal.html', // URL HTTPS Netlify
    SCOPES: ['identify', 'guilds', 'guilds.members.read'], // Permissions demandées

    /**
     * Générer l'URL d'autorisation Discord
     */
    getAuthUrl() {
        const params = new URLSearchParams({
            client_id: this.CLIENT_ID,
            redirect_uri: this.REDIRECT_URI,
            response_type: 'token', // Implicit flow (pas besoin de serveur backend)
            scope: this.SCOPES.join(' ')
        });

        return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
    },

    /**
     * Rediriger vers Discord pour l'authentification
     */
    login() {
        console.log('🔐 Redirection vers Discord OAuth...');
        window.location.href = this.getAuthUrl();
    },

    /**
     * Parser le token de retour depuis l'URL
     */
    parseTokenFromUrl() {
        const fragment = window.location.hash.substring(1);
        if (!fragment) {
            return null;
        }

        const params = new URLSearchParams(fragment);
        const accessToken = params.get('access_token');
        const tokenType = params.get('token_type');
        const expiresIn = params.get('expires_in');

        if (!accessToken) {
            return null;
        }

        return {
            accessToken,
            tokenType,
            expiresIn: parseInt(expiresIn),
            timestamp: Date.now()
        };
    },

    /**
     * Récupérer les informations de l'utilisateur Discord
     * @param accessToken
     */
    async getUserInfo(accessToken) {
        const response = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Impossible de récupérer les informations utilisateur');
        }

        return await response.json();
    },

    /**
     * Récupérer les serveurs (guilds) de l'utilisateur
     * @param accessToken
     */
    async getUserGuilds(accessToken) {
        const response = await fetch('https://discord.com/api/users/@me/guilds', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Impossible de récupérer les serveurs');
        }

        return await response.json();
    },

    /**
     * Vérifier si l'utilisateur est membre du serveur Skàli
     * @param accessToken
     */
    async isUserInSkaliGuild(accessToken) {
        const SKALI_GUILD_ID = ENV.get('discordGuildId', '1400713384546009169');

        try {
            const guilds = await this.getUserGuilds(accessToken);
            return guilds.some(guild => guild.id === SKALI_GUILD_ID);
        } catch (error) {
            console.error('Erreur vérification guild:', error);
            return false;
        }
    },

    /**
     * Sauvegarder le token (localStorage pour persistance)
     * @param tokenData
     */
    saveToken(tokenData) {
        // Sauvegarder dans localStorage (persiste après fermeture navigateur)
        localStorage.setItem('discord_oauth_token', JSON.stringify(tokenData));
        console.log('💾 Token Discord sauvegardé (localStorage)');
    },

    /**
     * Charger le token sauvegardé
     */
    loadToken() {
        try {
            const data = localStorage.getItem('discord_oauth_token');
            if (!data) {
                return null;
            }

            const token = JSON.parse(data);

            // Vérifier si le token n'a pas expiré (tokens Discord expirent en 7 jours généralement)
            const expirationTime = token.timestamp + token.expiresIn * 1000;
            if (Date.now() > expirationTime) {
                console.log('⏰ Token Discord expiré, reconnexion nécessaire');
                this.clearToken();
                return null;
            }

            console.log(
                '✅ Token Discord chargé (valide encore ' +
                    Math.floor((expirationTime - Date.now()) / 1000 / 60 / 60) +
                    'h)'
            );
            return token;
        } catch (error) {
            console.error('Erreur chargement token:', error);
            return null;
        }
    },

    /**
     * Supprimer le token
     */
    clearToken() {
        localStorage.removeItem('discord_oauth_token');
        console.log('🗑️ Token Discord supprimé');

        // Nettoyer l'URL du fragment OAuth
        if (window.location.hash.includes('access_token')) {
            window.location.hash = '';
        }
    }
};

// Export
window.DiscordOAuth = DiscordOAuth;
