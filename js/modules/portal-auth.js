/**
 * PORTAL AUTH V2 - Authentification Discord ROBUSTE
 * Vérifie l'appartenance au serveur + Gère les cas d'erreur + Déliaison
 */

const PortalAuth = {
    currentUser: null,
    linkedMember: null,
    pendingDiscordId: null,
    pendingUsername: null,
    linkingModal: null,

    /**
     * Initialisation
     */
    async init() {
        console.log('🔐 Initialisation PortalAuth V2...');

        // Initialiser la config Discord Skàli
        if (typeof DiscordConfig !== 'undefined') {
            await DiscordConfig.init();
            console.log('✅ Discord Skàli configuré - Guild:', DiscordConfig.GUILD_ID);
        }

        // Vérifier si l'utilisateur a déjà une session
        const savedSession = this.restoreSession();

        if (savedSession) {
            console.log('✅ Session Discord restaurée:', savedSession.discordId);
            await this.showApp();
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
     * Connexion Discord
     */
    async loginWithDiscord() {
        console.log('🔐 Démarrage connexion Discord...');

        // DÉSACTIVÉ: Connexion automatique via MY_DISCORD_CONFIG
        // Raison: Éviter que tout le monde se connecte avec le même compte
        // Chaque utilisateur doit maintenant entrer manuellement son Discord ID

        const modal = document.createElement('div');
        modal.className =
            'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
        modal.onclick = e => {
            if (e.target === modal) {
                modal.remove();
            }
        };

        modal.innerHTML = `
            <div style="background: var(--glass-bg); backdrop-filter: blur(20px); border-radius: var(--radius-xl); max-width: 32rem; width: 100%; padding: 1.5rem; border: 2px solid var(--accent-primary); box-shadow: var(--shadow-2xl);" onclick="event.stopPropagation()">
                <div style="background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%); margin: -1.5rem -1.5rem 1.5rem -1.5rem; padding: 1.5rem; border-radius: var(--radius-xl) var(--radius-xl) 0 0;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <i class="fab fa-discord" style="font-size: 2.25rem; color: white;"></i>
                            <div>
                                <h3 style="font-size: 1.5rem; font-weight: 700; color: white;">Connexion Discord</h3>
                                <p style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem;">Membre du serveur Skàli</p>
                            </div>
                        </div>
                        <button onclick="this.closest('.fixed').remove()" style="color: white; background: none; border: none; cursor: pointer; opacity: 0.8; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">
                            <i class="fas fa-times" style="font-size: 1.5rem;"></i>
                        </button>
                    </div>
                </div>

                <div style="background: rgba(var(--accent-primary-rgb), 0.1); border: 1px solid rgba(var(--accent-primary-rgb), 0.3); border-radius: var(--radius-lg); padding: 1rem; margin-bottom: 1.5rem;">
                    <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                        <i class="fas fa-info-circle" style="color: var(--accent-primary); font-size: 1.25rem; margin-top: 0.25rem;"></i>
                        <div style="font-size: 0.875rem; color: var(--text-primary);">
                            <p style="font-weight: 600; margin-bottom: 0.5rem;">Comment trouver mon Discord ID ?</p>
                            <ol style="list-style: decimal; list-style-position: inside; font-size: 0.75rem; line-height: 1.6;">
                                <li>Ouvrir Discord</li>
                                <li>Paramètres > Avancés</li>
                                <li>Activer "Mode développeur"</li>
                                <li>Clic droit sur votre nom > "Copier l'ID"</li>
                            </ol>
                        </div>
                    </div>
                </div>

                <form id="discordLoginForm" style="display: flex; flex-direction: column; gap: 1rem;">
                    <div>
                        <label style="display: block; font-size: 0.875rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem;">
                            <i class="fab fa-discord" style="color: var(--accent-primary); margin-right: 0.5rem;"></i>Votre Discord ID
                        </label>
                        <input type="text" id="discordIdInput" required
                               placeholder="123456789012345678"
                               pattern="[0-9]{17,19}"
                               style="width: 100%; background: var(--input-bg); color: var(--text-primary); padding: 0.75rem 1rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color); font-size: 1.125rem; font-family: monospace; transition: border-color 0.2s;"
                               onfocus="this.style.borderColor='var(--accent-primary)'; this.style.outline='none';"
                               onblur="this.style.borderColor='var(--border-color)';">
                        <p style="font-size: 0.75rem; color: var(--text-tertiary); margin-top: 0.25rem;">
                            17-19 chiffres uniquement
                        </p>
                    </div>

                    <button type="submit" style="width: 100%; background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%); color: white; font-weight: 700; padding: 0.75rem; border-radius: var(--radius-lg); border: none; cursor: pointer; transition: all 0.2s; box-shadow: var(--shadow-lg);" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                        <i class="fas fa-sign-in-alt" style="margin-right: 0.5rem;"></i>Se connecter
                    </button>
                </form>

                <div style="margin-top: 1rem; text-align: center;">
                    <p style="font-size: 0.75rem; color: var(--text-tertiary);">
                        Vous devez être membre du serveur Discord Skàli
                    </p>
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

                await this.verifyAndLinkDiscord(discordId);

                modal.remove();
            } catch (error) {
                console.error('❌ Erreur:', error);
                this.showErrorModal(error.message, discordId);
                modal.remove();
            }
        };
    },

    /**
     * ÉTAPE 1: Vérifier et lier le Discord ID
     * @param discordId
     * @param username
     */
    async verifyAndLinkDiscord(discordId, username = null) {
        console.log('🔍 ÉTAPE 1: Vérification Discord ID:', discordId);

        // VÉRIFICATION 1: Discord ID est membre du serveur Skàli ?
        try {
            const isMember = await DiscordConfig.isUserInGuild(discordId);

            if (!isMember) {
                throw new Error('NON_MEMBRE_SERVEUR');
            }

            console.log('✅ Utilisateur confirmé membre du serveur Skàli');

            // Récupérer le pseudo Discord depuis l'API
            const displayName = await DiscordConfig.getMemberDisplayName(discordId);
            this.pendingUsername = displayName || username || `User${discordId.slice(-4)}`;
        } catch (error) {
            if (error.message === 'NON_MEMBRE_SERVEUR') {
                console.error('❌ Utilisateur pas membre du serveur Skàli');
                throw error;
            }

            // Si erreur de vérification (CORS, etc.), on continue mais on avertit
            console.warn("⚠️ Impossible de vérifier l'appartenance au serveur:", error);
            this.pendingUsername = username || `User${discordId.slice(-4)}`;
        }

        // VÉRIFICATION 2: Discord ID déjà lié ?
        const members = await SupabaseManager.getMembers();
        const linkedMember = members.find(m => m.discord_id === discordId);

        if (linkedMember) {
            // SCÉNARIO A: Discord ID déjà lié → Connexion directe
            console.log('✅ Discord ID déjà lié au profil:', linkedMember.name);

            this.currentUser = {
                discordId: discordId,
                username: this.pendingUsername || linkedMember.discord_username
            };
            this.linkedMember = linkedMember;

            this.saveSession();
            await this.showApp();

            this.showNotification(`✅ Bienvenue ${linkedMember.name} !`, 'success');
        } else {
            // SCÉNARIO B: Premier accès → Recherche profil
            console.log('📝 Premier accès - Recherche de profil');
            this.pendingDiscordId = discordId;
            await this.searchAndLinkMember(discordId);
        }
    },

    /**
     * ÉTAPE 2: Rechercher et lier son profil
     * @param discordId
     */
    async searchAndLinkMember(discordId) {
        console.log('🔍 ÉTAPE 2: Recherche de profil pour:', discordId);

        const modal = document.createElement('div');
        modal.className =
            'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';

        modal.innerHTML = `
            <div style="background: var(--glass-bg); backdrop-filter: blur(20px); border-radius: var(--radius-xl); max-width: 32rem; width: 100%; padding: 1.5rem; border: 2px solid var(--success-color); box-shadow: var(--shadow-2xl);">
                <div style="background: linear-gradient(135deg, var(--success-color) 0%, #10b981 100%); margin: -1.5rem -1.5rem 1.5rem -1.5rem; padding: 1.5rem; border-radius: var(--radius-xl) var(--radius-xl) 0 0;">
                    <h3 style="font-size: 1.5rem; font-weight: 700; color: white; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-user-plus"></i>
                        Lier votre profil adhérent
                    </h3>
                    <p style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem;">Discord: ${this.pendingUsername}</p>
                </div>

                <div style="background: rgba(234, 179, 8, 0.1); border: 1px solid rgba(234, 179, 8, 0.3); border-radius: var(--radius-lg); padding: 1rem; margin-bottom: 1.5rem;">
                    <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                        <i class="fas fa-exclamation-triangle" style="color: #eab308; font-size: 1.25rem; margin-top: 0.25rem;"></i>
                        <div style="font-size: 0.875rem; color: var(--text-primary);">
                            <p style="font-weight: 600; margin-bottom: 0.25rem;">Première connexion</p>
                            <p>Recherchez et sélectionnez votre profil adhérent pour le lier à votre Discord.</p>
                        </div>
                    </div>
                </div>

                <div style="margin-bottom: 1rem;">
                    <label style="display: block; font-size: 0.875rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem;">
                        <i class="fas fa-search" style="color: var(--success-color); margin-right: 0.5rem;"></i>Rechercher votre nom
                    </label>
                    <input type="text" id="memberSearchInput"
                           placeholder="Nom ou prénom..."
                           oninput="PortalAuth.searchMembersForLinking(this.value)"
                           style="width: 100%; background: var(--input-bg); color: var(--text-primary); padding: 0.75rem 1rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color); transition: border-color 0.2s;"
                           onfocus="this.style.borderColor='var(--success-color)'; this.style.outline='none';"
                           onblur="this.style.borderColor='var(--border-color)';"
                           autofocus>
                </div>

                <div id="searchResults" style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; max-height: 16rem; overflow-y: auto;">
                    <p style="text-align: center; color: var(--text-tertiary); padding: 1rem;">
                        <i class="fas fa-search" style="font-size: 1.5rem; display: block; margin-bottom: 0.5rem;"></i>
                        Tapez votre nom pour rechercher...
                    </p>
                </div>

                <button onclick="this.closest('.fixed').remove(); PortalAuth.showLoginScreen();"
                        style="width: 100%; background: var(--card-bg); color: var(--text-primary); font-weight: 600; padding: 0.75rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color); cursor: pointer; transition: all 0.2s;"
                        onmouseover="this.style.background='var(--hover-bg)'" onmouseout="this.style.background='var(--card-bg)'">
                    <i class="fas fa-arrow-left" style="margin-right: 0.5rem;"></i>Retour
                </button>
            </div>
        `;

        document.body.appendChild(modal);
        this.linkingModal = modal;
    },

    /**
     * ÉTAPE 3: Recherche des membres
     * @param query
     */
    async searchMembersForLinking(query) {
        const resultsDiv = document.getElementById('searchResults');

        if (!query || query.length < 2) {
            resultsDiv.innerHTML = `
                <p style="text-align: center; color: var(--text-tertiary); padding: 1rem;">
                    <i class="fas fa-search" style="font-size: 1.5rem; display: block; margin-bottom: 0.5rem;"></i>
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
                    m.name.toLowerCase().includes(searchLower) ||
                    (m.firstName && m.firstName.toLowerCase().includes(searchLower)) ||
                    (m.lastName && m.lastName.toLowerCase().includes(searchLower))
            );

            if (filtered.length === 0) {
                resultsDiv.innerHTML = `
                    <div style="text-align: center; padding: 1rem; color: var(--text-secondary);">
                        <i class="fas fa-user-slash" style="font-size: 1.875rem; display: block; margin-bottom: 0.5rem;"></i>
                        <p style="font-weight: 600;">Aucun adhérent trouvé</p>
                        <p style="font-size: 0.75rem;">Vérifiez l'orthographe</p>
                    </div>
                `;
                return;
            }

            resultsDiv.innerHTML = filtered
                .slice(0, 10)
                .map(member => {
                    const isLinked = member.discord_id && member.discord_id !== '';
                    const canSelect = !isLinked || member.discord_id === this.pendingDiscordId;

                    return `
                    <div style="background: var(--card-bg); border-radius: var(--radius-lg); padding: 0.75rem; border: 1px solid ${canSelect ? 'var(--border-color)' : 'rgba(239, 68, 68, 0.3)'}; ${canSelect ? 'cursor: pointer;' : 'opacity: 0.6;'} transition: all 0.2s;"
                         ${canSelect ? `onclick="PortalAuth.confirmLinking('${member.id}', '${member.name.replace(/'/g, "\\'")}', ${isLinked})"` : ''}
                         ${canSelect ? "onmouseover=\"this.style.background='var(--hover-bg)'; this.style.borderColor='var(--success-color)'\" onmouseout=\"this.style.background='var(--card-bg)'; this.style.borderColor='var(--border-color)'\"" : ''}>
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <div style="width: 2.5rem; height: 2.5rem; border-radius: 50%; background: linear-gradient(135deg, ${canSelect ? 'var(--success-color) 0%, #10b981 100%' : '#ef4444 0%, #dc2626 100%'}); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <i class="fas fa-user" style="color: white;"></i>
                            </div>
                            <div style="flex: 1; min-width: 0;">
                                <h4 style="font-weight: 700; color: var(--text-primary); font-size: 0.875rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${member.name}</h4>
                                ${
                                    isLinked
                                        ? `
                                    <p style="font-size: 0.75rem; color: #ef4444;">
                                        <i class="fas fa-lock" style="margin-right: 0.25rem;"></i>Déjà lié à un autre Discord
                                    </p>
                                `
                                        : `
                                    <p style="font-size: 0.75rem; color: var(--success-color);">
                                        <i class="fas fa-check-circle" style="margin-right: 0.25rem;"></i>Disponible
                                    </p>
                                `
                                }
                            </div>
                            ${canSelect ? '<i class="fas fa-chevron-right" style="color: var(--text-tertiary);"></i>' : '<i class="fas fa-ban" style="color: #ef4444;"></i>'}
                        </div>
                    </div>
                `;
                })
                .join('');
        } catch (error) {
            console.error('Erreur recherche:', error);
            resultsDiv.innerHTML =
                '<p style="text-align: center; color: var(--error-color); padding: 1rem;">Erreur de recherche</p>';
        }
    },

    /**
     * ÉTAPE 4: Confirmer la liaison
     * @param memberId
     * @param memberName
     * @param isAlreadyLinked
     */
    async confirmLinking(memberId, memberName, isAlreadyLinked) {
        console.log('🔗 ÉTAPE 4: Confirmation liaison pour:', memberName);

        // Si déjà lié au même Discord, c'est OK (re-liaison)
        if (isAlreadyLinked) {
            const confirmRelink = confirm(
                `Ce profil est déjà lié à votre Discord.\n\nConfirmer la reconnexion à "${memberName}" ?`
            );
            if (!confirmRelink) {
                return;
            }
        } else {
            const confirmLink = confirm(
                `Lier votre Discord au profil "${memberName}" ?\n\n⚠️ Une fois lié, seul votre compte Discord pourra modifier ce profil.`
            );
            if (!confirmLink) {
                return;
            }
        }

        try {
            // Vérification finale: le membre existe et n'est pas lié à un autre Discord
            const member = await SupabaseManager.getMember(memberId);

            if (member.discord_id && member.discord_id !== this.pendingDiscordId) {
                // Profil lié à un AUTRE Discord → Erreur avec option de déliaison
                this.showAlreadyLinkedError(member, memberName);
                return;
            }

            // LIAISON
            await SupabaseManager.updateMember(memberId, {
                discord_id: this.pendingDiscordId,
                discord_username: this.pendingUsername
            });

            console.log('✅ Liaison réussie:', memberId, '→', this.pendingDiscordId);

            // Sauvegarder la session
            this.currentUser = {
                discordId: this.pendingDiscordId,
                username: this.pendingUsername
            };
            this.linkedMember = member;

            this.saveSession();

            // Fermer la modal
            if (this.linkingModal) {
                this.linkingModal.remove();
            }

            // Afficher l'app
            await this.showApp();

            this.showNotification(`✅ Profil lié avec succès ! Bienvenue ${memberName}`, 'success');
        } catch (error) {
            console.error('❌ Erreur liaison:', error);
            this.showNotification('❌ Erreur lors de la liaison', 'error');
        }
    },

    /**
     * Afficher erreur si profil déjà lié à un autre Discord
     * @param member
     * @param memberName
     */
    showAlreadyLinkedError(member, memberName) {
        console.log('❌ Profil déjà lié à un autre Discord');

        const modal = document.createElement('div');
        modal.className =
            'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';

        modal.innerHTML = `
            <div style="background: var(--glass-bg); backdrop-filter: blur(20px); border-radius: var(--radius-xl); max-width: 28rem; width: 100%; padding: 1.5rem; border: 2px solid var(--error-color); box-shadow: var(--shadow-2xl);">
                <div style="background: linear-gradient(135deg, var(--error-color) 0%, #dc2626 100%); margin: -1.5rem -1.5rem 1.5rem -1.5rem; padding: 1.5rem; border-radius: var(--radius-xl) var(--radius-xl) 0 0;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: white;"></i>
                        <div>
                            <h3 style="font-size: 1.5rem; font-weight: 700; color: white;">Profil déjà lié</h3>
                            <p style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem;">${memberName}</p>
                        </div>
                    </div>
                </div>

                <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: var(--radius-lg); padding: 1rem; margin-bottom: 1.5rem;">
                    <p style="color: var(--text-primary); font-weight: 600; margin-bottom: 0.5rem;">
                        <i class="fas fa-lock" style="margin-right: 0.5rem;"></i>Ce profil est déjà lié à un autre compte Discord
                    </p>
                    <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
                        Le profil "${memberName}" est déjà lié au Discord: <span style="font-family: monospace; color: #ef4444;">${member.discord_username || 'Utilisateur'}</span>
                    </p>
                    <p style="font-size: 0.75rem; color: var(--text-tertiary);">
                        Si vous vous êtes trompé lors de la liaison, vous pouvez délier ce profil ci-dessous.
                    </p>
                </div>

                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    <button onclick="PortalAuth.unlinkAndRelink('${member.id}', '${memberName.replace(/'/g, "\\'")}'); this.closest('.fixed').remove();"
                            style="width: 100%; background: #eab308; color: white; font-weight: 700; padding: 0.75rem; border-radius: var(--radius-lg); border: none; cursor: pointer; transition: all 0.2s;"
                            onmouseover="this.style.background='#ca8a04'" onmouseout="this.style.background='#eab308'">
                        <i class="fas fa-unlink" style="margin-right: 0.5rem;"></i>Délier et lier à mon Discord
                    </button>

                    <button onclick="this.closest('.fixed').remove(); PortalAuth.searchAndLinkMember(PortalAuth.pendingDiscordId);"
                            style="width: 100%; background: var(--card-bg); color: var(--text-primary); font-weight: 600; padding: 0.75rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color); cursor: pointer; transition: all 0.2s;"
                            onmouseover="this.style.background='var(--hover-bg)'" onmouseout="this.style.background='var(--card-bg)'">
                        <i class="fas fa-arrow-left" style="margin-right: 0.5rem;"></i>Chercher un autre profil
                    </button>

                    <button onclick="this.closest('.fixed').remove(); PortalAuth.showLoginScreen();"
                            style="width: 100%; background: none; border: none; color: var(--text-tertiary); font-size: 0.875rem; padding: 0.5rem; cursor: pointer; transition: color 0.2s;"
                            onmouseover="this.style.color='var(--text-primary)'" onmouseout="this.style.color='var(--text-tertiary)'">
                        <i class="fas fa-times" style="margin-right: 0.5rem;"></i>Annuler
                    </button>
                </div>

                <div style="margin-top: 1rem; background: rgba(234, 179, 8, 0.1); border: 1px solid rgba(234, 179, 8, 0.3); border-radius: var(--radius-md); padding: 0.75rem;">
                    <p style="font-size: 0.75rem; color: var(--text-tertiary);">
                        <i class="fas fa-info-circle" style="margin-right: 0.25rem;"></i>
                        <strong>Note:</strong> Si ce n'est pas votre profil, contactez un administrateur.
                    </p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Fermer la modal de recherche
        if (this.linkingModal) {
            this.linkingModal.remove();
        }
    },

    /**
     * Délier et relancer la liaison
     * @param memberId
     * @param memberName
     */
    async unlinkAndRelink(memberId, memberName) {
        console.log('🔓 Déliaison et re-liaison pour:', memberName);

        const confirmUnlink = confirm(
            `⚠️ ATTENTION ⚠️\n\nVous allez délier le profil "${memberName}" de son Discord actuel et le lier au vôtre.\n\nÊtes-vous sûr ? Cette action est irréversible.`
        );

        if (!confirmUnlink) {
            // Retour à la recherche
            await this.searchAndLinkMember(this.pendingDiscordId);
            return;
        }

        try {
            // Délier l'ancien Discord
            await SupabaseManager.updateMember(memberId, {
                discord_id: null,
                discord_username: null
            });

            console.log('✅ Ancien Discord délié');

            // Attendre un instant
            await new Promise(resolve => setTimeout(resolve, 500));

            // Lier au nouveau Discord
            await SupabaseManager.updateMember(memberId, {
                discord_id: this.pendingDiscordId,
                discord_username: this.pendingUsername
            });

            console.log('✅ Nouveau Discord lié');

            // Charger le membre mis à jour
            const member = await SupabaseManager.getMember(memberId);

            // Sauvegarder la session
            this.currentUser = {
                discordId: this.pendingDiscordId,
                username: this.pendingUsername
            };
            this.linkedMember = member;

            this.saveSession();

            // Afficher l'app
            await this.showApp();

            this.showNotification(
                `✅ Profil délié et relié avec succès ! Bienvenue ${memberName}`,
                'success'
            );
        } catch (error) {
            console.error('❌ Erreur déliaison/reliaison:', error);
            this.showNotification("❌ Erreur lors de l'opération", 'error');
            await this.searchAndLinkMember(this.pendingDiscordId);
        }
    },

    /**
     * Afficher modal d'erreur personnalisée
     * @param errorCode
     * @param discordId
     */
    showErrorModal(errorCode, discordId) {
        let title, message, suggestion;

        if (errorCode === 'NON_MEMBRE_SERVEUR') {
            title = 'Non membre du serveur';
            message = `Le Discord ID <span style="font-family: monospace;">${discordId}</span> n'est pas membre du serveur Discord Skàli.`;
            suggestion = "Rejoignez d'abord le serveur Discord de la Skàli, puis réessayez.";
        } else {
            title = 'Erreur de connexion';
            message = errorCode;
            suggestion = 'Contactez un administrateur si le problème persiste.';
        }

        const modal = document.createElement('div');
        modal.className =
            'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';

        modal.innerHTML = `
            <div style="background: var(--glass-bg); backdrop-filter: blur(20px); border-radius: var(--radius-xl); max-width: 28rem; width: 100%; padding: 1.5rem; border: 2px solid var(--error-color); box-shadow: var(--shadow-2xl);">
                <div style="background: linear-gradient(135deg, var(--error-color) 0%, #dc2626 100%); margin: -1.5rem -1.5rem 1.5rem -1.5rem; padding: 1.5rem; border-radius: var(--radius-xl) var(--radius-xl) 0 0;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <i class="fas fa-times-circle" style="font-size: 3rem; color: white;"></i>
                        <div>
                            <h3 style="font-size: 1.5rem; font-weight: 700; color: white;">${title}</h3>
                        </div>
                    </div>
                </div>

                <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: var(--radius-lg); padding: 1rem; margin-bottom: 1rem;">
                    <p style="color: var(--text-primary); font-size: 0.875rem; margin-bottom: 0.5rem;">${message}</p>
                    <p style="color: var(--text-secondary); font-size: 0.75rem;">${suggestion}</p>
                </div>

                <button onclick="this.closest('.fixed').remove(); PortalAuth.loginWithDiscord();"
                        style="width: 100%; background: white; color: #ef4444; font-weight: 700; padding: 0.75rem; border-radius: var(--radius-lg); border: none; cursor: pointer; transition: all 0.2s; margin-bottom: 0.5rem;"
                        onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='white'">
                    <i class="fas fa-redo" style="margin-right: 0.5rem;"></i>Réessayer
                </button>

                <button onclick="this.closest('.fixed').remove(); PortalAuth.showLoginScreen();"
                        style="width: 100%; background: var(--card-bg); color: var(--text-primary); font-weight: 600; padding: 0.75rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color); cursor: pointer; transition: all 0.2s;"
                        onmouseover="this.style.background='var(--hover-bg)'" onmouseout="this.style.background='var(--card-bg)'">
                    <i class="fas fa-arrow-left" style="margin-right: 0.5rem;"></i>Retour
                </button>
            </div>
        `;

        document.body.appendChild(modal);
    },

    /**
     * Sauvegarder la session
     * DÉSACTIVÉ - Ne pas sauvegarder automatiquement pour éviter les conflits multi-utilisateurs
     */
    saveSession() {
        // SESSION DÉSACTIVÉE VOLONTAIREMENT
        // Raison: Sur un ordinateur partagé, la sauvegarde automatique
        // fait que tous les utilisateurs se retrouvent connectés sur le même compte
        // Solution: Chaque utilisateur doit se connecter à chaque session
        console.log('💾 Sauvegarde session DÉSACTIVÉE (multi-utilisateurs)');

        // On peut optionnellement garder juste le Discord ID (sans lier à un membre)
        // pour faciliter la reconnexion, mais SANS auto-login
        const quickAccess = {
            lastDiscordId: this.currentUser.discordId,
            timestamp: Date.now()
        };
        sessionStorage.setItem('portal_quick_access', JSON.stringify(quickAccess));
    },

    /**
     * Restaurer la session
     * DÉSACTIVÉ - Toujours demander la connexion
     */
    restoreSession() {
        // IMPORTANT: NE PAS restaurer automatiquement la session
        // pour éviter que plusieurs utilisateurs utilisent le même compte Discord
        console.log('🔐 Pas de restauration automatique (sécurité multi-utilisateurs)');

        // Nettoyer toutes les anciennes sessions qui pourraient traîner
        localStorage.removeItem('portal_session');

        return null;

        // Note: Si on voulait juste pré-remplir le Discord ID (sans auto-login):
        // const quickAccess = sessionStorage.getItem('portal_quick_access');
        // if (quickAccess) {
        //     const data = JSON.parse(quickAccess);
        //     return data.lastDiscordId; // Pour pré-remplir le formulaire
        // }
    },

    /**
     * Déconnexion
     */
    logout() {
        console.log('🚪 Déconnexion...');

        this.currentUser = null;
        this.linkedMember = null;

        // Nettoyer toutes les données de session
        localStorage.removeItem('portal_session');
        sessionStorage.removeItem('portal_quick_access');

        window.location.reload();
    },

    /**
     * Afficher une notification
     * @param message
     * @param type
     */
    showNotification(message, type = 'success') {
        const colors = {
            success: 'var(--success-color)',
            error: 'var(--error-color)',
            warning: '#eab308',
            info: 'var(--accent-primary)'
        };

        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 1rem;
            right: 1rem;
            background: ${colors[type]};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            z-index: 9999;
            animation: slideInRight 0.3s ease;
        `;
        notification.innerHTML = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
};

// Export
window.PortalAuth = PortalAuth;
