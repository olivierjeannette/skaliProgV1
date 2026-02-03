/**
 * DISCORD AUTHENTICATION MANAGER
 * Gère l'authentification Discord OAuth pour le verrouillage des adhérents
 */

const DiscordAuth = {
    config: {
        clientId: '', // À configurer dans ENV
        redirectUri: '', // URL de callback OAuth
        scopes: ['identify', 'email'] // Permissions demandées
    },

    currentUser: null, // Utilisateur Discord actuellement connecté
    linkedMemberId: null, // ID de l'adhérent lié

    /**
     * Initialiser
     */
    async init() {
        console.log('🔐 Initialisation DiscordAuth...');

        // Charger configuration depuis ENV
        if (ENV.isLoaded) {
            this.config.clientId = ENV.get('discordClientId', '');
            this.config.redirectUri = ENV.get(
                'discordRedirectUri',
                window.location.origin + '/discord-callback.html'
            );
        }

        // Vérifier si on revient d'OAuth (code dans l'URL)
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            await this.handleOAuthCallback(code);
        }

        // Restaurer la session si disponible
        this.restoreSession();

        console.log('✅ DiscordAuth initialisé');
    },

    /**
     * Lancer le processus de connexion Discord
     */
    loginWithDiscord() {
        console.log('🔐 Démarrage connexion Discord OAuth...');

        if (!this.config.clientId) {
            alert("❌ Configuration Discord manquante. Contactez l'administrateur.");
            return;
        }

        // Générer un state pour sécurité CSRF
        const state = this.generateState();
        sessionStorage.setItem('discord_oauth_state', state);

        // Construire l'URL OAuth
        const oauthUrl =
            'https://discord.com/api/oauth2/authorize?' +
            `client_id=${this.config.clientId}&` +
            `redirect_uri=${encodeURIComponent(this.config.redirectUri)}&` +
            'response_type=code&' +
            `scope=${this.config.scopes.join('%20')}&` +
            `state=${state}`;

        // Rediriger vers Discord
        window.location.href = oauthUrl;
    },

    /**
     * Générer un state aléatoire pour CSRF protection
     */
    generateState() {
        return (
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15)
        );
    },

    /**
     * Gérer le retour OAuth
     * @param code
     */
    async handleOAuthCallback(code) {
        console.log('🔐 Traitement callback OAuth Discord...');

        // Vérifier le state
        const urlParams = new URLSearchParams(window.location.search);
        const state = urlParams.get('state');
        const savedState = sessionStorage.getItem('discord_oauth_state');

        if (state !== savedState) {
            console.error('❌ State OAuth invalide - possible attaque CSRF');
            alert('❌ Erreur de sécurité lors de la connexion Discord');
            return;
        }

        try {
            // Échanger le code contre un token
            // NOTE: Cette partie doit être gérée côté serveur pour sécurité
            // Pour l'instant, on simule avec le bot Discord ou webhook

            const userInfo = await this.exchangeCodeForUser(code);

            if (userInfo) {
                this.currentUser = userInfo;
                this.saveSession(userInfo);

                console.log('✅ Connexion Discord réussie:', userInfo.username);

                // Nettoyer l'URL
                window.history.replaceState({}, document.title, window.location.pathname);

                // Callback si défini
                if (typeof this.onLoginSuccess === 'function') {
                    this.onLoginSuccess(userInfo);
                }
            }
        } catch (error) {
            console.error('❌ Erreur OAuth Discord:', error);
            alert('❌ Erreur lors de la connexion Discord');
        }

        // Nettoyer le state
        sessionStorage.removeItem('discord_oauth_state');
    },

    /**
     * Échanger le code OAuth contre les infos utilisateur
     * NOTE: Idéalement, ceci doit être fait côté serveur
     * @param code
     */
    async exchangeCodeForUser(code) {
        console.log('🔐 Échange code OAuth...');

        // ATTENTION: Cette implémentation est simplifiée
        // En production, il faut un backend pour gérer l'OAuth de manière sécurisée
        // car on ne peut pas exposer le client_secret côté client

        try {
            // Alternative 1: Utiliser un backend proxy
            // const response = await fetch('/api/discord/oauth', { ... })

            // Alternative 2: Pour le développement, simuler avec les données du webhook
            // (nécessite que l'utilisateur se soit identifié autrement)

            // Pour l'instant, on retourne null et on demande une liaison manuelle
            console.warn(
                '⚠️ OAuth complet nécessite un backend. Utilisation du mode liaison manuelle.'
            );
            return null;
        } catch (error) {
            console.error('❌ Erreur échange code:', error);
            throw error;
        }
    },

    /**
     * Lier un adhérent à un Discord ID (mode manuel)
     * @param memberId
     * @param discordId
     * @param discordUsername
     */
    async linkMemberToDiscord(memberId, discordId, discordUsername) {
        console.log('🔗 Liaison membre Discord:', memberId, discordId);

        try {
            // Vérifier que ce Discord ID n'est pas déjà utilisé
            const existingLink = await this.checkDiscordIdUsed(discordId);

            if (existingLink && existingLink !== memberId) {
                throw new Error('Ce compte Discord est déjà lié à un autre adhérent');
            }

            // Mettre à jour le membre dans Supabase
            await SupabaseManager.updateMember(memberId, {
                discord_id: discordId,
                discord_username: discordUsername
            });

            console.log('✅ Liaison Discord réussie');

            // Sauvegarder la session
            this.currentUser = {
                id: discordId,
                username: discordUsername
            };
            this.linkedMemberId = memberId;
            this.saveSession(this.currentUser);

            return true;
        } catch (error) {
            console.error('❌ Erreur liaison Discord:', error);
            throw error;
        }
    },

    /**
     * Vérifier si un Discord ID est déjà utilisé
     * @param discordId
     */
    async checkDiscordIdUsed(discordId) {
        try {
            const members = await SupabaseManager.getMembers();
            const linkedMember = members.find(m => m.discord_id === discordId);
            return linkedMember ? linkedMember.id : null;
        } catch (error) {
            console.error('❌ Erreur vérification Discord ID:', error);
            return null;
        }
    },

    /**
     * Vérifier si l'utilisateur Discord actuel peut modifier un adhérent
     * @param memberId
     */
    async canModifyMember(memberId) {
        console.log('🔒 Vérification droits modification:', memberId);

        // Si pas connecté Discord, refuser
        if (!this.currentUser) {
            console.log('❌ Pas de session Discord');
            return false;
        }

        try {
            // Récupérer les infos du membre
            const member = await SupabaseManager.getMember(memberId);

            if (!member) {
                console.log('❌ Membre introuvable');
                return false;
            }

            // Si le membre n'a pas de Discord ID, autoriser (premier lien)
            if (!member.discord_id) {
                console.log('✅ Membre sans Discord, autorisation premier lien');
                return true;
            }

            // Vérifier que le Discord ID correspond
            const canModify = member.discord_id === this.currentUser.id;
            console.log(canModify ? '✅ Autorisé' : '❌ Discord ID ne correspond pas');

            return canModify;
        } catch (error) {
            console.error('❌ Erreur vérification droits:', error);
            return false;
        }
    },

    /**
     * Délier un adhérent de Discord
     * @param memberId
     */
    async unlinkMember(memberId) {
        console.log('🔓 Déliaison Discord:', memberId);

        try {
            await SupabaseManager.updateMember(memberId, {
                discord_id: null,
                discord_username: null
            });

            console.log('✅ Déliaison réussie');
            return true;
        } catch (error) {
            console.error('❌ Erreur déliaison:', error);
            throw error;
        }
    },

    /**
     * Sauvegarder la session Discord
     * @param userInfo
     */
    saveSession(userInfo) {
        sessionStorage.setItem('discord_user', JSON.stringify(userInfo));
        sessionStorage.setItem('discord_linked_member', this.linkedMemberId || '');
    },

    /**
     * Restaurer la session Discord
     */
    restoreSession() {
        const savedUser = sessionStorage.getItem('discord_user');
        const savedMemberId = sessionStorage.getItem('discord_linked_member');

        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.linkedMemberId = savedMemberId || null;
            console.log('✅ Session Discord restaurée:', this.currentUser.username);
        }
    },

    /**
     * Déconnexion Discord
     */
    logout() {
        console.log('🔐 Déconnexion Discord');

        this.currentUser = null;
        this.linkedMemberId = null;

        sessionStorage.removeItem('discord_user');
        sessionStorage.removeItem('discord_linked_member');

        console.log('✅ Déconnexion réussie');
    },

    /**
     * Obtenir l'utilisateur Discord actuel
     */
    getCurrentUser() {
        return this.currentUser;
    },

    /**
     * Vérifier si l'utilisateur est connecté
     */
    isLoggedIn() {
        return this.currentUser !== null;
    },

    /**
     * Afficher la modal de liaison Discord (mode manuel)
     * @param memberId
     * @param memberName
     */
    showLinkModal(memberId, memberName) {
        const modal = document.createElement('div');
        modal.className =
            'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
        modal.onclick = e => {
            if (e.target === modal) {
                modal.remove();
            }
        };

        modal.innerHTML = `
            <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-lg w-full p-6 border-2 border-indigo-500 shadow-2xl" onclick="event.stopPropagation()">
                <!-- En-tête -->
                <div class="bg-gradient-to-r from-indigo-600 to-purple-600 -mx-6 -mt-6 p-6 rounded-t-2xl mb-6">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <i class="fab fa-discord text-4xl text-white"></i>
                            <div>
                                <h3 class="text-2xl font-bold text-white">Lier à Discord</h3>
                                <p class="text-indigo-200 text-sm">${memberName}</p>
                            </div>
                        </div>
                        <button onclick="this.closest('.fixed').remove()" class="text-white hover:text-gray-300">
                            <i class="fas fa-times text-2xl"></i>
                        </button>
                    </div>
                </div>

                <!-- Info -->
                <div class="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 mb-6">
                    <div class="flex items-start gap-3">
                        <i class="fas fa-info-circle text-blue-400 text-xl mt-1"></i>
                        <div class="text-sm text-gray-300">
                            <p class="font-semibold text-white mb-2">Sécurité des données</p>
                            <p>Une fois lié, seul ce compte Discord pourra modifier les performances de cet adhérent.</p>
                        </div>
                    </div>
                </div>

                <!-- Formulaire -->
                <form id="discordLinkForm" class="space-y-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-300 mb-2">
                            <i class="fab fa-discord text-indigo-400 mr-2"></i>Discord User ID
                        </label>
                        <input type="text" id="discordId" required
                               placeholder="123456789012345678"
                               class="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-indigo-500 focus:outline-none">
                        <p class="text-xs text-gray-500 mt-1">
                            <i class="fas fa-question-circle mr-1"></i>
                            <a href="https://support.discord.com/hc/fr/articles/206346498" target="_blank" class="text-indigo-400 hover:text-indigo-300 underline">
                                Comment trouver mon Discord ID ?
                            </a>
                        </p>
                    </div>

                    <div>
                        <label class="block text-sm font-semibold text-gray-300 mb-2">
                            <i class="fas fa-user text-indigo-400 mr-2"></i>Pseudo Discord (optionnel)
                        </label>
                        <input type="text" id="discordUsername"
                               placeholder="username#1234"
                               class="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-indigo-500 focus:outline-none">
                    </div>

                    <button type="submit" class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg">
                        <i class="fas fa-link mr-2"></i>Lier mon compte
                    </button>
                </form>

                <!-- Alternative -->
                <div class="mt-4 text-center">
                    <p class="text-xs text-gray-500">
                        Besoin d'aide ? Contactez un administrateur
                    </p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Gérer la soumission
        document.getElementById('discordLinkForm').onsubmit = async e => {
            e.preventDefault();

            const discordId = document.getElementById('discordId').value.trim();
            const discordUsername =
                document.getElementById('discordUsername').value.trim() ||
                `User${discordId.slice(-4)}`;

            if (!discordId) {
                alert('⚠️ Veuillez entrer votre Discord ID');
                return;
            }

            try {
                await this.linkMemberToDiscord(memberId, discordId, discordUsername);

                modal.remove();

                if (typeof Utils !== 'undefined' && Utils.showNotification) {
                    Utils.showNotification('✅ Compte Discord lié avec succès !', 'success');
                }

                // Callback si défini
                if (typeof this.onLinkSuccess === 'function') {
                    this.onLinkSuccess(memberId, discordId, discordUsername);
                }
            } catch (error) {
                alert('❌ Erreur lors de la liaison : ' + error.message);
            }
        };
    }
};

// Export
window.DiscordAuth = DiscordAuth;
