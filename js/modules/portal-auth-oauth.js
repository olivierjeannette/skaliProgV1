/**
 * PORTAL AUTH OAUTH - Authentification Discord automatique
 * - Connexion OAuth Discord (pas de saisie manuelle)
 * - Vérification automatique de la liaison
 * - Auto-liaison si l'admin n'a pas encore lié
 */

const PortalAuthOAuth = {
    currentUser: null,
    linkedMember: null,
    discordToken: null,

    /**
     * Initialisation
     */
    async init() {
        console.log('🔐 Initialisation PortalAuth OAuth...');

        // Initialiser Supabase
        if (!SupabaseManager.supabase) {
            await SupabaseManager.init();
        }

        // ÉTAPE 1: Vérifier si on a une session sauvegardée (localStorage)
        const sessionRestored = await this.loadSavedSession();
        if (sessionRestored) {
            console.log('✅ Connexion automatique depuis session sauvegardée');
            await this.showApp();
            this.showNotification(`✅ Bon retour ${this.linkedMember.name} !`, 'success');
            // Mettre à jour la session avec la date actuelle
            await this.saveSession();
            return;
        }

        // ÉTAPE 2: Vérifier si on revient de Discord OAuth (URL contient #access_token)
        if (window.location.hash.includes('access_token')) {
            await this.handleOAuthCallback();
            return;
        }

        // ÉTAPE 3: Vérifier si on a un token Discord sauvegardé
        const savedToken = DiscordOAuth.loadToken();
        if (savedToken) {
            console.log('✅ Token Discord trouvé, vérification...');
            this.discordToken = savedToken;
            await this.verifyAndLoginWithToken(savedToken.accessToken);
            return;
        }

        // ÉTAPE 4: Aucune session + pas de token → Afficher écran de connexion
        console.log('⚠️ Aucune session → Connexion Discord requise');
        this.showLoginScreen();
    },

    /**
     * Gérer le callback OAuth
     */
    async handleOAuthCallback() {
        console.log('🔄 Traitement callback OAuth...');

        const tokenData = DiscordOAuth.parseTokenFromUrl();

        if (!tokenData) {
            console.error("❌ Pas de token dans l'URL");
            this.showLoginScreen();
            return;
        }

        // Sauvegarder le token
        DiscordOAuth.saveToken(tokenData);
        this.discordToken = tokenData;

        // Nettoyer l'URL
        window.history.replaceState({}, document.title, window.location.pathname);

        // Vérifier et connecter
        await this.verifyAndLoginWithToken(tokenData.accessToken);
    },

    /**
     * Vérifier et connecter avec le token
     * @param accessToken
     */
    async verifyAndLoginWithToken(accessToken) {
        try {
            // ÉTAPE 1: Récupérer les infos Discord de l'utilisateur
            const userInfo = await DiscordOAuth.getUserInfo(accessToken);
            console.log('✅ Utilisateur Discord:', userInfo.username);

            this.currentUser = {
                discordId: userInfo.id,
                username: userInfo.username,
                globalName: userInfo.global_name || userInfo.username,
                avatar: userInfo.avatar
                    ? `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.png`
                    : null
            };

            // ÉTAPE 2: Vérifier qu'il est membre du serveur Skàli
            const isInGuild = await DiscordOAuth.isUserInSkaliGuild(accessToken);

            if (!isInGuild) {
                throw new Error('NOT_IN_GUILD');
            }

            console.log('✅ Membre du serveur Skàli confirmé');

            // ÉTAPE 3: Vérifier s'il existe dans discord_members
            await this.ensureDiscordMemberExists(userInfo);

            // ÉTAPE 4: Vérifier si lié à un adhérent
            const linkedMember = await this.getLinkedMember(userInfo.id);

            if (linkedMember) {
                // CAS A: Déjà lié → Connexion directe
                console.log('✅ Compte lié à:', linkedMember.name);
                this.linkedMember = linkedMember;
                this.saveSession();
                await this.showApp();
                this.showNotification(`✅ Bienvenue ${linkedMember.name} !`, 'success');
            } else {
                // CAS B: Pas lié → Permettre l'auto-liaison
                console.log('⚠️ Pas encore lié → Auto-liaison');
                await this.showLinkingInterface();
            }
        } catch (error) {
            console.error('❌ Erreur:', error);

            if (error.message === 'NOT_IN_GUILD') {
                this.showNotInGuildError();
            } else {
                this.showNotification('❌ Erreur de connexion: ' + error.message, 'error');
                this.showLoginScreen();
            }
        }
    },

    /**
     * S'assurer que l'utilisateur Discord existe dans discord_members
     * @param userInfo
     */
    async ensureDiscordMemberExists(userInfo) {
        const client = SupabaseManager.supabase;

        // Vérifier s'il existe déjà
        const { data: existing } = await client
            .from('discord_members')
            .select('discord_id')
            .eq('discord_id', userInfo.id)
            .single();

        if (existing) {
            console.log('✅ discord_members existe déjà');
            return;
        }

        // Créer l'entrée dans discord_members
        console.log('📝 Création entrée discord_members...');

        const { error } = await client.from('discord_members').insert({
            discord_id: userInfo.id,
            discord_username: userInfo.username,
            discord_global_name: userInfo.global_name || userInfo.username,
            discord_avatar: userInfo.avatar
                ? `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.png`
                : null,
            is_active: true,
            last_sync: new Date().toISOString()
        });

        if (error) {
            console.error('❌ Erreur création discord_members:', error);
        } else {
            console.log('✅ Entrée discord_members créée');
        }
    },

    /**
     * Récupérer l'adhérent lié (si existe)
     * @param discordId
     */
    async getLinkedMember(discordId) {
        const client = SupabaseManager.supabase;

        // Vérifier dans discord_members
        const { data: discordMember } = await client
            .from('discord_members')
            .select('member_id')
            .eq('discord_id', discordId)
            .single();

        if (!discordMember || !discordMember.member_id) {
            return null;
        }

        // Charger le membre
        const { data: member } = await client
            .from('members')
            .select('*')
            .eq('id', discordMember.member_id)
            .single();

        return member;
    },

    /**
     * Afficher l'interface de liaison
     */
    async showLinkingInterface() {
        console.log('🔗 Affichage interface de liaison...');

        const modal = document.createElement('div');
        modal.className =
            'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';

        modal.innerHTML = `
            <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-lg w-full p-6 border-2 border-green-500 shadow-2xl">
                <div class="bg-gradient-to-r from-green-600 to-green-700 -mx-6 -mt-6 p-6 rounded-t-2xl mb-6">
                    <div class="flex items-center gap-3">
                        <img src="${this.currentUser.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}"
                             class="w-16 h-16 rounded-full border-2 border-white">
                        <div>
                            <h3 class="text-2xl font-bold text-white">Lier votre profil</h3>
                            <p class="text-green-200 text-sm">
                                <i class="fab fa-discord mr-1"></i>${this.currentUser.globalName}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 mb-6">
                    <div class="flex items-start gap-3">
                        <i class="fas fa-info-circle text-blue-400 text-xl mt-1"></i>
                        <div class="text-sm text-gray-300">
                            <p class="font-semibold text-white mb-1">Première connexion</p>
                            <p>Recherchez votre profil adhérent pour le lier à votre compte Discord.</p>
                        </div>
                    </div>
                </div>

                <div class="mb-4">
                    <label class="block text-sm font-semibold text-gray-300 mb-2">
                        <i class="fas fa-search text-green-400 mr-2"></i>Rechercher votre nom
                    </label>
                    <input type="text" id="memberSearchInput"
                           placeholder="Prénom, nom, ou email..."
                           oninput="PortalAuthOAuth.searchMembers(this.value)"
                           class="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none"
                           autofocus>
                </div>

                <div id="searchResults" class="space-y-2 mb-4 max-h-64 overflow-y-auto">
                    <p class="text-center text-gray-500 py-4">
                        <i class="fas fa-search text-2xl mb-2"></i><br>
                        Tapez votre nom pour rechercher...
                    </p>
                </div>

                <button onclick="PortalAuthOAuth.logout()"
                        class="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-all">
                    <i class="fas fa-arrow-left mr-2"></i>Annuler et déconnecter
                </button>
            </div>
        `;

        document.body.appendChild(modal);
        this.linkingModal = modal;
    },

    /**
     * Rechercher les membres
     * @param query
     */
    async searchMembers(query) {
        const resultsDiv = document.getElementById('searchResults');

        if (!query || query.length < 2) {
            resultsDiv.innerHTML = `
                <p class="text-center text-gray-500 py-4">
                    <i class="fas fa-search text-2xl mb-2"></i><br>
                    Entrez au moins 2 caractères...
                </p>
            `;
            return;
        }

        try {
            const members = await SupabaseManager.getMembers();
            const searchLower = query.toLowerCase();

            const filtered = members.filter(
                m =>
                    m.name?.toLowerCase().includes(searchLower) ||
                    m.email?.toLowerCase().includes(searchLower) ||
                    (m.firstName && m.firstName.toLowerCase().includes(searchLower)) ||
                    (m.lastName && m.lastName.toLowerCase().includes(searchLower))
            );

            if (filtered.length === 0) {
                resultsDiv.innerHTML = `
                    <div class="text-center py-4 text-gray-400">
                        <i class="fas fa-user-slash text-3xl mb-2"></i>
                        <p class="font-semibold">Aucun adhérent trouvé</p>
                        <p class="text-xs">Vérifiez l'orthographe</p>
                    </div>
                `;
                return;
            }

            resultsDiv.innerHTML = filtered
                .slice(0, 10)
                .map(member => {
                    const isAlreadyLinked = member.discord_id && member.discord_id !== '';
                    const canSelect = !isAlreadyLinked;

                    return `
                    <div class="bg-gray-800 rounded-lg p-3 ${canSelect ? 'hover:bg-gray-750 cursor-pointer border border-gray-700 hover:border-green-500' : 'opacity-60 border border-red-500/30'} transition"
                         ${canSelect ? `onclick="PortalAuthOAuth.confirmLinking('${member.id}', '${member.name.replace(/'/g, "\\'")}')"` : ''}>
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-gradient-to-br ${canSelect ? 'from-green-500 to-green-700' : 'from-red-500 to-red-700'} flex items-center justify-center flex-shrink-0">
                                <i class="fas fa-user text-white"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <h4 class="font-bold text-white text-sm truncate">${member.name}</h4>
                                ${member.email ? `<p class="text-xs text-gray-400">${member.email}</p>` : ''}
                                ${
                                    isAlreadyLinked
                                        ? `
                                    <p class="text-xs text-red-400 mt-1">
                                        <i class="fas fa-lock mr-1"></i>Déjà lié à un autre Discord
                                    </p>
                                `
                                        : `
                                    <p class="text-xs text-green-400 mt-1">
                                        <i class="fas fa-check-circle mr-1"></i>Disponible
                                    </p>
                                `
                                }
                            </div>
                            ${canSelect ? '<i class="fas fa-chevron-right text-gray-500"></i>' : '<i class="fas fa-ban text-red-500"></i>'}
                        </div>
                    </div>
                `;
                })
                .join('');
        } catch (error) {
            console.error('Erreur recherche:', error);
            resultsDiv.innerHTML =
                '<p class="text-center text-red-400 py-4">Erreur de recherche</p>';
        }
    },

    /**
     * Confirmer la liaison
     * @param memberId
     * @param memberName
     */
    async confirmLinking(memberId, memberName) {
        const confirm = window.confirm(
            `Lier votre Discord (${this.currentUser.globalName}) au profil "${memberName}" ?\n\n` +
                '⚠️ Une fois lié, seul vous pourrez accéder à ce profil via Discord.'
        );

        if (!confirm) {
            return;
        }

        try {
            const client = SupabaseManager.supabase;

            // Lier dans discord_members
            const { error: dmError } = await client
                .from('discord_members')
                .update({
                    member_id: memberId,
                    linked_at: new Date().toISOString()
                })
                .eq('discord_id', this.currentUser.discordId);

            if (dmError) {
                throw dmError;
            }

            // Lier dans members
            const { error: mError } = await client
                .from('members')
                .update({
                    discord_id: this.currentUser.discordId,
                    discord_username: this.currentUser.username
                })
                .eq('id', memberId);

            if (mError) {
                throw mError;
            }

            console.log('✅ Liaison réussie');

            // Charger le membre
            const { data: member } = await client
                .from('members')
                .select('*')
                .eq('id', memberId)
                .single();

            this.linkedMember = member;
            this.saveSession();

            // Fermer la modal
            if (this.linkingModal) {
                this.linkingModal.remove();
            }

            await this.showApp();
            this.showNotification(`✅ Profil lié avec succès ! Bienvenue ${memberName}`, 'success');
        } catch (error) {
            console.error('❌ Erreur liaison:', error);
            this.showNotification('❌ Erreur lors de la liaison: ' + error.message, 'error');
        }
    },

    /**
     * Afficher l'écran de connexion
     */
    showLoginScreen() {
        document.getElementById('discordLoginScreen')?.classList.remove('hidden');
        document.getElementById('contentArea')?.classList.add('hidden');

        const nav = document.querySelector('nav');
        if (nav) {
            nav.style.display = 'none';
        }
    },

    /**
     * Afficher l'application
     */
    async showApp() {
        // Supprimer complètement l'écran de connexion du DOM
        const loginScreen = document.getElementById('discordLoginScreen');
        if (loginScreen) {
            loginScreen.remove();
            console.log('🗑️ Écran de connexion Discord supprimé du DOM');
        }

        document.getElementById('contentArea')?.classList.remove('hidden');

        const nav = document.querySelector('nav');
        if (nav) {
            nav.style.display = 'block';
        }

        if (typeof showHome === 'function') {
            showHome();
        }
    },

    /**
     * Connexion OAuth
     */
    loginWithDiscord() {
        DiscordOAuth.login();
    },

    /**
     * Erreur: Pas dans le serveur
     */
    showNotInGuildError() {
        const modal = document.createElement('div');
        modal.className =
            'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';

        modal.innerHTML = `
            <div class="bg-gradient-to-br from-red-900 to-red-800 rounded-2xl max-w-md w-full p-6 border-2 border-red-500 shadow-2xl">
                <div class="bg-gradient-to-r from-red-600 to-red-700 -mx-6 -mt-6 p-6 rounded-t-2xl mb-6">
                    <div class="flex items-center gap-3">
                        <i class="fas fa-times-circle text-5xl text-white"></i>
                        <div>
                            <h3 class="text-2xl font-bold text-white">Non membre du serveur</h3>
                        </div>
                    </div>
                </div>

                <div class="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-6">
                    <p class="text-white font-semibold mb-2">
                        <i class="fas fa-user-slash mr-2"></i>Vous n'êtes pas membre du serveur Discord Skàli
                    </p>
                    <p class="text-sm text-gray-300">
                        Rejoignez d'abord le serveur Discord de la salle, puis réessayez.
                    </p>
                </div>

                <button onclick="this.closest('.fixed').remove(); PortalAuthOAuth.logout();"
                        class="w-full bg-white hover:bg-gray-100 text-red-600 font-bold py-3 rounded-lg transition-all">
                    <i class="fas fa-arrow-left mr-2"></i>Retour
                </button>
            </div>
        `;

        document.body.appendChild(modal);
    },

    /**
     * Sauvegarder la session (localStorage + Supabase)
     */
    async saveSession() {
        if (!this.currentUser || !this.linkedMember) {
            return;
        }

        const session = {
            discordId: this.currentUser.discordId,
            username: this.currentUser.username,
            globalName: this.currentUser.globalName,
            avatar: this.currentUser.avatar,
            memberId: this.linkedMember.id,
            memberName: this.linkedMember.name,
            timestamp: Date.now()
        };

        // Sauvegarder dans localStorage (persiste après fermeture)
        localStorage.setItem('portal_oauth_session', JSON.stringify(session));
        console.log('💾 Session sauvegardée (localStorage)');

        // Synchroniser avec Supabase (last_login uniquement) - OPTIONNEL
        try {
            const { error } = await SupabaseManager.supabase
                .from('members')
                .update({
                    last_login: new Date().toISOString()
                })
                .eq('id', this.linkedMember.id);

            if (error) {
                // Erreur silencieuse - la colonne last_login n'existe peut-être pas
                console.debug(
                    '⚠️ Impossible de mettre à jour last_login (colonne inexistante?), ignoré'
                );
            } else {
                console.log('☁️ Session synchronisée avec Supabase');
            }
        } catch (error) {
            // Erreur non bloquante - ignorée
            console.debug('⚠️ Erreur sync Supabase (non bloquant, ignoré)');
        }
    },

    /**
     * Charger la session sauvegardée
     */
    async loadSavedSession() {
        try {
            const data = localStorage.getItem('portal_oauth_session');
            if (!data) {
                return false;
            }

            const session = JSON.parse(data);

            // Vérifier que la session n'est pas trop ancienne (90 jours max - optimisé mobile)
            const maxAge = 90 * 24 * 60 * 60 * 1000; // 90 jours
            const daysRemaining = Math.floor(
                (maxAge - (Date.now() - session.timestamp)) / 1000 / 60 / 60 / 24
            );

            if (Date.now() - session.timestamp > maxAge) {
                console.log('⏰ Session expirée (> 90 jours)');
                this.clearSavedSession();
                return false;
            }

            console.log(
                `✅ Session locale trouvée: ${session.memberName} (valide encore ${daysRemaining} jours)`
            );

            // Reconstituer l'état
            this.currentUser = {
                discordId: session.discordId,
                username: session.username,
                globalName: session.globalName,
                avatar: session.avatar
            };

            // Recharger le membre depuis Supabase (pour avoir les données à jour)
            const { data: member } = await SupabaseManager.supabase
                .from('members')
                .select('*')
                .eq('id', session.memberId)
                .single();

            if (!member) {
                console.error('❌ Membre introuvable dans Supabase');
                this.clearSavedSession();
                return false;
            }

            this.linkedMember = member;

            // Vérifier que le Discord ID correspond toujours
            if (member.discord_id !== session.discordId) {
                console.error('❌ Discord ID ne correspond pas');
                this.clearSavedSession();
                return false;
            }

            console.log('✅ Session restaurée pour:', member.name);
            return true;
        } catch (error) {
            console.error('❌ Erreur chargement session:', error);
            this.clearSavedSession();
            return false;
        }
    },

    /**
     * Effacer la session sauvegardée
     */
    clearSavedSession() {
        localStorage.removeItem('portal_oauth_session');
        console.log('🗑️ Session locale supprimée');
    },

    /**
     * Déconnexion
     */
    logout() {
        console.log('🚪 Déconnexion...');

        this.currentUser = null;
        this.linkedMember = null;
        this.discordToken = null;

        DiscordOAuth.clearToken();
        this.clearSavedSession();

        window.location.reload();
    },

    /**
     * Afficher une notification
     * @param message
     * @param type
     */
    showNotification(message, type = 'success') {
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };

        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-4 rounded-lg shadow-lg z-50 transition-opacity`;
        notification.innerHTML = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
};

// Export
window.PortalAuthOAuth = PortalAuthOAuth;
