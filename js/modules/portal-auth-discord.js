/**
 * PORTAL AUTH DISCORD V3 - Authentification simplifiée
 * Connexion automatique via la table discord_members (liée par l'admin)
 */

const PortalAuthDiscord = {
    currentUser: null,
    linkedMember: null,

    /**
     * Initialisation
     */
    async init() {
        console.log('🔐 Initialisation PortalAuth Discord V3...');

        // Vérifier si l'utilisateur a une session active
        const savedSession = this.restoreSession();

        if (savedSession) {
            console.log('✅ Session Discord restaurée:', savedSession.discordId);

            // Vérifier que la liaison existe toujours
            const isStillLinked = await this.verifyLinking(savedSession.discordId);

            if (isStillLinked) {
                await this.showApp();
            } else {
                console.log('⚠️ Liaison expirée, reconnexion nécessaire');
                this.showLoginScreen();
            }
        } else {
            console.log('📝 Aucune session, affichage de la connexion');
            this.showLoginScreen();
        }
    },

    /**
     * Afficher l'écran de connexion
     */
    showLoginScreen() {
        document.getElementById('discordLoginScreen')?.classList.remove('hidden');
        document.getElementById('contentArea')?.classList.add('hidden');

        // Cacher le menu de navigation
        const nav = document.querySelector('nav');
        if (nav) {
            nav.style.display = 'none';
        }
    },

    /**
     * Afficher l'application
     */
    async showApp() {
        document.getElementById('discordLoginScreen')?.classList.add('hidden');
        document.getElementById('contentArea')?.classList.remove('hidden');

        // Afficher le menu de navigation
        const nav = document.querySelector('nav');
        if (nav) {
            nav.style.display = 'block';
        }

        // Charger automatiquement la page d'accueil
        if (typeof showHome === 'function') {
            showHome();
        }
    },

    /**
     * Connexion Discord simplifiée
     */
    async loginWithDiscord() {
        console.log('🔐 Connexion Discord V3...');

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
                <div class="bg-gradient-to-r from-indigo-600 to-purple-600 -mx-6 -mt-6 p-6 rounded-t-2xl mb-6">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <i class="fab fa-discord text-4xl text-white"></i>
                            <div>
                                <h3 class="text-2xl font-bold text-white">Connexion Discord</h3>
                                <p class="text-indigo-200 text-sm">Membre Skàli</p>
                            </div>
                        </div>
                        <button onclick="this.closest('.fixed').remove()" class="text-white hover:text-gray-300">
                            <i class="fas fa-times text-2xl"></i>
                        </button>
                    </div>
                </div>

                <div class="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 mb-6">
                    <div class="flex items-start gap-3">
                        <i class="fas fa-info-circle text-blue-400 text-xl mt-1"></i>
                        <div class="text-sm text-gray-300">
                            <p class="font-semibold text-white mb-2">Comment trouver mon Discord ID ?</p>
                            <ol class="list-decimal list-inside space-y-1 text-xs">
                                <li>Ouvrir Discord</li>
                                <li>Paramètres > Avancés > Activer "Mode développeur"</li>
                                <li>Clic droit sur votre nom > "Copier l'ID"</li>
                            </ol>
                        </div>
                    </div>
                </div>

                <form id="discordLoginForm" class="space-y-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-300 mb-2">
                            <i class="fab fa-discord text-indigo-400 mr-2"></i>Votre Discord ID
                        </label>
                        <input type="text" id="discordIdInput" required
                               placeholder="123456789012345678"
                               pattern="[0-9]{17,19}"
                               class="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-indigo-500 focus:outline-none text-lg font-mono">
                        <p class="text-xs text-gray-500 mt-1">
                            17-19 chiffres uniquement
                        </p>
                    </div>

                    <button type="submit" class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg">
                        <i class="fas fa-sign-in-alt mr-2"></i>Se connecter
                    </button>
                </form>

                <div class="mt-4 bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-3">
                    <div class="flex items-start gap-2">
                        <i class="fas fa-shield-alt text-yellow-400 text-sm mt-0.5"></i>
                        <p class="text-xs text-gray-300">
                            <strong class="text-yellow-200">Nouveau :</strong> Votre compte Discord doit être lié à votre profil adhérent par un administrateur. Si vous n'avez pas accès, contactez la salle.
                        </p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('discordLoginForm').onsubmit = async e => {
            e.preventDefault();

            const discordId = document.getElementById('discordIdInput').value.trim();

            if (!discordId || !/^[0-9]{17,19}$/.test(discordId)) {
                this.showNotification('❌ Discord ID invalide (17-19 chiffres)', 'error');
                return;
            }

            try {
                const btn = e.target.querySelector('button[type="submit"]');
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Vérification...';

                await this.verifyAndLogin(discordId);

                modal.remove();
            } catch (error) {
                console.error('❌ Erreur:', error);

                const btn = e.target.querySelector('button[type="submit"]');
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i>Se connecter';

                if (error.message === 'NOT_LINKED') {
                    this.showNotLinkedError(discordId);
                } else if (error.message === 'NOT_IN_SERVER') {
                    this.showNotInServerError(discordId);
                } else if (error.message === 'MEMBER_INACTIVE') {
                    this.showMemberInactiveError(discordId);
                } else {
                    this.showNotification('❌ Erreur de connexion : ' + error.message, 'error');
                }
            }
        };
    },

    /**
     * Vérifier et connecter via Discord ID
     * @param discordId
     */
    async verifyAndLogin(discordId) {
        console.log('🔍 Vérification Discord ID:', discordId);

        const client = SupabaseManager.supabase;
        if (!client) {
            throw new Error('Supabase non initialisé');
        }

        // ÉTAPE 1: Vérifier que le Discord ID existe dans discord_members (donc dans le serveur)
        const { data: discordMember, error: discordError } = await client
            .from('discord_members')
            .select('*')
            .eq('discord_id', discordId)
            .eq('is_active', true)
            .single();

        if (discordError || !discordMember) {
            console.error('❌ Discord ID non trouvé dans discord_members');
            throw new Error('NOT_IN_SERVER');
        }

        console.log('✅ Discord membre trouvé:', discordMember.discord_username);

        // ÉTAPE 2: Vérifier si le Discord ID est lié à un adhérent
        if (!discordMember.member_id) {
            console.error('❌ Discord ID non lié à un adhérent');
            throw new Error('NOT_LINKED');
        }

        console.log('✅ Discord lié au membre:', discordMember.member_id);

        // ÉTAPE 3: Charger les informations de l'adhérent
        const { data: member, error: memberError } = await client
            .from('members')
            .select('*')
            .eq('id', discordMember.member_id)
            .single();

        if (memberError || !member) {
            console.error('❌ Membre non trouvé');
            throw new Error('MEMBER_NOT_FOUND');
        }

        console.log('✅ Membre trouvé:', member.name);

        // ÉTAPE 4: Vérifier que le membre est actif
        if (member.is_active === false) {
            console.error('❌ Membre inactif');
            throw new Error('MEMBER_INACTIVE');
        }

        console.log('✅ Membre actif, connexion autorisée');

        // CONNEXION RÉUSSIE
        this.currentUser = {
            discordId: discordId,
            username: discordMember.discord_username || discordMember.discord_global_name
        };
        this.linkedMember = member;

        this.saveSession();
        await this.showApp();

        this.showNotification(`✅ Bienvenue ${member.name} !`, 'success');
    },

    /**
     * Vérifier que la liaison existe toujours et que le membre est actif
     * @param discordId
     */
    async verifyLinking(discordId) {
        try {
            const client = SupabaseManager.supabase;
            if (!client) {
                return false;
            }

            const { data: discordMember, error } = await client
                .from('discord_members')
                .select('member_id')
                .eq('discord_id', discordId)
                .eq('is_active', true)
                .single();

            if (error || !discordMember || !discordMember.member_id) {
                return false;
            }

            // Vérifier que le membre est actif
            const { data: member, error: memberError } = await client
                .from('members')
                .select('is_active')
                .eq('id', discordMember.member_id)
                .single();

            if (memberError || !member || member.is_active === false) {
                console.log('⚠️ Membre trouvé mais inactif');
                return false;
            }

            return true;
        } catch (error) {
            console.error('Erreur vérification liaison:', error);
            return false;
        }
    },

    /**
     * Afficher erreur : Discord non lié
     * @param discordId
     */
    showNotLinkedError(discordId) {
        const modal = document.createElement('div');
        modal.className =
            'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';

        modal.innerHTML = `
            <div class="bg-gradient-to-br from-yellow-900 to-orange-900 rounded-2xl max-w-md w-full p-6 border-2 border-yellow-500 shadow-2xl">
                <div class="bg-gradient-to-r from-yellow-600 to-orange-600 -mx-6 -mt-6 p-6 rounded-t-2xl mb-6">
                    <div class="flex items-center gap-3">
                        <i class="fas fa-unlink text-5xl text-white"></i>
                        <div>
                            <h3 class="text-2xl font-bold text-white">Compte non lié</h3>
                            <p class="text-yellow-200 text-sm">Discord ID: ${discordId.slice(0, 8)}...</p>
                        </div>
                    </div>
                </div>

                <div class="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4 mb-6">
                    <p class="text-white font-semibold mb-2">
                        <i class="fas fa-exclamation-triangle mr-2"></i>Votre Discord n'est pas encore lié à un adhérent
                    </p>
                    <p class="text-sm text-gray-300 mb-3">
                        Un administrateur doit lier votre compte Discord à votre profil adhérent avant que vous puissiez vous connecter.
                    </p>
                    <p class="text-xs text-gray-400">
                        Contactez la salle Skàli pour demander la liaison de votre compte.
                    </p>
                </div>

                <div class="space-y-3">
                    <button onclick="this.closest('.fixed').remove(); PortalAuthDiscord.loginWithDiscord();"
                            class="w-full bg-white hover:bg-gray-100 text-yellow-600 font-bold py-3 rounded-lg transition-all">
                        <i class="fas fa-redo mr-2"></i>Réessayer avec un autre ID
                    </button>

                    <button onclick="this.closest('.fixed').remove();"
                            class="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-all">
                        <i class="fas fa-times mr-2"></i>Fermer
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    },

    /**
     * Afficher erreur : Pas dans le serveur Discord
     * @param discordId
     */
    showNotInServerError(discordId) {
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
                            <p class="text-red-200 text-sm">Discord ID: ${discordId.slice(0, 8)}...</p>
                        </div>
                    </div>
                </div>

                <div class="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-6">
                    <p class="text-white font-semibold mb-2">
                        <i class="fas fa-user-slash mr-2"></i>Vous n'êtes pas membre du serveur Discord Skàli
                    </p>
                    <p class="text-sm text-gray-300 mb-3">
                        Ce Discord ID n'a pas été trouvé dans le serveur Discord de la Skàli.
                    </p>
                    <p class="text-xs text-gray-400">
                        Rejoignez d'abord le serveur Discord, puis réessayez.
                    </p>
                </div>

                <div class="space-y-3">
                    <button onclick="this.closest('.fixed').remove(); PortalAuthDiscord.loginWithDiscord();"
                            class="w-full bg-white hover:bg-gray-100 text-red-600 font-bold py-3 rounded-lg transition-all">
                        <i class="fas fa-redo mr-2"></i>Réessayer
                    </button>

                    <button onclick="this.closest('.fixed').remove();"
                            class="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-all">
                        <i class="fas fa-times mr-2"></i>Fermer
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    },

    /**
     * Afficher erreur : Membre inactif
     * @param discordId
     */
    showMemberInactiveError(discordId) {
        const modal = document.createElement('div');
        modal.className =
            'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';

        modal.innerHTML = `
            <div class="bg-gradient-to-br from-orange-900 to-red-900 rounded-2xl max-w-md w-full p-6 border-2 border-orange-500 shadow-2xl">
                <div class="bg-gradient-to-r from-orange-600 to-red-600 -mx-6 -mt-6 p-6 rounded-t-2xl mb-6">
                    <div class="flex items-center gap-3">
                        <i class="fas fa-user-slash text-5xl text-white"></i>
                        <div>
                            <h3 class="text-2xl font-bold text-white">Adhésion inactive</h3>
                            <p class="text-orange-200 text-sm">Accès temporairement suspendu</p>
                        </div>
                    </div>
                </div>

                <div class="bg-orange-900/30 border border-orange-500/50 rounded-lg p-4 mb-6">
                    <p class="text-white font-semibold mb-2">
                        <i class="fas fa-exclamation-triangle mr-2"></i>Votre adhésion est actuellement inactive
                    </p>
                    <p class="text-sm text-gray-300 mb-3">
                        Votre profil adhérent est marqué comme inactif dans notre système. Cela peut arriver si :
                    </p>
                    <ul class="text-xs text-gray-400 space-y-1 list-disc list-inside">
                        <li>Votre adhésion n'a pas été renouvelée</li>
                        <li>Vous n'apparaissez pas dans la dernière liste d'adhérents importée</li>
                        <li>Votre compte a été suspendu temporairement</li>
                    </ul>
                </div>

                <div class="bg-blue-900/30 border border-blue-500/50 rounded-lg p-3 mb-4">
                    <p class="text-xs text-blue-200">
                        <i class="fas fa-info-circle mr-2"></i>
                        <strong>Que faire ?</strong> Contactez la salle Skàli pour vérifier votre statut d'adhésion et régulariser votre situation.
                    </p>
                </div>

                <div class="space-y-3">
                    <button onclick="this.closest('.fixed').remove();"
                            class="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-all">
                        <i class="fas fa-times mr-2"></i>Fermer
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    },

    /**
     * Sauvegarder la session
     */
    saveSession() {
        if (!this.currentUser || !this.linkedMember) {
            return;
        }

        const session = {
            discordId: this.currentUser.discordId,
            username: this.currentUser.username,
            memberId: this.linkedMember.id,
            memberName: this.linkedMember.name,
            timestamp: Date.now()
        };

        // Utiliser sessionStorage au lieu de localStorage pour plus de sécurité
        // La session expire quand l'utilisateur ferme le navigateur
        sessionStorage.setItem('portal_discord_session', JSON.stringify(session));
        console.log('💾 Session sauvegardée (expire à la fermeture du navigateur)');
    },

    /**
     * Restaurer la session
     */
    restoreSession() {
        try {
            const sessionData = sessionStorage.getItem('portal_discord_session');
            if (!sessionData) {
                return null;
            }

            const session = JSON.parse(sessionData);

            // Vérifier que la session n'est pas trop vieille (24h max)
            const maxAge = 24 * 60 * 60 * 1000; // 24 heures
            if (Date.now() - session.timestamp > maxAge) {
                console.log('⏰ Session expirée (>24h)');
                sessionStorage.removeItem('portal_discord_session');
                return null;
            }

            this.currentUser = {
                discordId: session.discordId,
                username: session.username
            };

            this.linkedMember = {
                id: session.memberId,
                name: session.memberName
            };

            return session;
        } catch (error) {
            console.error('Erreur restauration session:', error);
            sessionStorage.removeItem('portal_discord_session');
            return null;
        }
    },

    /**
     * Déconnexion
     */
    logout() {
        console.log('🚪 Déconnexion...');

        this.currentUser = null;
        this.linkedMember = null;

        // Nettoyer toutes les données de session
        sessionStorage.removeItem('portal_discord_session');
        localStorage.removeItem('portal_session'); // Ancien système

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
window.PortalAuthDiscord = PortalAuthDiscord;
