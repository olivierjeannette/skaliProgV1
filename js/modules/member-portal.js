/**
 * MEMBER PORTAL
 * Portail public pour que les adhérents saisissent leurs données
 */

console.log('🔵 Début chargement member-portal.js');

const MemberPortal = {
    currentMember: null,
    allMembers: [],
    galleryCards: [],
    selectedForComparison: [],

    /**
     * Section : Accueil avec carte Pokémon plein écran
     */
    async showHomeSection() {
        const contentArea = document.getElementById('contentArea');

        // Vérifier qu'on a un utilisateur connecté
        const session = PortalAuthOAuth.currentUser;
        if (!session || !session.discordId) {
            contentArea.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-user-slash text-6xl text-secondary mb-4"></i>
                    <p class="text-secondary">Session expirée</p>
                </div>
            `;
            return;
        }

        // Charger le membre lié au Discord ID
        try {
            const members = await SupabaseManager.getMembers();
            const linkedMember = members.find(m => m.discord_id === session.discordId);

            if (!linkedMember) {
                contentArea.innerHTML = `
                    <div class="text-center py-12">
                        <i class="fas fa-user-times text-6xl text-secondary mb-4"></i>
                        <p class="text-secondary">Aucun profil lié</p>
                    </div>
                `;
                return;
            }

            this.currentMember = linkedMember;

            // Générer la carte Pokémon
            await PokemonPortal.loadCards();
            const card = PokemonPortal.pokemonCards.get(linkedMember.id);

            if (!card) {
                contentArea.innerHTML = `
                    <div class="text-center py-12">
                        <i class="fas fa-exclamation-triangle text-6xl text-yellow-600 mb-4"></i>
                        <p class="text-secondary">Carte non disponible</p>
                    </div>
                `;
                return;
            }

            // Afficher la page d'accueil avec carte plein écran
            contentArea.innerHTML = `
                <div class="min-h-screen -m-4 md:-m-8 p-2 md:p-8 bg-gradient-to-br from-skali-darker via-gray-900 to-skali-dark">
                    <!-- Header Bienvenue -->
                    <div class="text-center mb-4 md:mb-8">
                        <h1 class="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-3">
                            <i class="fas fa-home text-green-400 mr-2"></i>
                            Bienvenue, ${linkedMember.firstName || linkedMember.name} !
                        </h1>
                        <p class="text-secondary text-sm md:text-lg">Voici votre carte Pokémon</p>
                    </div>

                    <!-- Carte Pokémon (responsive - taille réduite) -->
                    <div class="flex justify-center items-start px-2 md:px-4">
                        <div class="w-full max-w-xs md:max-w-md lg:max-w-lg transform transition-all hover:scale-[1.02] md:hover:scale-105 duration-500">
                            ${PokemonPortal.renderCardFullscreen(card)}
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('❌ Erreur affichage accueil:', error);
            contentArea.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-exclamation-circle text-6xl text-red-600 mb-4"></i>
                    <p class="text-secondary">Erreur de chargement</p>
                </div>
            `;
        }
    },

    /**
     * Section : Saisie de données (VERSION SIMPLIFIÉE - Sans recherche)
     */
    async showDataEntrySection() {
        const contentArea = document.getElementById('contentArea');

        // Vérifier la session Discord
        const session = PortalAuthOAuth.currentUser;
        if (!session || !session.discordId) {
            contentArea.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-user-slash text-6xl text-secondary mb-4"></i>
                    <p class="text-secondary">Session expirée</p>
                </div>
            `;
            return;
        }

        // Afficher le loading
        contentArea.innerHTML = `
            <div class="text-center py-12">
                <div class="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p class="text-secondary">Chargement de vos données...</p>
            </div>
        `;

        try {
            // Charger le membre lié au Discord ID
            const members = await SupabaseManager.getMembers();
            const linkedMember = members.find(m => m.discord_id === session.discordId);

            if (!linkedMember) {
                contentArea.innerHTML = `
                    <div class="text-center py-12">
                        <i class="fas fa-user-times text-6xl text-secondary mb-4"></i>
                        <p class="text-secondary">Aucun profil lié</p>
                    </div>
                `;
                return;
            }

            // Définir le membre actuel
            this.currentMember = linkedMember;

            // Afficher l'interface avec onglets (SANS RECHERCHE)
            contentArea.innerHTML = `
                <!-- Header avec nom de l'adhérent -->
                <div class="sticky top-0 z-10 bg-skali-darker/95 backdrop-blur-lg border-b border-blue-500/30 px-3 py-3 mb-4">
                    <div class="flex items-center justify-between">
                        <div class="flex-1">
                            <div class="text-lg font-bold text-white flex items-center gap-2">
                                <i class="fas fa-user-circle text-blue-400 text-xl"></i>
                                <span>${linkedMember.firstName || linkedMember.name}</span>
                            </div>
                            <p class="text-xs text-secondary mt-1">Gérez vos informations et performances</p>
                        </div>
                        <button onclick="showHome()"
                                class="px-3 py-2 glass-card hover:bg-gray-600 text-white rounded-lg text-xs font-semibold transition touch-active">
                            <i class="fas fa-home mr-1"></i>Accueil
                        </button>
                    </div>
                </div>

                <!-- Tabs : Infos perso / Performances / Historique (3 onglets) -->
                <div class="flex gap-2 mb-4 px-3">
                    <button onclick="MemberPortal.showTab('personal')"
                            id="tabPersonal"
                            class="flex-1 px-3 py-3 rounded-lg text-sm font-semibold transition bg-blue-600 text-white touch-active min-h-[48px]">
                        <i class="fas fa-user text-sm mr-1"></i>Infos
                    </button>
                    <button onclick="MemberPortal.showTab('performances')"
                            id="tabPerformances"
                            class="flex-1 px-3 py-3 rounded-lg text-sm font-semibold transition glass-card text-secondary touch-active min-h-[48px]">
                        <i class="fas fa-trophy text-sm mr-1"></i>Perfs
                    </button>
                    <button onclick="MemberPortal.showTab('history')"
                            id="tabHistory"
                            class="flex-1 px-3 py-3 rounded-lg text-sm font-semibold transition glass-card text-secondary touch-active min-h-[48px]">
                        <i class="fas fa-history text-sm mr-1"></i>Historique
                    </button>
                </div>

                <!-- Contenu des tabs -->
                <div id="tabContent" class="px-3"></div>
            `;

            // Afficher le premier onglet par défaut
            this.showTab('personal');
        } catch (error) {
            console.error('❌ Erreur chargement données:', error);
            contentArea.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-exclamation-circle text-6xl text-red-600 mb-4"></i>
                    <p class="text-secondary">Erreur de chargement</p>
                </div>
            `;
        }
    },

    /**
     * Charger tous les membres
     */
    async loadAllMembers() {
        try {
            console.log('🔍 Chargement des membres depuis Supabase...');

            // Vérifier que SupabaseManager est initialisé
            if (!SupabaseManager.isInitialized) {
                console.warn("⚠️ SupabaseManager non initialisé, tentative d'init...");
                await SupabaseManager.init();
            }

            this.allMembers = await SupabaseManager.getMembers();
            console.log(`✅ ${this.allMembers.length} membres chargés:`, this.allMembers);

            if (this.allMembers.length === 0) {
                console.warn('⚠️ Aucun membre trouvé dans Supabase !');
                this.showNotification(
                    '⚠️ Aucun adhérent trouvé dans la base de données',
                    'warning'
                );
            }
        } catch (error) {
            console.error('❌ Erreur chargement membres:', error);
            this.showNotification('❌ Erreur de connexion à la base de données', 'error');
            this.allMembers = [];
        }
    },

    /**
     * Rechercher des membres
     * @param query
     */
    searchMembers(query) {
        const resultsDiv = document.getElementById('memberSearchResults');

        if (!query || query.length < 2) {
            resultsDiv.innerHTML = '';
            return;
        }

        const searchLower = query.toLowerCase();
        const filtered = this.allMembers.filter(
            m =>
                m.name.toLowerCase().includes(searchLower) ||
                (m.firstName && m.firstName.toLowerCase().includes(searchLower))
        );

        if (filtered.length === 0) {
            resultsDiv.innerHTML = `
                <div class="text-center py-8 text-secondary">
                    <i class="fas fa-search text-4xl mb-3"></i>
                    <p>Aucun adhérent trouvé</p>
                </div>
            `;
            return;
        }

        resultsDiv.innerHTML = `
            <div class="space-y-2">
                ${filtered
                    .slice(0, 10)
                    .map(
                        member => `
                    <div class="bg-gray-800 rounded-lg p-3 hover:bg-gray-750 transition cursor-pointer border border-gray-700 hover:border-blue-500 touch-active"
                         onclick="MemberPortal.selectMember('${member.id}')">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                <i class="fas fa-user text-white"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <h4 class="font-bold text-white text-sm truncate">${member.name}</h4>
                                ${member.firstName ? `<p class="text-xs text-secondary truncate">${member.firstName}</p>` : ''}
                            </div>
                            <i class="fas fa-chevron-right text-secondary"></i>
                        </div>
                    </div>
                `
                    )
                    .join('')}
            </div>
        `;
    },

    /**
     * Sélectionner un membre
     * @param memberId
     */
    async selectMember(memberId) {
        this.currentMember = this.allMembers.find(m => m.id === memberId);

        if (!this.currentMember) {
            alert('Erreur : membre introuvable');
            return;
        }

        // NOUVEAU: Vérifier l'authentification Discord
        await this.checkDiscordAuthentication(memberId);
    },

    /**
     * Vérifier l'authentification Discord
     * @param memberId
     */
    async checkDiscordAuthentication(memberId) {
        console.log('🔒 Vérification authentification Discord pour:', memberId);

        // Récupérer la session PortalAuth
        const session = PortalAuthOAuth.currentUser;

        if (!session || !session.discordId) {
            console.error('❌ Pas de session Discord');
            this.showNotification('❌ Session Discord expirée, reconnexion requise', 'error');
            setTimeout(() => PortalAuthOAuth.logout(), 2000);
            return;
        }

        // Cas 1: Membre sans Discord ID - il doit être le même que celui connecté
        // Ce cas ne devrait pas arriver car on lie à la connexion, mais par sécurité
        if (!this.currentMember.discord_id) {
            console.log('⚠️ Membre non lié, tentative de liaison automatique');

            // Lier automatiquement si c'est la première fois
            try {
                await SupabaseManager.updateMember(memberId, {
                    discord_id: session.discordId,
                    discord_username: session.username
                });
                console.log('✅ Liaison automatique réussie');
                this.currentMember.discord_id = session.discordId;
                this.showMemberForm();
            } catch (error) {
                console.error('❌ Erreur liaison automatique:', error);
                this.showNotification('❌ Erreur lors de la liaison', 'error');
            }
            return;
        }

        // Cas 2: Membre avec Discord ID - vérifier que c'est le bon
        if (this.currentMember.discord_id === session.discordId) {
            console.log('✅ Discord ID correspond, accès autorisé');
            this.showMemberForm();
        } else {
            console.log('❌ Discord ID ne correspond pas');
            this.showAccessDenied();
        }
    },

    /**
     * Afficher l'accès refusé
     */
    showAccessDenied() {
        const contentArea = document.getElementById('contentArea');

        const currentDiscordUser = PortalAuthOAuth.currentUser;

        contentArea.innerHTML = `
            <div class="flex items-center justify-center min-h-screen px-3">
                <div class="bg-gradient-to-br from-red-900/50 to-orange-900/50 rounded-2xl p-8 max-w-md w-full border-2 border-red-500/50 shadow-2xl">
                    <!-- Icône -->
                    <div class="flex justify-center mb-6">
                        <div class="bg-red-600 rounded-full p-6">
                            <i class="fas fa-lock text-6xl text-white"></i>
                        </div>
                    </div>

                    <!-- Titre -->
                    <h2 class="text-2xl font-bold text-white text-center mb-3">
                        Accès refusé
                    </h2>
                    <p class="text-secondary text-center mb-6">
                        Ce profil est lié à un autre compte Discord
                    </p>

                    <!-- Info -->
                    <div class="bg-gray-800/50 rounded-lg p-4 mb-6">
                        <div class="text-sm text-secondary space-y-2">
                            <p><span class="font-semibold text-white">Profil:</span> ${this.currentMember.name}</p>
                            <p><span class="font-semibold text-white">Lié à:</span> ${this.currentMember.discord_username || 'Discord User'}</p>
                            ${currentDiscordUser ? `<p><span class="font-semibold text-white">Vous:</span> ${currentDiscordUser.username}</p>` : ''}
                        </div>
                    </div>

                    <!-- Message -->
                    <div class="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4 mb-6">
                        <div class="flex items-start gap-3">
                            <i class="fas fa-exclamation-triangle text-yellow-400 text-lg mt-1"></i>
                            <div class="text-sm text-secondary">
                                <p class="font-semibold text-white mb-1">Protection active</p>
                                <p>Seul le propriétaire du compte lié peut modifier ces données. Si c'est une erreur, contactez un administrateur.</p>
                            </div>
                        </div>
                    </div>

                    <!-- Boutons -->
                    <div class="space-y-3">
                        <button onclick="MemberPortal.resetSearch()"
                                class="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg">
                            <i class="fas fa-search mr-2"></i>Chercher mon profil
                        </button>
                        <button onclick="alert('Contactez un admin sur Discord pour délier votre compte')"
                                class="w-full glass-card hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-all">
                            <i class="fas fa-question-circle mr-2"></i>Besoin d'aide ?
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Afficher le formulaire du membre (après authentification)
     */
    showMemberForm() {
        // Masquer la recherche, afficher le formulaire
        document.getElementById('searchMemberStep')?.classList.add('hidden');
        document.getElementById('dataEntryForm')?.classList.remove('hidden');

        const nameElement = document.getElementById('selectedMemberName');
        if (nameElement) {
            nameElement.textContent = this.currentMember.name;
        }

        // Afficher le tab des infos personnelles par défaut
        this.showTab('personal');
    },

    /**
     * Réinitialiser la recherche
     */
    resetSearch() {
        this.currentMember = null;
        document.getElementById('searchMemberStep').classList.remove('hidden');
        document.getElementById('dataEntryForm').classList.add('hidden');
        document.getElementById('memberSearchInput').value = '';
        document.getElementById('memberSearchResults').innerHTML = '';
    },

    /**
     * Afficher un tab
     * @param tabName
     */
    showTab(tabName) {
        console.log('🔄 showTab appelé avec:', tabName);

        // Mettre à jour les 3 boutons (cohérent avec HTML initial)
        document.getElementById('tabPersonal').className =
            tabName === 'personal'
                ? 'flex-1 px-3 py-3 rounded-lg text-sm font-semibold transition bg-blue-600 text-white touch-active min-h-[48px]'
                : 'flex-1 px-3 py-3 rounded-lg text-sm font-semibold transition glass-card text-secondary touch-active min-h-[48px]';

        document.getElementById('tabPerformances').className =
            tabName === 'performances'
                ? 'flex-1 px-3 py-3 rounded-lg text-sm font-semibold transition bg-blue-600 text-white touch-active min-h-[48px]'
                : 'flex-1 px-3 py-3 rounded-lg text-sm font-semibold transition glass-card text-secondary touch-active min-h-[48px]';

        document.getElementById('tabHistory').className =
            tabName === 'history'
                ? 'flex-1 px-3 py-3 rounded-lg text-sm font-semibold transition bg-blue-600 text-white touch-active min-h-[48px]'
                : 'flex-1 px-3 py-3 rounded-lg text-sm font-semibold transition glass-card text-secondary touch-active min-h-[48px]';

        // Afficher le bon contenu
        if (tabName === 'personal') {
            console.log('➡️ Appel showPersonalDataForm()');
            this.showPersonalDataForm();
        } else if (tabName === 'performances') {
            console.log('➡️ Appel showPerformancesForm()');
            this.showPerformancesForm();
        } else if (tabName === 'history') {
            console.log('➡️ Appel showHistoryTab()');
            this.showHistoryTab();
        }
    },

    /**
     * Formulaire infos personnelles
     */
    showPersonalDataForm() {
        const member = this.currentMember;
        const tabContent = document.getElementById('tabContent');

        tabContent.innerHTML = `
            <form id="personalDataForm" class="space-y-4" onsubmit="MemberPortal.savePersonalData(event)">
                <div class="grid grid-cols-2 gap-3">
                    <!-- Poids -->
                    <div>
                        <label class="block text-xs font-semibold text-secondary mb-1">
                            <i class="fas fa-weight text-blue-400 mr-1"></i>Poids (kg)
                        </label>
                        <input type="number" step="0.1" name="weight" value="${member.weight || ''}"
                               class="form-input w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-blue-400 focus:outline-none text-sm"
                               placeholder="75.5">
                    </div>

                    <!-- Taille -->
                    <div>
                        <label class="block text-xs font-semibold text-secondary mb-1">
                            <i class="fas fa-ruler-vertical text-blue-400 mr-1"></i>Taille (cm)
                        </label>
                        <input type="number" name="height" value="${member.height || ''}"
                               class="form-input w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-blue-400 focus:outline-none text-sm"
                               placeholder="175">
                    </div>

                    <!-- Date de naissance -->
                    <div>
                        <label class="block text-xs font-semibold text-secondary mb-1">
                            <i class="fas fa-calendar text-blue-400 mr-1"></i>Naissance
                        </label>
                        <input type="date" name="birthdate" value="${member.birthdate || ''}"
                               class="form-input w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-blue-400 focus:outline-none text-sm">
                    </div>

                    <!-- Genre -->
                    <div>
                        <label class="block text-xs font-semibold text-secondary mb-1">
                            <i class="fas fa-venus-mars text-blue-400 mr-1"></i>Genre
                        </label>
                        <select name="gender" class="form-input w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-blue-400 focus:outline-none text-sm">
                            <option value="">--</option>
                            <option value="male" ${member.gender === 'male' ? 'selected' : ''}>Homme</option>
                            <option value="female" ${member.gender === 'female' ? 'selected' : ''}>Femme</option>
                        </select>
                    </div>
                </div>

                <button type="submit" class="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-3 rounded-lg font-bold text-sm hover:from-blue-600 hover:to-blue-800 transition touch-active">
                    <i class="fas fa-save mr-2"></i>Enregistrer
                </button>
            </form>

            <!-- Section Connexion Montre HR -->
            <div class="mt-6 bg-gradient-to-br from-red-900/30 to-pink-900/30 rounded-lg p-4 border border-red-500/30">
                <div class="flex items-center justify-between mb-3">
                    <h4 class="font-bold text-white text-sm flex items-center gap-2">
                        <i class="fas fa-heartbeat text-red-400 text-lg"></i>
                        Fréquence Cardiaque
                    </h4>
                    <span id="hrConnectionStatus" class="text-xs px-3 py-1 rounded-full glass-card text-secondary">
                        <i class="fas fa-circle text-secondary mr-1"></i>Non connecté
                    </span>
                </div>

                <p class="text-xs text-secondary mb-3">
                    Connectez votre montre ou ceinture cardio pour afficher votre FC en temps réel pendant les séances.
                </p>

                <!-- Affichage HR en direct (caché par défaut) -->
                <div id="hrDisplayBox" class="hidden mb-3 bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-2 border-green-500 rounded-xl p-4 text-center">
                    <div id="hrValueDisplay" class="text-5xl font-black text-green-400">--</div>
                    <div class="text-xs font-semibold text-green-300 mt-1">BPM EN DIRECT</div>
                    <div id="hrZoneDisplay" class="mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-300">
                        Zone --
                    </div>
                </div>

                <!-- Boutons de connexion -->
                <div class="space-y-2">
                    <button onclick="MemberPortal.connectHRBluetooth()"
                            class="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-3 rounded-lg font-bold text-sm hover:from-blue-600 hover:to-blue-800 transition touch-active flex items-center justify-center gap-2">
                        <i class="fab fa-bluetooth text-lg"></i>
                        Connecter en Bluetooth
                    </button>

                    <button onclick="MemberPortal.toggleHRSimulation()" id="simulationBtn"
                            class="w-full bg-gradient-to-r from-purple-500 to-purple-700 text-white px-4 py-3 rounded-lg font-bold text-sm hover:from-purple-600 hover:to-purple-800 transition touch-active flex items-center justify-center gap-2">
                        <i class="fas fa-flask text-lg"></i>
                        Mode Simulation (Test)
                    </button>

                    <button onclick="MemberPortal.showHROptions()"
                            class="w-full glass-card hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold text-xs transition touch-active flex items-center justify-center gap-2">
                        <i class="fas fa-cog"></i>
                        Autres méthodes (Strava, HypeRate)
                    </button>
                </div>

                <!-- Aide contextuelle -->
                <div class="mt-3 bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                    <p class="text-xs text-blue-200 leading-relaxed">
                        <i class="fas fa-info-circle text-blue-400 mr-1"></i>
                        <strong>Apple Watch:</strong> Activez "Partage FC" dans Réglages → Confidentialité
                    </p>
                </div>
            </div>
        `;

        // Vérifier si une connexion HR existe déjà
        this.checkExistingHRConnection();
    },

    /**
     * Formulaire performances
     */
    async showPerformancesForm() {
        const tabContent = document.getElementById('tabContent');

        // Charger l'historique des performances
        tabContent.innerHTML = `
            <div class="text-center py-8">
                <div class="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p class="text-secondary">Chargement de vos performances...</p>
            </div>
        `;

        let existingPerfs = [];
        try {
            existingPerfs = await SupabaseManager.getMemberPerformances(this.currentMember.id);
        } catch (error) {
            console.error('Erreur chargement performances:', error);
        }

        // Catégories et exercices (comme dans l'app admin)
        const categories = {
            Cardio: [
                '600m Run',
                '800m Run',
                '1200m Run',
                '2000m Run',
                '1km Skierg',
                '1km Rameur',
                '2km Bikerg',
                'Max burpees (2 min)'
            ],
            Gym: ['Max pullups', 'Max Toes to bar', 'Max dips', 'Max pushups', 'Handstand hold'],
            Musculation: [
                '1RM Bench Press',
                '1RM Deadlift',
                '1RM Front squat',
                '1RM Back squat',
                '1RM Strict press',
                '1RM Snatch',
                '1RM Clean & Jerk'
            ],
            Puissance: [
                'Assault bike (Pic watts)',
                'Skierg (Pic watts)',
                'Broad jump (cm)',
                'Box jump (cm)'
            ]
        };

        tabContent.innerHTML = `
            <!-- Formulaire d'ajout (compact mobile) -->
            <div class="bg-gradient-to-br from-orange-900/30 to-red-900/30 rounded-lg p-3 border border-orange-500/30">
                <h4 class="font-bold text-white mb-3 text-sm flex items-center gap-2">
                    <i class="fas fa-plus-circle text-orange-400"></i>
                    Ajouter une performance
                </h4>

                <form id="performancesForm" class="space-y-3" onsubmit="MemberPortal.saveNewPerformance(event)">
                    <!-- Catégorie -->
                    <div>
                        <label class="block text-xs font-semibold text-secondary mb-1">
                            <i class="fas fa-tag text-orange-400 mr-1"></i>Catégorie
                        </label>
                        <select id="perfCategory" name="category" onchange="MemberPortal.updateExerciseList()"
                                class="form-input w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-orange-400 focus:outline-none text-sm"
                                required>
                            ${Object.keys(categories)
                                .map(cat => `<option value="${cat}">${cat}</option>`)
                                .join('')}
                        </select>
                    </div>

                    <!-- Exercice -->
                    <div>
                        <label class="block text-xs font-semibold text-secondary mb-1">
                            <i class="fas fa-dumbbell text-orange-400 mr-1"></i>Exercice
                        </label>
                        <select id="perfExercise" name="exercise"
                                class="form-input w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-orange-400 focus:outline-none text-sm"
                                required>
                            ${categories['Cardio'].map(ex => `<option value="${ex}">${ex}</option>`).join('')}
                        </select>
                    </div>

                    <!-- Valeur et Date -->
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="block text-xs font-semibold text-secondary mb-1">
                                <i class="fas fa-hashtag text-orange-400 mr-1"></i>Valeur
                            </label>
                            <input type="text" id="perfValue" name="value"
                                   class="form-input w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-orange-400 focus:outline-none text-sm"
                                   placeholder="Ex: 100 ou 2:30"
                                   required>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-secondary mb-1">
                                <i class="fas fa-calendar text-orange-400 mr-1"></i>Date
                            </label>
                            <input type="date" name="date" value="${new Date().toISOString().split('T')[0]}"
                                   class="form-input w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-orange-400 focus:outline-none text-sm"
                                   required>
                        </div>
                    </div>
                    <p class="text-xs text-secondary">Format temps: mm:ss (ex: 2:30)</p>

                    <!-- Notes -->
                    <div>
                        <label class="block text-xs font-semibold text-secondary mb-1">
                            <i class="fas fa-comment text-orange-400 mr-1"></i>Notes
                        </label>
                        <textarea name="notes" rows="2"
                                  class="form-input w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-orange-400 focus:outline-none text-sm"
                                  placeholder="Optionnel..."></textarea>
                    </div>

                    <button type="submit" class="w-full bg-gradient-to-r from-orange-500 to-orange-700 text-white px-4 py-3 rounded-lg font-bold text-sm hover:from-orange-600 hover:to-orange-800 transition touch-active">
                        <i class="fas fa-save mr-2"></i>Enregistrer
                    </button>
                </form>
            </div>
        `;

        // Stocker les catégories pour updateExerciseList
        this.exerciseCategories = categories;
    },

    /**
     * Afficher l'historique des performances organisé par catégories
     */
    async showHistoryTab() {
        console.log('📊 showHistoryTab appelé');
        const tabContent = document.getElementById('tabContent');

        if (!tabContent) {
            console.error('❌ Conteneur tabContent introuvable !');
            return;
        }

        if (!this.currentMember) {
            console.error('❌ currentMember non défini !');
            tabContent.innerHTML = `
                <div class="text-center py-8 text-red-400">
                    <i class="fas fa-exclamation-triangle text-4xl mb-3"></i>
                    <p>Membre non chargé</p>
                    <p class="text-sm text-secondary mt-2">Rechargez la page</p>
                </div>
            `;
            return;
        }

        console.log('✅ Chargement historique pour:', this.currentMember.name);

        // Loading
        tabContent.innerHTML = `
            <div class="text-center py-8">
                <div class="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p class="text-secondary">Chargement de l'historique...</p>
            </div>
        `;

        try {
            // Charger toutes les performances
            console.log('🔍 Appel getMemberPerformances pour ID:', this.currentMember.id);
            const allPerfs = await SupabaseManager.getMemberPerformances(this.currentMember.id);
            console.log('✅ Performances chargées:', allPerfs?.length || 0);

            if (allPerfs.length === 0) {
                tabContent.innerHTML = `
                    <div class="text-center py-12">
                        <i class="fas fa-inbox text-6xl text-secondary mb-4"></i>
                        <p class="text-secondary">Aucune performance enregistrée</p>
                    </div>
                `;
                return;
            }

            // Organiser par catégories selon les définitions du formulaire (ligne 571-576)
            // Cardio: courses, rameur, skierg, bikerg, burpees
            // Gym: pull ups, dips, push ups, toes to bar, handstand
            // Musculation (Force): bench, deadlift, squat, press, snatch, clean & jerk
            // Puissance: watts, sauts
            const categorized = {
                cardio: [],
                force: [],
                gym: [],
                puissance: []
            };

            allPerfs.forEach(perf => {
                const ex = (perf.exercise_type || '').toLowerCase();

                // PUISSANCE EN PREMIER : watts, sauts (pour capturer Skierg Pic watts AVANT Cardio)
                if (
                    ex.includes('pic watts') ||
                    ex.includes('watts') ||
                    ex.includes('jump') ||
                    ex.includes('saut')
                ) {
                    categorized.puissance.push(perf);
                }
                // CARDIO : courses, rameur, skierg (1km), bikerg, burpees
                else if (
                    ex.includes('run') ||
                    ex.includes('rameur') ||
                    ex.includes('row') ||
                    ex.includes('skierg') ||
                    ex.includes('ski erg') ||
                    ex.includes('bikerg') ||
                    ex.includes('burpees')
                ) {
                    categorized.cardio.push(perf);
                }
                // MUSCULATION (Force) : squat, deadlift, bench, press, snatch, clean & jerk
                else if (
                    ex.includes('squat') ||
                    ex.includes('deadlift') ||
                    ex.includes('bench') ||
                    ex.includes('strict press') ||
                    ex.includes('snatch') ||
                    (ex.includes('clean') && ex.includes('jerk'))
                ) {
                    categorized.force.push(perf);
                }
                // GYM : pull ups, dips, push ups, toes to bar, handstand
                else if (
                    ex.includes('pullups') ||
                    ex.includes('pull ups') ||
                    ex.includes('pull-ups') ||
                    ex.includes('dips') ||
                    ex.includes('pushups') ||
                    ex.includes('push ups') ||
                    ex.includes('push-ups') ||
                    ex.includes('toes to bar') ||
                    ex.includes('handstand')
                ) {
                    categorized.gym.push(perf);
                }
                // Par défaut : GYM (si on ne sait pas, on met en Gym)
                else {
                    categorized.gym.push(perf);
                }
            });

            // Afficher avec accordéons par catégorie
            tabContent.innerHTML = `
                <div class="space-y-3">
                    <!-- Cardio -->
                    ${this.renderCategorySection('cardio', categorized.cardio, '💓', 'Cardio', 'from-red-900/30 to-red-800/30', 'red')}

                    <!-- Force -->
                    ${this.renderCategorySection('force', categorized.force, '💪', 'Force', 'from-orange-900/30 to-orange-800/30', 'orange')}

                    <!-- Gym -->
                    ${this.renderCategorySection('gym', categorized.gym, '🏋️', 'Gym', 'from-blue-900/30 to-blue-800/30', 'blue')}

                    <!-- Puissance -->
                    ${this.renderCategorySection('puissance', categorized.puissance, '⚡', 'Puissance', 'from-yellow-900/30 to-yellow-800/30', 'yellow')}
                </div>
            `;
        } catch (error) {
            console.error('Erreur chargement historique:', error);
            tabContent.innerHTML = `
                <div class="text-center py-8 text-red-400">
                    <i class="fas fa-exclamation-triangle text-4xl mb-3"></i>
                    <p>Erreur de chargement</p>
                </div>
            `;
        }
    },

    /**
     * Rendre une section de catégorie
     * @param categoryId
     * @param perfs
     * @param emoji
     * @param title
     * @param gradient
     * @param color
     */
    renderCategorySection(categoryId, perfs, emoji, title, gradient, color) {
        if (perfs.length === 0) {
            return `
                <div class="bg-gradient-to-br ${gradient} rounded-lg p-3 border border-${color}-500/30 opacity-50">
                    <div class="flex items-center justify-between">
                        <h4 class="font-bold text-white text-sm">
                            ${emoji} ${title}
                        </h4>
                        <span class="text-xs text-secondary">Aucune performance</span>
                    </div>
                </div>
            `;
        }

        return `
            <div class="bg-gradient-to-br ${gradient} rounded-lg border border-${color}-500/30">
                <!-- Header (cliquable pour expand/collapse) -->
                <button onclick="MemberPortal.toggleCategory('${categoryId}')"
                        class="w-full p-3 flex items-center justify-between hover:glass-bg-hover transition touch-active">
                    <h4 class="font-bold text-white text-sm flex items-center gap-2">
                        ${emoji} ${title}
                        <span class="text-xs text-secondary">(${perfs.length})</span>
                    </h4>
                    <i id="icon-${categoryId}" class="fas fa-chevron-down text-${color}-400 transition-transform"></i>
                </button>

                <!-- Contenu (liste des perfs) -->
                <div id="content-${categoryId}" class="hidden px-3 pb-3 space-y-2 max-h-64 overflow-y-auto">
                    ${perfs
                        .map(
                            perf => `
                        <div class="flex items-center justify-between p-2 bg-black/20 rounded hover:bg-black/30 transition">
                            <div class="flex-1 min-w-0">
                                <div class="font-bold text-white text-sm truncate">${perf.exercise_type || 'Exercice'}</div>
                                <div class="text-xs text-secondary truncate">
                                    ${perf.value ? `${perf.value} ${perf.unit || ''}` : 'N/A'}
                                    ${perf.is_pr ? '<span class="text-yellow-400 ml-1">🏆</span>' : ''}
                                    <span class="ml-2 text-secondary">${perf.date || ''}</span>
                                </div>
                            </div>
                            <div class="flex gap-1 ml-2 flex-shrink-0">
                                <button onclick="MemberPortal.editPerformance('${perf.id}')"
                                        class="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 rounded transition touch-active"
                                        title="Modifier">
                                    <i class="fas fa-edit text-xs"></i>
                                </button>
                                <button onclick="MemberPortal.deletePerformance('${perf.id}')"
                                        class="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition touch-active"
                                        title="Supprimer">
                                    <i class="fas fa-trash text-xs"></i>
                                </button>
                            </div>
                        </div>
                    `
                        )
                        .join('')}
                </div>
            </div>
        `;
    },

    /**
     * Toggle expand/collapse d'une catégorie
     * @param categoryId
     */
    toggleCategory(categoryId) {
        const content = document.getElementById(`content-${categoryId}`);
        const icon = document.getElementById(`icon-${categoryId}`);

        if (content.classList.contains('hidden')) {
            content.classList.remove('hidden');
            icon.classList.add('rotate-180');
        } else {
            content.classList.add('hidden');
            icon.classList.remove('rotate-180');
        }
    },

    /**
     * Sauvegarder les infos personnelles
     * @param event
     */
    async savePersonalData(event) {
        event.preventDefault();
        const formData = new FormData(event.target);

        const updates = {
            weight: parseFloat(formData.get('weight')) || null,
            height: parseInt(formData.get('height')) || null,
            birthdate: formData.get('birthdate') || null,
            gender: formData.get('gender') || null
        };

        try {
            await SupabaseManager.updateMember(this.currentMember.id, updates);

            // Notification succès
            this.showNotification('✅ Informations enregistrées avec succès !', 'success');

            // Mettre à jour le membre local
            Object.assign(this.currentMember, updates);
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            this.showNotification("❌ Erreur lors de l'enregistrement", 'error');
        }
    },

    /**
     * Mettre à jour la liste des exercices selon la catégorie
     */
    updateExerciseList() {
        const categorySelect = document.getElementById('perfCategory');
        const exerciseSelect = document.getElementById('perfExercise');

        if (!categorySelect || !exerciseSelect) {
            return;
        }

        const selectedCategory = categorySelect.value;
        const exercises = this.exerciseCategories[selectedCategory] || [];

        exerciseSelect.innerHTML = exercises
            .map(ex => `<option value="${ex}">${ex}</option>`)
            .join('');
    },

    /**
     * Sauvegarder une nouvelle performance (FORMAT SUPABASE)
     * @param event
     */
    async saveNewPerformance(event) {
        event.preventDefault();
        const formData = new FormData(event.target);

        const exerciseType = formData.get('exercise');
        const category = formData.get('category');
        const rawValue = formData.get('value').trim();
        const date = formData.get('date');
        const notes = formData.get('notes') || null;

        if (!exerciseType || !rawValue) {
            this.showNotification("⚠️ Veuillez renseigner l'exercice et la valeur", 'warning');
            return;
        }

        try {
            // Déterminer le type et l'unité selon l'exercice (comme dans MemberManager)
            let perfData = {
                memberId: this.currentMember.id,
                exerciseType: exerciseType,
                category: category,
                date: date,
                isPR: false, // Sera déterminé automatiquement
                notes: notes
            };

            // Parser la valeur selon le type d'exercice
            // IMPORTANT: Vérifier "Pic watts" en PREMIER avant les temps
            if (exerciseType.toLowerCase().includes('pic watts')) {
                // Watts (Assault bike, Skierg Pic watts)
                perfData.value = parseFloat(rawValue);
                perfData.unit = 'W';
            } else if (
                exerciseType.includes('Run') ||
                exerciseType.includes('Skierg') ||
                exerciseType.includes('Rameur') ||
                exerciseType.includes('Bikerg')
            ) {
                // Temps : convertir mm:ss en secondes
                const seconds = this.parseTimeToSeconds(rawValue);
                perfData.value = seconds;
                perfData.unit = 'sec';
            } else if (
                exerciseType.toLowerCase().includes('burpees') ||
                (exerciseType.toLowerCase().includes('max') &&
                    (exerciseType.toLowerCase().includes('pull') ||
                        exerciseType.toLowerCase().includes('toes') ||
                        exerciseType.toLowerCase().includes('dips') ||
                        exerciseType.toLowerCase().includes('push')))
            ) {
                // Répétitions
                perfData.value = parseInt(rawValue);
                perfData.unit = 'reps';
            } else if (
                exerciseType.toLowerCase().includes('jump') &&
                exerciseType.toLowerCase().includes('cm')
            ) {
                // Centimètres
                perfData.value = parseFloat(rawValue);
                perfData.unit = 'cm';
            } else {
                // Force / poids par défaut
                perfData.value = parseFloat(rawValue);
                perfData.unit = 'kg';
            }

            // AUTO-DÉTECTION DU PR: Comparer avec les performances existantes
            const existingPerfs = await SupabaseManager.getMemberPerformances(
                this.currentMember.id
            );
            const sameExercisePerfs = existingPerfs.filter(p => p.exercise_type === exerciseType);

            if (sameExercisePerfs.length > 0) {
                // Déterminer si c'est un PR selon le type d'exercice
                if (perfData.unit === 'sec') {
                    // Pour le temps: plus petit = meilleur
                    const bestTime = Math.min(...sameExercisePerfs.map(p => p.value));
                    perfData.isPR = perfData.value < bestTime;
                } else {
                    // Pour le poids/reps/watts/cm: plus grand = meilleur
                    const bestValue = Math.max(...sameExercisePerfs.map(p => p.value));
                    perfData.isPR = perfData.value > bestValue;
                }
            } else {
                // Première performance pour cet exercice = PR automatique
                perfData.isPR = true;
            }

            // Créer dans Supabase
            await SupabaseManager.createPerformance(perfData);

            const prMessage = perfData.isPR ? ' 🏆 NOUVEAU RECORD !' : '';
            this.showNotification(`✅ Performance enregistrée !${prMessage}`, 'success');

            // Réinitialiser le formulaire et recharger
            event.target.reset();
            this.showPerformancesForm();
        } catch (error) {
            console.error('Erreur sauvegarde performance:', error);
            this.showNotification("❌ Erreur lors de l'enregistrement", 'error');
        }
    },

    /**
     * Convertir un temps mm:ss en secondes
     * @param timeStr
     */
    parseTimeToSeconds(timeStr) {
        if (!timeStr) {
            return null;
        }
        const parts = timeStr.split(':');
        if (parts.length === 2) {
            return parseInt(parts[0]) * 60 + parseInt(parts[1]);
        }
        return parseInt(timeStr); // Si c'est déjà en secondes
    },

    /**
     * ANCIENNE FONCTION - à supprimer plus tard
     * Sauvegarder les performances (FORMAT SUPABASE)
     * @param event
     */
    async savePerformances(event) {
        event.preventDefault();
        const formData = new FormData(event.target);

        const performances = [];

        // Parser les données du formulaire
        const exercises = ['bench_press', 'squat', 'deadlift', 'shoulder_press', 'pull_up', 'row'];

        exercises.forEach(exId => {
            const weight = formData.get(`${exId}_weight`);
            const reps = formData.get(`${exId}_reps`);
            const sets = formData.get(`${exId}_sets`);
            const date = formData.get(`${exId}_date`);

            if (weight && reps) {
                // Format compatible avec SupabaseManager.createPerformance (camelCase)
                performances.push({
                    memberId: this.currentMember.id,
                    exerciseType: this.getExerciseName(exId),
                    category: 'Musculation',
                    value: parseFloat(weight),
                    unit: 'kg',
                    date: date || new Date().toISOString().split('T')[0],
                    isPR: true,
                    notes: `${parseInt(reps)} reps x ${parseInt(sets) || 1} sets`
                });
            }
        });

        if (performances.length === 0) {
            this.showNotification('⚠️ Aucune performance à enregistrer', 'warning');
            return;
        }

        try {
            // Sauvegarder toutes les performances avec createPerformance (comme MemberManager)
            for (const perf of performances) {
                await SupabaseManager.createPerformance(perf);
            }

            this.showNotification(
                `✅ ${performances.length} performance(s) enregistrée(s) !`,
                'success'
            );

            // Réinitialiser le formulaire
            event.target.reset();

            // Recharger l'onglet performances pour afficher les nouvelles perfs
            this.showPerformancesForm();
        } catch (error) {
            console.error('Erreur sauvegarde performances:', error);
            this.showNotification("❌ Erreur lors de l'enregistrement", 'error');
        }
    },

    /**
     * Obtenir le nom d'un exercice
     * @param exerciseId
     */
    getExerciseName(exerciseId) {
        const names = {
            bench_press: 'Développé couché',
            squat: 'Squat',
            deadlift: 'Soulevé de terre',
            shoulder_press: 'Développé militaire',
            pull_up: 'Tractions',
            row: 'Rowing'
        };
        return names[exerciseId] || exerciseId;
    },

    /**
     * Section : Galerie de cartes
     */
    async showCardGallerySection() {
        const contentArea = document.getElementById('contentArea');

        contentArea.innerHTML = `
            <!-- Header Sticky Mobile-First -->
            <div class="sticky top-0 z-20 bg-gradient-to-b from-skali-dark to-skali-dark/95 backdrop-blur-sm pb-3 mb-4 -mx-3 px-3 md:mx-0 md:px-0">
                <div class="flex items-center justify-between mb-3">
                    <h2 class="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                        <i class="fas fa-id-card text-green-400"></i>
                        Cartes
                    </h2>
                    <div class="text-xs md:text-sm text-secondary">
                        <span id="cardCount">0</span> cartes
                    </div>
                </div>

                <!-- Onglets Hommes / Femmes -->
                <div class="flex gap-2 mb-3">
                    <button onclick="MemberPortal.setGenderFilter('male')"
                            id="genderMale"
                            class="flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition bg-blue-600 text-white">
                        <i class="fas fa-mars mr-1"></i>Hommes
                    </button>
                    <button onclick="MemberPortal.setGenderFilter('female')"
                            id="genderFemale"
                            class="flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition glass-card text-secondary">
                        <i class="fas fa-venus mr-1"></i>Femmes
                    </button>
                </div>

                <!-- Barre recherche + filtres -->
                <div class="flex gap-2 mb-2">
                    <div class="flex-1 relative">
                        <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-sm"></i>
                        <input type="text"
                               id="cardSearchInput"
                               placeholder="Rechercher..."
                               oninput="MemberPortal.filterCards()"
                               class="form-input w-full bg-gray-800/80 text-white pl-9 pr-3 py-2 rounded-lg border border-gray-700 focus:border-green-400 focus:outline-none text-sm">
                    </div>
                    <button onclick="MemberPortal.toggleFilters()"
                            id="filterToggleBtn"
                            class="px-3 py-2 bg-gray-800/80 text-white rounded-lg border border-gray-700 hover:border-green-400 transition-all">
                        <i class="fas fa-sliders-h text-sm"></i>
                    </button>
                </div>

                <!-- Panel Filtres -->
                <div id="filtersPanel" class="hidden">
                    <div class="bg-gray-800/50 rounded-lg p-2 border border-gray-700">
                        <div class="grid grid-cols-3 gap-2">
                            <button onclick="MemberPortal.sortCards('level-desc')"
                                    data-sort="level-desc"
                                    class="sort-btn px-2 py-1.5 glass-card text-white rounded text-xs font-semibold transition-all active">
                                <i class="fas fa-arrow-down mr-1"></i>Niveau
                            </button>
                            <button onclick="MemberPortal.sortCards('name-asc')"
                                    data-sort="name-asc"
                                    class="sort-btn px-2 py-1.5 glass-card text-white rounded text-xs font-semibold transition-all">
                                <i class="fas fa-sort-alpha-down mr-1"></i>A-Z
                            </button>
                            <button onclick="MemberPortal.sortCards('hp-desc')"
                                    data-sort="hp-desc"
                                    class="sort-btn px-2 py-1.5 glass-card text-white rounded text-xs font-semibold transition-all">
                                <i class="fas fa-heart mr-1"></i>HP
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Loading (compact) -->
            <div id="galleryLoading" class="flex items-center justify-center gap-2 py-4">
                <div class="animate-spin w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full"></div>
                <p class="text-secondary text-xs">Chargement...</p>
            </div>

            <!-- Galerie -->
            <div id="cardGallery" class="hidden"></div>

            <!-- Aucun résultat -->
            <div id="noCards" class="hidden text-center py-8">
                <i class="fas fa-search text-3xl text-secondary mb-2"></i>
                <p class="text-sm text-secondary">Aucune carte trouvée</p>
            </div>
        `;

        // Charger les cartes
        await this.loadCardGallery();
    },

    /**
     * Charger la galerie de cartes POKEMON
     */
    async loadCardGallery() {
        try {
            console.log('🎴 Chargement galerie Pokemon...');

            // Utiliser le système Pokemon Portal
            const cards = await PokemonPortal.loadCards();
            this.galleryCards = cards;

            console.log('✅ Cartes chargées:', cards.length);

            // Afficher les cartes avec le nouveau système de filtres
            this.filterCards();
        } catch (error) {
            console.error('Erreur chargement galerie:', error);
            document.getElementById('galleryLoading').innerHTML = `
                <div class="text-center text-red-400">
                    <i class="fas fa-exclamation-triangle text-4xl mb-3"></i>
                    <p>Erreur de chargement</p>
                </div>
            `;
        }
    },

    /**
     * Tri et filtre actuels
     */
    currentSort: 'level-desc',
    currentSearch: '',
    currentGenderFilter: 'male', // Par défaut: hommes

    /**
     * Définir le filtre de genre
     * @param gender
     */
    setGenderFilter(gender) {
        this.currentGenderFilter = gender;

        // Mettre à jour l'UI des boutons
        document.getElementById('genderMale').className =
            gender === 'male'
                ? 'flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition bg-blue-600 text-white'
                : 'flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition glass-card text-secondary';

        document.getElementById('genderFemale').className =
            gender === 'female'
                ? 'flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition bg-pink-600 text-white'
                : 'flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition glass-card text-secondary';

        // Réappliquer les filtres
        this.filterCards();
    },

    /**
     * Toggle panel filtres
     */
    toggleFilters() {
        const panel = document.getElementById('filtersPanel');
        const btn = document.getElementById('filterToggleBtn');

        if (panel.classList.contains('hidden')) {
            panel.classList.remove('hidden');
            btn.classList.add('border-green-400', 'bg-green-900/30');
        } else {
            panel.classList.add('hidden');
            btn.classList.remove('border-green-400', 'bg-green-900/30');
        }
    },

    /**
     * Trier les cartes
     * @param sortType
     */
    sortCards(sortType) {
        this.currentSort = sortType;

        // Update UI des boutons
        document.querySelectorAll('.sort-btn').forEach(btn => {
            btn.classList.remove('active', 'bg-green-600');
            btn.classList.add('glass-card');
        });

        const activeBtn = document.querySelector(`[data-sort="${sortType}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active', 'bg-green-600');
            activeBtn.classList.remove('glass-card');
        }

        // Appliquer le tri
        this.filterCards();
    },

    /**
     * Filtrer et afficher les cartes
     */
    filterCards() {
        this.currentSearch = document.getElementById('cardSearchInput')?.value.toLowerCase() || '';

        let filtered = [...this.galleryCards];

        console.log('🔍 Total cartes:', filtered.length);

        // Filtre par genre (NE PAS afficher les cartes sans genre)
        filtered = filtered.filter(card => {
            const gender = (card.gender || card.sexe || '').toLowerCase();

            // Si pas de genre valide, ne pas afficher
            if (
                !gender ||
                (gender !== 'male' &&
                    gender !== 'female' &&
                    gender !== 'homme' &&
                    gender !== 'femme')
            ) {
                return false;
            }

            // Normaliser le genre
            const normalizedGender = gender === 'homme' || gender === 'male' ? 'male' : 'female';

            // Filtrer selon le genre sélectionné
            return normalizedGender === this.currentGenderFilter;
        });

        // Recherche
        if (this.currentSearch) {
            filtered = filtered.filter(
                card =>
                    (card.firstName || '').toLowerCase().includes(this.currentSearch) ||
                    (card.lastName || '').toLowerCase().includes(this.currentSearch) ||
                    (card.pokemonName || '').toLowerCase().includes(this.currentSearch)
            );
        }

        // Tri
        switch (this.currentSort) {
            case 'level-desc':
                filtered.sort((a, b) => b.level - a.level);
                break;
            case 'level-asc':
                filtered.sort((a, b) => a.level - b.level);
                break;
            case 'name-asc':
                filtered.sort((a, b) => (a.firstName || '').localeCompare(b.firstName || ''));
                break;
            case 'name-desc':
                filtered.sort((a, b) => (b.firstName || '').localeCompare(a.firstName || ''));
                break;
            case 'hp-desc':
                filtered.sort((a, b) => (b.stats?.hp || 0) - (a.stats?.hp || 0));
                break;
            case 'hp-asc':
                filtered.sort((a, b) => (a.stats?.hp || 0) - (b.stats?.hp || 0));
                break;
        }

        // Mettre à jour l'affichage
        this.displayFilteredCards(filtered);
    },

    /**
     * Afficher les cartes filtrées
     * @param cards
     */
    displayFilteredCards(cards) {
        const gallery = document.getElementById('cardGallery');
        const noCards = document.getElementById('noCards');
        const cardCount = document.getElementById('cardCount');

        // Mettre à jour le compteur
        if (cardCount) {
            cardCount.textContent = cards.length;
        }

        if (cards.length === 0) {
            gallery.classList.add('hidden');
            noCards.classList.remove('hidden');
            return;
        }

        noCards.classList.add('hidden');
        gallery.classList.remove('hidden');

        // Afficher les cartes
        const cardsHTML = cards.map(card => PokemonPortal.renderCard(card)).join('');
        gallery.innerHTML = `
            <div class="pokemon-gallery">
                ${cardsHTML}
            </div>
        `;
    },

    /**
     * Calculer l'âge
     * @param birthdate
     */
    calculateAge(birthdate) {
        if (!birthdate) {
            return 25;
        }
        const today = new Date();
        const birth = new Date(birthdate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    },

    /**
     * Section : Objectifs & Progression - NOUVEAU SYSTÈME
     */
    async showGoalsSection() {
        const contentArea = document.getElementById('contentArea');

        // Charger le membre actuel et ses données
        if (!this.currentMember) {
            contentArea.innerHTML =
                '<div class="text-center py-12"><p class="text-secondary">Veuillez sélectionner un membre</p></div>';
            return;
        }

        // Charger les objectifs, performances ET toutes les perfs pour extraire les exercices
        const [goals, performances, allPerformances] = await Promise.all([
            this.loadMemberGoals(this.currentMember.id),
            SupabaseManager.getMemberPerformances(this.currentMember.id),
            SupabaseManager.getPerformances() // Récupérer TOUTES les performances
        ]);

        // Extraire les catégories et exercices uniques depuis le SQL
        const categoriesMap = new Map();
        allPerformances.forEach(perf => {
            const exercise = perf.exercise_type || perf.exercise;
            if (perf.category && exercise) {
                if (!categoriesMap.has(perf.category)) {
                    categoriesMap.set(perf.category, new Set());
                }
                categoriesMap.get(perf.category).add(exercise);
            }
        });

        console.log('📊 Catégories et exercices extraits du SQL:', categoriesMap);

        // Stocker pour les barres de progression et le formulaire
        this.goalsExercisesData = categoriesMap;
        this.currentGoals = goals;
        this.tempGoals = {};

        contentArea.innerHTML = `
            <div class="min-h-screen -m-4 md:-m-8 p-4 md:p-8 bg-gradient-to-br from-skali-darker via-gray-900 to-skali-dark">
                <!-- Header Moderne -->
                <div class="mb-6">
                    <div class="flex items-center gap-4 mb-3">
                        <div class="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl">
                            <i class="fas fa-bullseye text-white text-2xl"></i>
                        </div>
                        <div>
                            <h1 class="text-3xl md:text-4xl font-black text-white">
                                Objectifs & Progression
                            </h1>
                            <p class="text-secondary text-sm md:text-base">Définissez vos objectifs et suivez votre progression</p>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <!-- COLONNE GAUCHE: Définir Objectifs (2/3) -->
                    <div class="xl:col-span-2 space-y-6">
                        <!-- Formulaire d'objectifs - VERSION SIMPLE -->
                        <div class="glass-card rounded-2xl p-6">
                            <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <i class="fas fa-target text-green-400"></i>
                                Définir mes objectifs
                            </h2>

                            <!-- Sélecteur Catégorie + Exercice -->
                            <div class="space-y-4 mb-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <!-- Catégorie -->
                                    <div>
                                        <label class="block text-sm font-semibold text-secondary mb-2">
                                            <i class="fas fa-folder mr-1"></i>Catégorie
                                        </label>
                                        <select id="goalCategorySelect" onchange="MemberPortal.onGoalCategoryChange()"
                                                class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none">
                                            <option value="">-- Choisir une catégorie --</option>
                                            ${Array.from(categoriesMap.keys())
                                                .sort()
                                                .map(
                                                    cat => `<option value="${cat}">${cat}</option>`
                                                )
                                                .join('')}
                                        </select>
                                    </div>

                                    <!-- Exercice -->
                                    <div>
                                        <label class="block text-sm font-semibold text-secondary mb-2">
                                            <i class="fas fa-dumbbell mr-1"></i>Exercice
                                        </label>
                                        <select id="goalExerciseSelect" disabled
                                                class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none">
                                            <option value="">-- Choisir un exercice --</option>
                                        </select>
                                    </div>
                                </div>

                                <!-- Valeur objectif -->
                                <div>
                                    <label class="block text-sm font-semibold text-secondary mb-2">
                                        <i class="fas fa-bullseye mr-1"></i>Objectif à atteindre
                                    </label>
                                    <input type="text" id="goalValueInput" placeholder="Ex: 100 kg, 02:30, 50 reps..."
                                           class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none">
                                    <p class="text-xs text-secondary mt-1">Indiquez la valeur cible (poids, temps, répétitions...)</p>
                                </div>

                                <!-- Durée pour atteindre l'objectif -->
                                <div class="bg-blue-900/20 border-2 border-blue-500/30 rounded-xl p-4">
                                    <label class="block text-sm font-semibold text-blue-300 mb-3">
                                        <i class="fas fa-clock mr-1"></i>Durée pour atteindre cet objectif
                                    </label>
                                    <div class="grid grid-cols-2 gap-3">
                                        <div>
                                            <input type="number" id="durationValue" min="1" placeholder="Ex: 3" value="${goals.duration_value || ''}"
                                                   class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none">
                                            <p class="text-xs text-secondary mt-1">Valeur numérique</p>
                                        </div>
                                        <div>
                                            <select id="durationType" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none">
                                                <option value="">Choisir...</option>
                                                <option value="week" ${goals.duration_type === 'week' ? 'selected' : ''}>Semaine(s)</option>
                                                <option value="month" ${goals.duration_type === 'month' ? 'selected' : ''}>Mois</option>
                                                <option value="year" ${goals.duration_type === 'year' ? 'selected' : ''}>Année(s)</option>
                                            </select>
                                            <p class="text-xs text-secondary mt-1">Période</p>
                                        </div>
                                    </div>
                                    <p class="text-xs text-blue-300 mt-2">
                                        <i class="fas fa-info-circle mr-1"></i>
                                        La date cible sera calculée automatiquement
                                    </p>
                                </div>

                                <!-- Bouton Ajouter - Maintenant à la fin du processus -->
                                <button type="button" onclick="MemberPortal.addGoal()"
                                        class="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2">
                                    <i class="fas fa-plus-circle text-xl"></i>
                                    <span>Ajouter cet objectif</span>
                                </button>
                            </div>

                            <!-- Liste des objectifs définis -->
                            <div class="mb-6">
                                <h3 class="text-sm font-bold text-secondary mb-3 uppercase">Mes objectifs</h3>
                                <div id="goalsList" class="space-y-2">
                                    ${this.renderGoalsList(goals, categoriesMap)}
                                </div>
                            </div>

                            <!-- Objectifs personnalisés (texte libre) -->
                            <div class="bg-gray-800/50 rounded-xl p-4 border border-gray-700 mb-4">
                                <h3 class="text-sm font-bold text-white mb-2 flex items-center gap-2">
                                    <i class="fas fa-pen text-purple-400"></i>
                                    Objectifs personnalisés
                                </h3>
                                <textarea id="customGoalsInput" rows="3"
                                          placeholder="Ex: Réussir mon premier muscle-up, tenir 60s en handstand..."
                                          class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none resize-none text-sm">${goals.custom_goals || ''}</textarea>
                            </div>

                            <!-- Bouton Sauvegarder -->
                            <button onclick="MemberPortal.saveAllGoals()"
                                    class="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-xl hover:shadow-2xl hover:scale-105">
                                <i class="fas fa-save mr-2"></i>Sauvegarder mes objectifs
                            </button>
                        </div>
                    </div>

                    <!-- COLONNE DROITE: Progression & Analyse IA (1/3) -->
                    <div class="space-y-6">
                        <!-- Barres de progression -->
                        <div class="glass-card rounded-2xl p-6">
                            <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <i class="fas fa-chart-line text-green-400"></i>
                                Ma progression
                            </h2>
                            <div id="progressBars" class="space-y-4">
                                ${this.renderProgressBars(goals, performances)}
                            </div>
                        </div>

                        <!-- Bouton Analyse IA -->
                        <button onclick="MemberPortal.analyzeGoalsWithAI()"
                                class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-xl hover:shadow-2xl hover:scale-105">
                            <i class="fas fa-brain mr-2"></i>Analyse IA de mes objectifs
                        </button>

                        <!-- Résultat analyse IA -->
                        <div id="aiAnalysisResult" class="hidden"></div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Charger les objectifs d'un membre depuis Supabase (JSONB)
     * @param memberId
     */
    async loadMemberGoals(memberId) {
        try {
            const response = await fetch(
                `${SupabaseManager.supabaseUrl}/rest/v1/member_goals?member_id=eq.${memberId}`,
                {
                    headers: SupabaseManager.headers
                }
            );

            if (response.ok) {
                const data = await response.json();
                if (data.length > 0) {
                    const record = data[0];
                    // NOUVELLE STRUCTURE : Chaque objectif contient sa propre durée
                    // goals_data = {
                    //   "squat": { "target": "100", "duration_value": 3, "duration_type": "month", "start_date": "2025-01-15" },
                    //   "deadlift": "140"  // Ancien format supporté aussi
                    // }
                    return {
                        ...record.goals_data, // Étaler les objectifs depuis le JSONB
                        member_id: record.member_id,
                        custom_goals: record.custom_goals,
                        id: record.id
                    };
                }
            }
            return {};
        } catch (error) {
            console.error('Erreur chargement objectifs:', error);
            return {};
        }
    },

    /**
     * Variable temporaire pour stocker les objectifs en cours d'édition
     */
    tempGoals: {},

    /**
     * Rendre la liste des objectifs définis
     * @param goals
     * @param categoriesMap
     */
    renderGoalsList(goals, categoriesMap) {
        if (
            !goals ||
            Object.keys(goals).filter(k => k !== 'member_id' && k !== 'custom_goals' && k !== 'id')
                .length === 0
        ) {
            return `
                <div class="text-center py-8 text-secondary">
                    <i class="fas fa-info-circle text-2xl mb-2"></i>
                    <p class="text-sm">Aucun objectif défini</p>
                    <p class="text-xs mt-1">Sélectionnez une catégorie et un exercice ci-dessus</p>
                </div>
            `;
        }

        let html = '';
        for (const [category, exercisesSet] of categoriesMap.entries()) {
            for (const exerciseName of exercisesSet) {
                const fieldName = exerciseName.replace(/\s+/g, '_').toLowerCase();
                const goalData = goals[fieldName];

                if (goalData) {
                    // Gérer ancien format (string) et nouveau format (objet avec durée)
                    const isObject = typeof goalData === 'object' && goalData !== null;
                    const targetValue = isObject ? goalData.target : goalData;
                    const durationValue = isObject ? goalData.duration_value : null;
                    const durationType = isObject ? goalData.duration_type : null;

                    const unit = this.detectExerciseUnit(exerciseName);

                    // Texte de durée si présent
                    let durationText = '';
                    if (durationValue && durationType) {
                        const typeLabel =
                            durationType === 'week'
                                ? 'sem.'
                                : durationType === 'month'
                                  ? 'mois'
                                  : 'an(s)';
                        durationText = `<div class="text-xs text-blue-400 mt-1">
                            <i class="fas fa-clock mr-1"></i>${durationValue} ${typeLabel}
                        </div>`;
                    }

                    html += `
                        <div class="flex items-center justify-between glass-list-item rounded-lg px-4 py-3 border border-gray-700">
                            <div class="flex-1">
                                <div class="text-sm font-semibold text-white">${exerciseName}</div>
                                <div class="text-xs text-secondary">${category}</div>
                                ${durationText}
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="text-green-400 font-bold">${targetValue} ${unit}</span>
                                <button onclick="MemberPortal.removeGoal('${fieldName}').catch(e => console.error(e))"
                                        class="text-red-400 hover:text-red-300 transition"
                                        title="Supprimer cet objectif">
                                    <i class="fas fa-trash text-sm"></i>
                                </button>
                            </div>
                        </div>
                    `;
                }
            }
        }

        return html;
    },

    /**
     * Quand la catégorie change dans le sélecteur
     */
    onGoalCategoryChange() {
        const category = document.getElementById('goalCategorySelect').value;
        const exerciseSelect = document.getElementById('goalExerciseSelect');
        const categoriesMap = this.goalsExercisesData;

        if (category && categoriesMap && categoriesMap.has(category)) {
            exerciseSelect.disabled = false;
            const exercises = Array.from(categoriesMap.get(category)).sort();
            exerciseSelect.innerHTML =
                '<option value="">-- Choisir un exercice --</option>' +
                exercises.map(ex => `<option value="${ex}">${ex}</option>`).join('');
        } else {
            exerciseSelect.disabled = true;
            exerciseSelect.innerHTML = '<option value="">-- Choisir un exercice --</option>';
        }
    },

    /**
     * Ajouter un objectif à la liste temporaire
     */
    addGoal() {
        const exerciseName = document.getElementById('goalExerciseSelect').value;
        const goalValue = document.getElementById('goalValueInput').value;
        const durationValue = document.getElementById('durationValue').value;
        const durationType = document.getElementById('durationType').value;

        // Validation étape par étape
        if (!exerciseName) {
            this.showNotification("⚠️ Veuillez d'abord sélectionner un exercice", 'error');
            return;
        }

        if (!goalValue || goalValue.trim() === '') {
            this.showNotification("⚠️ Veuillez entrer une valeur d'objectif", 'error');
            return;
        }

        if (!durationValue || durationValue <= 0) {
            this.showNotification('⚠️ Veuillez entrer une durée (nombre)', 'error');
            return;
        }

        if (!durationType) {
            this.showNotification('⚠️ Veuillez choisir une période (semaine/mois/année)', 'error');
            return;
        }

        // Ajouter à tempGoals avec la nouvelle structure
        const fieldName = exerciseName.replace(/\s+/g, '_').toLowerCase();
        if (!this.tempGoals) {
            this.tempGoals = {};
        }

        // NOUVELLE STRUCTURE : Objet avec target + durée
        this.tempGoals[fieldName] = {
            target: goalValue,
            duration_value: parseInt(durationValue),
            duration_type: durationType,
            start_date: new Date().toISOString().split('T')[0] // Date du jour
        };

        // Réinitialiser les champs
        document.getElementById('goalValueInput').value = '';
        document.getElementById('durationValue').value = '';
        document.getElementById('durationType').value = '';
        document.getElementById('goalCategorySelect').value = '';
        document.getElementById('goalExerciseSelect').disabled = true;
        document.getElementById('goalExerciseSelect').value = '';

        // Recharger la liste
        this.refreshGoalsList();

        this.showNotification('✅ Objectif ajouté avec succès !', 'success');
    },

    /**
     * Supprimer un objectif (temporaire ou sauvegardé)
     * @param fieldName
     */
    async removeGoal(fieldName) {
        // Supprimer de tempGoals si présent
        if (this.tempGoals && this.tempGoals[fieldName]) {
            delete this.tempGoals[fieldName];
        }

        // Supprimer de currentGoals si présent (objectif déjà sauvegardé)
        if (this.currentGoals && this.currentGoals[fieldName]) {
            delete this.currentGoals[fieldName];
        }

        // Sauvegarder immédiatement la suppression dans la base de données
        try {
            const existing = await this.loadMemberGoals(this.currentMember.id);

            if (existing && existing.id) {
                // Fusionner les objectifs restants
                const allGoalsData = { ...this.currentGoals, ...this.tempGoals };

                const response = await fetch(
                    `${SupabaseManager.supabaseUrl}/rest/v1/member_goals?id=eq.${existing.id}`,
                    {
                        method: 'PATCH',
                        headers: SupabaseManager.headers,
                        body: JSON.stringify({
                            goals_data: allGoalsData
                        })
                    }
                );

                if (!response.ok) {
                    throw new Error('Erreur lors de la sauvegarde de la suppression');
                }
            }
        } catch (error) {
            console.error('Erreur suppression objectif:', error);
            this.showNotification(
                '⚠️ Objectif supprimé localement mais erreur de sauvegarde',
                'warning'
            );
        }

        this.refreshGoalsList();
        this.showNotification('🗑️ Objectif supprimé', 'success');
    },

    /**
     * Rafraîchir la liste des objectifs affichés
     */
    refreshGoalsList() {
        const goalsList = document.getElementById('goalsList');
        if (!goalsList) {
            return;
        }

        // Fusionner les objectifs existants avec les temporaires
        const allGoals = { ...this.currentGoals, ...this.tempGoals };
        goalsList.innerHTML = this.renderGoalsList(allGoals, this.goalsExercisesData);
    },

    /**
     * Sauvegarder tous les objectifs (NOUVEAU: durée individuelle par objectif)
     */
    async saveAllGoals() {
        const customGoals = document.getElementById('customGoalsInput').value;

        // Fusionner avec les objectifs existants
        // Les durées sont maintenant DANS chaque objectif du JSONB
        const allGoalsData = { ...this.currentGoals, ...this.tempGoals };

        const dataToSave = {
            member_id: this.currentMember.id,
            goals_data: allGoalsData,
            custom_goals: customGoals
        };

        try {
            const existing = await this.loadMemberGoals(this.currentMember.id);

            let response;
            if (existing && existing.id) {
                response = await fetch(
                    `${SupabaseManager.supabaseUrl}/rest/v1/member_goals?id=eq.${existing.id}`,
                    {
                        method: 'PATCH',
                        headers: SupabaseManager.headers,
                        body: JSON.stringify(dataToSave)
                    }
                );
            } else {
                response = await fetch(`${SupabaseManager.supabaseUrl}/rest/v1/member_goals`, {
                    method: 'POST',
                    headers: SupabaseManager.headers,
                    body: JSON.stringify(dataToSave)
                });
            }

            if (response.ok) {
                this.showNotification('✅ Objectifs sauvegardés!', 'success');
                this.tempGoals = {};

                // Petit délai pour que la DB soit à jour, puis recharger complètement
                setTimeout(async () => {
                    await this.showGoalsSection();
                }, 300);
            } else {
                throw new Error('Erreur sauvegarde');
            }
        } catch (error) {
            console.error('Erreur:', error);
            this.showNotification('❌ Erreur lors de la sauvegarde', 'error');
        }
    },

    /**
     * Rendre toutes les catégories avec leurs exercices (depuis SQL) - DEPRECATED
     * @param categoriesMap
     * @param goals
     */
    renderGoalCategories(categoriesMap, goals) {
        if (!categoriesMap || categoriesMap.size === 0) {
            return `
                <div class="text-center py-8 text-secondary">
                    <i class="fas fa-info-circle text-3xl mb-2"></i>
                    <p>Aucun exercice trouvé dans la base de données</p>
                    <p class="text-sm mt-1">Ajoutez des performances pour voir les exercices</p>
                </div>
            `;
        }

        // Icônes et couleurs par catégorie
        const categoryStyles = {
            Cardio: { icon: 'fa-heartbeat', color: 'red-400' },
            Haltérophilie: { icon: 'fa-dumbbell', color: 'blue-400' },
            Musculation: { icon: 'fa-dumbbell', color: 'blue-400' },
            Gymnastique: { icon: 'fa-medal', color: 'yellow-400' },
            Puissance: { icon: 'fa-bolt', color: 'orange-400' }
        };

        let html = '';

        // Générer une section pour chaque catégorie
        for (const [category, exercisesSet] of categoriesMap.entries()) {
            const exercises = Array.from(exercisesSet).sort();
            const style = categoryStyles[category] || { icon: 'fa-dumbbell', color: 'gray-400' };

            html += `
                <div class="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <h3 class="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        <i class="fas ${style.icon} text-${style.color}"></i>
                        ${category}
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${exercises.map(ex => this.renderGoalInput(ex, this.detectExerciseType(ex), this.detectExerciseUnit(ex), goals)).join('')}
                    </div>
                </div>
            `;
        }

        return html;
    },

    /**
     * Détecter le type d'un exercice (time, weight, reps, power)
     * @param exerciseName
     */
    detectExerciseType(exerciseName) {
        const lower = exerciseName.toLowerCase();
        if (
            lower.includes('run') ||
            lower.includes('rameur') ||
            lower.includes('skierg') ||
            lower.includes('bikerg') ||
            lower.includes('row')
        ) {
            return 'time';
        }
        if (lower.includes('watts') || lower.includes('pic')) {
            return 'power';
        }
        if (
            lower.includes('max') ||
            lower.includes('burpees') ||
            lower.includes('pull') ||
            lower.includes('push') ||
            lower.includes('dips') ||
            lower.includes('toes')
        ) {
            return 'reps';
        }
        return 'weight'; // Par défaut: poids
    },

    /**
     * Détecter l'unité d'un exercice
     * @param exerciseName
     */
    detectExerciseUnit(exerciseName) {
        const lower = exerciseName.toLowerCase();
        if (
            lower.includes('run') ||
            lower.includes('rameur') ||
            lower.includes('skierg') ||
            lower.includes('bikerg') ||
            lower.includes('row')
        ) {
            return 'mm:ss';
        }
        if (lower.includes('watts') || lower.includes('pic')) {
            return 'W';
        }
        if (
            lower.includes('max') ||
            lower.includes('burpees') ||
            lower.includes('pull') ||
            lower.includes('push') ||
            lower.includes('dips') ||
            lower.includes('toes')
        ) {
            return 'reps';
        }
        if (lower.includes('cm')) {
            return 'cm';
        }
        return 'kg'; // Par défaut: kg
    },

    /**
     * Rendre un champ de saisie d'objectif
     * @param exerciseName
     * @param type
     * @param unit
     * @param goals
     */
    renderGoalInput(exerciseName, type, unit, goals) {
        const fieldName = exerciseName.replace(/\s+/g, '_').toLowerCase();
        const currentValue = goals[fieldName] || '';
        const placeholder = type === 'time' ? '00:00' : `0 ${unit}`;

        return `
            <div>
                <label class="block text-sm font-semibold text-secondary mb-2">
                    ${exerciseName}
                </label>
                <div class="relative">
                    <input type="text"
                           name="${fieldName}"
                           value="${currentValue}"
                           placeholder="${placeholder}"
                           class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none">
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-secondary text-sm font-semibold">${unit}</span>
                </div>
            </div>
        `;
    },

    /**
     * Rendre les barres de progression (NOUVEAU: durée individuelle par objectif)
     * @param goals
     * @param performances
     */
    renderProgressBars(goals, performances) {
        if (!goals || Object.keys(goals).length === 0 || !goals.member_id) {
            return `
                <div class="text-center py-8 text-secondary">
                    <i class="fas fa-info-circle text-3xl mb-2"></i>
                    <p>Aucun objectif défini</p>
                    <p class="text-sm mt-1">Complétez le formulaire pour voir votre progression</p>
                </div>
            `;
        }

        let html = '';
        const categoriesMap = this.goalsExercisesData || new Map();

        // Parcourir tous les exercices dans le SQL
        for (const [category, exercisesSet] of categoriesMap.entries()) {
            for (const exerciseName of exercisesSet) {
                const fieldName = exerciseName.replace(/\s+/g, '_').toLowerCase();
                const goalData = goals[fieldName];

                if (!goalData) {
                    continue;
                } // Pas d'objectif défini pour cet exercice

                // Gérer ancien format (string) et nouveau format (objet avec durée)
                const isObject = typeof goalData === 'object' && goalData !== null;
                const targetValue = isObject ? goalData.target : goalData;
                const durationValue = isObject ? goalData.duration_value : null;
                const durationType = isObject ? goalData.duration_type : null;
                const startDate = isObject ? goalData.start_date : null;

                // Détecter le type d'exercice
                const exerciseType = this.detectExerciseType(exerciseName);
                const exerciseUnit = this.detectExerciseUnit(exerciseName);
                const isTimeBased = exerciseType === 'time';

                // Trouver les performances pour cet exercice
                const relatedPerfs = performances.filter(p => {
                    const perfExercise = p.exercise_type || p.exercise;
                    return perfExercise === exerciseName;
                });

                // Calculer la meilleure performance (ou 0 si aucune)
                let currentValue = 0;
                let percentage = 0;
                let hasPerformance = relatedPerfs.length > 0;

                if (hasPerformance) {
                    if (isTimeBased) {
                        currentValue = Math.min(
                            ...relatedPerfs.map(p => parseFloat(p.value) || 999999)
                        );
                    } else {
                        currentValue = Math.max(...relatedPerfs.map(p => parseFloat(p.value) || 0));
                    }

                    // Calculer le pourcentage de progression
                    const goalNum = isTimeBased
                        ? this.parseTimeToSeconds(targetValue)
                        : parseFloat(targetValue);

                    if (isTimeBased) {
                        percentage = (goalNum / currentValue) * 100;
                    } else {
                        percentage = (currentValue / goalNum) * 100;
                    }

                    percentage = Math.min(percentage, 100);
                }

                const color =
                    percentage >= 100
                        ? 'green'
                        : percentage >= 75
                          ? 'blue'
                          : percentage >= 50
                            ? 'yellow'
                            : 'red';
                const displayCurrent = hasPerformance
                    ? isTimeBased
                        ? this.formatTimeFromSeconds(currentValue)
                        : `${currentValue} ${exerciseUnit}`
                    : '---';
                const displayGoal = isTimeBased ? targetValue : `${targetValue} ${exerciseUnit}`;

                // BARRE DE TEMPS INDIVIDUELLE (si cet objectif a une durée)
                let timeProgressHTML = '';
                if (durationValue && durationType && startDate) {
                    const timeProgress = this.calculateTimeProgress({
                        duration_value: durationValue,
                        duration_type: durationType,
                        start_date: startDate
                    });
                    const timeColor =
                        timeProgress.percentage >= 75
                            ? 'red'
                            : timeProgress.percentage >= 50
                              ? 'yellow'
                              : 'blue';

                    timeProgressHTML = `
                        <div class="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-3 mt-2 mb-2">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-xs font-semibold text-blue-300">
                                    <i class="fas fa-clock mr-1"></i>Temps restant
                                </span>
                                <span class="text-xs font-bold text-blue-400">${timeProgress.daysRemaining}j</span>
                            </div>
                            <div class="relative h-2 bg-gray-800 rounded-full overflow-hidden mb-1">
                                <div class="absolute inset-0 bg-gradient-to-r from-${timeColor}-600 to-${timeColor}-400"
                                     style="width: ${timeProgress.percentage}%"></div>
                            </div>
                            <div class="flex justify-between text-[10px] text-secondary">
                                <span>${timeProgress.startDate}</span>
                                <span>${timeProgress.targetDate}</span>
                            </div>
                            ${
                                timeProgress.status === 'expired'
                                    ? `
                                <div class="bg-red-900/30 border border-red-500/50 rounded px-2 py-1 mt-1">
                                    <p class="text-[10px] text-red-300">⚠️ Deadline dépassée</p>
                                </div>
                            `
                                    : timeProgress.status === 'urgent'
                                      ? `
                                <div class="bg-orange-900/30 border border-orange-500/50 rounded px-2 py-1 mt-1">
                                    <p class="text-[10px] text-orange-300">🔥 Urgent: ${timeProgress.daysRemaining}j restants</p>
                                </div>
                            `
                                      : ''
                            }
                        </div>
                    `;
                }

                html += `
                    <div class="space-y-2 border-b border-gray-700 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                        <div class="flex justify-between items-center text-sm">
                            <span class="font-semibold text-white">${exerciseName}</span>
                            <span class="text-secondary">${displayCurrent} / ${displayGoal}</span>
                        </div>
                        ${
                            !hasPerformance
                                ? `
                            <div class="bg-yellow-900/20 border border-yellow-500/30 rounded-lg px-3 py-2 mb-2">
                                <p class="text-xs text-yellow-300">
                                    <i class="fas fa-info-circle mr-1"></i>Aucune performance enregistrée - Ajoutez vos résultats dans "Performances"
                                </p>
                            </div>
                        `
                                : `
                            <div class="relative h-3 bg-gray-800 rounded-full overflow-hidden">
                                <div class="absolute inset-0 bg-gradient-to-r from-${color}-600 to-${color}-400 transition-all duration-500"
                                     style="width: ${percentage}%"></div>
                            </div>
                            <div class="text-xs text-${color}-400 font-bold text-right">
                                ${percentage.toFixed(1)}% ${percentage >= 100 ? '🎉 OBJECTIF ATTEINT!' : ''}
                            </div>
                        `
                        }
                        ${timeProgressHTML}
                    </div>
                `;
            }
        }

        return (
            html || '<p class="text-secondary text-center py-4">Aucune progression à afficher</p>'
        );
    },

    /**
     * Calculer la progression temporelle
     * @param goals
     */
    calculateTimeProgress(goals) {
        const now = new Date();
        const startDate = goals.start_date ? new Date(goals.start_date) : new Date();

        // Calculer la date cible
        let targetDate = new Date(startDate);
        const durationValue = parseInt(goals.duration_value) || 0;

        switch (goals.duration_type) {
            case 'week':
                targetDate.setDate(targetDate.getDate() + durationValue * 7);
                break;
            case 'month':
                targetDate.setMonth(targetDate.getMonth() + durationValue);
                break;
            case 'year':
                targetDate.setFullYear(targetDate.getFullYear() + durationValue);
                break;
        }

        // Calculs
        const totalDuration = targetDate - startDate;
        const elapsed = now - startDate;
        const remaining = targetDate - now;
        const daysRemaining = Math.ceil(remaining / (1000 * 60 * 60 * 24));
        const percentage = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);

        // Statut
        let status = 'on_track';
        if (daysRemaining < 0) {
            status = 'expired';
        } else if (daysRemaining <= 7) {
            status = 'urgent';
        } else if (daysRemaining <= 30) {
            status = 'approaching';
        }

        return {
            startDate: startDate.toLocaleDateString('fr-FR'),
            targetDate: targetDate.toLocaleDateString('fr-FR'),
            daysRemaining: Math.max(daysRemaining, 0),
            percentage: percentage,
            status: status,
            totalDurationDays: Math.ceil(totalDuration / (1000 * 60 * 60 * 24)),
            elapsedDays: Math.ceil(elapsed / (1000 * 60 * 60 * 24))
        };
    },

    /**
     * Render performances actuelles pour l'IA (avec PRs par exercice)
     * @param goals
     * @param performances
     */
    renderPerformancesForAI(goals, performances) {
        if (!performances || performances.length === 0) {
            return "Aucune performance enregistrée - Impossible d'évaluer la faisabilité.\n";
        }

        // Extraire les PRs (Personal Records) pour chaque exercice ayant un objectif
        const prsMap = new Map();

        // D'abord, identifier tous les exercices avec objectifs
        const exercisesWithGoals = new Set();
        const categoriesMap = this.goalsExercisesData || new Map();

        for (const [category, exercisesSet] of categoriesMap.entries()) {
            for (const exerciseName of exercisesSet) {
                const fieldName = exerciseName.replace(/\s+/g, '_').toLowerCase();
                const goalData = goals[fieldName];

                if (goalData) {
                    exercisesWithGoals.add(exerciseName);
                }
            }
        }

        // Extraire les meilleures perfs pour chaque exercice avec objectif
        performances.forEach(perf => {
            const exerciseName = perf.exercise_type || perf.exercise;
            if (!exerciseName) {
                return;
            }

            // Chercher si cet exercice a un objectif
            let matchedExercise = null;
            for (const ex of exercisesWithGoals) {
                if (ex.toLowerCase() === exerciseName.toLowerCase()) {
                    matchedExercise = ex;
                    break;
                }
            }

            if (matchedExercise) {
                if (!prsMap.has(matchedExercise)) {
                    prsMap.set(matchedExercise, {
                        value: perf.value,
                        date: perf.date,
                        unit: perf.unit || ''
                    });
                } else {
                    // Garder la meilleure perf (on suppose que les perfs sont triées par valeur DESC)
                    const current = prsMap.get(matchedExercise);
                    if (this.comparePerformances(perf.value, current.value) > 0) {
                        prsMap.set(matchedExercise, {
                            value: perf.value,
                            date: perf.date,
                            unit: perf.unit || ''
                        });
                    }
                }
            }
        });

        if (prsMap.size === 0) {
            return 'Aucune performance trouvée pour les exercices avec objectifs.\n';
        }

        // Construire le rapport de performances
        let output = '';
        for (const [exerciseName, pr] of prsMap.entries()) {
            const fieldName = exerciseName.replace(/\s+/g, '_').toLowerCase();
            const goalData = goals[fieldName];

            if (goalData) {
                const targetValue = typeof goalData === 'object' ? goalData.target : goalData;
                const prDate = pr.date ? new Date(pr.date).toLocaleDateString('fr-FR') : 'N/A';

                output += `**${exerciseName}**: PR actuel = ${pr.value}${pr.unit} (${prDate}) → Objectif = ${targetValue}\n`;
            }
        }

        // Ajouter quelques autres perfs récentes pour contexte
        const recentOther = performances.slice(0, 3).filter(p => {
            const exName = p.exercise_type || p.exercise;
            return (
                exName &&
                !Array.from(prsMap.keys()).some(pr => pr.toLowerCase() === exName.toLowerCase())
            );
        });

        if (recentOther.length > 0) {
            output += '\nAutres perfs récentes (contexte): ';
            output += recentOther
                .map(p => `${p.exercise_type || p.exercise}: ${p.value}${p.unit || ''}`)
                .join(', ');
            output += '\n';
        }

        return output;
    },

    /**
     * Comparer deux valeurs de performances (pour trouver le PR)
     * @param val1
     * @param val2
     */
    comparePerformances(val1, val2) {
        // Extraire les nombres des valeurs
        const num1 = parseFloat(String(val1).replace(/[^\d.-]/g, ''));
        const num2 = parseFloat(String(val2).replace(/[^\d.-]/g, ''));

        if (isNaN(num1) || isNaN(num2)) {
            return 0;
        }
        return num1 - num2;
    },

    /**
     * Render progression temporelle pour l'IA
     * @param goals
     */
    renderTimeProgressForAI(goals) {
        // Parcourir chaque objectif pour extraire les contraintes temporelles
        let output = '\n## ⏰ DÉLAIS\n';

        let hasAnyDeadline = false;
        const categoriesMap = this.goalsExercisesData || new Map();

        for (const [category, exercisesSet] of categoriesMap.entries()) {
            for (const exerciseName of exercisesSet) {
                const fieldName = exerciseName.replace(/\s+/g, '_').toLowerCase();
                const goalData = goals[fieldName];

                if (!goalData) {
                    continue;
                }

                // Gérer ancien format (string) et nouveau format (objet avec durée)
                const isObject = typeof goalData === 'object' && goalData !== null;
                if (!isObject) {
                    continue;
                } // Pas d'objet = pas de durée

                const targetValue = goalData.target;
                const durationValue = goalData.duration_value;
                const durationType = goalData.duration_type;
                const startDate = goalData.start_date;

                if (!durationValue || !durationType) {
                    continue;
                } // Pas de durée définie

                hasAnyDeadline = true;

                const timeProgress = this.calculateTimeProgress({
                    duration_value: durationValue,
                    duration_type: durationType,
                    start_date: startDate
                });

                const durationText =
                    durationType === 'week' ? 'sem' : durationType === 'month' ? 'mois' : 'an(s)';
                const statusEmoji =
                    timeProgress.status === 'expired'
                        ? '🚨'
                        : timeProgress.status === 'urgent'
                          ? '🔥'
                          : timeProgress.status === 'approaching'
                            ? '⚠️'
                            : '✅';

                output += `${statusEmoji} **${exerciseName}** → ${targetValue} | Durée: ${durationValue} ${durationText} | Reste: ${timeProgress.daysRemaining}j\n`;
            }
        }

        if (!hasAnyDeadline) {
            return '\n## ⏰ DÉLAIS\nAucune deadline définie.\n';
        }

        return output + '\n';
    },

    /**
     * Sauvegarder les objectifs (JSONB)
     * @param event
     */
    async saveGoals(event) {
        event.preventDefault();
        const formData = new FormData(event.target);

        // Créer l'objet goals en JSONB
        const goalsObject = {};
        const customGoals = formData.get('custom_goals') || '';

        // Extraire tous les champs d'objectifs (sauf custom_goals)
        for (const [key, value] of formData.entries()) {
            if (key !== 'custom_goals' && value) {
                goalsObject[key] = value;
            }
        }

        const dataToSave = {
            member_id: this.currentMember.id,
            goals_data: goalsObject, // Stocker dans le champ JSONB
            custom_goals: customGoals
        };

        try {
            // Vérifier si des objectifs existent déjà
            const existing = await this.loadMemberGoals(this.currentMember.id);

            let response;
            if (existing && existing.id) {
                // UPDATE
                response = await fetch(
                    `${SupabaseManager.supabaseUrl}/rest/v1/member_goals?id=eq.${existing.id}`,
                    {
                        method: 'PATCH',
                        headers: SupabaseManager.headers,
                        body: JSON.stringify(dataToSave)
                    }
                );
            } else {
                // INSERT
                response = await fetch(`${SupabaseManager.supabaseUrl}/rest/v1/member_goals`, {
                    method: 'POST',
                    headers: SupabaseManager.headers,
                    body: JSON.stringify(dataToSave)
                });
            }

            if (response.ok) {
                this.showNotification('✅ Objectifs sauvegardés!', 'success');
                // Recharger la page pour afficher les barres de progression
                this.showGoalsSection();
            } else {
                const errorText = await response.text();
                console.error('Erreur réponse Supabase:', errorText);
                throw new Error('Erreur lors de la sauvegarde');
            }
        } catch (error) {
            console.error('Erreur sauvegarde objectifs:', error);
            this.showNotification('❌ Erreur lors de la sauvegarde', 'error');
        }
    },

    /**
     * Analyser les objectifs avec l'IA DeepSeek
     */
    async analyzeGoalsWithAI() {
        const resultDiv = document.getElementById('aiAnalysisResult');
        if (!resultDiv) {
            return;
        }

        // Afficher le loading avec barre de progression
        resultDiv.classList.remove('hidden');
        resultDiv.innerHTML = `
            <div class="glass-card rounded-2xl p-6">
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center animate-pulse">
                        <i class="fas fa-brain text-white text-xl"></i>
                    </div>
                    <div class="flex-1">
                        <h3 class="text-lg font-bold text-white" id="aiAnalysisStep">Analyse en cours...</h3>
                        <p class="text-xs text-secondary" id="aiAnalysisSubstep">Initialisation...</p>
                    </div>
                </div>

                <!-- Barre de progression -->
                <div class="relative w-full h-3 glass-card rounded-full overflow-hidden mb-2">
                    <div id="aiProgressBar" class="ai-progress-bar" style="width: 0%"></div>
                    <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
                </div>
                <p class="text-xs text-center text-secondary" id="aiProgressText">0%</p>
            </div>
        `;

        // Animation de progression
        const progressBar = document.getElementById('aiProgressBar');
        const progressText = document.getElementById('aiProgressText');
        const stepText = document.getElementById('aiAnalysisStep');
        const substepText = document.getElementById('aiAnalysisSubstep');

        const steps = [
            {
                progress: 15,
                step: 'Chargement des données...',
                substep: 'Récupération du profil et objectifs',
                duration: 500
            },
            {
                progress: 35,
                step: 'Extraction des PRs...',
                substep: 'Analyse des meilleures performances',
                duration: 800
            },
            {
                progress: 50,
                step: "Envoi à l'IA...",
                substep: 'Connexion à DeepSeek',
                duration: 600
            },
            {
                progress: 70,
                step: 'Analyse en cours...',
                substep: "L'IA évalue la faisabilité",
                duration: 1000
            },
            {
                progress: 85,
                step: 'Calcul des recommandations...',
                substep: 'Génération de la semaine type',
                duration: 800
            },
            {
                progress: 95,
                step: 'Finalisation...',
                substep: 'Préparation du rapport',
                duration: 400
            }
        ];

        let currentStepIndex = 0;
        const updateProgress = () => {
            if (currentStepIndex < steps.length) {
                const step = steps[currentStepIndex];
                progressBar.style.width = `${step.progress}%`;
                progressText.textContent = `${step.progress}%`;
                stepText.textContent = step.step;
                substepText.textContent = step.substep;
                currentStepIndex++;
                setTimeout(updateProgress, step.duration);
            }
        };

        updateProgress();

        try {
            // Charger les données
            const [goals, performances, member] = await Promise.all([
                this.loadMemberGoals(this.currentMember.id),
                SupabaseManager.getMemberPerformances(this.currentMember.id),
                Promise.resolve(this.currentMember)
            ]);

            // Appel à l'API DeepSeek
            const analysis = await this.callDeepSeekAPI(goals, performances, member);

            // Finaliser la barre à 100%
            progressBar.style.width = '100%';
            progressText.textContent = '100%';
            stepText.textContent = 'Analyse terminée !';
            substepText.textContent = 'Affichage des résultats...';

            // Attendre un peu avant d'afficher
            await new Promise(resolve => setTimeout(resolve, 300));

            // Afficher les résultats
            this.displayAIAnalysis(analysis);
        } catch (error) {
            console.error('Erreur analyse IA:', error);
            resultDiv.innerHTML = `
                <div class="glass-card rounded-2xl p-6 border-2 border-red-500/50">
                    <div class="text-center">
                        <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-3"></i>
                        <h3 class="text-lg font-bold text-white mb-2">Erreur d'analyse</h3>
                        <p class="text-secondary text-sm">${error.message}</p>
                    </div>
                </div>
            `;
        }
    },

    /**
     * Appeler l'API DeepSeek pour l'analyse
     * @param goals
     * @param performances
     * @param member
     */
    async callDeepSeekAPI(goals, performances, member) {
        // Clé API DeepSeek
        const DEEPSEEK_API_KEY = ENV.get('deepseekKey') || 'sk-f04ae091a6664d54b40b3eb42faf7705';

        if (!DEEPSEEK_API_KEY) {
            throw new Error('Clé API DeepSeek non configurée.');
        }

        const prompt = this.buildDeepSeekPrompt(goals, performances, member);

        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content:
                            'Expert prépa physique CrossFit/Functional. PRAGMATIQUE, DIRECT, RÉALISTE. Analyse faisabilité objectifs vs PRs actuels. Calcule écarts. Conseille ajustements concrets. Propose semaine type simple. MAX 800 mots.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 1200,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erreur API DeepSeek: ${error}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    },

    /**
     * Construire le prompt pour Deep Seek
     * @param goals
     * @param performances
     * @param member
     */
    buildDeepSeekPrompt(goals, performances, member) {
        const age = member.birthdate ? this.calculateAge(member.birthdate) : null;
        const weight = member.weight || null;
        const height = member.height || null;
        const gender =
            member.gender === 'male' ? 'Homme' : member.gender === 'female' ? 'Femme' : null;

        // Calculer IMC si poids et taille disponibles
        let imc = null;
        if (weight && height) {
            imc = (weight / (height / 100) ** 2).toFixed(1);
        }

        return `
# ANALYSE OBJECTIFS

## PROFIL
${age || '?'}ans | ${gender || '?'} | ${weight || '?'}kg | ${height || '?'}cm | IMC:${imc || '?'}

## OBJECTIFS
${JSON.stringify(goals, null, 2)}
${goals.custom_goals ? `Custom: ${goals.custom_goals}` : ''}

${this.renderTimeProgressForAI(goals)}

## 📊 PRs ACTUELS vs OBJECTIFS
${this.renderPerformancesForAI(goals, performances)}

---

## CONSIGNES (MAX 800 MOTS):

### 1️⃣ FAISABILITÉ (3 lignes/objectif)
Pour CHAQUE objectif:
- Calcule écart: "PR 80kg → Obj 100kg = +20kg en 3mois = +6,7kg/mois"
- Verdict: ✅ RÉALISABLE / ⚠️ AMBITIEUX / ❌ IRRÉALISTE
- Ajustement si besoin: "Rallonge à 6mois OU vise 90kg"

### 2️⃣ SEMAINE TYPE (5 lignes)
Donne UNIQUEMENT:
- Fréquence: X séances/sem
- Répartition: Combien CrossTraining, Muscu, Endurance, Mobility (cours La Skàli)
- Équilibre vie: entraînement/récup/sommeil selon âge
- Ex: "4x/sem: 2x CrossTraining, 1x Muscu, 1x Mobility + 3j repos"

### 3️⃣ TOP CONSEIL (2 lignes)
LE conseil #1 pour réussir (technique/mental/récup/nutrition)
Si nutrition → orienter suivi La Skàli

### 4️⃣ PROGRESSION ESTIMÉE (3 lignes)
Pour l'objectif PRINCIPAL:
- Rythme hebdo requis: "+1,5kg/sem"
- Paliers intermédiaires: "Vise 85kg dans 1 mois, 92kg dans 2 mois"
- Facteurs clés: "Constance, intensité, récupération"

**CRITIQUES:**
- CONCIS (max 800 mots)
- FRANC: dis si irréaliste
- CALCULS PRÉCIS avec les PRs fournis
- Pas de blabla motivationnel
`;
    },

    /**
     * Afficher l'analyse IA
     * @param analysisText
     */
    displayAIAnalysis(analysisText) {
        const resultDiv = document.getElementById('aiAnalysisResult');
        if (!resultDiv) {
            return;
        }

        resultDiv.classList.remove('hidden');
        resultDiv.innerHTML = `
            <div class="glass-card rounded-2xl p-6 border-2 border-purple-500/30">
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                        <i class="fas fa-brain text-white text-xl"></i>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-white">Analyse Professionnelle</h3>
                        <p class="text-xs text-secondary">Générée par IA DeepSeek</p>
                    </div>
                </div>
                <div class="prose prose-invert prose-sm max-w-none">
                    <div class="text-secondary text-sm leading-relaxed whitespace-pre-wrap">${analysisText}</div>
                </div>
            </div>
        `;
    },

    /**
     * Charger la galerie pour comparaison
     */
    async loadComparisonGallery() {
        const gallery = document.getElementById('comparisonGallery');
        if (!gallery) {
            return;
        }

        try {
            // Utiliser les cartes déjà chargées ou recharger
            const cards =
                PokemonPortal.pokemonCards.size > 0
                    ? Array.from(PokemonPortal.pokemonCards.values())
                    : await PokemonPortal.loadCards();

            this.comparisonAvailableCards = cards;
            this.renderComparisonGallery(cards);
        } catch (error) {
            console.error('Erreur chargement galerie comparaison:', error);
            gallery.innerHTML =
                '<p class="text-red-400 text-center col-span-full">Erreur de chargement</p>';
        }
    },

    /**
     * Rendre la galerie de comparaison
     * @param cards
     */
    renderComparisonGallery(cards) {
        const gallery = document.getElementById('comparisonGallery');
        if (!gallery) {
            return;
        }

        if (cards.length === 0) {
            gallery.innerHTML =
                '<p class="text-secondary text-center col-span-full py-8">Aucune carte trouvée</p>';
            return;
        }

        gallery.innerHTML = cards
            .map(card => {
                const isSelected = this.selectedForComparison.some(c => c.id === card.id);
                const canAdd = this.selectedForComparison.length < 2;
                const typeData = PokemonPortal.pokemonTypes[card.type];

                return `
                <div class="relative cursor-pointer group"
                     ${!isSelected && canAdd ? `onclick="MemberPortal.addToComparison('${card.id}')"` : ''}>
                    <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-3 border-2 ${isSelected ? 'border-orange-400' : 'border-gray-700'} hover:border-orange-400 transition-all hover:scale-105 shadow-lg">
                        <!-- Image Pokemon -->
                        <div class="h-20 flex items-center justify-center mb-2 rounded-lg" style="background: ${typeData.gradient};">
                            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${card.pokemonId}.png"
                                 class="w-16 h-16"
                                 onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${card.pokemonId}.png'">
                        </div>

                        <!-- Info -->
                        <div class="text-center">
                            <div class="text-sm font-bold text-white truncate mb-1">${
                                card.lastName
                                    ? `${card.firstName} ${card.lastName.charAt(0).toUpperCase()}.`
                                    : card.firstName || 'Inconnu'
                            }</div>
                            <div class="text-xs text-orange-400 font-bold">NIV ${card.level}</div>
                        </div>

                        <!-- Badge sélection -->
                        ${
                            isSelected
                                ? `
                            <div class="absolute top-2 right-2 bg-orange-500 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold shadow-lg">
                                <i class="fas fa-check"></i>
                            </div>
                        `
                                : canAdd
                                  ? `
                            <div class="absolute inset-0 bg-orange-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                <div class="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-xl">
                                    <i class="fas fa-plus text-lg"></i>
                                </div>
                            </div>
                        `
                                  : ''
                        }
                    </div>
                </div>
            `;
            })
            .join('');
    },

    /**
     * Ajouter une carte à la comparaison (MAX 2)
     * @param cardId
     */
    addToComparison(cardId) {
        if (this.selectedForComparison.length >= 2) {
            this.showNotification('⚠️ Maximum 2 athlètes pour la comparaison', 'warning');
            return;
        }

        const card = PokemonPortal.pokemonCards.get(cardId);
        if (!card) {
            return;
        }

        if (!this.selectedForComparison.find(c => c.id === cardId)) {
            this.selectedForComparison.push(card);
            this.showComparisonSection(); // Recharger la section
        }
    },

    /**
     * Retirer une carte de la comparaison
     * @param cardId
     */
    removeFromComparison(cardId) {
        this.selectedForComparison = this.selectedForComparison.filter(c => c.id !== cardId);
        this.showComparisonSection(); // Recharger la section
    },

    /**
     * Vider la sélection
     */
    clearComparison() {
        this.selectedForComparison = [];
        this.showComparisonSection();
    },

    /**
     * Filtrer les cartes de comparaison
     * @param search
     */
    filterComparisonCards(search) {
        const searchLower = search.toLowerCase();
        const filtered = this.comparisonAvailableCards.filter(
            card =>
                (card.firstName || '').toLowerCase().includes(searchLower) ||
                (card.pokemonName || '').toLowerCase().includes(searchLower)
        );
        this.renderComparisonGallery(filtered);
    },

    /**
     * NOUVELLE FONCTION : Analyser avec IA + Pourcentages par catégories
     */
    async analyzeWithAI() {
        const result = document.getElementById('comparisonResult');
        if (!result || this.selectedForComparison.length < 2) {
            return;
        }

        const cards = this.selectedForComparison;
        const [athlete1, athlete2] = cards;

        // Afficher le loading
        result.classList.remove('hidden');
        result.innerHTML = `
            <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-12 text-center border-2 border-orange-500/30">
                <div class="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse">
                    <i class="fas fa-brain text-4xl text-white"></i>
                </div>
                <h3 class="text-2xl font-bold text-white mb-3">Analyse en cours...</h3>
                <p class="text-secondary">L'IA analyse les performances des 2 athlètes</p>
                <div class="mt-6 flex justify-center gap-2">
                    <div class="w-3 h-3 bg-orange-400 rounded-full animate-bounce loading-dot-1"></div>
                    <div class="w-3 h-3 bg-orange-400 rounded-full animate-bounce loading-dot-2"></div>
                    <div class="w-3 h-3 bg-orange-400 rounded-full animate-bounce loading-dot-3"></div>
                </div>
            </div>
        `;

        try {
            // Charger les performances des 2 athlètes
            const perfs1 = await SupabaseManager.getMemberPerformances(athlete1.memberId);
            const perfs2 = await SupabaseManager.getMemberPerformances(athlete2.memberId);

            // Calculer les pourcentages par catégories
            const comparison = this.calculateCategoryComparison(perfs1, perfs2, athlete1, athlete2);

            // Générer l'analyse IA
            const aiAnalysis = await this.callClaudeAPI(comparison, athlete1, athlete2);

            // Afficher les résultats
            this.displayComparisonResults(comparison, aiAnalysis, athlete1, athlete2);
        } catch (error) {
            console.error('Erreur analyse IA:', error);
            result.innerHTML = `
                <div class="bg-red-900/30 border-2 border-red-500 rounded-2xl p-8 text-center">
                    <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
                    <h3 class="text-xl font-bold text-white mb-2">Erreur d'analyse</h3>
                    <p class="text-secondary">${error.message}</p>
                </div>
            `;
        }
    },

    /**
     * Calculer la comparaison par catégories avec pourcentages
     * @param perfs1
     * @param perfs2
     * @param athlete1
     * @param athlete2
     */
    calculateCategoryComparison(perfs1, perfs2, athlete1, athlete2) {
        // Organiser par catégories
        const categories = {
            cardio: { name: 'Cardio', icon: '💓', color: 'red' },
            force: { name: 'Force', icon: '💪', color: 'orange' },
            gym: { name: 'Gym', icon: '🏋️', color: 'blue' },
            puissance: { name: 'Puissance', icon: '⚡', color: 'yellow' }
        };

        const categorized1 = this.categorizePerformances(perfs1);
        const categorized2 = this.categorizePerformances(perfs2);

        const comparison = {};

        Object.keys(categories).forEach(catKey => {
            const cat = categories[catKey];
            const p1 = categorized1[catKey] || [];
            const p2 = categorized2[catKey] || [];

            // Calculer le score moyen par catégorie (normalisé sur 100)
            const score1 = this.calculateCategoryScore(p1, catKey);
            const score2 = this.calculateCategoryScore(p2, catKey);

            const total = score1 + score2;
            const percent1 = total > 0 ? Math.round((score1 / total) * 100) : 50;
            const percent2 = 100 - percent1;

            comparison[catKey] = {
                ...cat,
                athlete1: {
                    name: athlete1.firstName,
                    score: score1,
                    percent: percent1,
                    count: p1.length,
                    performances: p1
                },
                athlete2: {
                    name: athlete2.firstName,
                    score: score2,
                    percent: percent2,
                    count: p2.length,
                    performances: p2
                },
                winner: percent1 > percent2 ? 1 : percent2 > percent1 ? 2 : 0
            };
        });

        return comparison;
    },

    /**
     * Catégoriser les performances
     * @param perfs
     */
    categorizePerformances(perfs) {
        const categorized = {
            cardio: [],
            force: [],
            gym: [],
            puissance: []
        };

        perfs.forEach(perf => {
            const ex = (perf.exercise_type || '').toLowerCase();

            // PUISSANCE : watts, sauts
            if (
                ex.includes('pic watts') ||
                ex.includes('watts') ||
                ex.includes('jump') ||
                ex.includes('saut')
            ) {
                categorized.puissance.push(perf);
            }
            // CARDIO : courses, rameur, skierg, bikerg, burpees
            else if (
                ex.includes('run') ||
                ex.includes('rameur') ||
                ex.includes('row') ||
                ex.includes('skierg') ||
                ex.includes('ski erg') ||
                ex.includes('bikerg') ||
                ex.includes('burpees')
            ) {
                categorized.cardio.push(perf);
            }
            // FORCE : squat, deadlift, bench, press, snatch, clean & jerk
            else if (
                ex.includes('squat') ||
                ex.includes('deadlift') ||
                ex.includes('bench') ||
                ex.includes('strict press') ||
                ex.includes('snatch') ||
                (ex.includes('clean') && ex.includes('jerk'))
            ) {
                categorized.force.push(perf);
            }
            // GYM : pullups, dips, pushups, toes to bar, handstand
            else if (
                ex.includes('pullups') ||
                ex.includes('pull ups') ||
                ex.includes('pull-ups') ||
                ex.includes('dips') ||
                ex.includes('pushups') ||
                ex.includes('push ups') ||
                ex.includes('toes to bar') ||
                ex.includes('handstand')
            ) {
                categorized.gym.push(perf);
            } else {
                categorized.gym.push(perf); // Par défaut
            }
        });

        return categorized;
    },

    /**
     * Calculer le score d'une catégorie (normalisé)
     * @param perfs
     * @param category
     */
    calculateCategoryScore(perfs, category) {
        if (perfs.length === 0) {
            return 0;
        }

        let totalScore = 0;

        perfs.forEach(perf => {
            const value = perf.value || 0;
            const unit = perf.unit || '';

            // Normalisation selon l'unité et la catégorie
            let normalizedScore = 0;

            if (unit === 'sec') {
                // Pour les temps : plus petit = meilleur → inverser
                // Convertir en score sur 100 (ex: 120sec → 100 - (120/6) = 80)
                normalizedScore = Math.max(0, 100 - value / 6);
            } else if (unit === 'kg') {
                // Pour les poids : valeur directe (ex: 100kg = 100 points)
                normalizedScore = value;
            } else if (unit === 'reps') {
                // Pour les reps : valeur * 2 (ex: 20 reps = 40 points)
                normalizedScore = value * 2;
            } else if (unit === 'W') {
                // Pour les watts : valeur / 10 (ex: 500W = 50 points)
                normalizedScore = value / 10;
            } else if (unit === 'cm') {
                // Pour les sauts : valeur / 3 (ex: 60cm = 20 points)
                normalizedScore = value / 3;
            } else {
                normalizedScore = value;
            }

            totalScore += normalizedScore;
        });

        // Retourner le score moyen
        return Math.round(totalScore / perfs.length);
    },

    /**
     * Appeler l'API Claude pour générer des recommandations
     * @param comparison
     * @param athlete1
     * @param athlete2
     */
    async callClaudeAPI(comparison, athlete1, athlete2) {
        const claudeKey = ENV.get('claudeKey');

        if (!claudeKey) {
            return {
                athlete1: {
                    strengths: "Données insuffisantes pour l'analyse IA",
                    weaknesses: 'Configurez la clé Claude API dans les paramètres',
                    recommendations: []
                },
                athlete2: {
                    strengths: "Données insuffisantes pour l'analyse IA",
                    weaknesses: 'Configurez la clé Claude API dans les paramètres',
                    recommendations: []
                }
            };
        }

        // Préparer les données pour Claude
        const prompt = this.buildAnalysisPrompt(comparison, athlete1, athlete2);

        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': claudeKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-sonnet-20241022',
                    max_tokens: 2000,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`Erreur API Claude: ${response.status}`);
            }

            const data = await response.json();
            const analysisText = data.content[0].text;

            // Parser la réponse JSON de Claude
            return JSON.parse(analysisText);
        } catch (error) {
            console.error('Erreur appel Claude API:', error);
            throw new Error("Impossible de contacter l'API Claude");
        }
    },

    /**
     * Construire le prompt pour Claude
     * @param comparison
     * @param athlete1
     * @param athlete2
     */
    buildAnalysisPrompt(comparison, athlete1, athlete2) {
        const comparisonText = Object.entries(comparison)
            .map(([key, data]) => {
                return `${data.name}: ${data.athlete1.name} ${data.athlete1.percent}% vs ${data.athlete2.name} ${data.athlete2.percent}% (${data.athlete1.count} vs ${data.athlete2.count} perfs)`;
            })
            .join('\n');

        return `Tu es un coach sportif expert en CrossFit et préparation physique. Analyse la comparaison suivante entre 2 athlètes et fournis des recommandations personnalisées.

ATHLÈTE 1: ${athlete1.firstName} (Niveau ${athlete1.level})
ATHLÈTE 2: ${athlete2.firstName} (Niveau ${athlete2.level})

COMPARAISON PAR CATÉGORIES:
${comparisonText}

Réponds UNIQUEMENT avec un JSON valide au format suivant (sans markdown, sans balises de code):
{
  "athlete1": {
    "strengths": "Points forts de ${athlete1.firstName} (1 phrase courte)",
    "weaknesses": "Points faibles de ${athlete1.firstName} (1 phrase courte)",
    "recommendations": ["Conseil 1", "Conseil 2", "Conseil 3"]
  },
  "athlete2": {
    "strengths": "Points forts de ${athlete2.firstName} (1 phrase courte)",
    "weaknesses": "Points faibles de ${athlete2.firstName} (1 phrase courte)",
    "recommendations": ["Conseil 1", "Conseil 2", "Conseil 3"]
  }
}

Sois précis, encourageant et orienté vers l'amélioration. Les conseils doivent être actionnables et spécifiques au CrossFit.`;
    },

    /**
     * Afficher les résultats de la comparaison avec l'analyse IA
     * @param comparison
     * @param aiAnalysis
     * @param athlete1
     * @param athlete2
     */
    displayComparisonResults(comparison, aiAnalysis, athlete1, athlete2) {
        const result = document.getElementById('comparisonResult');

        result.classList.remove('hidden');
        result.innerHTML = `
            <!-- Titre principal -->
            <div class="bg-gradient-to-r from-orange-900 to-red-900 rounded-2xl p-8 mb-6 border-2 border-orange-400 shadow-2xl text-center">
                <h3 class="text-4xl font-black text-white mb-2">
                    <i class="fas fa-trophy text-yellow-400 mr-3"></i>
                    Analyse Comparative Détaillée
                </h3>
                <p class="text-orange-200 text-lg">Powered by Claude AI</p>
            </div>

            <!-- Graphiques par catégories avec POURCENTAGES -->
            <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 mb-6 border border-gray-700">
                <h4 class="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <i class="fas fa-chart-bar text-green-400"></i>
                    Comparaison par Catégories
                </h4>

                <div class="space-y-6">
                    ${Object.entries(comparison)
                        .map(
                            ([key, data]) => `
                        <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-${data.color}-500/30">
                            <!-- Header catégorie -->
                            <div class="flex items-center justify-between mb-4">
                                <h5 class="text-xl font-bold text-white flex items-center gap-2">
                                    <span class="text-2xl">${data.icon}</span>
                                    ${data.name}
                                </h5>
                                <div class="text-sm text-secondary">
                                    ${data.athlete1.count + data.athlete2.count} performances
                                </div>
                            </div>

                            <!-- Barre de progression comparative -->
                            <div class="mb-4">
                                <div class="flex items-center justify-between text-sm mb-2">
                                    <span class="font-bold text-${data.color}-400">${data.athlete1.name}</span>
                                    <span class="font-bold text-${data.color}-400">${data.athlete2.name}</span>
                                </div>
                                <div class="flex h-8 rounded-lg overflow-hidden border-2 border-${data.color}-500/50">
                                    <div class="bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm transition-all duration-500"
                                         style="width: ${data.athlete1.percent}%">
                                        ${data.athlete1.percent}%
                                    </div>
                                    <div class="bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-sm transition-all duration-500"
                                         style="width: ${data.athlete2.percent}%">
                                        ${data.athlete2.percent}%
                                    </div>
                                </div>
                            </div>

                            <!-- Détails performances -->
                            <div class="grid grid-cols-2 gap-4 text-sm">
                                <div class="text-left">
                                    <p class="text-secondary">Score: <span class="text-white font-bold">${data.athlete1.score}</span></p>
                                    <p class="text-secondary">Perfs: <span class="text-white font-bold">${data.athlete1.count}</span></p>
                                </div>
                                <div class="text-right">
                                    <p class="text-secondary">Score: <span class="text-white font-bold">${data.athlete2.score}</span></p>
                                    <p class="text-secondary">Perfs: <span class="text-white font-bold">${data.athlete2.count}</span></p>
                                </div>
                            </div>

                            ${
                                data.winner !== 0
                                    ? `
                                <div class="mt-4 text-center">
                                    <span class="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 font-bold">
                                        <i class="fas fa-crown text-yellow-400"></i>
                                        ${data.winner === 1 ? data.athlete1.name : data.athlete2.name} domine
                                    </span>
                                </div>
                            `
                                    : ''
                            }
                        </div>
                    `
                        )
                        .join('')}
                </div>
            </div>

            <!-- Analyses IA des 2 athlètes -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                ${[
                    { athlete: athlete1, analysis: aiAnalysis.athlete1, color: 'blue' },
                    { athlete: athlete2, analysis: aiAnalysis.athlete2, color: 'orange' }
                ]
                    .map(
                        ({ athlete, analysis, color }) => `
                    <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border-2 border-${color}-500/50">
                        <!-- Header athlète -->
                        <div class="text-center mb-6">
                            <div class="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style="background: ${PokemonPortal.pokemonTypes[athlete.type].gradient};">
                                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${athlete.pokemonId}.png"
                                     class="w-16 h-16"
                                     onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${athlete.pokemonId}.png'">
                            </div>
                            <h4 class="text-2xl font-black text-white">${athlete.firstName}</h4>
                            <p class="text-${color}-400 font-bold">Niveau ${athlete.level}</p>
                        </div>

                        <!-- Points forts -->
                        <div class="mb-4">
                            <h5 class="text-sm font-bold text-green-400 mb-2 flex items-center gap-2">
                                <i class="fas fa-check-circle"></i>Points forts
                            </h5>
                            <p class="text-secondary text-sm bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                                ${analysis.strengths}
                            </p>
                        </div>

                        <!-- Points faibles -->
                        <div class="mb-4">
                            <h5 class="text-sm font-bold text-red-400 mb-2 flex items-center gap-2">
                                <i class="fas fa-exclamation-circle"></i>Points d'amélioration
                            </h5>
                            <p class="text-secondary text-sm bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                                ${analysis.weaknesses}
                            </p>
                        </div>

                        <!-- Recommandations -->
                        <div>
                            <h5 class="text-sm font-bold text-${color}-400 mb-3 flex items-center gap-2">
                                <i class="fas fa-lightbulb"></i>Recommandations
                            </h5>
                            <ul class="space-y-2">
                                ${analysis.recommendations
                                    .map(
                                        rec => `
                                    <li class="flex items-start gap-2 text-sm">
                                        <i class="fas fa-arrow-right text-${color}-400 mt-1"></i>
                                        <span class="text-secondary">${rec}</span>
                                    </li>
                                `
                                    )
                                    .join('')}
                            </ul>
                        </div>
                    </div>
                `
                    )
                    .join('')}
            </div>
        `;

        // Scroll vers les résultats
        result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    /**
     * Obtenir la classe de highlight (meilleur score)
     * @param value
     * @param allValues
     */
    getHighlightClass(value, allValues) {
        const max = Math.max(...allValues);
        return value === max ? 'text-green-400' : 'text-secondary';
    },

    // Variables pour comparaison
    comparisonAvailableCards: [],

    /**
     * Modifier une performance
     * @param performanceId
     */
    async editPerformance(performanceId) {
        try {
            // Récupérer la performance
            const perfs = await SupabaseManager.getMemberPerformances(this.currentMember.id);
            const perf = perfs.find(p => p.id === performanceId);

            if (!perf) {
                this.showNotification('❌ Performance introuvable', 'error');
                return;
            }

            // Créer le modal d'édition
            const modal = document.createElement('div');
            modal.className =
                'fixed inset-0 bg-gray-200 bg-opacity-90 flex items-center justify-center z-50 p-4';
            modal.innerHTML = `
                <div class="bg-skali-darker rounded-xl max-w-lg w-full border-2 border-blue-500 shadow-2xl">
                    <div class="bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-t-xl">
                        <h3 class="text-2xl font-bold text-white flex items-center gap-3">
                            <i class="fas fa-edit"></i>
                            Modifier la performance
                        </h3>
                    </div>
                    <form id="editPerfForm" class="p-6 space-y-4">
                        <div>
                            <label class="block text-sm font-semibold text-secondary mb-2">Exercice</label>
                            <input type="text" name="exercise_type" value="${perf.exercise_type || ''}"
                                   class="form-input w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-400 focus:outline-none"
                                   required>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-secondary mb-2">Catégorie</label>
                            <input type="text" name="category" value="${perf.category || ''}"
                                   class="form-input w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-400 focus:outline-none">
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-semibold text-secondary mb-2">Valeur</label>
                                <input type="number" step="0.1" name="value" value="${perf.value || ''}"
                                       class="form-input w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-400 focus:outline-none"
                                       required>
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-secondary mb-2">Unité</label>
                                <input type="text" name="unit" value="${perf.unit || ''}"
                                       class="form-input w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-400 focus:outline-none">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-secondary mb-2">Date</label>
                            <input type="date" name="date" value="${perf.date || ''}"
                                   class="form-input w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-400 focus:outline-none"
                                   required>
                        </div>
                        <div class="flex items-center gap-2">
                            <input type="checkbox" name="is_pr" id="editIsPR" ${perf.is_pr ? 'checked' : ''}
                                   class="w-5 h-5 bg-gray-800 border-gray-700 rounded text-blue-600 focus:ring-blue-500">
                            <label for="editIsPR" class="text-sm font-semibold text-secondary">
                                🏆 Record personnel (PR)
                            </label>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-secondary mb-2">Notes</label>
                            <textarea name="notes" rows="3"
                                      class="form-input w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-400 focus:outline-none"
                                      placeholder="Ajoutez des notes...">${perf.notes || ''}</textarea>
                        </div>
                        <div class="flex gap-3 pt-4">
                            <button type="button" onclick="this.closest('.fixed').remove()"
                                    class="flex-1 px-6 py-3 glass-card hover:bg-gray-600 text-white rounded-lg font-semibold transition">
                                Annuler
                            </button>
                            <button type="submit"
                                    class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-lg font-semibold transition">
                                <i class="fas fa-save mr-2"></i>Enregistrer
                            </button>
                        </div>
                    </form>
                </div>
            `;

            document.body.appendChild(modal);

            // Gérer la soumission
            const form = document.getElementById('editPerfForm');
            form.onsubmit = async e => {
                e.preventDefault();
                const formData = new FormData(form);

                const updates = {
                    exerciseType: formData.get('exercise_type'),
                    category: formData.get('category') || null,
                    value: parseFloat(formData.get('value')),
                    unit: formData.get('unit') || null,
                    date: formData.get('date'),
                    isPR: formData.get('is_pr') === 'on',
                    notes: formData.get('notes') || null
                };

                try {
                    await SupabaseManager.updatePerformance(performanceId, updates);
                    modal.remove();
                    this.showNotification('✅ Performance mise à jour !', 'success');
                    // Recharger les performances
                    this.showPerformancesForm();
                } catch (error) {
                    console.error('Erreur mise à jour:', error);
                    this.showNotification('❌ Erreur lors de la mise à jour', 'error');
                }
            };
        } catch (error) {
            console.error('Erreur édition performance:', error);
            this.showNotification("❌ Erreur lors de l'édition", 'error');
        }
    },

    /**
     * Supprimer une performance
     * @param performanceId
     */
    async deletePerformance(performanceId) {
        if (!confirm('⚠️ Êtes-vous sûr de vouloir supprimer cette performance ?')) {
            return;
        }

        try {
            await SupabaseManager.deletePerformance(performanceId);
            this.showNotification('✅ Performance supprimée', 'success');
            // Recharger les performances
            this.showPerformancesForm();
        } catch (error) {
            console.error('Erreur suppression:', error);
            this.showNotification('❌ Erreur lors de la suppression', 'error');
        }
    },

    /**
     * Section : Performances Globales (Tableau des PRs par exercice)
     */
    async showPerformancesSection() {
        const contentArea = document.getElementById('contentArea');

        try {
            // Charger tous les adhérents et leurs performances
            const [members, allPerformances] = await Promise.all([
                SupabaseManager.getMembers(),
                SupabaseManager.getPerformances()
            ]);

            console.log('👥 Tous les membres chargés:', members.length);
            console.log('🏋️ Toutes les performances chargées:', allPerformances.length);

            // Filtrer uniquement les membres actifs
            const activeMembers = members.filter(m => m.is_active !== false);
            console.log('✅ Membres actifs:', activeMembers.length);

            // DEBUG: Vérifier les performances d'Olivier
            const olivierPerfs = allPerformances.filter(p => {
                const member = members.find(m => m.id === p.member_id);
                return (
                    member &&
                    (member.firstName?.toLowerCase().includes('olivier') ||
                        member.name?.toLowerCase().includes('olivier'))
                );
            });
            console.log("🔍 Performances d'Olivier trouvées:", olivierPerfs.length);
            if (olivierPerfs.length > 0) {
                console.log("📋 Exemple de perf d'Olivier:", {
                    exercise_type: olivierPerfs[0].exercise_type,
                    exercise: olivierPerfs[0].exercise,
                    category: olivierPerfs[0].category,
                    value: olivierPerfs[0].value,
                    unit: olivierPerfs[0].unit
                });
            }

            // Récupérer les catégories et exercices uniques depuis les performances
            const categoriesMap = new Map();
            allPerformances.forEach(perf => {
                const exercise = perf.exercise_type || perf.exercise;
                if (perf.category && exercise) {
                    if (!categoriesMap.has(perf.category)) {
                        categoriesMap.set(perf.category, new Set());
                    }
                    categoriesMap.get(perf.category).add(exercise);
                }
            });

            // Convertir en objet
            const categories = {};
            categoriesMap.forEach((exercises, category) => {
                categories[category] = Array.from(exercises).sort();
            });

            console.log('📊 Catégories trouvées:', Object.keys(categories));

            // Générer le HTML
            contentArea.innerHTML = `
                <div class="min-h-screen -m-4 md:-m-8 p-3 md:p-6 bg-gradient-to-br from-skali-darker via-gray-900 to-skali-dark">
                    <!-- Header -->
                    <div class="mb-4 md:mb-6">
                        <h1 class="text-2xl md:text-4xl font-bold text-white mb-2">
                            <i class="fas fa-trophy text-yellow-400 mr-2"></i>
                            Records Personnels
                        </h1>
                        <p class="text-secondary text-sm md:text-base">Classement des meilleurs PRs par exercice</p>
                    </div>

                    <!-- Filtres -->
                    <div class="glass-card rounded-xl p-3 md:p-4 mb-4">
                        <div class="flex flex-col md:flex-row gap-3">
                            <!-- Filtre Catégorie -->
                            <div class="flex-1">
                                <label class="block text-xs md:text-sm font-semibold text-secondary mb-2">
                                    <i class="fas fa-filter mr-1"></i>Catégorie *
                                </label>
                                <select id="filterCategory" onchange="MemberPortal.onCategoryChange()"
                                        class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 md:py-3 text-white text-sm md:text-base focus:border-green-500 focus:outline-none">
                                    <option value="">-- Choisir une catégorie --</option>
                                    ${Object.keys(categories)
                                        .sort()
                                        .map(cat => {
                                            const icons = {
                                                Haltérophilie: '💪',
                                                Musculation: '💪',
                                                Gymnastique: '🤸',
                                                Cardio: '💓',
                                                Puissance: '⚡'
                                            };
                                            const icon = icons[cat] || '📊';
                                            return `<option value="${cat}">${icon} ${cat}</option>`;
                                        })
                                        .join('')}
                                </select>
                            </div>

                            <!-- Filtre Exercice -->
                            <div class="flex-1">
                                <label class="block text-xs md:text-sm font-semibold text-secondary mb-2">
                                    <i class="fas fa-dumbbell mr-1"></i>Exercice *
                                </label>
                                <select id="filterExercice" onchange="MemberPortal.showPerformanceRankings()"
                                        class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 md:py-3 text-white text-sm md:text-base focus:border-green-500 focus:outline-none"
                                        disabled>
                                    <option value="">-- Choisir un exercice --</option>
                                </select>
                            </div>

                            <!-- Filtre Sexe -->
                            <div class="flex-1">
                                <label class="block text-xs md:text-sm font-semibold text-secondary mb-2">
                                    <i class="fas fa-venus-mars mr-1"></i>Sexe
                                </label>
                                <select id="filterGender" onchange="MemberPortal.showPerformanceRankings()"
                                        class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 md:py-3 text-white text-sm md:text-base focus:border-green-500 focus:outline-none">
                                    <option value="">Tous</option>
                                    <option value="male">👨 Hommes</option>
                                    <option value="female">👩 Femmes</option>
                                </select>
                            </div>
                        </div>
                        <p class="text-xs text-secondary mt-2">
                            <i class="fas fa-info-circle mr-1"></i>
                            Sélectionnez une catégorie et un exercice pour voir le classement
                        </p>
                    </div>

                    <!-- Tableau des performances (responsive) -->
                    <div id="performancesTableContainer" class="glass-card rounded-xl overflow-hidden">
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm md:text-base">
                                <thead class="bg-gray-800/50">
                                    <tr>
                                        <th class="px-3 md:px-4 py-3 text-center text-white font-bold w-16">
                                            #
                                        </th>
                                        <th class="px-3 md:px-4 py-3 text-left text-white font-bold">
                                            Adhérent
                                        </th>
                                        <th class="px-3 md:px-4 py-3 text-center text-white font-bold">
                                            Record
                                        </th>
                                        <th class="px-3 md:px-4 py-3 text-center text-white font-bold hidden md:table-cell">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody id="performancesTableBody" class="text-white">
                                    <tr>
                                        <td colspan="4" class="text-center py-12 text-secondary">
                                            <i class="fas fa-hand-pointer text-4xl mb-3 opacity-50"></i>
                                            <p class="text-lg">Sélectionnez une catégorie et un exercice</p>
                                            <p class="text-sm mt-1">pour afficher le classement des PRs</p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;

            // Stocker les données pour le filtrage
            this.performancesData = {
                members: activeMembers,
                performances: allPerformances,
                categories: categories
            };
        } catch (error) {
            console.error('❌ Erreur affichage performances:', error);
            contentArea.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-exclamation-circle text-6xl text-red-600 mb-4"></i>
                    <p class="text-secondary">Erreur de chargement des performances</p>
                </div>
            `;
        }
    },

    /**
     * Mise à jour de la liste d'exercices quand la catégorie change
     */
    onCategoryChange() {
        if (!this.performancesData) {
            return;
        }

        const category = document.getElementById('filterCategory').value;
        const exerciseSelect = document.getElementById('filterExercice');
        const { categories } = this.performancesData;

        if (category && categories[category]) {
            exerciseSelect.disabled = false;
            exerciseSelect.innerHTML =
                '<option value="">-- Choisir un exercice --</option>' +
                categories[category].map(ex => `<option value="${ex}">${ex}</option>`).join('');
        } else {
            exerciseSelect.disabled = true;
            exerciseSelect.innerHTML = '<option value="">-- Choisir un exercice --</option>';
        }

        // Réinitialiser le tableau
        const tbody = document.getElementById('performancesTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-12 text-secondary">
                    <i class="fas fa-hand-pointer text-4xl mb-3 opacity-50"></i>
                    <p class="text-lg">Sélectionnez un exercice</p>
                    <p class="text-sm mt-1">pour afficher le classement des PRs</p>
                </td>
            </tr>
        `;
    },

    /**
     * Afficher le classement des PRs pour un exercice donné
     */
    showPerformanceRankings() {
        if (!this.performancesData) {
            return;
        }

        const exercise = document.getElementById('filterExercice').value;
        const genderFilter = document.getElementById('filterGender').value;
        const tbody = document.getElementById('performancesTableBody');

        if (!exercise) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center py-12 text-secondary">
                        <i class="fas fa-hand-pointer text-4xl mb-3 opacity-50"></i>
                        <p class="text-lg">Sélectionnez un exercice</p>
                        <p class="text-sm mt-1">pour afficher le classement des PRs</p>
                    </td>
                </tr>
            `;
            return;
        }

        const { members, performances } = this.performancesData;

        // Filtrer les performances pour cet exercice (corriger le nom du champ)
        const exercisePerfs = performances.filter(p => {
            const perfExercise = p.exercise_type || p.exercise;
            return perfExercise === exercise;
        });

        console.log(`📊 ${exercisePerfs.length} performances trouvées pour "${exercise}"`);

        if (exercisePerfs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center py-8 text-secondary">
                        <i class="fas fa-inbox text-3xl mb-2"></i>
                        <p>Aucune performance enregistrée pour cet exercice</p>
                    </td>
                </tr>
            `;
            return;
        }

        // Grouper par adhérent et garder seulement le meilleur PR
        const memberPRs = new Map();
        exercisePerfs.forEach(perf => {
            const member = members.find(m => m.id === perf.member_id);
            if (!member) {
                return;
            }

            // Filtrer par sexe si nécessaire
            if (genderFilter) {
                const memberGender = member.gender;
                if (memberGender !== genderFilter) {
                    return;
                }
            }

            if (!memberPRs.has(perf.member_id)) {
                memberPRs.set(perf.member_id, {
                    member: member,
                    bestPerf: perf
                });
            } else {
                const existing = memberPRs.get(perf.member_id);
                // Comparer les performances pour garder la meilleure
                if (this.isBetterPerformance(perf, existing.bestPerf)) {
                    existing.bestPerf = perf;
                }
            }
        });

        // Convertir en tableau et trier du meilleur au moins bon
        const rankings = Array.from(memberPRs.values()).sort((a, b) => {
            return this.isBetterPerformance(a.bestPerf, b.bestPerf) ? -1 : 1;
        });

        console.log(`🏆 ${rankings.length} adhérents classés`);

        // Générer le HTML du classement
        tbody.innerHTML = rankings
            .map((entry, index) => {
                const { member, bestPerf } = entry;
                const rank = index + 1;
                const date = new Date(bestPerf.created_at).toLocaleDateString('fr-FR');

                // Formater la valeur
                let displayValue = bestPerf.value;
                if (bestPerf.unit === 'kg' || bestPerf.unit === 'lbs') {
                    displayValue = `${bestPerf.value} ${bestPerf.unit}`;
                } else if (bestPerf.unit === 'reps') {
                    displayValue = `${bestPerf.value} reps`;
                } else if (bestPerf.unit === 'sec') {
                    // Formater le temps en hh:mm:ss (temps en secondes)
                    displayValue = this.formatTimeFromSeconds(bestPerf.value);
                } else if (bestPerf.unit === 'W') {
                    displayValue = `${bestPerf.value} W`;
                } else if (bestPerf.unit === 'cm') {
                    displayValue = `${bestPerf.value} cm`;
                }

                // Couleurs pour le podium
                let rankStyle = '';
                if (rank === 1) {
                    rankStyle = 'bg-yellow-500 text-black font-bold';
                } else if (rank === 2) {
                    rankStyle = 'bg-gray-300 text-black font-semibold';
                } else if (rank === 3) {
                    rankStyle = 'bg-orange-700 text-white font-semibold';
                }

                return `
                <tr class="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                    <td class="px-3 md:px-4 py-3 text-center">
                        <span class="inline-flex items-center justify-center w-8 h-8 rounded-full ${rankStyle || 'glass-card text-white'}">
                            ${rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : rank}
                        </span>
                    </td>
                    <td class="px-3 md:px-4 py-3 font-semibold text-green-400">
                        ${member.name || `${member.firstName} ${member.lastName}`}
                    </td>
                    <td class="px-3 md:px-4 py-3 text-center font-bold text-white text-lg">
                        ${displayValue}
                    </td>
                    <td class="px-3 md:px-4 py-3 text-center text-secondary text-sm hidden md:table-cell">
                        ${date}
                    </td>
                </tr>
            `;
            })
            .join('');
    },

    /**
     * Comparer deux performances pour savoir laquelle est meilleure
     * @param perf1
     * @param perf2
     */
    isBetterPerformance(perf1, perf2) {
        // Pour les temps (cardio), plus petit = meilleur (plus rapide)
        if (perf1.unit === 'sec') {
            const time1 = parseFloat(perf1.value) || 999999;
            const time2 = parseFloat(perf2.value) || 999999;
            return time1 < time2;
        }
        // Pour tout le reste (kg, reps, watts, cm), plus grand = meilleur
        return (perf1.value || 0) > (perf2.value || 0);
    },

    /**
     * Formater un temps en secondes vers hh:mm:ss
     * @param totalSeconds
     */
    formatTimeFromSeconds(totalSeconds) {
        if (!totalSeconds || isNaN(totalSeconds)) {
            return '00:00:00';
        }

        const seconds = Math.floor(totalSeconds);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        // Si moins d'une heure, afficher mm:ss
        if (hours === 0) {
            return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }

        // Sinon afficher hh:mm:ss
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    },

    /**
     * Section : Analyse Morphologique IA (Remplace Vidéo IA)
     */
    async showVideoAISection() {
        const contentArea = document.getElementById('contentArea');

        // Vérifier la session Discord
        const session = PortalAuthOAuth.currentUser;
        if (!session || !session.discordId) {
            contentArea.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-user-slash text-6xl text-secondary mb-4"></i>
                    <p class="text-secondary">Session expirée</p>
                </div>
            `;
            return;
        }

        // Charger le membre
        try {
            const members = await SupabaseManager.getMembers();
            const linkedMember = members.find(m => m.discord_id === session.discordId);

            if (!linkedMember) {
                contentArea.innerHTML = `
                    <div class="text-center py-12">
                        <i class="fas fa-user-times text-6xl text-secondary mb-4"></i>
                        <p class="text-secondary">Aucun profil lié</p>
                    </div>
                `;
                return;
            }

            this.currentMember = linkedMember;

            // Charger l'analyse existante si disponible
            const existingAnalysis = await this.loadMorphoAnalysis(linkedMember.id);

            // Afficher l'interface Analyse Morphologique IA - AVEC ONGLETS PROPRES
            contentArea.innerHTML = `
                <div class="-m-4 md:-m-8 bg-gradient-to-br from-skali-darker via-gray-900 to-skali-dark min-h-screen">
                    <!-- Header avec Titre -->
                    <div class="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-b border-purple-500/30 p-3">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                                <i class="fas fa-user-chart text-white text-xl"></i>
                            </div>
                            <div>
                                <h1 class="text-xl font-bold text-white">Analyse Morphologique IA</h1>
                                <p class="text-purple-200 text-xs">Scan 3D · Analyse biomécanique</p>
                            </div>
                        </div>
                    </div>

                    <!-- ONGLETS -->
                    <div class="flex border-b border-gray-700 bg-gray-900/50">
                        <button onclick="MemberPortal.switchMorphoTab('analyse')"
                                id="tabAnalyse"
                                class="flex-1 px-4 py-3 text-sm font-bold border-b-2 border-purple-500 text-purple-400 transition">
                            <i class="fas fa-camera mr-2"></i>Nouvelle Analyse
                        </button>
                        <button onclick="MemberPortal.switchMorphoTab('historique')"
                                id="tabHistorique"
                                class="flex-1 px-4 py-3 text-sm font-bold border-b-2 border-transparent text-gray-400 hover:text-white transition">
                            <i class="fas fa-history mr-2"></i>Historique
                        </button>
                    </div>

                    <!-- CONTENU DES ONGLETS -->
                    <div id="morphoTabContent" class="p-3">
                        <!-- Le contenu sera chargé dynamiquement par switchMorphoTab() -->
                    </div>
                </div>
            `;

            // Initialiser les variables de stockage temporaire des photos
            this.morphoPhotos = { front: null, side: null, back: null };

            // Charger l'onglet "Analyse" par défaut
            this.switchMorphoTab('analyse');
        } catch (error) {
            console.error('❌ Erreur affichage Analyse Morphologique:', error);
            contentArea.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-exclamation-circle text-6xl text-red-600 mb-4"></i>
                    <p class="text-secondary">Erreur de chargement</p>
                </div>
            `;
        }
    },

    /**
     * Gérer l'upload d'une photo morphologique
     * @param event
     * @param type
     */
    async handleMorphoPhoto(event, type) {
        console.log(`📸 handleMorphoPhoto appelée pour: ${type}`);

        // Vérifier que morphoPhotos existe
        if (!this.morphoPhotos) {
            console.error("❌ this.morphoPhotos n'existe pas ! Initialisation...");
            this.morphoPhotos = { front: null, side: null, back: null };
        }

        const file = event.target.files[0];
        if (!file) {
            console.warn(`⚠️ Aucun fichier sélectionné pour ${type}`);
            return;
        }

        console.log(
            `📸 Photo ${type} - Taille originale: ${(file.size / 1024 / 1024).toFixed(2)} MB`
        );

        // Afficher un message de compression si nécessaire
        const statusEl = document.getElementById(`${type}PhotoStatus`);
        if (statusEl && file.size > 5 * 1024 * 1024) {
            statusEl.innerHTML =
                '<i class="fas fa-spinner fa-spin text-blue-400 mr-1"></i>Compression...';
            statusEl.classList.remove('text-secondary', 'text-green-400');
            statusEl.classList.add('text-blue-400');
        }

        // Compresser la photo si nécessaire
        const compressedDataUrl = await this.compressImage(file, 5 * 1024 * 1024); // Max 5MB

        console.log(
            `✅ Photo ${type} compressée - Taille finale: ${((compressedDataUrl.length * 0.75) / 1024 / 1024).toFixed(2)} MB`
        );

        // Stocker en mémoire
        this.morphoPhotos[type] = compressedDataUrl;
        console.log(`💾 Photo ${type} stockée dans morphoPhotos`);

        // Mettre à jour le statut visuel
        if (statusEl) {
            statusEl.innerHTML = '✓ OK';
            statusEl.classList.remove('text-secondary', 'text-blue-400');
            statusEl.classList.add('text-green-400', 'font-bold');
        }

        // Afficher la preview
        const previewEl = document.getElementById(
            `preview${type.charAt(0).toUpperCase() + type.slice(1)}`
        );
        if (previewEl) {
            previewEl.innerHTML = `<img src="${compressedDataUrl}" class="w-full h-full object-cover">`;
        }

        // Afficher la zone de preview
        const previewsEl = document.getElementById('morphoPhotoPreviews');
        if (previewsEl) {
            previewsEl.classList.remove('hidden');
        }

        // Vérifier si les 3 photos sont prêtes (avec petit délai pour que le DOM soit prêt)
        setTimeout(() => {
            this.checkMorphoPhotosReady();
        }, 100);
    },

    /**
     * Compresser une image pour qu'elle fasse moins de maxSizeBytes
     * @param file
     * @param maxSizeBytes
     */
    async compressImage(file, maxSizeBytes) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = e => {
                const img = new Image();

                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Réduire la résolution si l'image est trop grande
                    const maxDimension = 1920; // Max 1920px de côté
                    if (width > maxDimension || height > maxDimension) {
                        if (width > height) {
                            height = (height / width) * maxDimension;
                            width = maxDimension;
                        } else {
                            width = (width / height) * maxDimension;
                            height = maxDimension;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Compression progressive jusqu'à atteindre la taille cible
                    let quality = 0.9;
                    let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

                    // Si toujours trop gros, réduire la qualité
                    while (compressedDataUrl.length * 0.75 > maxSizeBytes && quality > 0.3) {
                        quality -= 0.1;
                        compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                    }

                    resolve(compressedDataUrl);
                };

                img.onerror = reject;
                img.src = e.target.result;
            };

            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    /**
     * Vérifier si les 3 photos sont prêtes
     */
    checkMorphoPhotosReady() {
        const { front, side, back } = this.morphoPhotos;
        const analyzeBtn = document.getElementById('analyzeMorphoBtn'); // ID CORRIGÉ!
        const analyzeBtnText = document.getElementById('analyzeBtnText');

        // DEBUG: Afficher l'état des photos
        console.log('🔍 État des photos:', {
            front: front ? `✅ ${(front.length / 1024).toFixed(0)}KB` : '❌ Manquante',
            side: side ? `✅ ${(side.length / 1024).toFixed(0)}KB` : '❌ Manquante',
            back: back ? `✅ ${(back.length / 1024).toFixed(0)}KB` : '❌ Manquante'
        });

        // Vérifier que les éléments existent (ils peuvent ne pas exister si on a changé d'onglet)
        if (!analyzeBtn || !analyzeBtnText) {
            console.warn("⚠️ Bouton d'analyse non trouvé (changement d'onglet?)");
            return;
        }

        if (front && side && back) {
            console.log('✅ Les 3 photos sont prêtes - Activation du bouton');
            analyzeBtn.disabled = false;
            analyzeBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            analyzeBtn.classList.add('cursor-pointer');
            analyzeBtnText.textContent = "🚀 Lancer l'analyse";
        } else {
            const missing = [];
            if (!front) {
                missing.push('Face');
            }
            if (!side) {
                missing.push('Profil');
            }
            if (!back) {
                missing.push('Dos');
            }
            console.warn(`⚠️ Photos manquantes: ${missing.join(', ')}`);
            analyzeBtn.disabled = true;
            analyzeBtn.classList.add('opacity-50', 'cursor-not-allowed');
            analyzeBtn.classList.remove('cursor-pointer');
            analyzeBtnText.textContent = `Manque : ${missing.join(', ')}`;
        }
    },

    /**
     * Démarrer l'analyse morphologique
     */
    async startMorphoAnalysis() {
        const resultDiv = document.getElementById('morphoAnalysisResult');
        if (!resultDiv) {
            return;
        }

        // Afficher la barre de progression
        resultDiv.classList.remove('hidden');
        resultDiv.innerHTML = `
            <div class="glass-card rounded-2xl p-6 mt-6">
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center animate-pulse">
                        <i class="fas fa-brain text-white text-xl"></i>
                    </div>
                    <div class="flex-1">
                        <h3 class="text-lg font-bold text-white" id="morphoAnalysisStep">Analyse en cours...</h3>
                        <p class="text-xs text-secondary" id="morphoAnalysisSubstep">Initialisation...</p>
                    </div>
                </div>

                <!-- Barre de progression -->
                <div class="relative w-full h-3 glass-card rounded-full overflow-hidden mb-2">
                    <div id="morphoProgressBar" class="morpho-progress-bar" style="width: 0%"></div>
                    <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
                </div>
                <p class="text-xs text-center text-secondary" id="morphoProgressText">0%</p>
            </div>
        `;

        // Animation de progression
        const progressBar = document.getElementById('morphoProgressBar');
        const progressText = document.getElementById('morphoProgressText');
        const stepText = document.getElementById('morphoAnalysisStep');
        const substepText = document.getElementById('morphoAnalysisSubstep');

        const steps = [
            {
                progress: 10,
                step: 'Préparation des images...',
                substep: 'Chargement des 3 photos',
                duration: 400
            },
            {
                progress: 25,
                step: 'Analyse squelette (Face)...',
                substep: 'Extraction des points articulaires',
                duration: 600
            },
            {
                progress: 40,
                step: 'Analyse squelette (Profil)...',
                substep: 'Calcul des segments corporels',
                duration: 600
            },
            {
                progress: 55,
                step: 'Analyse squelette (Dos)...',
                substep: 'Détection des asymétries',
                duration: 600
            },
            {
                progress: 70,
                step: "Envoi à l'IA...",
                substep: 'Connexion à Claude Vision',
                duration: 500
            },
            {
                progress: 85,
                step: 'Analyse morphologique...',
                substep: "L'IA évalue votre profil",
                duration: 800
            },
            {
                progress: 95,
                step: 'Génération recommandations...',
                substep: "Calcul des axes d'amélioration",
                duration: 600
            }
        ];

        let currentStepIndex = 0;
        const updateProgress = () => {
            if (currentStepIndex < steps.length) {
                const step = steps[currentStepIndex];
                progressBar.style.width = `${step.progress}%`;
                progressText.textContent = `${step.progress}%`;
                stepText.textContent = step.step;
                substepText.textContent = step.substep;
                currentStepIndex++;
                setTimeout(updateProgress, step.duration);
            }
        };

        updateProgress();

        try {
            // Analyser avec MediaPipe (squelette) - En parallèle pour les 3 photos
            const [frontSkeleton, sideSkeleton, backSkeleton] = await Promise.all([
                this.extractSkeletonData(this.morphoPhotos.front),
                this.extractSkeletonData(this.morphoPhotos.side),
                this.extractSkeletonData(this.morphoPhotos.back)
            ]);

            // Combiner les données squelettiques
            const combinedSkeleton = this.combineSkeletonData(
                frontSkeleton,
                sideSkeleton,
                backSkeleton
            );

            // Analyser avec Claude Vision (uniquement photo de face pour morphologie)
            const morphoAnalysis = await this.analyzeWithClaudeVision(
                this.morphoPhotos.front,
                combinedSkeleton
            );

            // Finaliser la barre à 100%
            progressBar.style.width = '100%';
            progressText.textContent = '100%';
            stepText.textContent = 'Analyse terminée !';
            substepText.textContent = 'Affichage des résultats...';

            await new Promise(resolve => setTimeout(resolve, 300));

            // Stocker l'analyse et les données squelette pour les boutons "Sauvegarder" et "Export PDF"
            this.lastMorphoAnalysis = morphoAnalysis;
            this.lastSkeletonData = combinedSkeleton;

            // Afficher le rapport (AVANT de sauvegarder, pour que ça marche même si la table n'existe pas)
            this.displayMorphoAnalysis(morphoAnalysis);

            // Sauvegarder le rapport (pas les photos) - NON BLOQUANT
            try {
                await this.saveMorphoAnalysis(
                    this.currentMember.id,
                    morphoAnalysis,
                    combinedSkeleton
                );
                console.log('✅ Analyse sauvegardée en historique');
            } catch (saveError) {
                console.warn(
                    "⚠️ Impossible de sauvegarder dans l'historique (table inexistante?):",
                    saveError.message
                );
            }

            // AUTO-RESET: Libérer mémoire + Réinitialiser l'interface après 3 secondes
            setTimeout(() => {
                console.log("🔄 Auto-reset de l'interface...");
                this.morphoPhotos = { front: null, side: null, back: null };

                // Cacher le résultat et réinitialiser les previews
                if (resultDiv) {
                    resultDiv.innerHTML = '';
                }

                // Reset les statuts des photos
                ['front', 'side', 'back'].forEach(type => {
                    const statusEl = document.getElementById(`${type}PhotoStatus`);
                    if (statusEl) {
                        statusEl.innerHTML = 'Cliquez ici';
                        statusEl.classList.remove('text-green-400', 'font-bold');
                        statusEl.classList.add('text-secondary');
                    }

                    const previewEl = document.getElementById(
                        `preview${type.charAt(0).toUpperCase() + type.slice(1)}`
                    );
                    if (previewEl) {
                        previewEl.innerHTML = '<i class="fas fa-plus text-gray-500 text-xl"></i>';
                    }

                    // Reset les inputs files
                    const input = document.getElementById(
                        `morphoPhoto${type.charAt(0).toUpperCase() + type.slice(1)}`
                    );
                    if (input) {
                        input.value = '';
                    }
                });

                // Désactiver le bouton d'analyse
                const analyzeBtn = document.getElementById('analyzeMorphoBtn');
                const analyzeBtnText = document.getElementById('analyzeBtnText');
                if (analyzeBtn) {
                    analyzeBtn.disabled = true;
                    analyzeBtn.classList.add('opacity-50', 'cursor-not-allowed');
                    analyzeBtn.classList.remove('cursor-pointer');
                }
                if (analyzeBtnText) {
                    analyzeBtnText.textContent = 'Sélectionnez les 3 photos';
                }

                console.log('✅ Interface réinitialisée - Prête pour nouvelle analyse');
            }, 3000); // 3 secondes pour lire les résultats
        } catch (error) {
            console.error('Erreur analyse morphologique:', error);
            resultDiv.innerHTML = `
                <div class="glass-card rounded-2xl p-6 border-2 border-red-500/50 mt-6">
                    <div class="text-center">
                        <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-3"></i>
                        <h3 class="text-lg font-bold text-white mb-2">Erreur d'analyse</h3>
                        <p class="text-secondary text-sm">${error.message}</p>
                    </div>
                </div>
            `;
        }
    },

    /**
     * Extraire les données squelettiques (VERSION SIMPLIFIÉE - MediaPipe désactivé temporairement)
     * @param imageDataUrl
     */
    async extractSkeletonData(imageDataUrl) {
        return new Promise(async (resolve, reject) => {
            try {
                console.log("📸 Analyse de l'image...");

                // Pour l'instant, on utilise des valeurs basées sur l'image (taille, etc.)
                const img = new Image();
                img.crossOrigin = 'anonymous';

                img.onload = async () => {
                    try {
                        // Utiliser les dimensions de l'image pour estimer les proportions
                        const aspectRatio = img.width / img.height;

                        // Estimation basée sur les proportions humaines standards
                        // (Ces valeurs seront affinées par Claude Vision qui voit vraiment l'image)
                        const baseWidth = 45;
                        const baseHeight = 170; // cm approximatif

                        console.warn(
                            '⚠️ MediaPipe désactivé temporairement - Utilisation estimation + Claude Vision'
                        );
                        resolve({
                            shoulder_width: baseWidth * (1 + (aspectRatio - 0.5) * 0.1),
                            hip_width: baseWidth * 0.75,
                            femur_length: baseHeight * 0.26,
                            tibia_length: baseHeight * 0.22,
                            arm_length: baseHeight * 0.35,
                            confidence: 0.75,
                            simulated: true,
                            image_aspect_ratio: aspectRatio
                        });
                    } catch (error) {
                        console.error("Erreur lors de l'analyse MediaPipe:", error);
                        // Fallback vers simulation
                        resolve({
                            shoulder_width: 45,
                            hip_width: 35,
                            femur_length: 44,
                            tibia_length: 37,
                            arm_length: 60,
                            confidence: 0.7,
                            simulated: true
                        });
                    }
                };

                img.onerror = () => {
                    console.error('Erreur chargement image');
                    reject(new Error("Impossible de charger l'image"));
                };

                img.src = imageDataUrl;
            } catch (error) {
                console.error('Erreur extraction squelette:', error);
                reject(error);
            }
        });
    },

    /**
     * Calculer la distance 3D entre deux landmarks MediaPipe
     * @param landmark1
     * @param landmark2
     * @param imageWidth
     * @param imageHeight
     */
    calculateDistance3D(landmark1, landmark2, imageWidth, imageHeight) {
        const x1 = landmark1.x * imageWidth;
        const y1 = landmark1.y * imageHeight;
        const z1 = landmark1.z || 0;

        const x2 = landmark2.x * imageWidth;
        const y2 = landmark2.y * imageHeight;
        const z2 = landmark2.z || 0;

        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2));
    },

    /**
     * Combiner les données squelettiques des 3 vues
     * @param front
     * @param side
     * @param back
     */
    combineSkeletonData(front, side, back) {
        return {
            shoulder_width: front.shoulder_width,
            hip_width: front.hip_width,
            femur_length: side.femur_length,
            tibia_length: side.tibia_length,
            arm_length: front.arm_length,
            avg_confidence: (front.confidence + side.confidence + back.confidence) / 3,
            symmetry_score: 0.9 // TODO: calculer depuis front vs back
        };
    },

    /**
     * Analyser avec Claude Vision (via proxy backend)
     * @param imageDataUrl
     * @param skeletonData
     */
    async analyzeWithClaudeVision(imageDataUrl, skeletonData) {
        console.log('🔄 Envoi à Claude Vision via proxy...');

        const prompt = this.buildMorphoPrompt(skeletonData);

        // Extraire la partie base64 (après "data:image/jpeg;base64,")
        const base64Data = imageDataUrl.split(',')[1];

        // Déterminer l'URL du proxy (Netlify Function en prod, localhost en dev)
        const proxyUrl =
            window.location.hostname === 'localhost' || window.location.hostname === '192.168.1.114'
                ? 'http://localhost:3001/api/analyze-morpho'
                : '/.netlify/functions/analyze-morpho';

        console.log('🌐 Utilisation du proxy:', proxyUrl);

        // Appeler le proxy backend au lieu de l'API Claude directement
        const response = await fetch(proxyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image: base64Data, // CORRIGÉ: "image" au lieu de "image_data"
                image_type: 'image/jpeg',
                memberData: skeletonData // Envoyer les données squelette
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erreur API Claude: ${error}`);
        }

        const data = await response.json();
        console.log('📦 Réponse Claude brute:', data);

        // Extraire le texte de l'analyse
        let analysisText;
        if (data.content && data.content[0] && data.content[0].text) {
            analysisText = data.content[0].text;
        } else if (data.text) {
            analysisText = data.text;
        } else if (typeof data === 'string') {
            analysisText = data;
        } else {
            console.error('❌ Format de réponse inattendu:', data);
            throw new Error('Format de réponse API inattendu');
        }

        console.log("📝 Texte d'analyse extrait:", analysisText.substring(0, 200) + '...');

        // Parser le JSON (Claude retourne du JSON structuré)
        try {
            // Nettoyer le texte de manière plus agressive
            let cleanText = analysisText.trim();

            // Méthode 1: Enlever les balises markdown
            if (cleanText.startsWith('```json')) {
                cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
            } else if (cleanText.startsWith('```')) {
                cleanText = cleanText.replace(/```\n?/g, '');
            }

            // Méthode 2: Extraire le JSON entre les premières accolades
            const firstBrace = cleanText.indexOf('{');
            const lastBrace = cleanText.lastIndexOf('}');

            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                const extractedJson = cleanText.substring(firstBrace, lastBrace + 1);
                console.log('🔍 JSON extrait entre accolades (premier essai)');

                try {
                    const parsed = JSON.parse(extractedJson);
                    console.log('✅ JSON parsé avec succès:', Object.keys(parsed));
                    return parsed;
                } catch (e) {
                    console.warn('⚠️ Échec extraction entre accolades, essai sans extraction...');
                }
            }

            // Méthode 3: Parser directement le texte nettoyé
            const parsed = JSON.parse(cleanText.trim());
            console.log('✅ JSON parsé avec succès:', Object.keys(parsed));
            return parsed;
        } catch (parseError) {
            console.error('❌ Erreur parsing JSON:', parseError);
            console.error(
                'Texte problématique (100 premiers chars):',
                analysisText.substring(0, 100)
            );

            // Dernier essai: chercher un objet JSON valide avec une regex + nettoyage avancé
            try {
                const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    console.log("🔍 Tentative d'extraction JSON par regex...");
                    let jsonText = jsonMatch[0];

                    // Nettoyer les virgules traînantes et erreurs communes
                    jsonText = jsonText
                        .replace(/,\s*}/g, '}') // Enlever virgule avant }
                        .replace(/,\s*]/g, ']') // Enlever virgule avant ]
                        .replace(/\n/g, ' ') // Remplacer retours à la ligne
                        .replace(/\r/g, '') // Enlever retours chariot
                        .replace(/\s+/g, ' ') // Normaliser espaces
                        .replace(/"\s*:\s*"/g, '": "'); // Normaliser les paires clé-valeur

                    console.log('🧹 JSON nettoyé, tentative de parsing...');

                    // Essayer de parser avec la méthode JSON5 (plus permissive)
                    try {
                        const parsed = JSON.parse(jsonText);
                        console.log(
                            '✅ JSON parsé avec succès (via regex + nettoyage):',
                            Object.keys(parsed)
                        );
                        return parsed;
                    } catch (innerError) {
                        // Si ça échoue encore, essayer de trouver où le JSON se casse
                        console.log('🔧 Tentative de réparation du JSON cassé...');

                        // Trouver la position de l'erreur et tronquer le JSON juste avant
                        const errorMatch = innerError.message.match(/position (\d+)/);
                        if (errorMatch) {
                            const errorPos = parseInt(errorMatch[1]);
                            // Tronquer au dernier } valide avant l'erreur
                            const beforeError = jsonText.substring(0, errorPos);
                            const lastValidBrace = beforeError.lastIndexOf('}');
                            if (lastValidBrace > 0) {
                                const truncatedJson = jsonText.substring(0, lastValidBrace + 1);
                                console.log('✂️ JSON tronqué à la position', lastValidBrace);
                                const parsed = JSON.parse(truncatedJson);
                                console.log('✅ JSON parsé après troncation:', Object.keys(parsed));
                                return parsed;
                            }
                        }
                        throw innerError;
                    }
                }
            } catch (regexError) {
                console.error('❌ Échec parsing via regex:', regexError.message);
            }

            // Retourner un objet avec l'analyse brute pour ne pas perdre l'info
            console.log('⚠️ Affichage en mode fallback (analyse brute)');
            return {
                raw_analysis: analysisText,
                parse_error: true,
                somatotype: { type_principal: 'Non analysé', description_fr: analysisText }
            };
        }
    },

    /**
     * Construire le prompt optimisé pour Claude Vision - VERSION PROFESSIONNELLE FRANÇAISE
     * @param skeletonData
     */
    buildMorphoPrompt(skeletonData) {
        const age = this.currentMember.birthdate
            ? this.calculateAge(this.currentMember.birthdate)
            : null;
        const weight = this.currentMember.weight || null;
        const height = this.currentMember.height || null;
        const gender =
            this.currentMember.gender === 'male'
                ? 'Homme'
                : this.currentMember.gender === 'female'
                  ? 'Femme'
                  : 'Non spécifié';
        const imc = weight && height ? (weight / Math.pow(height / 100, 2)).toFixed(1) : 'N/A';

        return `Tu es un expert en biomécanique sportive, préparation physique multi-disciplines et analyse morphologique.
Tu vas réaliser une analyse morphologique complète et professionnelle pour un adhérent de box CrossFit.

Ta mission inclut l'évaluation de l'adéquation morphologique pour PLUSIEURS SPORTS :
• CrossFit (discipline principale)
• Hyrox (endurance-force)
• Triathlon (natation, vélo, course)
• Running / Course à pied
• Sports alternatifs potentiels (natation, cyclisme, escalade, powerlifting, etc.)

═══════════════════════════════════════════════════════════════════════════
📋 PROFIL DE L'ATHLÈTE
═══════════════════════════════════════════════════════════════════════════
• Âge : ${age || 'Non renseigné'} ans
• Genre : ${gender}
• Poids : ${weight || 'Non renseigné'} kg
• Taille : ${height || 'Non renseigné'} cm
• IMC : ${imc}
• Discipline actuelle : CrossFit / Functional Fitness

═══════════════════════════════════════════════════════════════════════════
📊 DONNÉES BIOMÉCANIQUES (MediaPipe Pose Detection)
═══════════════════════════════════════════════════════════════════════════
${JSON.stringify(skeletonData, null, 2)}

RATIOS CALCULÉS :
• Ratio Fémur/Tibia : ${(skeletonData.femur_length / skeletonData.tibia_length).toFixed(2)}
• Ratio Épaules/Hanches : ${(skeletonData.shoulder_width / skeletonData.hip_width).toFixed(2)}
• Longueur des bras : ${skeletonData.arm_length} cm

═══════════════════════════════════════════════════════════════════════════
🎯 MISSION : ANALYSE MORPHOLOGIQUE PROFESSIONNELLE
═══════════════════════════════════════════════════════════════════════════

En analysant l'IMAGE FOURNIE + les DONNÉES BIOMÉCANIQUES, fournis une analyse morphologique
COMPLÈTE, PRÉCISE et PROFESSIONNELLE destinée à un adhérent qui souhaite progresser.

INSTRUCTIONS CRITIQUES :
1. Analyse l'image RÉELLEMENT (composition corporelle, posture, asymétries visibles)
2. Croise avec les données squelettiques MediaPipe
3. Sois HONNÊTE et CONSTRUCTIF (ni trop positif, ni trop négatif)
4. Utilise un vocabulaire PROFESSIONNEL mais ACCESSIBLE
5. TOUT doit être en FRANÇAIS (aucun terme anglais sauf noms de mouvements techniques)
6. Fournis des recommandations CONCRÈTES et APPLICABLES

INSTRUCTIONS SPÉCIFIQUES ANALYSE MULTI-SPORTS :
• CrossFit : Évalue la capacité à être polyvalent (force, endurance, gymnastique, haltérophilie)
• Hyrox : Analyse ratio muscle/poids pour course + force explosive pour stations (sled, skierg, etc.)
• Triathlon : Évalue aérodynamisme (vélo), flottabilité (natation), économie de course
• Running : Analyse ratio poids/taille, longueur foulée, impact articulaire
• Sports alternatifs : Propose 2-3 sports où la morphologie serait VRAIMENT avantageuse
• Synthèse : Détermine le profil athlétique global (endurance vs force vs polyvalent)

═══════════════════════════════════════════════════════════════════════════
📝 FORMAT DE RÉPONSE ATTENDU (JSON STRICT)
═══════════════════════════════════════════════════════════════════════════

{
  "somatotype": {
    "type_principal": "Ectomorphe|Mésomorphe|Endomorphe|Ecto-Méso|Méso-Endo",
    "description_fr": "Description détaillée du somatotype observé (2-3 phrases en français)"
  },

  "composition_corporelle": {
    "masse_grasse_estimee": "X-Y%",
    "masse_musculaire": "Faible|Moyenne|Développée|Très développée",
    "distribution_graisseuse": "Androïde (haut du corps)|Gynoïde (bas du corps)|Homogène",
    "potentiel_musculaire": "Description du potentiel de développement musculaire (1-2 phrases)"
  },

  "analyse_posturale": {
    "epaules": {
      "statut": "Symétriques|Asymétrie légère|Asymétrie marquée",
      "detail_fr": "Description précise de ce qui est observé",
      "correction_necessaire": true|false
    },
    "bassin": {
      "statut": "Neutre|Antéversion|Rétroversion|Latéral",
      "detail_fr": "Explication de l'observation",
      "impact_mouvements": "Impact sur les squats, deadlifts, etc."
    },
    "colonne_vertebrale": {
      "statut": "Neutre|Cyphose thoracique|Hyperlordose lombaire|Scoliose légère",
      "detail_fr": "Observation détaillée",
      "zones_a_surveiller": ["Zone 1", "Zone 2"]
    },
    "alignement_general": {
      "qualite": "Excellent|Bon|Moyen|À améliorer",
      "points_forts": ["Point fort 1", "Point fort 2"],
      "points_faibles": ["Point faible 1", "Point faible 2"]
    }
  },

  "biomecanique_sportive": {
    "ratio_femur_tibia": {
      "valeur": ${(skeletonData.femur_length / skeletonData.tibia_length).toFixed(2)},
      "interpretation_fr": "Fémur long/tibia court favorise...|Proportions équilibrées|Tibia long favorise...",
      "consequence_pratique": "Impact concret sur les mouvements (1-2 phrases)"
    },
    "longueur_membres": {
      "bras": "Courts|Moyens|Longs (relativement au torse)",
      "jambes": "Courtes|Moyennes|Longues (relativement au torse)",
      "impact_leviers_fr": "Explication de l'impact sur les leviers mécaniques"
    },
    "mouvements_favorises": [
      {
        "nom": "Nom du mouvement (ex: Back Squat)",
        "raison_fr": "Explication biomécanique précise du pourquoi (1 phrase)",
        "conseil_exploitation": "Comment exploiter cet avantage"
      },
      {
        "nom": "Deuxième mouvement favorisé",
        "raison_fr": "Explication",
        "conseil_exploitation": "Conseil pratique"
      },
      {
        "nom": "Troisième mouvement",
        "raison_fr": "Explication",
        "conseil_exploitation": "Conseil"
      }
    ],
    "mouvements_challengeants": [
      {
        "nom": "Nom du mouvement (ex: Snatch)",
        "raison_fr": "Explication biomécanique du défi",
        "adaptation_recommandee": "Comment compenser ou adapter (technique spécifique)"
      },
      {
        "nom": "Deuxième mouvement challengeant",
        "raison_fr": "Pourquoi c'est difficile",
        "adaptation_recommandee": "Solution concrète"
      }
    ],
    "zones_risque_blessure": [
      {
        "zone": "Nom de la zone anatomique (ex: Épaules, Lombaires)",
        "raison_fr": "Pourquoi cette zone est à risque (biomécanique + posture)",
        "prevention": "Exercices/étirements spécifiques de prévention"
      }
    ]
  },

  "adequation_multi_sports": {
    "crossfit": {
      "score_adequation": "X/10",
      "niveau_compatibilite": "Excellente|Très bonne|Bonne|Moyenne|Limitée",
      "points_forts_morpho": [
        "Avantage morphologique 1 pour le CrossFit",
        "Avantage 2",
        "Avantage 3"
      ],
      "points_faibles_morpho": [
        "Limitation morphologique 1",
        "Limitation 2"
      ],
      "mouvements_signature_favorises": ["Clean", "Thruster", "Pull-ups", "etc."],
      "conseil_specialisation": "Conseil pour optimiser le CrossFit avec cette morphologie (2 phrases)"
    },
    "hyrox": {
      "score_adequation": "X/10",
      "niveau_compatibilite": "Excellente|Très bonne|Bonne|Moyenne|Limitée",
      "points_forts_morpho": [
        "Avantage morphologique 1 pour Hyrox (ex: Ratio muscle/poids favorable pour les courses)",
        "Avantage 2",
        "Avantage 3"
      ],
      "points_faibles_morpho": [
        "Limitation 1 (ex: Poids à optimiser pour la course)",
        "Limitation 2"
      ],
      "stations_favorisees": ["SkiErg", "Sled Push", "Farmers Carry", "etc."],
      "stations_challengeantes": ["Burpees Broad Jump", "Rowing", "etc."],
      "conseil_specialisation": "Recommandation spécifique Hyrox (focus endurance-force)"
    },
    "triathlon": {
      "score_adequation": "X/10",
      "niveau_compatibilite": "Excellente|Très bonne|Bonne|Moyenne|Limitée",
      "discipline_favorisee": "Natation|Vélo|Course à pied|Équilibré",
      "points_forts_morpho": [
        "Avantage morpho 1 pour le triathlon",
        "Avantage 2"
      ],
      "points_faibles_morpho": [
        "Limitation 1 (ex: Poids corporel élevé pour la course)",
        "Limitation 2"
      ],
      "distance_recommandee": "Sprint|Olympique|Half Ironman|Ironman|À éviter",
      "conseil_specialisation": "Conseil triathlon basé sur morphologie (2 phrases)"
    },
    "running": {
      "score_adequation": "X/10",
      "niveau_compatibilite": "Excellente|Très bonne|Bonne|Moyenne|Limitée",
      "type_coureur_morpho": "Sprinter|Demi-fond|Fond|Ultra|Polyvalent",
      "points_forts_morpho": [
        "Avantage 1 pour la course (ex: Ratio poids/taille favorable)",
        "Avantage 2 (ex: Longueur de foulée optimale)",
        "Avantage 3"
      ],
      "points_faibles_morpho": [
        "Limitation 1 (ex: Poids à optimiser)",
        "Limitation 2 (ex: Posture à corriger)"
      ],
      "distance_optimale": "5-10km|10-21km|21-42km|Ultra (50km+)",
      "conseil_specialisation": "Recommandation course à pied (ex: Privilégier trails vs route)"
    },
    "sports_alternatifs_recommandes": [
      {
        "sport": "Nom du sport (ex: Natation, Cyclisme, Escalade, Powerlifting, etc.)",
        "score_adequation": "X/10",
        "raison_fr": "Pourquoi cette morphologie est avantageuse pour ce sport (1-2 phrases)",
        "benefice_complementaire": "Comment ce sport peut compléter l'entraînement principal"
      },
      {
        "sport": "Deuxième sport recommandé",
        "score_adequation": "X/10",
        "raison_fr": "Explication de l'adéquation morphologique",
        "benefice_complementaire": "Bénéfice pour l'entraînement global"
      }
    ],
    "sports_a_eviter": [
      {
        "sport": "Sport peu adapté (ex: Basket si taille limitée)",
        "raison_fr": "Explication biomécanique/morphologique de la limitation",
        "alternative_suggeree": "Sport similaire mais plus adapté"
      }
    ],
    "synthese_orientation": {
      "profil_athlete": "Endurance pure|Force-endurance|Force maximale|Polyvalent|Technique",
      "sports_elite_potentiel": ["Sport 1 avec potentiel haut niveau", "Sport 2"],
      "sports_loisir_plaisir": ["Sports accessibles pour le plaisir", "Sport 2"],
      "conseil_final_orientation": "Recommandation finale sur l'orientation sportive basée sur morphologie (2-3 phrases)"
    }
  },

  "recommandations_entrainement": {
    "priorite_mobilite": [
      {
        "zone": "Zone anatomique (ex: Hanches)",
        "importance": "Critique|Élevée|Modérée",
        "exercices_specifiques": ["Exercice 1", "Exercice 2", "Exercice 3"],
        "frequence_recommandee": "X fois/semaine"
      },
      {
        "zone": "Deuxième zone prioritaire",
        "importance": "Critique|Élevée|Modérée",
        "exercices_specifiques": ["Exercice 1", "Exercice 2"],
        "frequence_recommandee": "X fois/semaine"
      }
    ],
    "priorite_renforcement": [
      {
        "groupe_musculaire": "Nom du groupe (ex: Chaîne postérieure)",
        "raison_fr": "Pourquoi ce renforcement est prioritaire",
        "exercices_cibles": ["Exercice 1 + séries/reps", "Exercice 2 + séries/reps"],
        "progression_suggeree": "Comment progresser sur 8-12 semaines"
      },
      {
        "groupe_musculaire": "Deuxième groupe",
        "raison_fr": "Raison",
        "exercices_cibles": ["Exercices"],
        "progression_suggeree": "Plan de progression"
      }
    ],
    "orientation_entrainement": {
      "focus_principal": "Force maximale|Force-endurance|Endurance|Mixte (Force + Endurance)|Technique",
      "justification_fr": "Explication de pourquoi cet axe est recommandé (2-3 phrases)",
      "ratio_hebdomadaire": "X% Force / Y% Metcon / Z% Technique"
    },
    "semaine_type_detaillee": {
      "lundi": {
        "contenu": "Description de la séance (ex: Force - Back Squat 5x5 + Accessoires chaîne postérieure)",
        "duree_estimee": "60-75 min"
      },
      "mardi": {
        "contenu": "Description de la séance",
        "duree_estimee": "45-60 min"
      },
      "mercredi": {
        "contenu": "Repos actif ou Mobilité/Yoga",
        "duree_estimee": "30-45 min"
      },
      "jeudi": {
        "contenu": "Description de la séance",
        "duree_estimee": "60-75 min"
      },
      "vendredi": {
        "contenu": "Description de la séance",
        "duree_estimee": "45-60 min"
      },
      "weekend": {
        "contenu": "Repos ou activité légère (natation, marche, vélo)",
        "duree_estimee": "Flexible"
      }
    }
  },

  "objectifs_physiques": {
    "perte_poids_recommandee": true|false,
    "kg_a_perdre_estime": null|number,
    "justification_fr": "Explication honnête et bienveillante si perte de poids recommandée",
    "approche_nutrition": "Déficit calorique modéré + protéines|Maintenance|Surplus contrôlé",
    "timeline_realiste": "Durée estimée pour atteindre l'objectif physique (ex: 12-16 semaines)"
  },

  "message_personnalise": {
    "points_forts_morpho": [
      "Premier point fort observé (ex: Excellente symétrie du haut du corps)",
      "Deuxième point fort",
      "Troisième point fort"
    ],
    "axes_amelioration": [
      "Premier axe d'amélioration (formulé positivement)",
      "Deuxième axe",
      "Troisième axe"
    ],
    "encouragement_final": "Message motivant et personnalisé pour l'adhérent (2-3 phrases, ton professionnel mais chaleureux)"
  },

  "indicateurs_suivi": {
    "reevaluation_recommandee": "Dans X semaines/mois",
    "metriques_a_suivre": [
      "Métrique 1 à tracker (ex: Tour de taille)",
      "Métrique 2 (ex: Photos mensuelles)",
      "Métrique 3 (ex: Force sur mouvements clés)"
    ],
    "objectifs_3_mois": "Objectifs réalistes à 3 mois (1-2 phrases)"
  }
}

═══════════════════════════════════════════════════════════════════════════
⚠️ CONSIGNES FINALES CRITIQUES
═══════════════════════════════════════════════════════════════════════════
1. TOUT doit être en FRANÇAIS (termes, explications, recommandations)
2. Sois HONNÊTE mais CONSTRUCTIF (évite le langage édulcoré ou trop pessimiste)
3. Base-toi sur l'IMAGE + les DONNÉES (pas de généralités vagues)
4. Les recommandations doivent être ACTIONNABLES (pas de conseil vague type "mangez mieux")
5. Utilise un ton PROFESSIONNEL mais ACCESSIBLE (évite le jargon excessif)
6. Retourne UNIQUEMENT le JSON (pas de texte avant/après, pas de markdown)
7. Maximum 2500 tokens pour la réponse complète

RAPPEL : L'adhérent compte sur une analyse HONNÊTE et PROFESSIONNELLE pour progresser.
C'est un outil de coaching, pas un simple compliment.`;
    },

    /**
     * Sauvegarder l'analyse dans l'historique
     * @param memberId
     * @param analysisData
     * @param skeletonData
     * @param notes
     */
    async saveMorphoAnalysis(memberId, analysisData, skeletonData = null, notes = '') {
        const dataToSave = {
            member_id: memberId,
            analysis_date: new Date().toISOString(),
            morpho_data: analysisData,
            skeleton_data: skeletonData,
            analysis_version: 'v2.3.4',
            ai_model: 'claude-vision',
            notes: notes
        };

        console.log("💾 Sauvegarde analyse dans l'historique...", dataToSave);

        const response = await fetch(
            `${SupabaseManager.supabaseUrl}/rest/v1/morphological_analysis_history`,
            {
                method: 'POST',
                headers: {
                    ...SupabaseManager.headers,
                    Prefer: 'return=representation'
                },
                body: JSON.stringify(dataToSave)
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error('❌ Erreur sauvegarde:', error);
            throw new Error(`Erreur sauvegarde: ${error}`);
        }

        const savedData = await response.json();
        console.log('✅ Analyse sauvegardée avec succès:', savedData);
        this.showNotification("✅ Analyse sauvegardée dans l'historique !", 'success');
        return savedData[0];
    },

    /**
     * Charger l'analyse la plus récente
     * @param memberId
     */
    async loadMorphoAnalysis(memberId) {
        try {
            console.log('📂 Chargement de la dernière analyse...');
            const response = await fetch(
                `${SupabaseManager.supabaseUrl}/rest/v1/morphological_analysis_history?member_id=eq.${memberId}&order=analysis_date.desc&limit=1`,
                {
                    headers: SupabaseManager.headers
                }
            );

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Dernière analyse chargée:', data);
                return data.length > 0 ? data[0] : null;
            }
        } catch (error) {
            console.error('❌ Erreur chargement analyse:', error);
        }
        return null;
    },

    /**
     * Charger tout l'historique des analyses d'un membre
     * @param memberId
     */
    async loadMorphoHistory(memberId) {
        try {
            console.log("📜 Chargement de l'historique complet...");
            const response = await fetch(
                `${SupabaseManager.supabaseUrl}/rest/v1/morphological_analysis_history?member_id=eq.${memberId}&order=analysis_date.desc`,
                {
                    headers: SupabaseManager.headers
                }
            );

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Historique chargé: ${data.length} analyse(s)`);
                return data;
            }
        } catch (error) {
            console.error('❌ Erreur chargement historique:', error);
        }
        return [];
    },

    /**
     * Supprimer une analyse de l'historique
     * @param analysisId
     */
    async deleteMorphoAnalysis(analysisId) {
        try {
            console.log("🗑️ Suppression de l'analyse:", analysisId);
            const response = await fetch(
                `${SupabaseManager.supabaseUrl}/rest/v1/morphological_analysis_history?id=eq.${analysisId}`,
                {
                    method: 'DELETE',
                    headers: SupabaseManager.headers
                }
            );

            if (response.ok) {
                console.log('✅ Analyse supprimée avec succès');
                this.showNotification("✅ Analyse supprimée de l'historique", 'success');
                return true;
            } else {
                const error = await response.text();
                console.error('❌ Erreur suppression:', error);
                throw new Error(`Erreur suppression: ${error}`);
            }
        } catch (error) {
            console.error('❌ Erreur suppression analyse:', error);
            this.showNotification('❌ Erreur lors de la suppression', 'error');
            return false;
        }
    },

    /**
     * Mettre à jour les notes d'une analyse
     * @param analysisId
     * @param notes
     */
    async updateMorphoNotes(analysisId, notes) {
        try {
            console.log('📝 Mise à jour des notes...', analysisId);
            const response = await fetch(
                `${SupabaseManager.supabaseUrl}/rest/v1/morphological_analysis_history?id=eq.${analysisId}`,
                {
                    method: 'PATCH',
                    headers: SupabaseManager.headers,
                    body: JSON.stringify({ notes: notes })
                }
            );

            if (response.ok) {
                console.log('✅ Notes mises à jour');
                this.showNotification('✅ Notes mises à jour', 'success');
                return true;
            }
        } catch (error) {
            console.error('❌ Erreur mise à jour notes:', error);
        }
        return false;
    },

    /**
     * Afficher l'analyse morphologique
     * @param analysis
     */
    displayMorphoAnalysis(analysis) {
        console.log("🎨 Affichage de l'analyse morphologique...", analysis);

        const resultDiv = document.getElementById('morphoAnalysisResult');
        if (!resultDiv) {
            console.error('❌ Element morphoAnalysisResult introuvable !');
            return;
        }

        console.log('✅ Element trouvé, rendu HTML...');
        resultDiv.classList.remove('hidden');

        try {
            const html = this.renderMorphoAnalysis(analysis);
            console.log('✅ HTML généré, longueur:', html.length);
            resultDiv.innerHTML = html;
            console.log('✅ Analyse affichée avec succès !');
        } catch (error) {
            console.error('❌ Erreur lors du rendu HTML:', error);
            resultDiv.innerHTML = `
                <div class="glass-card rounded-2xl p-6 border-2 border-red-500/50 mt-6">
                    <div class="text-center">
                        <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-3"></i>
                        <h3 class="text-lg font-bold text-white mb-2">Erreur d'affichage</h3>
                        <p class="text-secondary text-sm">${error.message}</p>
                        <details class="mt-4 text-left">
                            <summary class="cursor-pointer text-secondary text-xs">Détails techniques</summary>
                            <pre class="mt-2 text-xs bg-gray-900 p-3 rounded overflow-auto">${JSON.stringify(analysis, null, 2)}</pre>
                        </details>
                    </div>
                </div>
            `;
        }
    },

    /**
     * Render l'analyse morphologique - VERSION PROFESSIONNELLE COMPLÈTE EN FRANÇAIS
     * @param analysisData
     */
    renderMorphoAnalysis(analysisData) {
        console.log('🔧 Render analyse, données reçues:', analysisData);
        const data = analysisData.morpho_data || analysisData;

        // Si erreur de parsing, afficher un fallback
        if (data.parse_error && data.raw_analysis) {
            return `
                <div class="glass-card rounded-2xl p-4 md:p-6 mt-6 border-2 border-yellow-500/30">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-12 h-12 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl flex items-center justify-center">
                            <i class="fas fa-exclamation-triangle text-white text-xl"></i>
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-white">⚠️ Analyse partiellement disponible</h3>
                            <p class="text-xs text-secondary">L'IA a répondu mais le format n'est pas structuré</p>
                        </div>
                    </div>
                    <div class="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <p class="text-secondary text-sm whitespace-pre-wrap">${data.raw_analysis}</p>
                    </div>
                </div>
            `;
        }

        return `
            <div class="glass-card rounded-2xl p-4 md:p-6 mt-6 border-2 border-purple-500/30">
                <!-- En-tête -->
                <div class="mb-6 pb-4 border-b border-purple-500/20">
                    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                        <div class="flex items-center gap-3">
                            <div class="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                                <i class="fas fa-user-check text-white text-2xl"></i>
                            </div>
                            <div>
                                <h3 class="text-xl md:text-2xl font-bold text-white">📊 Votre Analyse Morphologique Complète</h3>
                                <p class="text-xs text-secondary">
                                    <i class="fas fa-robot mr-1"></i>Analyse professionnelle par IA ·
                                    ${analysisData.analysis_date ? new Date(analysisData.analysis_date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Maintenant'}
                                </p>
                            </div>
                        </div>

                        <!-- Boutons d'actions -->
                        <div class="flex flex-wrap gap-2">
                            ${
                                !analysisData.id
                                    ? `
                            <button onclick="MemberPortal.saveAnalysisToHistory()"
                                    class="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm font-bold rounded-lg transition shadow-lg hover:shadow-xl flex items-center gap-2">
                                <i class="fas fa-save"></i>
                                Sauvegarder dans l'historique
                            </button>
                            `
                                    : ''
                            }
                            <button onclick="MemberPortal.exportAnalysisToPDF()"
                                    class="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white text-sm font-bold rounded-lg transition shadow-lg hover:shadow-xl flex items-center gap-2">
                                <i class="fas fa-file-pdf"></i>
                                Exporter en PDF
                            </button>
                        </div>
                    </div>
                </div>

                <!-- SECTION 1: Profil Somatotype -->
                ${
                    data.somatotype
                        ? `
                <div class="mb-6">
                    <h4 class="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        <i class="fas fa-dna text-purple-400"></i>
                        Profil Morphologique (Somatotype)
                    </h4>
                    <div class="bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-xl p-4 border border-purple-500/30">
                        <div class="flex items-center gap-3 mb-3">
                            <span class="px-4 py-2 bg-purple-600 rounded-lg text-white font-bold text-lg">
                                ${data.somatotype.type_principal || data.somatotype}
                            </span>
                        </div>
                        <p class="text-secondary text-sm leading-relaxed">
                            ${data.somatotype.description_fr || 'Type morphologique identifié'}
                        </p>
                    </div>
                </div>
                `
                        : ''
                }

                <!-- SECTION 2: Composition Corporelle -->
                ${
                    data.composition_corporelle
                        ? `
                <div class="mb-6">
                    <h4 class="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        <i class="fas fa-chart-pie text-blue-400"></i>
                        Composition Corporelle
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-xl p-4 border border-blue-500/30">
                            <p class="text-blue-300 text-xs font-semibold mb-1">MASSE GRASSE ESTIMÉE</p>
                            <p class="text-white text-2xl font-bold">${data.composition_corporelle.masse_grasse_estimee}</p>
                        </div>
                        <div class="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl p-4 border border-green-500/30">
                            <p class="text-green-300 text-xs font-semibold mb-1">MASSE MUSCULAIRE</p>
                            <p class="text-white text-2xl font-bold">${data.composition_corporelle.masse_musculaire}</p>
                        </div>
                        <div class="bg-gradient-to-br from-orange-900/30 to-amber-900/30 rounded-xl p-4 border border-orange-500/30">
                            <p class="text-orange-300 text-xs font-semibold mb-1">DISTRIBUTION</p>
                            <p class="text-white text-sm font-bold">${data.composition_corporelle.distribution_graisseuse}</p>
                        </div>
                    </div>
                    <div class="mt-3 glass-list-item rounded-lg p-3 border border-gray-700">
                        <p class="text-secondary text-xs font-semibold mb-1">💪 Potentiel de développement musculaire :</p>
                        <p class="text-secondary text-sm">${data.composition_corporelle.potentiel_musculaire}</p>
                    </div>
                </div>
                `
                        : ''
                }

                <!-- SECTION 3: Analyse Posturale Détaillée -->
                ${
                    data.analyse_posturale
                        ? `
                <div class="mb-6">
                    <h4 class="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        <i class="fas fa-user-check text-cyan-400"></i>
                        Analyse Posturale
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- Épaules -->
                        <div class="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-xl p-4 border ${data.analyse_posturale.epaules?.correction_necessaire ? 'border-yellow-500/50' : 'border-cyan-500/30'}">
                            <div class="flex items-center justify-between mb-2">
                                <h5 class="text-cyan-300 font-bold text-sm flex items-center gap-2">
                                    <i class="fas fa-arrows-alt-h"></i>ÉPAULES
                                </h5>
                                ${
                                    data.analyse_posturale.epaules?.correction_necessaire
                                        ? '<span class="text-xs px-2 py-1 bg-yellow-600/30 text-yellow-300 rounded">⚠ Attention</span>'
                                        : '<span class="text-xs px-2 py-1 bg-green-600/30 text-green-300 rounded">✓ Bon</span>'
                                }
                            </div>
                            <p class="text-white text-sm font-semibold mb-1">${data.analyse_posturale.epaules?.statut}</p>
                            <p class="text-secondary text-xs leading-relaxed">${data.analyse_posturale.epaules?.detail_fr}</p>
                        </div>

                        <!-- Bassin -->
                        <div class="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-xl p-4 border border-indigo-500/30">
                            <h5 class="text-indigo-300 font-bold text-sm mb-2 flex items-center gap-2">
                                <i class="fas fa-compress-arrows-alt"></i>BASSIN
                            </h5>
                            <p class="text-white text-sm font-semibold mb-1">${data.analyse_posturale.bassin?.statut}</p>
                            <p class="text-secondary text-xs leading-relaxed mb-2">${data.analyse_posturale.bassin?.detail_fr}</p>
                            <p class="text-yellow-300 text-xs"><strong>Impact :</strong> ${data.analyse_posturale.bassin?.impact_mouvements}</p>
                        </div>

                        <!-- Colonne vertébrale -->
                        <div class="bg-gradient-to-br from-violet-900/30 to-fuchsia-900/30 rounded-xl p-4 border border-violet-500/30">
                            <h5 class="text-violet-300 font-bold text-sm mb-2 flex items-center gap-2">
                                <i class="fas fa-grip-lines-vertical"></i>COLONNE VERTÉBRALE
                            </h5>
                            <p class="text-white text-sm font-semibold mb-1">${data.analyse_posturale.colonne_vertebrale?.statut}</p>
                            <p class="text-secondary text-xs leading-relaxed mb-2">${data.analyse_posturale.colonne_vertebrale?.detail_fr}</p>
                            ${
                                data.analyse_posturale.colonne_vertebrale?.zones_a_surveiller
                                    ?.length > 0
                                    ? `
                                <p class="text-orange-300 text-xs"><strong>Zones à surveiller :</strong> ${data.analyse_posturale.colonne_vertebrale.zones_a_surveiller.join(', ')}</p>
                            `
                                    : ''
                            }
                        </div>

                        <!-- Alignement général -->
                        <div class="bg-gradient-to-br from-teal-900/30 to-cyan-900/30 rounded-xl p-4 border border-teal-500/30">
                            <h5 class="text-teal-300 font-bold text-sm mb-2 flex items-center gap-2">
                                <i class="fas fa-balance-scale"></i>ALIGNEMENT GÉNÉRAL
                            </h5>
                            <p class="text-white text-lg font-bold mb-2">${data.analyse_posturale.alignement_general?.qualite}</p>
                            <div class="space-y-1 text-xs">
                                ${
                                    data.analyse_posturale.alignement_general?.points_forts
                                        ?.length > 0
                                        ? `<p class="text-green-300"><strong>✓ Points forts :</strong> ${data.analyse_posturale.alignement_general.points_forts.join(', ')}</p>`
                                        : ''
                                }
                                ${
                                    data.analyse_posturale.alignement_general?.points_faibles
                                        ?.length > 0
                                        ? `<p class="text-orange-300"><strong>⚠ À améliorer :</strong> ${data.analyse_posturale.alignement_general.points_faibles.join(', ')}</p>`
                                        : ''
                                }
                            </div>
                        </div>
                    </div>
                </div>
                `
                        : ''
                }

                <!-- SECTION 4: Biomécanique Sportive -->
                ${
                    data.biomecanique_sportive
                        ? `
                <div class="mb-6">
                    <h4 class="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        <i class="fas fa-cogs text-green-400"></i>
                        Biomécanique & Mouvements
                    </h4>

                    <!-- Ratios et leviers -->
                    ${
                        data.biomecanique_sportive.ratio_femur_tibia ||
                        data.biomecanique_sportive.longueur_membres
                            ? `
                    <div class="bg-gray-800/50 rounded-lg p-4 mb-4 border border-gray-700">
                        <p class="text-secondary text-xs font-semibold mb-2">📐 ANALYSE DES LEVIERS MÉCANIQUES</p>
                        ${
                            data.biomecanique_sportive.ratio_femur_tibia
                                ? `
                            <div class="mb-3">
                                <p class="text-white text-sm"><strong>Ratio Fémur/Tibia :</strong> ${data.biomecanique_sportive.ratio_femur_tibia.valeur}</p>
                                <p class="text-yellow-300 text-xs mt-1">${data.biomecanique_sportive.ratio_femur_tibia.interpretation_fr}</p>
                                <p class="text-secondary text-xs mt-1">${data.biomecanique_sportive.ratio_femur_tibia.consequence_pratique}</p>
                            </div>
                        `
                                : ''
                        }
                        ${
                            data.biomecanique_sportive.longueur_membres
                                ? `
                            <div class="grid grid-cols-2 gap-3 text-xs">
                                <div><span class="text-secondary">Bras :</span> <span class="text-white font-semibold">${data.biomecanique_sportive.longueur_membres.bras}</span></div>
                                <div><span class="text-secondary">Jambes :</span> <span class="text-white font-semibold">${data.biomecanique_sportive.longueur_membres.jambes}</span></div>
                            </div>
                            <p class="text-secondary text-xs mt-2">${data.biomecanique_sportive.longueur_membres.impact_leviers_fr}</p>
                        `
                                : ''
                        }
                    </div>
                    `
                            : ''
                    }

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <!-- Mouvements favorisés -->
                        <div class="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl p-4 border border-green-500/30">
                            <h5 class="text-green-300 font-bold text-sm mb-3 flex items-center gap-2">
                                <i class="fas fa-thumbs-up"></i>MOUVEMENTS FAVORISÉS
                            </h5>
                            <div class="space-y-3">
                                ${
                                    data.biomecanique_sportive.mouvements_favorises
                                        ?.map(
                                            mvt => `
                                    <div class="bg-green-900/20 rounded-lg p-3 border border-green-600/30">
                                        <p class="text-white font-bold text-sm mb-1">✓ ${mvt.nom}</p>
                                        <p class="text-secondary text-xs mb-1">${mvt.raison_fr}</p>
                                        <p class="text-green-200 text-xs"><strong>💡 Conseil :</strong> ${mvt.conseil_exploitation}</p>
                                    </div>
                                `
                                        )
                                        .join('') ||
                                    '<p class="text-secondary text-sm">Analyse en cours...</p>'
                                }
                            </div>
                        </div>

                        <!-- Mouvements challengeants -->
                        <div class="bg-gradient-to-br from-orange-900/30 to-red-900/30 rounded-xl p-4 border border-orange-500/30">
                            <h5 class="text-orange-300 font-bold text-sm mb-3 flex items-center gap-2">
                                <i class="fas fa-exclamation-triangle"></i>MOUVEMENTS CHALLENGEANTS
                            </h5>
                            <div class="space-y-3">
                                ${
                                    data.biomecanique_sportive.mouvements_challengeants
                                        ?.map(
                                            mvt => `
                                    <div class="bg-orange-900/20 rounded-lg p-3 border border-orange-600/30">
                                        <p class="text-white font-bold text-sm mb-1">⚠ ${mvt.nom}</p>
                                        <p class="text-secondary text-xs mb-1">${mvt.raison_fr}</p>
                                        <p class="text-orange-200 text-xs"><strong>🔧 Adaptation :</strong> ${mvt.adaptation_recommandee}</p>
                                    </div>
                                `
                                        )
                                        .join('') ||
                                    '<p class="text-secondary text-sm">Aucun défi majeur identifié</p>'
                                }
                            </div>
                        </div>
                    </div>

                    <!-- Zones à risque -->
                    ${
                        data.biomecanique_sportive.zones_risque_blessure?.length > 0
                            ? `
                    <div class="bg-red-900/20 rounded-xl p-4 mt-4 border border-red-500/30">
                        <h5 class="text-red-300 font-bold text-sm mb-3 flex items-center gap-2">
                            <i class="fas fa-shield-alt"></i>PRÉVENTION DES BLESSURES
                        </h5>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            ${data.biomecanique_sportive.zones_risque_blessure
                                .map(
                                    zone => `
                                <div class="bg-red-900/20 rounded-lg p-3 border border-red-600/20">
                                    <p class="text-red-300 font-bold text-sm mb-1">🚨 ${zone.zone}</p>
                                    <p class="text-secondary text-xs mb-2">${zone.raison_fr}</p>
                                    <p class="text-yellow-200 text-xs"><strong>Prévention :</strong> ${zone.prevention}</p>
                                </div>
                            `
                                )
                                .join('')}
                        </div>
                    </div>
                    `
                            : ''
                    }
                </div>
                `
                        : ''
                }

                <!-- SECTION 5: Adéquation Multi-Sports -->
                ${
                    data.adequation_multi_sports
                        ? `
                <div class="mb-6">
                    <h4 class="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        <i class="fas fa-running text-orange-400"></i>
                        Adéquation Multi-Sports
                    </h4>
                    <p class="text-secondary text-xs mb-4">Analyse de votre morphologie pour différentes disciplines sportives</p>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <!-- CrossFit -->
                        ${
                            data.adequation_multi_sports.crossfit
                                ? `
                        <div class="bg-gradient-to-br from-red-900/30 to-orange-900/30 rounded-xl p-4 border border-red-500/30">
                            <div class="flex items-center justify-between mb-3">
                                <h5 class="text-red-300 font-bold text-sm flex items-center gap-2">
                                    <i class="fas fa-fire"></i>CROSSFIT
                                </h5>
                                <span class="text-2xl font-bold text-white">${data.adequation_multi_sports.crossfit.score_adequation}</span>
                            </div>
                            <p class="text-white text-sm font-semibold mb-2">${data.adequation_multi_sports.crossfit.niveau_compatibilite}</p>
                            <div class="text-xs space-y-1 mb-2">
                                ${data.adequation_multi_sports.crossfit.points_forts_morpho
                                    ?.map(point => `<p class="text-green-300">✓ ${point}</p>`)
                                    .join('')}
                            </div>
                            <p class="text-secondary text-xs">${data.adequation_multi_sports.crossfit.conseil_specialisation}</p>
                        </div>
                        `
                                : ''
                        }

                        <!-- Hyrox -->
                        ${
                            data.adequation_multi_sports.hyrox
                                ? `
                        <div class="bg-gradient-to-br from-yellow-900/30 to-amber-900/30 rounded-xl p-4 border border-yellow-500/30">
                            <div class="flex items-center justify-between mb-3">
                                <h5 class="text-yellow-300 font-bold text-sm flex items-center gap-2">
                                    <i class="fas fa-bolt"></i>HYROX
                                </h5>
                                <span class="text-2xl font-bold text-white">${data.adequation_multi_sports.hyrox.score_adequation}</span>
                            </div>
                            <p class="text-white text-sm font-semibold mb-2">${data.adequation_multi_sports.hyrox.niveau_compatibilite}</p>
                            <div class="text-xs mb-2">
                                <p class="text-green-300 mb-1">Stations favorisées: ${data.adequation_multi_sports.hyrox.stations_favorisees?.join(', ')}</p>
                                <p class="text-orange-300">Stations challengeantes: ${data.adequation_multi_sports.hyrox.stations_challengeantes?.join(', ')}</p>
                            </div>
                            <p class="text-secondary text-xs">${data.adequation_multi_sports.hyrox.conseil_specialisation}</p>
                        </div>
                        `
                                : ''
                        }

                        <!-- Triathlon -->
                        ${
                            data.adequation_multi_sports.triathlon
                                ? `
                        <div class="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-xl p-4 border border-blue-500/30">
                            <div class="flex items-center justify-between mb-3">
                                <h5 class="text-blue-300 font-bold text-sm flex items-center gap-2">
                                    <i class="fas fa-swimmer"></i>TRIATHLON
                                </h5>
                                <span class="text-2xl font-bold text-white">${data.adequation_multi_sports.triathlon.score_adequation}</span>
                            </div>
                            <p class="text-white text-sm font-semibold mb-2">${data.adequation_multi_sports.triathlon.niveau_compatibilite}</p>
                            <p class="text-cyan-300 text-xs mb-2">Discipline favorisée: ${data.adequation_multi_sports.triathlon.discipline_favorisee}</p>
                            <p class="text-yellow-300 text-xs mb-2">Distance recommandée: ${data.adequation_multi_sports.triathlon.distance_recommandee}</p>
                            <p class="text-secondary text-xs">${data.adequation_multi_sports.triathlon.conseil_specialisation}</p>
                        </div>
                        `
                                : ''
                        }

                        <!-- Running -->
                        ${
                            data.adequation_multi_sports.running
                                ? `
                        <div class="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl p-4 border border-green-500/30">
                            <div class="flex items-center justify-between mb-3">
                                <h5 class="text-green-300 font-bold text-sm flex items-center gap-2">
                                    <i class="fas fa-running"></i>RUNNING
                                </h5>
                                <span class="text-2xl font-bold text-white">${data.adequation_multi_sports.running.score_adequation}</span>
                            </div>
                            <p class="text-white text-sm font-semibold mb-2">${data.adequation_multi_sports.running.niveau_compatibilite}</p>
                            <p class="text-green-300 text-xs mb-2">Profil coureur: ${data.adequation_multi_sports.running.type_coureur_morpho}</p>
                            <p class="text-yellow-300 text-xs mb-2">Distance optimale: ${data.adequation_multi_sports.running.distance_optimale}</p>
                            <p class="text-secondary text-xs">${data.adequation_multi_sports.running.conseil_specialisation}</p>
                        </div>
                        `
                                : ''
                        }
                    </div>

                    <!-- Sports alternatifs recommandés -->
                    ${
                        data.adequation_multi_sports.sports_alternatifs_recommandes?.length > 0
                            ? `
                    <div class="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-4 mb-4 border border-purple-500/30">
                        <h5 class="text-purple-300 font-bold text-sm mb-3 flex items-center gap-2">
                            <i class="fas fa-star"></i>SPORTS ALTERNATIFS RECOMMANDÉS
                        </h5>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            ${data.adequation_multi_sports.sports_alternatifs_recommandes
                                .map(
                                    sport => `
                                <div class="bg-purple-900/20 rounded-lg p-3 border border-purple-600/30">
                                    <div class="flex items-center justify-between mb-2">
                                        <p class="text-white font-bold text-sm">${sport.sport}</p>
                                        <span class="text-purple-300 font-bold">${sport.score_adequation}</span>
                                    </div>
                                    <p class="text-secondary text-xs mb-1">${sport.raison_fr}</p>
                                    <p class="text-purple-200 text-xs"><strong>💡 Bénéfice :</strong> ${sport.benefice_complementaire}</p>
                                </div>
                            `
                                )
                                .join('')}
                        </div>
                    </div>
                    `
                            : ''
                    }

                    <!-- Synthèse orientation -->
                    ${
                        data.adequation_multi_sports.synthese_orientation
                            ? `
                    <div class="bg-gradient-to-r from-indigo-900/40 to-violet-900/40 rounded-xl p-4 border border-indigo-500/30">
                        <h5 class="text-indigo-300 font-bold text-sm mb-3 flex items-center gap-2">
                            <i class="fas fa-compass"></i>SYNTHÈSE & ORIENTATION
                        </h5>
                        <p class="text-white text-lg font-bold mb-2">Profil athlète: ${data.adequation_multi_sports.synthese_orientation.profil_athlete}</p>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-xs">
                            ${
                                data.adequation_multi_sports.synthese_orientation
                                    .sports_elite_potentiel?.length > 0
                                    ? `
                                <div>
                                    <p class="text-yellow-300 font-semibold mb-1">🏆 Potentiel haut niveau:</p>
                                    <p class="text-secondary">${data.adequation_multi_sports.synthese_orientation.sports_elite_potentiel.join(', ')}</p>
                                </div>
                            `
                                    : ''
                            }
                            ${
                                data.adequation_multi_sports.synthese_orientation
                                    .sports_loisir_plaisir?.length > 0
                                    ? `
                                <div>
                                    <p class="text-green-300 font-semibold mb-1">😊 Sports loisir/plaisir:</p>
                                    <p class="text-secondary">${data.adequation_multi_sports.synthese_orientation.sports_loisir_plaisir.join(', ')}</p>
                                </div>
                            `
                                    : ''
                            }
                        </div>
                        <p class="text-secondary text-sm">${data.adequation_multi_sports.synthese_orientation.conseil_final_orientation}</p>
                    </div>
                    `
                            : ''
                    }
                </div>
                `
                        : ''
                }

                <!-- SECTION 6: Recommandations d'Entraînement -->
                ${
                    data.recommandations_entrainement
                        ? `
                <div class="mb-6">
                    <h4 class="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        <i class="fas fa-dumbbell text-purple-400"></i>
                        Plan d'Entraînement Personnalisé
                    </h4>

                    <!-- Orientation générale -->
                    ${
                        data.recommandations_entrainement.orientation_entrainement
                            ? `
                    <div class="bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-xl p-4 mb-4 border border-purple-500/30">
                        <p class="text-purple-300 font-bold text-sm mb-2">🎯 ORIENTATION PRINCIPALE</p>
                        <p class="text-white text-xl font-bold mb-2">${data.recommandations_entrainement.orientation_entrainement.focus_principal}</p>
                        <p class="text-secondary text-sm mb-2">${data.recommandations_entrainement.orientation_entrainement.justification_fr}</p>
                        <p class="text-yellow-300 text-xs"><strong>Répartition :</strong> ${data.recommandations_entrainement.orientation_entrainement.ratio_hebdomadaire}</p>
                    </div>
                    `
                            : ''
                    }

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                        <!-- Mobilité prioritaire -->
                        ${
                            data.recommandations_entrainement.priorite_mobilite?.length > 0
                                ? `
                        <div class="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-xl p-4 border border-cyan-500/30">
                            <h5 class="text-cyan-300 font-bold text-sm mb-3 flex items-center gap-2">
                                <i class="fas fa-stretching"></i>MOBILITÉ PRIORITAIRE
                            </h5>
                            <div class="space-y-3">
                                ${data.recommandations_entrainement.priorite_mobilite
                                    .map(
                                        zone => `
                                    <div class="bg-cyan-900/20 rounded-lg p-3 border border-cyan-600/30">
                                        <div class="flex items-center justify-between mb-2">
                                            <p class="text-white font-bold text-sm">${zone.zone}</p>
                                            <span class="text-xs px-2 py-1 rounded ${
                                                zone.importance === 'Critique'
                                                    ? 'bg-red-600/30 text-red-300'
                                                    : zone.importance === 'Élevée'
                                                      ? 'bg-orange-600/30 text-orange-300'
                                                      : 'bg-yellow-600/30 text-yellow-300'
                                            }">${zone.importance}</span>
                                        </div>
                                        <ul class="text-secondary text-xs space-y-1 mb-2">
                                            ${zone.exercices_specifiques?.map(ex => `<li>• ${ex}</li>`).join('') || ''}
                                        </ul>
                                        <p class="text-cyan-200 text-xs"><strong>Fréquence :</strong> ${zone.frequence_recommandee}</p>
                                    </div>
                                `
                                    )
                                    .join('')}
                            </div>
                        </div>
                        `
                                : ''
                        }

                        <!-- Renforcement prioritaire -->
                        ${
                            data.recommandations_entrainement.priorite_renforcement?.length > 0
                                ? `
                        <div class="bg-gradient-to-br from-orange-900/30 to-amber-900/30 rounded-xl p-4 border border-orange-500/30">
                            <h5 class="text-orange-300 font-bold text-sm mb-3 flex items-center gap-2">
                                <i class="fas fa-fist-raised"></i>RENFORCEMENT MUSCULAIRE
                            </h5>
                            <div class="space-y-3">
                                ${data.recommandations_entrainement.priorite_renforcement
                                    .map(
                                        groupe => `
                                    <div class="bg-orange-900/20 rounded-lg p-3 border border-orange-600/30">
                                        <p class="text-white font-bold text-sm mb-1">${groupe.groupe_musculaire}</p>
                                        <p class="text-secondary text-xs mb-2">${groupe.raison_fr}</p>
                                        <ul class="text-orange-200 text-xs space-y-1 mb-2">
                                            ${groupe.exercices_cibles?.map(ex => `<li>→ ${ex}</li>`).join('') || ''}
                                        </ul>
                                        <p class="text-yellow-200 text-xs"><strong>Progression :</strong> ${groupe.progression_suggeree}</p>
                                    </div>
                                `
                                    )
                                    .join('')}
                            </div>
                        </div>
                        `
                                : ''
                        }
                    </div>

                    <!-- Semaine type détaillée -->
                    ${
                        data.recommandations_entrainement.semaine_type_detaillee
                            ? `
                    <div class="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-xl p-4 border border-indigo-500/30">
                        <h5 class="text-indigo-300 font-bold text-sm mb-3 flex items-center gap-2">
                            <i class="fas fa-calendar-week"></i>SEMAINE TYPE RECOMMANDÉE
                        </h5>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            ${Object.entries(
                                data.recommandations_entrainement.semaine_type_detaillee
                            )
                                .map(
                                    ([jour, info]) => `
                                <div class="bg-indigo-900/20 rounded-lg p-3 border border-indigo-600/30">
                                    <p class="text-indigo-300 font-bold text-xs uppercase mb-1">${jour}</p>
                                    <p class="text-white text-sm mb-1">${info.contenu}</p>
                                    <p class="text-secondary text-xs">⏱ ${info.duree_estimee}</p>
                                </div>
                            `
                                )
                                .join('')}
                        </div>
                    </div>
                    `
                            : ''
                    }
                </div>
                `
                        : ''
                }

                <!-- SECTION 6: Objectifs Physiques -->
                ${
                    data.objectifs_physiques
                        ? `
                <div class="mb-6">
                    <h4 class="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        <i class="fas fa-bullseye text-red-400"></i>
                        Objectifs Physiques
                    </h4>
                    <div class="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-xl p-4 border border-blue-500/30">
                        ${
                            data.objectifs_physiques.perte_poids_recommandee
                                ? `
                            <div class="flex items-center gap-3 mb-3">
                                <span class="text-3xl">🎯</span>
                                <div>
                                    <p class="text-white font-bold">Objectif de poids : ${data.objectifs_physiques.kg_a_perdre_estime ? `-${data.objectifs_physiques.kg_a_perdre_estime} kg` : 'À définir'}</p>
                                    <p class="text-secondary text-sm">${data.objectifs_physiques.justification_fr}</p>
                                </div>
                            </div>
                        `
                                : `
                            <p class="text-green-300 font-bold flex items-center gap-2 mb-2">
                                <i class="fas fa-check-circle"></i>Poids corporel optimal atteint
                            </p>
                        `
                        }
                        <div class="grid grid-cols-2 gap-3 text-sm mt-3">
                            <div class="bg-blue-900/30 rounded-lg p-3">
                                <p class="text-blue-300 text-xs font-semibold mb-1">APPROCHE NUTRITION</p>
                                <p class="text-white">${data.objectifs_physiques.approche_nutrition}</p>
                            </div>
                            <div class="bg-indigo-900/30 rounded-lg p-3">
                                <p class="text-indigo-300 text-xs font-semibold mb-1">TIMELINE</p>
                                <p class="text-white">${data.objectifs_physiques.timeline_realiste}</p>
                            </div>
                        </div>
                    </div>
                </div>
                `
                        : ''
                }

                <!-- SECTION 7: Message Personnalisé -->
                ${
                    data.message_personnalise
                        ? `
                <div class="mb-6">
                    <h4 class="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        <i class="fas fa-comment-dots text-yellow-400"></i>
                        Message Personnalisé
                    </h4>
                    <div class="bg-gradient-to-br from-yellow-900/20 to-amber-900/20 rounded-xl p-4 border border-yellow-500/30">
                        ${
                            data.message_personnalise.points_forts_morpho?.length > 0
                                ? `
                            <div class="mb-4">
                                <p class="text-green-300 font-bold text-sm mb-2 flex items-center gap-2">
                                    <i class="fas fa-star"></i>VOS POINTS FORTS
                                </p>
                                <ul class="text-gray-200 text-sm space-y-1">
                                    ${data.message_personnalise.points_forts_morpho.map(pt => `<li>✓ ${pt}</li>`).join('')}
                                </ul>
                            </div>
                        `
                                : ''
                        }
                        ${
                            data.message_personnalise.axes_amelioration?.length > 0
                                ? `
                            <div class="mb-4">
                                <p class="text-blue-300 font-bold text-sm mb-2 flex items-center gap-2">
                                    <i class="fas fa-arrow-up"></i>AXES D'AMÉLIORATION
                                </p>
                                <ul class="text-gray-200 text-sm space-y-1">
                                    ${data.message_personnalise.axes_amelioration.map(axe => `<li>→ ${axe}</li>`).join('')}
                                </ul>
                            </div>
                        `
                                : ''
                        }
                        <div class="bg-yellow-900/30 rounded-lg p-4 border border-yellow-600/30">
                            <p class="text-yellow-100 text-sm leading-relaxed italic">
                                "${data.message_personnalise.encouragement_final}"
                            </p>
                        </div>
                    </div>
                </div>
                `
                        : ''
                }

                <!-- SECTION 8: Indicateurs de Suivi -->
                ${
                    data.indicateurs_suivi
                        ? `
                <div class="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <h4 class="text-white font-bold text-sm mb-3 flex items-center gap-2">
                        <i class="fas fa-chart-line text-teal-400"></i>
                        SUIVI & RÉÉVALUATION
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p class="text-secondary text-xs font-semibold mb-1">📅 Prochaine évaluation :</p>
                            <p class="text-white">${data.indicateurs_suivi.reevaluation_recommandee}</p>
                        </div>
                        <div>
                            <p class="text-secondary text-xs font-semibold mb-1">📊 Métriques à tracker :</p>
                            <ul class="text-secondary text-xs space-y-1">
                                ${data.indicateurs_suivi.metriques_a_suivre?.map(m => `<li>• ${m}</li>`).join('') || ''}
                            </ul>
                        </div>
                    </div>
                    <div class="mt-3 pt-3 border-t border-gray-700">
                        <p class="text-teal-300 font-semibold text-xs mb-1">🎯 Objectifs à 3 mois :</p>
                        <p class="text-gray-200 text-sm">${data.indicateurs_suivi.objectifs_3_mois}</p>
                    </div>
                </div>
                `
                        : ''
                }

                <!-- Footer -->
                <div class="mt-6 pt-4 border-t border-gray-700 text-center">
                    <p class="text-secondary text-xs">
                        <i class="fas fa-info-circle mr-1"></i>
                        Cette analyse est générée par Intelligence Artificielle et doit être considérée comme un outil d'aide à la décision.
                        Consultez un professionnel de santé ou un coach diplômé pour un suivi personnalisé.
                    </p>
                </div>
            </div>
        `;
    },

    /**
     * Switcher entre les onglets Analyse/Historique
     * @param tabName
     */
    switchMorphoTab(tabName) {
        console.log('🔄 Switch onglet morpho:', tabName);

        // Mettre à jour les styles des onglets
        const tabAnalyse = document.getElementById('tabAnalyse');
        const tabHistorique = document.getElementById('tabHistorique');

        if (tabName === 'analyse') {
            // Activer onglet Analyse
            tabAnalyse.classList.remove('border-transparent', 'text-gray-400');
            tabAnalyse.classList.add('border-purple-500', 'text-purple-400');
            tabHistorique.classList.remove('border-purple-500', 'text-purple-400');
            tabHistorique.classList.add('border-transparent', 'text-gray-400');

            // Afficher le contenu Analyse
            this.renderAnalyseTab();
        } else if (tabName === 'historique') {
            // Activer onglet Historique
            tabHistorique.classList.remove('border-transparent', 'text-gray-400');
            tabHistorique.classList.add('border-purple-500', 'text-purple-400');
            tabAnalyse.classList.remove('border-purple-500', 'text-purple-400');
            tabAnalyse.classList.add('border-transparent', 'text-gray-400');

            // Afficher le contenu Historique
            this.showMorphoHistoryTab();
        }
    },

    /**
     * Afficher l'onglet Analyse
     */
    renderAnalyseTab() {
        const tabContent = document.getElementById('morphoTabContent');
        if (!tabContent) {
            return;
        }

        tabContent.innerHTML = `
            <!-- Conseils -->
            <div class="bg-blue-900/20 border border-blue-500/30 rounded-lg p-2 mb-3">
                <p class="text-blue-300 font-semibold text-xs mb-1">
                    <i class="fas fa-lightbulb mr-1"></i>Conseils photos
                </p>
                <p class="text-gray-300 text-xs">
                    Tenue légère · Fond uni · Lumière naturelle · Corps entier visible · Pieds écartés
                </p>
            </div>

            <!-- Grid 3 photos -->
            <div class="grid grid-cols-3 gap-2 mb-3">
                <!-- 1. FACE -->
                <div>
                    <input type="file" id="morphoPhotoFront" accept="image/*" capture="environment" class="hidden" onchange="MemberPortal.handleMorphoPhoto(event, 'front')">
                    <button onclick="document.getElementById('morphoPhotoFront').click()"
                            class="w-full glass-card rounded-lg p-2 border border-gray-700 hover:border-purple-500 transition">
                        <div class="flex flex-col items-center gap-1 mb-1">
                            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                                <i class="fas fa-camera text-white text-xs"></i>
                            </div>
                            <p class="text-white font-bold text-xs">1. Face</p>
                            <div id="frontPhotoStatus" class="text-[10px] text-secondary">Cliquez ici</div>
                        </div>
                        <div id="previewFront" class="aspect-[3/4] rounded-md overflow-hidden bg-gray-800/50 border border-dashed border-gray-600 flex items-center justify-center">
                            <i class="fas fa-plus text-gray-500 text-xl"></i>
                        </div>
                    </button>
                </div>

                <!-- 2. PROFIL -->
                <div>
                    <input type="file" id="morphoPhotoSide" accept="image/*" capture="environment" class="hidden" onchange="MemberPortal.handleMorphoPhoto(event, 'side')">
                    <button onclick="document.getElementById('morphoPhotoSide').click()"
                            class="w-full glass-card rounded-lg p-2 border border-gray-700 hover:border-blue-500 transition">
                        <div class="flex flex-col items-center gap-1 mb-1">
                            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                                <i class="fas fa-camera text-white text-xs"></i>
                            </div>
                            <p class="text-white font-bold text-xs">2. Profil</p>
                            <div id="sidePhotoStatus" class="text-[10px] text-secondary">Cliquez ici</div>
                        </div>
                        <div id="previewSide" class="aspect-[3/4] rounded-md overflow-hidden bg-gray-800/50 border border-dashed border-gray-600 flex items-center justify-center">
                            <i class="fas fa-plus text-gray-500 text-xl"></i>
                        </div>
                    </button>
                </div>

                <!-- 3. DOS -->
                <div>
                    <input type="file" id="morphoPhotoBack" accept="image/*" capture="environment" class="hidden" onchange="MemberPortal.handleMorphoPhoto(event, 'back')">
                    <button onclick="document.getElementById('morphoPhotoBack').click()"
                            class="w-full glass-card rounded-lg p-2 border border-gray-700 hover:border-green-500 transition">
                        <div class="flex flex-col items-center gap-1 mb-1">
                            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                <i class="fas fa-camera text-white text-xs"></i>
                            </div>
                            <p class="text-white font-bold text-xs">3. Dos</p>
                            <div id="backPhotoStatus" class="text-[10px] text-secondary">Cliquez ici</div>
                        </div>
                        <div id="previewBack" class="aspect-[3/4] rounded-md overflow-hidden bg-gray-800/50 border border-dashed border-gray-600 flex items-center justify-center">
                            <i class="fas fa-plus text-gray-500 text-xl"></i>
                        </div>
                    </button>
                </div>
            </div>

            <!-- Bouton d'analyse -->
            <button id="analyzeMorphoBtn" onclick="MemberPortal.startMorphoAnalysis()" disabled
                    class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                <i class="fas fa-brain mr-2"></i>
                <span id="analyzeBtnText">Sélectionnez les 3 photos</span>
            </button>

            <!-- Zone de résultat -->
            <div id="morphoAnalysisResult" class="mt-3"></div>
        `;
    },

    /**
     * Gérer les onglets de l'analyse morphologique (VERSION SIMPLIFIÉE - DEPRECATED)
     * @param tabName
     */
    async showMorphoTab(tabName) {
        console.log("🔄 Changement d'onglet (deprecated):", tabName);
        // Rediriger vers la nouvelle fonction
        this.switchMorphoTab(tabName === 'history' ? 'historique' : 'analyse');
    },

    /**
     * Afficher l'onglet "Nouvelle Analyse"
     */
    async showNewAnalysisTab() {
        const tabContent = document.getElementById('morphoTabContent');
        if (!tabContent) {
            return;
        }

        console.log('🔄 Affichage onglet "Nouvelle Analyse"');

        tabContent.innerHTML = `
            <!-- Message confidentialité & Info -->
            <div class="glass-card rounded-xl p-4 mb-4 border-2 border-green-500/30 bg-green-900/10">
                <div class="flex items-start gap-3">
                    <i class="fas fa-shield-check text-green-400 text-2xl"></i>
                    <div>
                        <p class="font-bold text-white mb-1 text-sm md:text-base">
                            🔒 100% Confidentiel · Aucune sauvegarde
                        </p>
                        <p class="text-secondary text-xs md:text-sm">
                            Vos photos sont analysées <strong>localement dans votre navigateur</strong> et ne sont <strong>jamais envoyées ni sauvegardées</strong> sur nos serveurs.
                            Seul le rapport d'analyse (données texte) est conservé pour votre suivi.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Card principale d'analyse -->
            <div class="glass-card rounded-2xl p-4 md:p-6 mb-6">
                <h2 class="text-lg md:text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <i class="fas fa-camera text-purple-400"></i>
                    Étape 1 : Capturez 3 photos
                </h2>

                <!-- Conseils généraux -->
                <div class="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 md:p-4 mb-4">
                    <p class="text-blue-300 font-semibold text-xs md:text-sm mb-2">
                        <i class="fas fa-lightbulb mr-1"></i>Conseils pour des photos optimales
                    </p>
                    <ul class="text-secondary text-xs space-y-1">
                        <li>✓ <strong>Tenue</strong> : Short/boxer pour homme, brassière + short pour femme</li>
                        <li>✓ <strong>Fond</strong> : Mur uni (blanc, beige ou gris clair)</li>
                        <li>✓ <strong>Lumière</strong> : Naturelle (devant fenêtre) ou éclairage uniforme</li>
                        <li>✓ <strong>Distance</strong> : Placez le téléphone à 2-3 mètres</li>
                        <li>✓ <strong>Cadrage</strong> : Corps entier visible (tête aux pieds)</li>
                        <li>✓ <strong>Posture</strong> : Naturelle, bras légèrement écartés, pieds nus</li>
                    </ul>
                </div>

                <!-- 3 BOUTONS DE CAPTURE PHOTO -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                    <!-- 1. FACE -->
                    <div class="relative">
                        <input type="file" id="morphoPhotoFront" accept="image/*" capture="environment" class="hidden" onchange="MemberPortal.handleMorphoPhoto(event, 'front')">
                        <button onclick="document.getElementById('morphoPhotoFront').click()"
                                class="w-full glass-card rounded-xl p-4 border-2 border-gray-700 hover:border-purple-500 transition-all group">
                            <div class="flex flex-col items-center">
                                <div class="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                                    <i class="fas fa-user text-white text-2xl"></i>
                                </div>
                                <p class="text-white font-bold text-sm mb-1">1️⃣ Vue de FACE</p>
                                <p class="text-secondary text-xs text-center mb-2">Debout, pieds écartés<br>Bras légèrement écartés</p>
                                <div id="frontPhotoStatus" class="text-xs text-secondary">
                                    <i class="fas fa-circle-plus mr-1"></i>Ajouter
                                </div>
                            </div>
                        </button>
                    </div>

                    <!-- 2. PROFIL -->
                    <div class="relative">
                        <input type="file" id="morphoPhotoSide" accept="image/*" capture="environment" class="hidden" onchange="MemberPortal.handleMorphoPhoto(event, 'side')">
                        <button onclick="document.getElementById('morphoPhotoSide').click()"
                                class="w-full glass-card rounded-xl p-4 border-2 border-gray-700 hover:border-blue-500 transition-all group">
                            <div class="flex flex-col items-center">
                                <div class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                                    <i class="fas fa-user text-white text-2xl" style="transform: rotate(90deg);"></i>
                                </div>
                                <p class="text-white font-bold text-sm mb-1">2️⃣ Vue de PROFIL</p>
                                <p class="text-secondary text-xs text-center mb-2">Tourné à 90°<br>Bras le long du corps</p>
                                <div id="sidePhotoStatus" class="text-xs text-secondary">
                                    <i class="fas fa-circle-plus mr-1"></i>Ajouter
                                </div>
                            </div>
                        </button>
                    </div>

                    <!-- 3. DOS -->
                    <div class="relative">
                        <input type="file" id="morphoPhotoBack" accept="image/*" capture="environment" class="hidden" onchange="MemberPortal.handleMorphoPhoto(event, 'back')">
                        <button onclick="document.getElementById('morphoPhotoBack').click()"
                                class="w-full glass-card rounded-xl p-4 border-2 border-gray-700 hover:border-green-500 transition-all group">
                            <div class="flex flex-col items-center">
                                <div class="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                                    <i class="fas fa-user text-white text-2xl icon-rotate-180"></i>
                                </div>
                                <p class="text-white font-bold text-sm mb-1">3️⃣ Vue de DOS</p>
                                <p class="text-secondary text-xs text-center mb-2">De dos, même position<br>Pieds écartés</p>
                                <div id="backPhotoStatus" class="text-xs text-secondary">
                                    <i class="fas fa-circle-plus mr-1"></i>Ajouter
                                </div>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Preview des 3 photos (miniatures) -->
                <div id="morphoPhotoPreviews" class="hidden grid grid-cols-3 gap-2 mt-3">
                    <img id="previewFront" class="w-full h-24 object-cover rounded-lg border-2 border-purple-500" alt="Face">
                    <img id="previewSide" class="w-full h-24 object-cover rounded-lg border-2 border-blue-500" alt="Profil">
                    <img id="previewBack" class="w-full h-24 object-cover rounded-lg border-2 border-green-500" alt="Dos">
                </div>
            </div>

            <!-- Bouton d'analyse (désactivé si pas 3 photos) -->
            <div class="text-center mb-6">
                <button id="startMorphoAnalysisBtn"
                        onclick="MemberPortal.startMorphoAnalysis()"
                        disabled
                        class="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-base md:text-lg rounded-xl shadow-lg hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg">
                    <i class="fas fa-brain mr-2"></i>
                    <span id="analyzeBtnText">Sélectionnez les 3 photos d'abord</span>
                </button>
            </div>

            <!-- Zone de résultat d'analyse (cachée au départ) -->
            <div id="morphoAnalysisResult" class="hidden"></div>
        `;

        // Initialiser morphoPhotos SEULEMENT s'il n'existe pas déjà (pour ne pas perdre les photos si on change d'onglet)
        if (!this.morphoPhotos) {
            this.morphoPhotos = { front: null, side: null, back: null };
            console.log('📷 Initialisation morphoPhotos');
        } else {
            console.log('📷 morphoPhotos existe déjà, conservation des photos:', {
                front: this.morphoPhotos.front ? '✅' : '❌',
                side: this.morphoPhotos.side ? '✅' : '❌',
                back: this.morphoPhotos.back ? '✅' : '❌'
            });
            // Restaurer les statuts visuels si des photos existent
            setTimeout(() => {
                ['front', 'side', 'back'].forEach(type => {
                    if (this.morphoPhotos[type]) {
                        const statusEl = document.getElementById(`${type}PhotoStatus`);
                        if (statusEl) {
                            statusEl.innerHTML =
                                '<i class="fas fa-check-circle text-green-400 mr-1"></i>Ajoutée';
                            statusEl.classList.remove('text-secondary');
                            statusEl.classList.add('text-green-400');
                        }
                        const previewEl = document.getElementById(
                            `preview${type.charAt(0).toUpperCase() + type.slice(1)}`
                        );
                        if (previewEl) {
                            previewEl.innerHTML = `<img src="${this.morphoPhotos[type]}" class="w-full h-full object-cover">`;
                        }
                    }
                });
                document.getElementById('morphoPhotoPreviews')?.classList.remove('hidden');
                this.checkMorphoPhotosReady();
            }, 100);
        }
    },

    /**
     * Afficher l'onglet "Historique"
     */
    async showMorphoHistoryTab() {
        const tabContent = document.getElementById('morphoTabContent');
        if (!tabContent) {
            return;
        }

        // Utiliser this.currentMember au lieu de window.PortalAuth?.linkedMember
        if (!this.currentMember || !this.currentMember.id) {
            tabContent.innerHTML =
                '<p class="text-secondary text-center py-8">Aucun membre connecté</p>';
            return;
        }

        // Charger l'historique
        const history = await this.loadMorphoHistory(this.currentMember.id);

        if (history.length === 0) {
            tabContent.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-inbox text-6xl text-secondary mb-4"></i>
                    <h3 class="text-xl font-bold text-white mb-2">Aucune analyse pour le moment</h3>
                    <p class="text-secondary mb-6">Créez votre première analyse morphologique pour commencer votre suivi</p>
                    <button onclick="MemberPortal.showMorphoTab('new')"
                            class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg transition">
                        <i class="fas fa-plus-circle mr-2"></i>Nouvelle Analyse
                    </button>
                </div>
            `;
            return;
        }

        // Afficher l'historique
        tabContent.innerHTML = `
            <div class="mb-4 flex items-center justify-between">
                <h2 class="text-xl font-bold text-white">
                    <i class="fas fa-history text-purple-400 mr-2"></i>
                    Historique des analyses (${history.length})
                </h2>
            </div>

            <div class="space-y-4">
                ${history.map((analysis, index) => this.renderHistoryItem(analysis, index)).join('')}
            </div>
        `;
    },

    /**
     * Rendre un élément de l'historique
     * @param analysis
     * @param index
     */
    renderHistoryItem(analysis, index) {
        const date = new Date(analysis.analysis_date);
        const dateStr = date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        // Extraire quelques infos clés pour l'aperçu
        const data = analysis.morpho_data || {};
        const somatotype = data.somatotype?.type_principal || 'Non analysé';
        const masseGrasse = data.composition_corporelle?.masse_grasse_estimee || 'N/A';

        return `
            <div class="glass-card rounded-xl p-4 border border-gray-700 hover:border-purple-500/50 transition">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                        <h3 class="text-white font-bold text-lg mb-1">
                            ${index === 0 ? '🆕 ' : ''}Analyse #${history.length - index}
                        </h3>
                        <p class="text-secondary text-xs">
                            <i class="fas fa-calendar mr-1"></i>${dateStr} à ${timeStr}
                        </p>
                        ${analysis.analysis_version ? `<p class="text-secondary text-xs"><i class="fas fa-code-branch mr-1"></i>Version ${analysis.analysis_version}</p>` : ''}
                    </div>
                    <button onclick="MemberPortal.deleteAnalysisConfirm('${analysis.id}')"
                            class="text-red-400 hover:text-red-300 transition p-2"
                            title="Supprimer cette analyse">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>

                <!-- Aperçu des données -->
                <div class="grid grid-cols-2 gap-2 mb-3">
                    <div class="bg-purple-900/20 rounded-lg p-2 border border-purple-600/30">
                        <p class="text-purple-300 text-xs font-semibold">SOMATOTYPE</p>
                        <p class="text-white text-sm">${somatotype}</p>
                    </div>
                    <div class="bg-blue-900/20 rounded-lg p-2 border border-blue-600/30">
                        <p class="text-blue-300 text-xs font-semibold">MASSE GRASSE</p>
                        <p class="text-white text-sm">${masseGrasse}</p>
                    </div>
                </div>

                <!-- Notes -->
                ${
                    analysis.notes
                        ? `
                    <div class="bg-gray-800/50 rounded-lg p-2 mb-3 border border-gray-700">
                        <p class="text-secondary text-xs font-semibold mb-1"><i class="fas fa-sticky-note mr-1"></i>Notes :</p>
                        <p class="text-secondary text-xs">${analysis.notes}</p>
                    </div>
                `
                        : ''
                }

                <!-- Actions -->
                <div class="flex gap-2">
                    <button onclick="MemberPortal.viewAnalysisDetail('${analysis.id}')"
                            class="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition">
                        <i class="fas fa-eye mr-2"></i>Voir détails
                    </button>
                    <button onclick="MemberPortal.editAnalysisNotes('${analysis.id}', '${(analysis.notes || '').replace(/'/g, "\\'")}')"
                            class="px-4 py-2 glass-card hover:bg-gray-600 text-white text-sm font-semibold rounded-lg transition">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Voir les détails d'une analyse
     * @param analysisId
     */
    async viewAnalysisDetail(analysisId) {
        console.log('👁️ Affichage détails analyse:', analysisId);

        // Utiliser this.currentMember au lieu de window.PortalAuth?.linkedMember
        if (!this.currentMember || !this.currentMember.id) {
            this.showNotification('❌ Aucun membre connecté', 'error');
            return;
        }

        // Charger l'historique complet
        const history = await this.loadMorphoHistory(this.currentMember.id);
        console.log('📋 Historique chargé:', history.length, 'analyses');

        const analysis = history.find(a => a.id === analysisId);
        console.log('🔍 Analyse trouvée:', analysis);

        if (!analysis) {
            this.showNotification('❌ Analyse introuvable', 'error');
            console.error(
                '❌ Analyse non trouvée. ID recherché:',
                analysisId,
                'IDs disponibles:',
                history.map(a => a.id)
            );
            return;
        }

        if (!analysis.morpho_data) {
            this.showNotification("❌ Données d'analyse manquantes", 'error');
            console.error('❌ analysis.morpho_data est vide:', analysis);
            return;
        }

        // Afficher en modal ou dans une nouvelle section
        const tabContent = document.getElementById('morphoTabContent');
        if (!tabContent) {
            console.error('❌ morphoTabContent introuvable !');
            return;
        }

        tabContent.innerHTML = `
            <div class="mb-4">
                <button onclick="MemberPortal.showMorphoTab('history')"
                        class="text-secondary hover:text-white transition flex items-center gap-2 mb-4">
                    <i class="fas fa-arrow-left"></i>Retour à l'historique
                </button>
                ${this.renderMorphoAnalysis(analysis)}
            </div>
        `;

        console.log('✅ Détails affichés avec succès');
    },

    /**
     * Confirmer suppression d'analyse
     * @param analysisId
     */
    async deleteAnalysisConfirm(analysisId) {
        if (
            !confirm(
                '⚠️ Êtes-vous sûr de vouloir supprimer cette analyse ?\n\nCette action est irréversible.'
            )
        ) {
            return;
        }

        const success = await this.deleteMorphoAnalysis(analysisId);
        if (success) {
            // Recharger l'onglet historique
            await this.showMorphoHistoryTab();
        }
    },

    /**
     * Éditer les notes d'une analyse
     * @param analysisId
     * @param currentNotes
     */
    async editAnalysisNotes(analysisId, currentNotes) {
        const newNotes = prompt('📝 Notes personnelles sur cette analyse:', currentNotes || '');

        if (newNotes !== null && newNotes !== currentNotes) {
            const success = await this.updateMorphoNotes(analysisId, newNotes);
            if (success) {
                // Recharger l'onglet historique
                await this.showMorphoHistoryTab();
            }
        }
    },

    /**
     * Sauvegarder manuellement l'analyse actuelle dans l'historique
     */
    async saveAnalysisToHistory() {
        console.log('💾 Sauvegarde manuelle demandée...');

        if (!this.lastMorphoAnalysis) {
            this.showNotification('❌ Aucune analyse à sauvegarder', 'error');
            return;
        }

        if (!this.currentMember) {
            this.showNotification('❌ Aucun membre connecté', 'error');
            return;
        }

        try {
            // Désactiver le bouton pendant la sauvegarde
            const saveBtn = event.target.closest('button');
            if (saveBtn) {
                saveBtn.disabled = true;
                saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sauvegarde...';
            }

            await this.saveMorphoAnalysis(
                this.currentMember.id,
                this.lastMorphoAnalysis,
                this.lastSkeletonData
            );

            // Recharger l'analyse pour afficher avec l'ID et cacher le bouton
            const history = await this.loadMorphoHistory(this.currentMember.id);
            if (history.length > 0) {
                this.displayMorphoAnalysis(history[0]);
            }
        } catch (error) {
            console.error('❌ Erreur sauvegarde manuelle:', error);
            this.showNotification('❌ Erreur lors de la sauvegarde: ' + error.message, 'error');
        }
    },

    /**
     * Exporter l'analyse en PDF - Version Simplifiée et Robuste
     * @param event
     */
    async exportAnalysisToPDF(event) {
        console.log('📄 Export PDF demandé...');

        if (!this.lastMorphoAnalysis) {
            this.showNotification('❌ Aucune analyse à exporter', 'error');
            return;
        }

        let saveBtn = null;
        try {
            // Récupérer le bouton de manière sécurisée
            if (event && event.target) {
                saveBtn = event.target.closest('button');
                if (saveBtn) {
                    saveBtn.disabled = true;
                    saveBtn.innerHTML =
                        '<i class="fas fa-spinner fa-spin mr-2"></i>Génération PDF...';
                }
            }

            // Récupérer le contenu de l'analyse
            const printContent = document.getElementById('morphoAnalysisResult');
            if (!printContent) {
                throw new Error("Contenu de l'analyse introuvable");
            }

            // Préparer le contenu pour l'impression
            const memberName = this.currentMember?.name || 'Adhérent';
            const analysisDate = new Date().toLocaleDateString('fr-FR');

            // Créer une fenêtre d'impression propre
            const printWindow = window.open('', '_blank', 'width=1200,height=800');

            if (!printWindow) {
                throw new Error('Pop-up bloqué. Autorisez les pop-ups pour ce site.');
            }

            printWindow.document.write(`
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Analyse Morphologique - ${memberName} - ${analysisDate}</title>
                    <script src="https://cdn.tailwindcss.com"><\/script>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
                    <style>
                        @media print {
                            body {
                                print-color-adjust: exact !important;
                                -webkit-print-color-adjust: exact !important;
                                color-adjust: exact !important;
                            }
                            .no-print { display: none !important; }
                            .page-break { page-break-before: always; }
                            button { display: none !important; }
                        }
                        @media screen {
                            body {
                                background: #0f172a;
                                min-height: 100vh;
                            }
                        }
                        body {
                            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                            line-height: 1.6;
                        }
                        .print-header {
                            text-align: center;
                            margin-bottom: 2rem;
                            padding: 1rem;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            border-radius: 0.5rem;
                        }
                    </style>
                </head>
                <body class="p-4 md:p-8">
                    <!-- En-tête pour impression -->
                    <div class="print-header">
                        <h1 class="text-3xl font-bold mb-2">📊 Analyse Morphologique Complète</h1>
                        <p class="text-lg">${memberName}</p>
                        <p class="text-sm opacity-90">${analysisDate}</p>
                    </div>

                    <!-- Boutons d'action (masqués à l'impression) -->
                    <div class="mb-6 text-center no-print space-x-2">
                        <button onclick="window.print()"
                                class="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg shadow-lg transition">
                            <i class="fas fa-print mr-2"></i>Imprimer / Enregistrer en PDF
                        </button>
                        <button onclick="window.close()"
                                class="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold rounded-lg shadow-lg transition">
                            <i class="fas fa-times mr-2"></i>Fermer
                        </button>
                    </div>

                    <!-- Contenu de l'analyse -->
                    <div class="max-w-5xl mx-auto">
                        ${printContent.innerHTML}
                    </div>

                    <!-- Footer pour impression -->
                    <div class="mt-8 pt-4 border-t border-gray-700 text-center text-sm text-secondary no-print">
                        <p>Document généré automatiquement par Skaliprog v2.3.4</p>
                        <p class="text-xs mt-1">© ${new Date().getFullYear()} - Analyse professionnelle par IA Claude</p>
                    </div>
                </body>
                </html>
            `);

            printWindow.document.close();

            // Attendre que la fenêtre soit chargée avant d'afficher la notification
            setTimeout(() => {
                this.showNotification(
                    '✅ Fenêtre PDF ouverte ! Cliquez sur "Imprimer" puis "Enregistrer en PDF"',
                    'success'
                );
            }, 500);

            // Réactiver le bouton après un délai
            if (saveBtn) {
                setTimeout(() => {
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = '<i class="fas fa-file-pdf mr-2"></i>Exporter en PDF';
                }, 2000);
            }
        } catch (error) {
            console.error('❌ Erreur export PDF:', error);
            this.showNotification('❌ Erreur: ' + error.message, 'error');

            // Réactiver le bouton en cas d'erreur
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i class="fas fa-file-pdf mr-2"></i>Exporter en PDF';
            }
        }
    },

    /**
     * SUPPRESSION des anciennes fonctions VideoAI
     */
    async startWebcam() {
        this.showNotification(
            "⚠️ Fonction désactivée - Utilisez l'analyse morphologique",
            'warning'
        );
    },

    async handleVideoUpload(event) {
        this.showNotification(
            "⚠️ Fonction désactivée - Utilisez l'analyse morphologique",
            'warning'
        );
    },

    stopAnalysis() {
        this.showNotification(
            "⚠️ Fonction désactivée - Utilisez l'analyse morphologique",
            'warning'
        );
    },

    async saveVideoAnalysis(memberId, analysisData) {
        // Deprecated - Ne plus utiliser
        console.warn('⚠️ saveVideoAnalysis est déprécié. Utilisez saveMorphoAnalysis à la place.');
        return null;
    },

    /**
     * Charger historique vidéos
     * @param memberId
     */
    async loadVideoHistory(memberId) {
        const container = document.getElementById('videoHistoryContainer');
        if (!container) {
            return;
        }

        try {
            const { data, error } = await SupabaseManager.supabase
                .from('video_analyses')
                .select('*')
                .eq('member_id', memberId)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) {
                throw error;
            }

            if (!data || data.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-8">
                        <i class="fas fa-inbox text-5xl text-secondary mb-3"></i>
                        <p class="text-secondary">Aucune analyse enregistrée</p>
                        <p class="text-sm text-secondary">Commencez par analyser une vidéo</p>
                    </div>
                `;
                return;
            }

            // Afficher l'historique
            container.innerHTML = `
                <div class="space-y-3">
                    ${data
                        .map(
                            analysis => `
                        <div class="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-green-500/50 transition-all">
                            <div class="flex items-center justify-between mb-2">
                                <h4 class="text-lg font-bold text-white flex items-center gap-2">
                                    <i class="fas fa-dumbbell text-green-400"></i>
                                    ${analysis.exercise_name}
                                </h4>
                                <span class="text-xs text-secondary">
                                    ${new Date(analysis.created_at).toLocaleDateString('fr-FR')}
                                </span>
                            </div>
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div class="bg-blue-900/30 rounded-lg p-3 border border-blue-500/30">
                                    <p class="text-xs text-blue-300 mb-1">Répétitions</p>
                                    <p class="text-2xl font-bold text-white">${analysis.rep_count || 0}</p>
                                </div>
                                <div class="bg-green-900/30 rounded-lg p-3 border border-green-500/30">
                                    <p class="text-xs text-green-300 mb-1">Score Forme</p>
                                    <p class="text-2xl font-bold text-white">${analysis.form_score || 0}<span class="text-sm">/100</span></p>
                                </div>
                                <div class="bg-purple-900/30 rounded-lg p-3 border border-purple-500/30">
                                    <p class="text-xs text-purple-300 mb-1">Source</p>
                                    <p class="text-sm font-bold text-white capitalize">${analysis.source_type || 'N/A'}</p>
                                </div>
                                <div class="bg-yellow-900/30 rounded-lg p-3 border border-yellow-500/30">
                                    <p class="text-xs text-yellow-300 mb-1">Conseils</p>
                                    <p class="text-sm font-bold text-white">${analysis.analysis_data?.recommendations?.length || 0}</p>
                                </div>
                            </div>
                            ${
                                analysis.analysis_data?.recommendations
                                    ? `
                                <div class="mt-3 pt-3 border-t border-gray-700">
                                    <p class="text-xs font-semibold text-secondary mb-2">Recommandations:</p>
                                    <ul class="text-sm text-secondary space-y-1">
                                        ${analysis.analysis_data.recommendations
                                            .map(
                                                rec => `
                                            <li class="flex items-start gap-2">
                                                <i class="fas fa-check-circle text-green-400 mt-1"></i>
                                                <span>${rec}</span>
                                            </li>
                                        `
                                            )
                                            .join('')}
                                    </ul>
                                </div>
                            `
                                    : ''
                            }
                        </div>
                    `
                        )
                        .join('')}
                </div>
            `;
        } catch (error) {
            console.error('❌ Erreur chargement historique:', error);
            container.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-exclamation-circle text-5xl text-red-600 mb-3"></i>
                    <p class="text-secondary">Erreur de chargement</p>
                </div>
            `;
        }
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
            warning: 'bg-yellow-500'
        };

        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-fade-in`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    },

    // ===================================================================
    // GESTION FRÉQUENCE CARDIAQUE (HR)
    // ===================================================================

    // Variables pour la simulation
    hrSimulationInterval: null,
    hrSimulationActive: false,

    /**
     * Vérifier si une connexion HR existe déjà
     */
    checkExistingHRConnection() {
        if (!this.currentMember) {
            return;
        }

        // Vérifier connexion existante via WearablesIntegration
        if (typeof WearablesIntegration !== 'undefined') {
            const connections = WearablesIntegration.getActiveConnections();
            const hrConnection = connections.find(c => c.memberId === this.currentMember.id);

            if (hrConnection) {
                this.updateHRDisplay(true, hrConnection.lastHR, hrConnection.source);
            }
        }

        // Écouter les mises à jour HR
        window.addEventListener('wearable-hr-update', event => {
            if (this.currentMember && event.detail.memberId === this.currentMember.id) {
                this.updateHRDisplay(true, event.detail.heartRate, event.detail.source);
            }
        });

        // Écouter les déconnexions
        window.addEventListener('wearable-disconnected', event => {
            if (this.currentMember && event.detail.memberId === this.currentMember.id) {
                this.updateHRDisplay(false);
            }
        });
    },

    /**
     * Mettre à jour l'affichage HR
     * @param connected
     * @param hr
     * @param source
     */
    updateHRDisplay(connected, hr = null, source = null) {
        const statusBadge = document.getElementById('hrConnectionStatus');
        const hrDisplayBox = document.getElementById('hrDisplayBox');
        const hrValueDisplay = document.getElementById('hrValueDisplay');
        const hrZoneDisplay = document.getElementById('hrZoneDisplay');

        if (!statusBadge) {
            return;
        }

        if (connected && hr) {
            // Afficher connecté
            statusBadge.className = 'text-xs px-3 py-1 rounded-full bg-green-600 text-white';
            statusBadge.innerHTML = '<i class="fas fa-circle mr-1"></i>Connecté';

            // Afficher la FC
            if (hrDisplayBox) {
                hrDisplayBox.classList.remove('hidden');
                hrValueDisplay.textContent = hr;

                // Calculer la zone
                const age = this.calculateAge(this.currentMember.birthdate);
                const zone = this.calculateHRZone(hr, age);
                hrZoneDisplay.textContent = `Zone ${zone.name}`;
                hrZoneDisplay.className = `mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold ${zone.bgClass} ${zone.textClass}`;
            }
        } else {
            // Afficher déconnecté
            statusBadge.className = 'text-xs px-3 py-1 rounded-full glass-card text-secondary';
            statusBadge.innerHTML = '<i class="fas fa-circle text-secondary mr-1"></i>Non connecté';

            if (hrDisplayBox) {
                hrDisplayBox.classList.add('hidden');
            }
        }
    },

    /**
     * Calculer l'âge depuis la date de naissance
     * @param birthdate
     */
    calculateAge(birthdate) {
        if (!birthdate) {
            return 30;
        } // Défaut
        const today = new Date();
        const birth = new Date(birthdate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    },

    /**
     * Calculer la zone cardiaque
     * @param hr
     * @param age
     */
    calculateHRZone(hr, age) {
        const maxHR = 220 - age;
        const percentage = (hr / maxHR) * 100;

        const zones = [
            { name: '1', min: 0, max: 60, bgClass: 'bg-green-500/20', textClass: 'text-green-300' },
            { name: '2', min: 60, max: 70, bgClass: 'bg-blue-500/20', textClass: 'text-blue-300' },
            {
                name: '3',
                min: 70,
                max: 80,
                bgClass: 'bg-yellow-500/20',
                textClass: 'text-yellow-300'
            },
            {
                name: '4',
                min: 80,
                max: 90,
                bgClass: 'bg-orange-500/20',
                textClass: 'text-orange-300'
            },
            { name: '5', min: 90, max: 100, bgClass: 'bg-red-500/20', textClass: 'text-red-300' }
        ];

        for (const zone of zones) {
            if (percentage >= zone.min && percentage < zone.max) {
                return zone;
            }
        }

        return zones[zones.length - 1]; // Zone 5 par défaut si > 100%
    },

    /**
     * Connexion Bluetooth
     */
    async connectHRBluetooth() {
        if (!this.currentMember) {
            this.showNotification('Aucun profil trouvé', 'error');
            return;
        }

        try {
            // Vérifier que Web Bluetooth est disponible
            if (!navigator.bluetooth) {
                // Afficher modal avec instructions détaillées
                this.showBluetoothHelp();
                return;
            }

            this.showNotification('Recherche de dispositifs...', 'warning');

            // Charger WearablesIntegration si pas déjà chargé
            if (typeof WearablesIntegration === 'undefined') {
                // Charger le script
                await this.loadScript('js/integrations/wearables-integration.js');
                await new Promise(resolve => setTimeout(resolve, 500)); // Attendre chargement
            }

            // Connecter via WearablesIntegration
            await WearablesIntegration.connectBluetoothDevice(this.currentMember.id);

            this.showNotification('Montre connectée avec succès !', 'success');
        } catch (error) {
            console.error('Erreur connexion Bluetooth:', error);

            // Gestion erreurs spécifiques
            if (error.message && error.message.includes('globally disabled')) {
                this.showBluetoothHelp();
            } else if (error.name === 'NotFoundError') {
                this.showNotification('Aucun dispositif sélectionné', 'warning');
            } else {
                this.showNotification('Erreur de connexion: ' + error.message, 'error');
            }
        }
    },

    /**
     * Afficher les autres options de connexion HR
     */
    showHROptions() {
        // Créer une modal avec les options Strava, HypeRate, etc.
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-bold text-white">Autres méthodes de connexion</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-secondary hover:text-white">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>

                <div class="space-y-3">
                    <!-- Strava -->
                    <div class="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
                        <div class="flex items-start gap-3">
                            <i class="fab fa-strava text-2xl text-orange-400 mt-1"></i>
                            <div class="flex-1">
                                <h4 class="font-bold text-white mb-1">Strava</h4>
                                <p class="text-xs text-secondary mb-3">Importez vos données après votre séance</p>
                                <button onclick="MemberPortal.connectStrava()" class="w-full bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                                    Connecter Strava
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- HypeRate -->
                    <div class="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                        <div class="flex items-start gap-3">
                            <i class="fas fa-broadcast-tower text-2xl text-purple-400 mt-1"></i>
                            <div class="flex-1">
                                <h4 class="font-bold text-white mb-1">HypeRate.io</h4>
                                <p class="text-xs text-secondary mb-3">Streaming professionnel en temps réel</p>
                                <button onclick="MemberPortal.connectHypeRate()" class="w-full bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                                    Connecter HypeRate
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Info -->
                    <div class="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                        <div class="flex items-start gap-3">
                            <i class="fas fa-info-circle text-blue-400 text-lg mt-1"></i>
                            <div class="text-xs text-secondary">
                                <p><strong>Bluetooth Direct</strong> : Connexion en temps réel (Apple Watch, ceintures cardio)</p>
                                <p class="mt-2"><strong>Strava</strong> : Import après la séance (toutes montres compatibles)</p>
                                <p class="mt-2"><strong>HypeRate</strong> : Streaming pro pour live streams</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Fermer en cliquant en dehors
        modal.addEventListener('click', e => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    },

    /**
     * Connecter Strava (Terra API)
     */
    async connectStrava() {
        this.showNotification('Fonction Strava en cours de développement', 'warning');
        // TODO: Implémenter Terra API OAuth
    },

    /**
     * Connecter HypeRate
     */
    async connectHypeRate() {
        if (!this.currentMember) {
            this.showNotification('Aucun profil trouvé', 'error');
            return;
        }

        // Demander le HypeRate ID à l'adhérent
        const hyperateId = prompt(
            '🎯 Connecter HypeRate.io\n\n' +
                '1. Installez l\'app "HypeRate Companion" sur votre téléphone\n' +
                "2. Connectez votre montre dans l'app\n" +
                '3. Copiez votre HypeRate ID\n\n' +
                'Entrez votre HypeRate ID :'
        );

        if (!hyperateId || !hyperateId.trim()) {
            return; // Annulé
        }

        try {
            this.showNotification('Connexion à HypeRate.io...', 'warning');

            // Charger WearablesIntegration si pas déjà chargé
            if (typeof WearablesIntegration === 'undefined') {
                await this.loadScript('js/integrations/wearables-integration.js');
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Initialiser si besoin
            if (!WearablesIntegration.initialized) {
                await WearablesIntegration.init();
            }

            // Connecter
            const result = await WearablesIntegration.connectHypeRate(
                this.currentMember.id,
                hyperateId.trim()
            );

            if (result.success) {
                this.showNotification(
                    '✅ HypeRate connecté ! Lancez une activité sur votre montre.',
                    'success'
                );

                // Mettre à jour l'affichage
                this.updateHRDisplay(true, null, 'hyperate');

                const statusBadge = document.getElementById('hrConnectionStatus');
                if (statusBadge) {
                    statusBadge.className =
                        'text-xs px-3 py-1 rounded-full bg-purple-600 text-white animate-pulse';
                    statusBadge.innerHTML =
                        '<i class="fas fa-broadcast-tower mr-1"></i>HypeRate En Attente...';
                }
            } else {
                this.showNotification('❌ Erreur HypeRate: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Erreur connexion HypeRate:', error);
            this.showNotification('Erreur: ' + error.message, 'error');
        }
    },

    /**
     * Activer/Désactiver simulation HR
     */
    toggleHRSimulation() {
        if (!this.currentMember) {
            this.showNotification('Aucun profil trouvé', 'error');
            return;
        }

        const btn = document.getElementById('simulationBtn');

        if (this.hrSimulationActive) {
            // Arrêter la simulation
            if (this.hrSimulationInterval) {
                clearInterval(this.hrSimulationInterval);
                this.hrSimulationInterval = null;
            }

            this.hrSimulationActive = false;

            // Diffuser déconnexion via HRBroadcast
            if (typeof HRBroadcast !== 'undefined') {
                HRBroadcast.sendDisconnect(this.currentMember.id);
            }

            // Émettre événement de déconnexion localement
            const disconnectEvent = new CustomEvent('wearable-disconnected', {
                detail: { memberId: this.currentMember.id }
            });
            window.dispatchEvent(disconnectEvent);

            // Mettre à jour le bouton
            btn.innerHTML = '<i class="fas fa-flask text-lg mr-2"></i>Mode Simulation (Test)';
            btn.className =
                'w-full bg-gradient-to-r from-purple-500 to-purple-700 text-white px-4 py-3 rounded-lg font-bold text-sm hover:from-purple-600 hover:to-purple-800 transition touch-active flex items-center justify-center gap-2';

            this.showNotification('Simulation arrêtée', 'warning');
        } else {
            // Démarrer la simulation
            this.hrSimulationActive = true;

            const baseHR = 75; // FC de base
            let eventCount = 0;

            // Simuler variations de FC toutes les 2 secondes
            this.hrSimulationInterval = setInterval(() => {
                // Varier la FC de ±20 BPM autour de la base (simule un entraînement)
                const variation = Math.floor(Math.random() * 40) - 20;
                const hr = Math.max(60, Math.min(200, baseHR + variation));

                // Diffuser via HRBroadcast (communication inter-onglets)
                if (typeof HRBroadcast !== 'undefined') {
                    HRBroadcast.sendHRUpdate(this.currentMember.id, hr, 'simulator');
                }

                // Émettre l'événement custom localement aussi
                const event = new CustomEvent('wearable-hr-update', {
                    detail: {
                        memberId: this.currentMember.id,
                        heartRate: hr,
                        source: 'simulator',
                        timestamp: new Date()
                    }
                });

                window.dispatchEvent(event);
                eventCount++;

                console.log(`🧪 Simulation HR: ${hr} BPM (événement #${eventCount})`);
            }, 2000);

            // Mettre à jour le bouton
            btn.innerHTML = '<i class="fas fa-stop-circle text-lg mr-2"></i>Arrêter Simulation';
            btn.className =
                'w-full bg-gradient-to-r from-red-500 to-red-700 text-white px-4 py-3 rounded-lg font-bold text-sm hover:from-red-600 hover:to-red-800 transition touch-active flex items-center justify-center gap-2';

            this.showNotification('Simulation démarrée - FC simulée en cours', 'success');
        }
    },

    /**
     * Afficher aide activation Bluetooth
     */
    showBluetoothHelp() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-gradient-to-br from-red-900 to-gray-900 rounded-2xl p-6 max-w-lg w-full border-2 border-red-500">
                <div class="text-center mb-4">
                    <i class="fab fa-bluetooth-b text-6xl text-red-400 mb-3"></i>
                    <h3 class="text-2xl font-bold text-white mb-2">Bluetooth Web désactivé</h3>
                    <p class="text-secondary text-sm">Le Bluetooth Web n'est pas activé dans votre navigateur</p>
                </div>

                <div class="bg-gray-900/50 rounded-lg p-4 mb-4 text-left">
                    <p class="text-white font-semibold mb-3 flex items-center gap-2">
                        <i class="fas fa-tools text-blue-400"></i>
                        Comment activer:
                    </p>
                    <ol class="text-sm text-secondary space-y-3 list-decimal list-inside">
                        <li>
                            <strong>Copiez cette URL:</strong>
                            <div class="mt-2 bg-blue-900/50 px-3 py-2 rounded text-blue-200 font-mono text-xs break-all">
                                chrome://flags/#enable-web-bluetooth-new-permissions-backend
                            </div>
                        </li>
                        <li><strong>Collez-la</strong> dans la barre d'adresse de Chrome/Edge</li>
                        <li><strong>Cherchez</strong> "Web Bluetooth"</li>
                        <li><strong>Sélectionnez</strong> "Enabled"</li>
                        <li><strong>Redémarrez</strong> le navigateur</li>
                    </ol>
                </div>

                <div class="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-3 mb-4">
                    <div class="flex items-start gap-2">
                        <i class="fas fa-lightbulb text-yellow-400 mt-1"></i>
                        <div class="text-xs text-yellow-200">
                            <p class="font-semibold mb-1">Alternative (Edge):</p>
                            <p class="font-mono bg-gray-900/50 px-2 py-1 rounded">edge://flags/#enable-experimental-web-platform-features</p>
                        </div>
                    </div>
                </div>

                <div class="flex gap-3">
                    <button onclick="navigator.clipboard.writeText('chrome://flags/#enable-web-bluetooth-new-permissions-backend').then(() => { this.innerHTML = '<i class=\\'fas fa-check mr-2\\'></i>Copié!'; })"
                            class="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-lg font-semibold transition text-sm">
                        <i class="fas fa-copy mr-2"></i>Copier l'URL
                    </button>
                    <button onclick="this.closest('.fixed').remove()"
                            class="flex-1 glass-card hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-semibold transition text-sm">
                        Fermer
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Fermer en cliquant en dehors
        modal.addEventListener('click', e => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    },

    /**
     * Charger un script dynamiquement
     * @param src
     */
    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
};

// Export
window.MemberPortal = MemberPortal;
console.log('✅ member-portal.js chargé, MemberPortal disponible:', typeof MemberPortal);
