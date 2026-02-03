/**
 * DISCORD MEMBERS MANAGER
 * Module admin pour gérer les membres Discord et leur liaison avec les adhérents
 */

const DiscordMembersManager = {
    discordMembers: [],
    members: [],
    currentFilter: 'all', // 'all', 'linked', 'unlinked', 'inactive'
    currentSort: 'username', // 'username', 'joined', 'linked'

    /**
     * Initialiser
     */
    async init() {
        console.log('🔐 Initialisation DiscordMembersManager...');

        // S'assurer que Supabase est initialisé
        if (!SupabaseManager.supabase) {
            await SupabaseManager.init();
        }

        await this.loadData();
    },

    /**
     * Charger les données
     */
    async loadData() {
        try {
            const client = SupabaseManager.supabase;

            if (!client) {
                throw new Error('Supabase non initialisé');
            }

            // Charger les membres Discord
            const { data: discordData, error: discordError } = await client
                .from('discord_members_full')
                .select('*')
                .order('discord_username');

            if (discordError) {
                throw discordError;
            }
            this.discordMembers = discordData || [];

            // Charger les adhérents
            this.members = await SupabaseManager.getMembers();

            console.log(`✅ ${this.discordMembers.length} membres Discord chargés`);
            console.log(`✅ ${this.members.length} adhérents chargés`);
        } catch (error) {
            console.error('❌ Erreur chargement données:', error);
            Utils.showNotification('Erreur lors du chargement des données', 'error');
        }
    },

    /**
     * Afficher l'interface principale
     */
    showInterface() {
        const container = document.getElementById('mainContent');
        if (!container) {
            return;
        }

        const linkedCount = this.discordMembers.filter(dm => dm.member_id).length;
        const unlinkedCount = this.discordMembers.filter(
            dm => !dm.member_id && dm.is_active
        ).length;
        const inactiveCount = this.discordMembers.filter(dm => !dm.is_active).length;

        container.innerHTML = `
            <div class="glass-card rounded-xl p-6">
                <!-- Header -->
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h2 class="text-3xl font-bold text-white flex items-center gap-3">
                            <i class="fab fa-discord text-indigo-400"></i>
                            Gestion Discord & Adhérents
                        </h2>
                        <p class="text-gray-400 mt-1">Liaison des comptes Discord aux adhérents</p>
                    </div>
                    <button onclick="DiscordMembersManager.syncFromDiscord()"
                            class="btn-premium bg-indigo-600 hover:bg-indigo-700">
                        <i class="fas fa-sync-alt mr-2"></i>
                        Synchroniser Discord
                    </button>
                </div>

                <!-- Stats Cards -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <!-- Total Discord -->
                    <div class="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-lg p-4 border border-indigo-500/50">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-indigo-200 text-sm font-semibold">Membres Discord</p>
                                <p class="text-3xl font-bold text-white mt-1">${this.discordMembers.length}</p>
                            </div>
                            <i class="fab fa-discord text-5xl text-indigo-300 opacity-50"></i>
                        </div>
                    </div>

                    <!-- Liés -->
                    <div class="bg-gradient-to-br from-green-600 to-green-800 rounded-lg p-4 border border-green-500/50">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-green-200 text-sm font-semibold">Liés aux adhérents</p>
                                <p class="text-3xl font-bold text-white mt-1">${linkedCount}</p>
                            </div>
                            <i class="fas fa-link text-5xl text-green-300 opacity-50"></i>
                        </div>
                    </div>

                    <!-- Non liés -->
                    <div class="bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-lg p-4 border border-yellow-500/50">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-yellow-200 text-sm font-semibold">À lier</p>
                                <p class="text-3xl font-bold text-white mt-1">${unlinkedCount}</p>
                            </div>
                            <i class="fas fa-exclamation-triangle text-5xl text-yellow-300 opacity-50"></i>
                        </div>
                    </div>

                    <!-- Inactifs -->
                    <div class="bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg p-4 border border-gray-500/50">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-200 text-sm font-semibold">Inactifs (partis)</p>
                                <p class="text-3xl font-bold text-white mt-1">${inactiveCount}</p>
                            </div>
                            <i class="fas fa-user-slash text-5xl text-gray-300 opacity-50"></i>
                        </div>
                    </div>
                </div>

                <!-- Filtres et Recherche -->
                <div class="flex flex-col md:flex-row gap-4 mb-6">
                    <!-- Recherche -->
                    <div class="flex-1">
                        <input type="text" id="discordSearchInput"
                               placeholder="Rechercher un membre Discord ou adhérent..."
                               oninput="DiscordMembersManager.applyFilters()"
                               class="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-indigo-500 focus:outline-none">
                    </div>

                    <!-- Filtres -->
                    <div class="flex gap-2">
                        <button onclick="DiscordMembersManager.setFilter('all')"
                                class="filter-btn ${this.currentFilter === 'all' ? 'active' : ''} px-4 py-2 rounded-lg font-semibold transition">
                            Tous
                        </button>
                        <button onclick="DiscordMembersManager.setFilter('linked')"
                                class="filter-btn ${this.currentFilter === 'linked' ? 'active' : ''} px-4 py-2 rounded-lg font-semibold transition">
                            Liés
                        </button>
                        <button onclick="DiscordMembersManager.setFilter('unlinked')"
                                class="filter-btn ${this.currentFilter === 'unlinked' ? 'active' : ''} px-4 py-2 rounded-lg font-semibold transition">
                            Non liés
                        </button>
                        <button onclick="DiscordMembersManager.setFilter('inactive')"
                                class="filter-btn ${this.currentFilter === 'inactive' ? 'active' : ''} px-4 py-2 rounded-lg font-semibold transition">
                            Inactifs
                        </button>
                    </div>
                </div>

                <!-- Liste des membres -->
                <div id="discordMembersList" class="space-y-3">
                    <!-- Généré dynamiquement -->
                </div>
            </div>

            <style>
                .filter-btn {
                    background: rgba(75, 85, 99, 0.5);
                    color: #d1d5db;
                }
                .filter-btn:hover {
                    background: rgba(75, 85, 99, 0.8);
                    color: white;
                }
                .filter-btn.active {
                    background: linear-gradient(135deg, #4f46e5, #6366f1);
                    color: white;
                }
            </style>
        `;

        this.renderMembersList();
    },

    /**
     * Appliquer les filtres
     * @param filter
     */
    setFilter(filter) {
        this.currentFilter = filter;
        this.showInterface();
    },

    /**
     * Rendre la liste des membres
     */
    renderMembersList() {
        const container = document.getElementById('discordMembersList');
        if (!container) {
            return;
        }

        const searchQuery =
            document.getElementById('discordSearchInput')?.value?.toLowerCase() || '';

        // Filtrer
        let filtered = this.discordMembers.filter(dm => {
            // Filtre par statut
            if (this.currentFilter === 'linked' && !dm.member_id) {
                return false;
            }
            if (this.currentFilter === 'unlinked' && dm.member_id) {
                return false;
            }
            if (this.currentFilter === 'inactive' && dm.is_active) {
                return false;
            }
            if (this.currentFilter !== 'inactive' && !dm.is_active) {
                return false;
            }

            // Filtre par recherche
            if (searchQuery) {
                const matchDiscord =
                    dm.discord_username?.toLowerCase().includes(searchQuery) ||
                    dm.discord_global_name?.toLowerCase().includes(searchQuery) ||
                    dm.server_nickname?.toLowerCase().includes(searchQuery);

                const matchMember =
                    dm.member_name?.toLowerCase().includes(searchQuery) ||
                    dm.firstname?.toLowerCase().includes(searchQuery) ||
                    dm.lastname?.toLowerCase().includes(searchQuery);

                return matchDiscord || matchMember;
            }

            return true;
        });

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12 text-gray-400">
                    <i class="fas fa-users-slash text-6xl mb-4 opacity-50"></i>
                    <p class="text-xl font-semibold">Aucun membre trouvé</p>
                    <p class="text-sm">Essayez un autre filtre ou recherche</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(dm => this.renderMemberCard(dm)).join('');
    },

    /**
     * Rendre une carte membre
     * @param dm
     */
    renderMemberCard(dm) {
        const isLinked = !!dm.member_id;
        const isActive = dm.is_active;

        return `
            <div class="bg-gray-800/50 rounded-lg p-4 border ${isLinked ? 'border-green-500/30' : 'border-gray-700'} hover:border-indigo-500/50 transition">
                <div class="flex items-center gap-4">
                    <!-- Avatar -->
                    <div class="flex-shrink-0">
                        ${
                            dm.discord_avatar
                                ? `
                            <img src="${dm.discord_avatar}" alt="${dm.discord_username}"
                                 class="w-16 h-16 rounded-full border-2 ${isLinked ? 'border-green-500' : 'border-gray-600'}">
                        `
                                : `
                            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center border-2 ${isLinked ? 'border-green-500' : 'border-gray-600'}">
                                <i class="fab fa-discord text-2xl text-white"></i>
                            </div>
                        `
                        }
                    </div>

                    <!-- Info Discord -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                            <h3 class="text-lg font-bold text-white truncate">
                                ${dm.server_nickname || dm.discord_global_name || dm.discord_username}
                            </h3>
                            ${
                                !isActive
                                    ? `
                                <span class="text-xs bg-gray-600 text-gray-200 px-2 py-1 rounded">Inactif</span>
                            `
                                    : ''
                            }
                            ${
                                isLinked
                                    ? `
                                <span class="text-xs bg-green-600 text-white px-2 py-1 rounded flex items-center gap-1">
                                    <i class="fas fa-link"></i>
                                    Lié
                                </span>
                            `
                                    : `
                                <span class="text-xs bg-yellow-600 text-white px-2 py-1 rounded flex items-center gap-1">
                                    <i class="fas fa-unlink"></i>
                                    Non lié
                                </span>
                            `
                            }
                        </div>

                        <p class="text-sm text-gray-400 font-mono">
                            <i class="fab fa-discord mr-1"></i>
                            ${dm.discord_username}
                            ${dm.discord_discriminator ? `#${dm.discord_discriminator}` : ''}
                        </p>

                        <p class="text-xs text-gray-500">
                            <i class="fas fa-id-card mr-1"></i>
                            ID: ${dm.discord_id}
                        </p>

                        ${
                            dm.joined_at
                                ? `
                            <p class="text-xs text-gray-500 mt-1">
                                <i class="fas fa-calendar mr-1"></i>
                                Membre depuis ${new Date(dm.joined_at).toLocaleDateString('fr-FR')}
                            </p>
                        `
                                : ''
                        }

                        ${
                            isLinked
                                ? `
                            <!-- Adhérent lié -->
                            <div class="mt-2 p-2 bg-green-900/30 border border-green-500/30 rounded flex items-center gap-2">
                                <i class="fas fa-user text-green-400"></i>
                                <div class="flex-1">
                                    <p class="text-sm font-semibold text-green-100">
                                        ${dm.member_name || dm.firstname || 'Adhérent'}
                                    </p>
                                    ${
                                        dm.niveau
                                            ? `
                                        <p class="text-xs text-green-300">
                                            Niveau ${dm.niveau} • ${dm.pokemon_type || 'Normal'}
                                        </p>
                                    `
                                            : ''
                                    }
                                </div>
                                <button onclick="DiscordMembersManager.viewMemberDetails('${dm.member_id}')"
                                        class="text-green-400 hover:text-green-300 transition">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        `
                                : ''
                        }
                    </div>

                    <!-- Actions -->
                    <div class="flex-shrink-0 flex flex-col gap-2">
                        ${
                            isLinked
                                ? `
                            <button onclick="DiscordMembersManager.unlinkMember('${dm.discord_id}', '${dm.member_name?.replace(/'/g, "\\'")}', '${dm.discord_username?.replace(/'/g, "\\'")}')"
                                    class="btn-premium bg-yellow-600 hover:bg-yellow-700 text-sm">
                                <i class="fas fa-unlink mr-1"></i>
                                Délier
                            </button>
                        `
                                : `
                            ${
                                isActive
                                    ? `
                                <button onclick="DiscordMembersManager.linkMember('${dm.discord_id}', '${dm.discord_username?.replace(/'/g, "\\'")}')"
                                        class="btn-premium bg-green-600 hover:bg-green-700 text-sm">
                                    <i class="fas fa-link mr-1"></i>
                                    Lier à un adhérent
                                </button>
                            `
                                    : ''
                            }
                        `
                        }
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Lier un membre Discord à un adhérent
     * @param discordId
     * @param discordUsername
     */
    async linkMember(discordId, discordUsername) {
        // Créer la modal de sélection d'adhérent
        const modal = document.createElement('div');
        modal.className =
            'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';

        // Adhérents disponibles (sans Discord lié)
        const availableMembers = this.members.filter(m => !m.discord_id);

        modal.innerHTML = `
            <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-2xl w-full p-6 border-2 border-green-500 shadow-2xl">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-2xl font-bold text-white flex items-center gap-2">
                        <i class="fas fa-link text-green-400"></i>
                        Lier ${discordUsername} à un adhérent
                    </h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>

                <div class="mb-4">
                    <input type="text" id="linkSearchInput"
                           placeholder="Rechercher un adhérent..."
                           oninput="DiscordMembersManager.filterLinkableMembers(this.value)"
                           class="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none">
                </div>

                <div id="linkableMembersList" class="max-h-96 overflow-y-auto space-y-2">
                    ${availableMembers
                        .map(
                            member => `
                        <div class="linkable-member bg-gray-800 rounded-lg p-3 hover:bg-gray-750 cursor-pointer border border-gray-700 hover:border-green-500 transition"
                             onclick="DiscordMembersManager.confirmLink('${discordId}', '${member.id}', '${member.name.replace(/'/g, "\\'")}', '${discordUsername.replace(/'/g, "\\'")}')"
                             data-name="${member.name.toLowerCase()}" data-firstname="${(member.firstName || '').toLowerCase()}" data-lastname="${(member.lastName || '').toLowerCase()}">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center flex-shrink-0">
                                    <i class="fas fa-user text-white"></i>
                                </div>
                                <div class="flex-1">
                                    <h4 class="font-bold text-white">${member.name}</h4>
                                    ${member.email ? `<p class="text-xs text-gray-400">${member.email}</p>` : ''}
                                </div>
                                <i class="fas fa-chevron-right text-gray-500"></i>
                            </div>
                        </div>
                    `
                        )
                        .join('')}
                </div>

                ${
                    availableMembers.length === 0
                        ? `
                    <div class="text-center py-8 text-gray-400">
                        <i class="fas fa-users-slash text-4xl mb-2"></i>
                        <p>Tous les adhérents sont déjà liés à un Discord</p>
                    </div>
                `
                        : ''
                }
            </div>
        `;

        document.body.appendChild(modal);
    },

    /**
     * Filtrer les adhérents liables
     * @param query
     */
    filterLinkableMembers(query) {
        const members = document.querySelectorAll('.linkable-member');
        const lowerQuery = query.toLowerCase();

        members.forEach(member => {
            const name = member.dataset.name;
            const firstname = member.dataset.firstname;
            const lastname = member.dataset.lastname;

            const matches =
                name.includes(lowerQuery) ||
                firstname.includes(lowerQuery) ||
                lastname.includes(lowerQuery);

            member.style.display = matches ? 'block' : 'none';
        });
    },

    /**
     * Confirmer la liaison
     * @param discordId
     * @param memberId
     * @param memberName
     * @param discordUsername
     */
    async confirmLink(discordId, memberId, memberName, discordUsername) {
        const confirmed = confirm(
            `Confirmer la liaison :\n\n${discordUsername} ↔ ${memberName}\n\nCette action est réversible.`
        );

        if (!confirmed) {
            return;
        }

        try {
            const client = SupabaseManager.supabase;

            if (!client) {
                throw new Error('Supabase non initialisé');
            }

            // Appeler la fonction SQL
            const { data, error } = await client.rpc('link_discord_to_member', {
                p_discord_id: discordId,
                p_member_id: memberId,
                p_linked_by: 'Admin' // TODO: Récupérer le nom de l'admin connecté
            });

            if (error) {
                throw error;
            }

            Utils.showNotification(`✅ ${discordUsername} lié à ${memberName}`, 'success');

            // Fermer la modal
            document.querySelector('.fixed').remove();

            // Recharger les données
            await this.loadData();
            this.renderMembersList();
        } catch (error) {
            console.error('❌ Erreur liaison:', error);
            Utils.showNotification('Erreur lors de la liaison : ' + error.message, 'error');
        }
    },

    /**
     * Délier un membre
     * @param discordId
     * @param memberName
     * @param discordUsername
     */
    async unlinkMember(discordId, memberName, discordUsername) {
        const confirmed = confirm(
            `Délier ${discordUsername} de ${memberName} ?\n\nCette action est réversible.`
        );

        if (!confirmed) {
            return;
        }

        try {
            const client = SupabaseManager.supabase;

            if (!client) {
                throw new Error('Supabase non initialisé');
            }

            const { data, error } = await client.rpc('unlink_discord_from_member', {
                p_discord_id: discordId
            });

            if (error) {
                throw error;
            }

            Utils.showNotification(`✅ ${discordUsername} délié de ${memberName}`, 'success');

            await this.loadData();
            this.renderMembersList();
        } catch (error) {
            console.error('❌ Erreur déliaison:', error);
            Utils.showNotification('Erreur lors de la déliaison : ' + error.message, 'error');
        }
    },

    /**
     * Voir les détails d'un adhérent
     * @param memberId
     */
    viewMemberDetails(memberId) {
        // TODO: Ouvrir la fiche complète de l'adhérent
        console.log('Voir détails adhérent:', memberId);
        Utils.showNotification('Fonctionnalité en cours de développement', 'info');
    },

    /**
     * Synchroniser depuis Discord (déclencher le bot)
     */
    async syncFromDiscord() {
        const confirmed = confirm(
            'Lancer une synchronisation complète depuis Discord ?\n\nCela peut prendre quelques secondes.'
        );

        if (!confirmed) {
            return;
        }

        Utils.showNotification('🔄 Synchronisation en cours...', 'info');

        // TODO: Appeler l'endpoint du bot ou déclencher une sync manuelle
        // Pour l'instant, on recharge juste les données
        setTimeout(async () => {
            await this.loadData();
            this.renderMembersList();
            Utils.showNotification('✅ Synchronisation terminée', 'success');
        }, 2000);
    },

    /**
     * Appliquer les filtres (appelé lors de la recherche)
     */
    applyFilters() {
        this.renderMembersList();
    }
};

// Export global
window.DiscordMembersManager = DiscordMembersManager;
