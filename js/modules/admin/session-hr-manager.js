/**
 * SESSION HR MANAGER - Module Admin
 * Gérer les adhérents du cours et leur affichage HR sur TV
 *
 * Fonctionnalités:
 * - Créer une session de cours
 * - Sélectionner les adhérents présents
 * - Générer un lien unique pour la TV
 * - Activer/désactiver l'affichage TV
 * - Voir les connexions HR en temps réel
 */

const SessionHRManager = {
    currentSession: null,
    sessions: [],

    // ===================================================================
    // AFFICHAGE PRINCIPAL
    // ===================================================================
    async show() {
        if (typeof ViewManager !== 'undefined') {
            ViewManager.clearAllActiveStates();
        }

        const html = `
            <div class="min-h-screen bg-slate-gradient">

                <!-- Header -->
                <div class="px-6 py-8 mb-8 bg-dark-header">
                    <div class="max-w-7xl mx-auto">
                        <h1 class="text-4xl font-black text-white mb-2 flex items-center">
                            <i class="fas fa-chalkboard-teacher mr-4"></i>
                            Gestion Séances HR
                        </h1>
                        <p class="text-slate-300 text-lg">
                            Sélectionnez les adhérents du cours pour afficher leur FC sur TV
                        </p>
                    </div>
                </div>

                <div class="max-w-7xl mx-auto px-6 pb-12">

                    <!-- Actions principales -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                        <!-- Créer nouvelle session -->
                        <div class="bg-white rounded-2xl p-6 shadow-lg border-2 border-sky-200">
                            <div class="flex items-center gap-4 mb-4">
                                <div class="w-14 h-14 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
                                    <i class="fas fa-plus text-2xl text-white"></i>
                                </div>
                                <h3 class="text-xl font-bold text-slate-800">Nouvelle Séance</h3>
                            </div>
                            <p class="text-slate-600 text-sm mb-4">
                                Créez une nouvelle session pour un cours et sélectionnez les adhérents présents
                            </p>
                            <button onclick="SessionHRManager.createNewSession()"
                                    class="w-full px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-xl hover:shadow-xl transition-all">
                                <i class="fas fa-calendar-plus mr-2"></i>
                                Créer une séance
                            </button>
                        </div>

                        <!-- Session active -->
                        <div id="activeSessionCard" class="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-200 hidden">
                            <div class="flex items-center gap-4 mb-4">
                                <div class="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                    <i class="fas fa-signal text-2xl text-white"></i>
                                </div>
                                <h3 class="text-xl font-bold text-slate-800">Séance Active</h3>
                            </div>
                            <div class="mb-4">
                                <div class="flex items-center justify-between mb-2">
                                    <span class="text-sm font-semibold text-slate-600">Adhérents:</span>
                                    <span id="activeCount" class="text-2xl font-black text-green-600">0</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-sm font-semibold text-slate-600">Connectés:</span>
                                    <span id="connectedCount" class="text-2xl font-black text-green-600">0</span>
                                </div>
                            </div>
                            <button onclick="SessionHRManager.manageSession()"
                                    class="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-xl transition-all">
                                <i class="fas fa-edit mr-2"></i>
                                Gérer la séance
                            </button>
                        </div>

                        <!-- Ouvrir TV -->
                        <div class="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-200">
                            <div class="flex items-center gap-4 mb-4">
                                <div class="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                                    <i class="fas fa-tv text-2xl text-white"></i>
                                </div>
                                <h3 class="text-xl font-bold text-slate-800">Affichage TV</h3>
                            </div>
                            <p class="text-slate-600 text-sm mb-4">
                                Ouvrez l'affichage TV sur le 2ème écran pour voir les FC en direct
                            </p>
                            <button onclick="SessionHRManager.openTV()"
                                    class="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold rounded-xl hover:shadow-xl transition-all">
                                <i class="fas fa-external-link-alt mr-2"></i>
                                Ouvrir sur TV
                            </button>
                        </div>
                    </div>

                    <!-- Sessions récentes -->
                    <div class="bg-white rounded-2xl p-6 shadow-lg">
                        <h3 class="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                            <i class="fas fa-history mr-3 text-sky-500"></i>
                            Sessions Récentes
                        </h3>
                        <div id="sessionsList"></div>
                    </div>

                </div>
            </div>
        `;

        document.getElementById('mainContent').innerHTML = html;

        // Charger les sessions
        await this.loadSessions();
    },

    // ===================================================================
    // GESTION DES SESSIONS
    // ===================================================================
    async createNewSession() {
        const sessionName = prompt('Nom de la séance (ex: CrossFit 18h00, Hyrox 19h30...):');

        if (!sessionName) {
            return;
        }

        // Créer la session
        const session = {
            id: 'session_' + Date.now(),
            name: sessionName,
            date: new Date().toISOString(),
            members: [],
            isActive: true,
            tvLink: null
        };

        this.currentSession = session;

        // Sauvegarder dans Supabase (ou localStorage pour le moment)
        await this.saveSession(session);

        // Ouvrir le modal de sélection des adhérents
        this.openMemberSelection(session);
    },

    async openMemberSelection(session) {
        // Récupérer tous les membres
        const allMembers = await SupabaseManager.getMembers();

        const modal = document.createElement('div');
        modal.className =
            'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-3xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col modal-shadow-deep">

                <!-- Header -->
                <div class="mb-6">
                    <h2 class="text-3xl font-black text-slate-800 mb-2">${session.name}</h2>
                    <p class="text-slate-600">Sélectionnez les adhérents présents à cette séance</p>
                </div>

                <!-- Recherche -->
                <div class="mb-6">
                    <input type="text" id="memberSearch" placeholder="Rechercher un adhérent..."
                           class="w-full px-4 py-3 border-2 border-sky-300 rounded-xl focus:border-sky-500 focus:outline-none"
                           oninput="SessionHRManager.filterMembers(this.value)">
                </div>

                <!-- Liste des membres (scrollable) -->
                <div id="membersList" class="flex-1 overflow-y-auto mb-6 space-y-2"></div>

                <!-- Footer -->
                <div class="flex gap-4">
                    <button onclick="this.closest('.fixed').remove()"
                            class="flex-1 px-6 py-3 bg-slate-200 hover:bg-slate-300 rounded-xl font-bold transition-all">
                        Annuler
                    </button>
                    <button onclick="SessionHRManager.confirmSelection()"
                            class="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-xl transition-all">
                        <span id="selectedCount">0</span> adhérents - Valider
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Rendre la liste des membres
        this.renderMembersList(allMembers, session);
    },

    renderMembersList(members, session) {
        const container = document.getElementById('membersList');

        container.innerHTML = members
            .map(member => {
                const isSelected = session.members.includes(member.id);

                return `
                <div class="flex items-center gap-4 p-4 border-2 ${isSelected ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-white'} rounded-xl cursor-pointer hover:border-sky-500 transition-all member-item"
                     data-member-id="${member.id}"
                     data-member-name="${member.name.toLowerCase()}"
                     onclick="SessionHRManager.toggleMember('${member.id}', this)">

                    <div class="w-10 h-10 rounded-full ${isSelected ? 'bg-green-500' : 'bg-slate-300'} flex items-center justify-center text-white font-bold transition-all">
                        ${isSelected ? '<i class="fas fa-check"></i>' : member.name.charAt(0)}
                    </div>

                    <div class="flex-1">
                        <div class="font-bold text-slate-800">${member.name}</div>
                        <div class="text-sm text-slate-500">${member.email || "Pas d'email"}</div>
                    </div>

                    ${isSelected ? '<i class="fas fa-check-circle text-2xl text-green-500"></i>' : ''}
                </div>
            `;
            })
            .join('');

        this.updateSelectedCount();
    },

    filterMembers(query) {
        const items = document.querySelectorAll('.member-item');
        const normalizedQuery = query.toLowerCase();

        items.forEach(item => {
            const memberName = item.getAttribute('data-member-name');
            if (memberName.includes(normalizedQuery)) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });
    },

    toggleMember(memberId, element) {
        if (!this.currentSession) {
            return;
        }

        const index = this.currentSession.members.indexOf(memberId);

        if (index > -1) {
            // Retirer
            this.currentSession.members.splice(index, 1);
            element.classList.remove('border-green-500', 'bg-green-50');
            element.classList.add('border-slate-200', 'bg-white');
            element.querySelector('.w-10').classList.remove('bg-green-500');
            element.querySelector('.w-10').classList.add('bg-slate-300');
            element.querySelector('.w-10').innerHTML = element
                .querySelector('.font-bold')
                .textContent.charAt(0);
            element.querySelector('.fa-check-circle')?.remove();
        } else {
            // Ajouter
            this.currentSession.members.push(memberId);
            element.classList.add('border-green-500', 'bg-green-50');
            element.classList.remove('border-slate-200', 'bg-white');
            element.querySelector('.w-10').classList.add('bg-green-500');
            element.querySelector('.w-10').classList.remove('bg-slate-300');
            element.querySelector('.w-10').innerHTML = '<i class="fas fa-check"></i>';
            element
                .querySelector('.flex-1')
                .insertAdjacentHTML(
                    'afterend',
                    '<i class="fas fa-check-circle text-2xl text-green-500"></i>'
                );
        }

        this.updateSelectedCount();
    },

    updateSelectedCount() {
        const count = this.currentSession ? this.currentSession.members.length : 0;
        const counter = document.getElementById('selectedCount');
        if (counter) {
            counter.textContent = count;
        }
    },

    async confirmSelection() {
        if (!this.currentSession || this.currentSession.members.length === 0) {
            alert('Veuillez sélectionner au moins un adhérent');
            return;
        }

        // Générer le lien unique pour la TV
        this.currentSession.tvLink = `/session-tv.html?sessionId=${this.currentSession.id}`;

        // Sauvegarder
        await this.saveSession(this.currentSession);

        // Fermer le modal
        document.querySelector('.fixed.inset-0').remove();

        // Rafraîchir l'affichage
        this.show();

        // Notification
        alert(
            `✅ Séance "${this.currentSession.name}" créée avec ${this.currentSession.members.length} adhérents !\n\nVous pouvez maintenant ouvrir l'affichage TV.`
        );
    },

    // ===================================================================
    // GESTION TV
    // ===================================================================
    async openTV() {
        if (!this.currentSession) {
            alert("Veuillez d'abord créer une séance");
            return;
        }

        // Sauvegarder l'ID de session dans localStorage pour que CardioTVLive le récupère
        localStorage.setItem('cardio_tv_session_id', this.currentSession.id);

        console.log(`📺 Ouverture Cardio TV avec session: ${this.currentSession.name}`);

        // Ouvrir cardio-tv.html dans une nouvelle fenêtre (2ème écran)
        const width = 1920;
        const height = 1080;
        const left = screen.width - width; // Positionner sur 2ème écran
        const top = 0;

        const tvWindow = window.open(
            'cardio-tv.html',
            'CardioTVLive',
            `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
        );

        if (!tvWindow) {
            alert(
                "Impossible d'ouvrir la fenêtre TV. Vérifiez que les popups ne sont pas bloqués."
            );
        } else {
            console.log('✅ Fenêtre Cardio TV ouverte');
        }
    },

    // ===================================================================
    // PERSISTENCE
    // ===================================================================
    async saveSession(session) {
        // Pour l'instant, utiliser localStorage
        // En production, sauvegarder dans Supabase

        let sessions = JSON.parse(localStorage.getItem('hr_sessions') || '[]');

        const index = sessions.findIndex(s => s.id === session.id);
        if (index > -1) {
            sessions[index] = session;
        } else {
            sessions.push(session);
        }

        localStorage.setItem('hr_sessions', JSON.stringify(sessions));

        // TODO: Sauvegarder dans Supabase
        /*
        await SupabaseManager.supabase
            .from('hr_sessions')
            .upsert({
                id: session.id,
                name: session.name,
                date: session.date,
                members: session.members,
                is_active: session.isActive
            });
        */
    },

    async loadSessions() {
        // Charger depuis localStorage
        this.sessions = JSON.parse(localStorage.getItem('hr_sessions') || '[]');

        // Trouver la session active
        this.currentSession = this.sessions.find(s => s.isActive);

        // Mettre à jour l'affichage
        if (this.currentSession) {
            document.getElementById('activeSessionCard')?.classList.remove('hidden');
            document.getElementById('activeCount').textContent = this.currentSession.members.length;

            // Compter les connexions actives
            if (typeof WearablesIntegration !== 'undefined') {
                const connections = WearablesIntegration.getActiveConnections();
                const connectedInSession = connections.filter(c =>
                    this.currentSession.members.includes(c.memberId)
                );
                document.getElementById('connectedCount').textContent = connectedInSession.length;
            }
        }

        // Afficher la liste
        this.renderSessionsList();
    },

    renderSessionsList() {
        const container = document.getElementById('sessionsList');
        if (!container) {
            return;
        }

        if (this.sessions.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12 text-slate-400">
                    <i class="fas fa-inbox text-6xl mb-4"></i>
                    <p class="text-lg">Aucune session créée</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.sessions
            .slice(0, 10)
            .map(
                session => `
            <div class="flex items-center justify-between p-4 border-2 border-slate-200 rounded-xl mb-3 hover:border-sky-500 transition-all">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full ${session.isActive ? 'bg-green-500' : 'bg-slate-300'} flex items-center justify-center">
                        <i class="fas ${session.isActive ? 'fa-signal' : 'fa-history'} text-white"></i>
                    </div>
                    <div>
                        <div class="font-bold text-slate-800">${session.name}</div>
                        <div class="text-sm text-slate-500">
                            ${new Date(session.date).toLocaleString('fr-FR')} • ${session.members.length} adhérents
                        </div>
                    </div>
                </div>
                <div class="flex gap-2">
                    ${
                        session.isActive
                            ? `
                        <button onclick="SessionHRManager.editSession('${session.id}')"
                                class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                                title="Gérer les adhérents">
                            <i class="fas fa-users-cog"></i>
                        </button>
                        <button onclick="SessionHRManager.setActiveSession('${session.id}')"
                                class="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all"
                                title="Ouvrir TV">
                            <i class="fas fa-tv"></i>
                        </button>
                        <button onclick="SessionHRManager.endSession('${session.id}')"
                                class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all"
                                title="Terminer la séance">
                            <i class="fas fa-stop"></i>
                        </button>
                    `
                            : ''
                    }
                    <button onclick="SessionHRManager.deleteSession('${session.id}')"
                            class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                            title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `
            )
            .join('');
    },

    async endSession(sessionId) {
        if (!confirm('Voulez-vous vraiment terminer cette séance ?')) {
            return;
        }

        const session = this.sessions.find(s => s.id === sessionId);
        if (session) {
            session.isActive = false;
            await this.saveSession(session);
        }

        if (this.currentSession && this.currentSession.id === sessionId) {
            this.currentSession = null;
        }

        this.show();
    },

    async deleteSession(sessionId) {
        if (
            !confirm('Voulez-vous vraiment SUPPRIMER cette séance ? Cette action est irréversible.')
        ) {
            return;
        }

        // Retirer de la liste
        this.sessions = this.sessions.filter(s => s.id !== sessionId);

        // Sauvegarder
        const allSessions = JSON.parse(localStorage.getItem('hr_sessions') || '[]');
        const filtered = allSessions.filter(s => s.id !== sessionId);
        localStorage.setItem('hr_sessions', JSON.stringify(filtered));

        if (this.currentSession && this.currentSession.id === sessionId) {
            this.currentSession = null;
        }

        this.show();
    },

    async setActiveSession(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (session) {
            this.currentSession = session;
            await this.openTV();
        }
    },

    async editSession(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) {
            return;
        }

        this.currentSession = session;
        await this.openMemberSelection(session);
    }
};

// Exposer globalement
window.SessionHRManager = SessionHRManager;

console.log('✅ Module Session HR Manager chargé');
