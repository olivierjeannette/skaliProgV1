/**
 * CARDIO SESSION MANAGER - Module Unifié Admin
 * Gestion complète des séances cardio avec affichage TV
 *
 * Fonctionnalités:
 * - Gestion des séances (création, sélection adhérents)
 * - Monitoring temps réel des connexions HR
 * - Affichage TV pour visualisation en direct
 * - Système d'onglets (Gestion, Monitor, TV Live)
 *
 * @author Skali Prog Team
 * @version 2.0.0
 */

const CardioSessionManager = {
    // État
    currentTab: 'gestion',
    currentSession: null,
    sessions: [],
    activeConnections: new Map(),
    updateInterval: null,

    // ===================================================================
    // AFFICHAGE PRINCIPAL
    // ===================================================================
    async show() {
        if (typeof ViewManager !== 'undefined') {
            ViewManager.clearAllActiveStates();
        }

        const html = `
            <div class="min-h-screen cardio-screen-bg">

                <!-- Header -->
                <div class="px-6 py-8 mb-8 cardio-header-gradient">
                    <div class="max-w-7xl mx-auto">
                        <h1 class="text-4xl font-black text-white mb-2 flex items-center">
                            <i class="fas fa-heartbeat mr-4"></i>
                            Cardio Session Manager
                        </h1>
                        <p class="text-slate-300 text-lg">
                            Gestion complète des séances cardio - Monitor temps réel - Affichage TV
                        </p>
                    </div>
                </div>

                <div class="max-w-7xl mx-auto px-6 pb-12">

                    <!-- Navigation par onglets -->
                    <div class="flex gap-4 mb-8 bg-slate-800/50 p-2 rounded-2xl backdrop-blur-sm">
                        <button onclick="CardioSessionManager.switchTab('gestion')"
                                id="tab-gestion"
                                class="flex-1 px-6 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3">
                            <i class="fas fa-tasks text-xl"></i>
                            <span>Gestion Séances</span>
                        </button>
                        <button onclick="CardioSessionManager.switchTab('monitor')"
                                id="tab-monitor"
                                class="flex-1 px-6 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3">
                            <i class="fas fa-desktop text-xl"></i>
                            <span>Monitor Live</span>
                        </button>
                        <button onclick="CardioSessionManager.switchTab('tv')"
                                id="tab-tv"
                                class="flex-1 px-6 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3">
                            <i class="fas fa-tv text-xl"></i>
                            <span>Affichage TV</span>
                        </button>
                    </div>

                    <!-- Contenu des onglets -->
                    <div id="tabContent"></div>

                </div>

                ${this.getStyles()}
            </div>
        `;

        document.getElementById('mainContent').innerHTML = html;

        // Charger les sessions
        await this.loadSessions();

        // Afficher l'onglet par défaut
        this.switchTab('gestion');

        // Démarrer les mises à jour des connexions
        this.startMonitoring();
    },

    // ===================================================================
    // NAVIGATION ONGLETS
    // ===================================================================
    switchTab(tabName) {
        this.currentTab = tabName;

        // Mise à jour visuelle des boutons
        document.querySelectorAll('[id^="tab-"]').forEach(btn => {
            btn.classList.remove('active-tab');
            btn.classList.add('inactive-tab');
        });

        const activeBtn = document.getElementById(`tab-${tabName}`);
        if (activeBtn) {
            activeBtn.classList.remove('inactive-tab');
            activeBtn.classList.add('active-tab');
        }

        // Afficher le contenu correspondant
        const container = document.getElementById('tabContent');
        if (!container) {
            return;
        }

        switch (tabName) {
            case 'gestion':
                this.renderGestionTab(container);
                break;
            case 'monitor':
                this.renderMonitorTab(container);
                break;
            case 'tv':
                this.renderTVTab(container);
                break;
        }
    },

    // ===================================================================
    // ONGLET 1 : GESTION DES SÉANCES
    // ===================================================================
    renderGestionTab(container) {
        container.innerHTML = `
            <!-- Actions principales -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                <!-- Créer nouvelle session -->
                <div class="card-premium">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="w-14 h-14 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
                            <i class="fas fa-plus text-2xl text-white"></i>
                        </div>
                        <h3 class="text-xl font-bold text-white">Nouvelle Séance</h3>
                    </div>
                    <p class="text-slate-400 text-sm mb-4">
                        Créez une nouvelle session et sélectionnez les adhérents présents
                    </p>
                    <button onclick="CardioSessionManager.createNewSession()"
                            class="w-full px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-xl hover:shadow-xl transition-all">
                        <i class="fas fa-calendar-plus mr-2"></i>
                        Créer une séance
                    </button>
                </div>

                <!-- Séance active -->
                <div id="activeSessionCard" class="card-premium border-2 border-green-500 ${!this.currentSession ? 'hidden' : ''}">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                            <i class="fas fa-signal text-2xl text-white animate-pulse"></i>
                        </div>
                        <h3 class="text-xl font-bold text-white">Séance Active</h3>
                    </div>
                    <div class="mb-4">
                        <div class="text-white font-bold mb-2" id="activeSessionName">
                            ${this.currentSession?.name || ''}
                        </div>
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-sm font-semibold text-slate-400">Adhérents:</span>
                            <span id="activeCount" class="text-2xl font-black text-green-400">
                                ${this.currentSession?.members?.length || 0}
                            </span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm font-semibold text-slate-400">Connectés:</span>
                            <span id="connectedCount" class="text-2xl font-black text-green-400">0</span>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="CardioSessionManager.editSession('${this.currentSession?.id}')"
                                class="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-all">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="CardioSessionManager.endCurrentSession()"
                                class="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all">
                            <i class="fas fa-stop mr-2"></i>Terminer
                        </button>
                    </div>
                </div>

                <!-- Ouvrir TV -->
                <div class="card-premium">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                            <i class="fas fa-external-link-alt text-2xl text-white"></i>
                        </div>
                        <h3 class="text-xl font-bold text-white">Affichage TV</h3>
                    </div>
                    <p class="text-slate-400 text-sm mb-4">
                        Ouvrez l'affichage TV sur un 2ème écran pour voir les FC en direct
                    </p>
                    <button onclick="CardioSessionManager.openTVWindow()"
                            class="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold rounded-xl hover:shadow-xl transition-all">
                        <i class="fas fa-tv mr-2"></i>
                        Ouvrir TV externe
                    </button>
                </div>
            </div>

            <!-- Sessions récentes -->
            <div class="card-premium">
                <h3 class="text-2xl font-bold text-white mb-6 flex items-center">
                    <i class="fas fa-history mr-3 text-sky-500"></i>
                    Sessions Récentes
                </h3>
                <div id="sessionsList"></div>
            </div>
        `;

        // Rendre la liste des sessions
        this.renderSessionsList();

        // Mettre à jour le compteur de connectés
        this.updateConnectedCount();
    },

    // ===================================================================
    // ONGLET 2 : MONITOR TEMPS RÉEL
    // ===================================================================
    renderMonitorTab(container) {
        container.innerHTML = `
            <div class="card-premium mb-6">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h3 class="text-2xl font-bold text-white mb-2">
                            <i class="fas fa-heartbeat mr-3 text-red-500 animate-pulse"></i>
                            Connexions Actives
                        </h3>
                        <p class="text-slate-400">Monitoring en temps réel des adhérents connectés</p>
                    </div>
                    <div class="flex gap-4">
                        <div class="text-center">
                            <div id="totalConnectedMonitor" class="text-4xl font-black text-green-400">0</div>
                            <div class="text-xs text-slate-400 font-semibold">CONNECTÉS</div>
                        </div>
                        ${
                            this.currentSession
                                ? `
                            <div class="text-center">
                                <div id="sessionMembersMonitor" class="text-4xl font-black text-blue-400">${this.currentSession.members.length}</div>
                                <div class="text-xs text-slate-400 font-semibold">EN SÉANCE</div>
                            </div>
                        `
                                : ''
                        }
                    </div>
                </div>

                <!-- Grille des connexions -->
                <div id="connectionsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div class="col-span-full text-center py-12 text-slate-500">
                        <i class="fas fa-heartbeat text-6xl mb-4"></i>
                        <p>Aucune connexion active</p>
                        <p class="text-sm mt-2">Les adhérents apparaîtront ici dès qu'ils se connecteront</p>
                    </div>
                </div>
            </div>

            <!-- Stats globales -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="card-premium text-center">
                    <div class="text-5xl font-black text-green-400 mb-2" id="avgHRMonitor">--</div>
                    <div class="text-slate-400 font-semibold">FC Moyenne (BPM)</div>
                </div>
                <div class="card-premium text-center">
                    <div class="text-5xl font-black text-orange-400 mb-2" id="maxHRMonitor">--</div>
                    <div class="text-slate-400 font-semibold">FC Max (BPM)</div>
                </div>
                <div class="card-premium text-center">
                    <div class="text-5xl font-black text-blue-400 mb-2" id="minHRMonitor">--</div>
                    <div class="text-slate-400 font-semibold">FC Min (BPM)</div>
                </div>
            </div>
        `;

        // Charger les connexions
        this.loadActiveConnections();
    },

    // ===================================================================
    // ONGLET 3 : AFFICHAGE TV INTÉGRÉ
    // ===================================================================
    renderTVTab(container) {
        container.innerHTML = `
            <div class="card-premium">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h3 class="text-2xl font-bold text-white mb-2">
                            <i class="fas fa-tv mr-3 text-purple-500"></i>
                            Affichage TV Live
                        </h3>
                        <p class="text-slate-400">Mode TV pour affichage sur grand écran</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="CardioSessionManager.toggleFullscreenTV()"
                                class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all">
                            <i class="fas fa-expand mr-2"></i>Plein écran
                        </button>
                        <button onclick="CardioSessionManager.openTVWindow()"
                                class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all">
                            <i class="fas fa-external-link-alt mr-2"></i>Fenêtre externe
                        </button>
                    </div>
                </div>

                <!-- Zone TV -->
                <div id="tvDisplay" class="rounded-xl overflow-hidden cardio-tv-display-bg">

                    <!-- Stats globales TV -->
                    <div class="flex items-center justify-between p-6 cardio-tv-header-border">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                                <i class="fas fa-heartbeat text-2xl text-white animate-pulse"></i>
                            </div>
                            <div>
                                <h2 class="text-2xl font-black text-white">CARDIO LIVE</h2>
                                <p class="text-slate-400 text-sm" id="tvSessionName">
                                    ${this.currentSession ? this.currentSession.name : 'Tous les adhérents'}
                                </p>
                            </div>
                        </div>
                        <div class="flex gap-4">
                            <div class="text-center px-4">
                                <div id="totalConnectedTV" class="text-3xl font-black text-green-400">0</div>
                                <div class="text-xs text-slate-400 font-semibold">CONNECTÉS</div>
                            </div>
                            <div class="text-center px-4">
                                <div id="avgHRTV" class="text-3xl font-black text-red-400">--</div>
                                <div class="text-xs text-slate-400 font-semibold">MOY BPM</div>
                            </div>
                        </div>
                    </div>

                    <!-- Grille adhérents TV -->
                    <div id="tvMembersGrid" class="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <div class="col-span-full text-center py-12 text-slate-500">
                            <i class="fas fa-heartbeat text-6xl mb-4 opacity-30"></i>
                            <p class="text-xl">Aucun adhérent connecté</p>
                        </div>
                    </div>

                </div>
            </div>
        `;

        // Charger l'affichage TV
        this.loadTVDisplay();
    },

    // ===================================================================
    // GESTION DES SESSIONS
    // ===================================================================
    async createNewSession() {
        const sessionName = prompt('Nom de la séance (ex: CrossFit 18h00, Hyrox 19h30...):');
        if (!sessionName) {
            return;
        }

        const session = {
            id: 'session_' + Date.now(),
            name: sessionName,
            date: new Date().toISOString(),
            members: [],
            isActive: true,
            tvLink: null
        };

        this.currentSession = session;
        await this.saveSession(session);
        await this.openMemberSelection(session);
    },

    async openMemberSelection(session) {
        const allMembers = await SupabaseManager.getMembers();

        const modal = document.createElement('div');
        modal.className =
            'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-slate-800 rounded-3xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
                 style="box-shadow: 0 20px 60px rgba(0,0,0,0.5); border: 2px solid rgba(59, 130, 246, 0.3);">

                <div class="mb-6">
                    <h2 class="text-3xl font-black text-white mb-2">${session.name}</h2>
                    <p class="text-slate-400">Sélectionnez les adhérents présents à cette séance</p>
                </div>

                <div class="mb-6">
                    <input type="text" id="memberSearch" placeholder="Rechercher un adhérent..."
                           class="w-full px-4 py-3 bg-slate-700 border-2 border-sky-500/50 rounded-xl text-white placeholder-slate-400 focus:border-sky-500 focus:outline-none"
                           oninput="CardioSessionManager.filterMembers(this.value)">
                </div>

                <div id="membersList" class="flex-1 overflow-y-auto mb-6 space-y-2"></div>

                <div class="flex gap-4">
                    <button onclick="this.closest('.fixed').remove()"
                            class="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold text-white transition-all">
                        Annuler
                    </button>
                    <button onclick="CardioSessionManager.confirmSelection()"
                            class="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-xl transition-all">
                        <span id="selectedCount">0</span> adhérents - Valider
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.renderMembersList(allMembers, session);
    },

    renderMembersList(members, session) {
        const container = document.getElementById('membersList');
        if (!container) {
            return;
        }

        container.innerHTML = members
            .map(member => {
                const isSelected = session.members.includes(member.id);

                return `
                <div class="flex items-center gap-4 p-4 border-2 ${isSelected ? 'border-green-500 bg-green-500/10' : 'border-slate-600 bg-slate-700/50'} rounded-xl cursor-pointer hover:border-sky-500 transition-all member-item"
                     data-member-id="${member.id}"
                     data-member-name="${member.name.toLowerCase()}"
                     onclick="CardioSessionManager.toggleMember('${member.id}', this)">

                    <div class="w-10 h-10 rounded-full ${isSelected ? 'bg-green-500' : 'bg-slate-500'} flex items-center justify-center text-white font-bold transition-all">
                        ${isSelected ? '<i class="fas fa-check"></i>' : member.name.charAt(0)}
                    </div>

                    <div class="flex-1">
                        <div class="font-bold text-white">${member.name}</div>
                        <div class="text-sm text-slate-400">${member.email || "Pas d'email"}</div>
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
            item.style.display = memberName.includes(normalizedQuery) ? 'flex' : 'none';
        });
    },

    toggleMember(memberId, element) {
        if (!this.currentSession) {
            return;
        }

        const index = this.currentSession.members.indexOf(memberId);

        if (index > -1) {
            this.currentSession.members.splice(index, 1);
            element.classList.remove('border-green-500', 'bg-green-500/10');
            element.classList.add('border-slate-600', 'bg-slate-700/50');
            element.querySelector('.w-10').classList.remove('bg-green-500');
            element.querySelector('.w-10').classList.add('bg-slate-500');
            element.querySelector('.w-10').innerHTML = element
                .querySelector('.font-bold')
                .textContent.charAt(0);
            element.querySelector('.fa-check-circle')?.remove();
        } else {
            this.currentSession.members.push(memberId);
            element.classList.add('border-green-500', 'bg-green-500/10');
            element.classList.remove('border-slate-600', 'bg-slate-700/50');
            element.querySelector('.w-10').classList.add('bg-green-500');
            element.querySelector('.w-10').classList.remove('bg-slate-500');
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

        this.currentSession.tvLink = `/cardio-tv-external.html?sessionId=${this.currentSession.id}`;
        await this.saveSession(this.currentSession);

        document.querySelector('.fixed.inset-0')?.remove();

        alert(
            `✅ Séance "${this.currentSession.name}" créée avec ${this.currentSession.members.length} adhérents !`
        );

        this.show();
    },

    async editSession(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) {
            return;
        }

        this.currentSession = session;
        await this.openMemberSelection(session);
    },

    async endCurrentSession() {
        if (!confirm('Voulez-vous vraiment terminer la séance active ?')) {
            return;
        }

        if (this.currentSession) {
            this.currentSession.isActive = false;
            await this.saveSession(this.currentSession);
            this.currentSession = null;
        }

        this.show();
    },

    // ===================================================================
    // MONITORING TEMPS RÉEL
    // ===================================================================
    startMonitoring() {
        // Écouter les mises à jour HR
        window.addEventListener('wearable-hr-update', event => {
            this.handleHRUpdate(event.detail);
        });

        // Écouter les déconnexions
        window.addEventListener('wearable-disconnected', event => {
            this.handleDisconnection(event.detail.memberId);
        });

        // Mise à jour périodique
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        this.updateInterval = setInterval(() => {
            this.updateMonitorDisplay();
            this.updateTVDisplay();
        }, 2000);
    },

    handleHRUpdate(data) {
        const { memberId, heartRate, source, timestamp } = data;

        // Filtrage par session si active
        if (this.currentSession && !this.currentSession.members.includes(memberId)) {
            return;
        }

        // Mettre à jour la connexion
        this.activeConnections.set(memberId, {
            memberId,
            heartRate,
            source,
            timestamp: timestamp || new Date(),
            lastUpdate: new Date()
        });

        // Rafraîchir les affichages
        this.updateConnectedCount();

        if (this.currentTab === 'monitor') {
            this.updateMonitorDisplay();
        } else if (this.currentTab === 'tv') {
            this.updateTVDisplay();
        }
    },

    handleDisconnection(memberId) {
        this.activeConnections.delete(memberId);
        this.updateConnectedCount();

        if (this.currentTab === 'monitor') {
            this.updateMonitorDisplay();
        } else if (this.currentTab === 'tv') {
            this.updateTVDisplay();
        }
    },

    async loadActiveConnections() {
        if (typeof WearablesIntegration === 'undefined') {
            return;
        }

        const connections = WearablesIntegration.getActiveConnections();

        for (const conn of connections) {
            if (conn.lastHR && conn.lastHR > 0) {
                this.activeConnections.set(conn.memberId, {
                    memberId: conn.memberId,
                    heartRate: conn.lastHR,
                    source: conn.type,
                    timestamp: new Date(),
                    lastUpdate: new Date()
                });
            }
        }

        this.updateMonitorDisplay();
    },

    async updateMonitorDisplay() {
        const grid = document.getElementById('connectionsGrid');
        if (!grid) {
            return;
        }

        if (this.activeConnections.size === 0) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-12 text-slate-500">
                    <i class="fas fa-heartbeat text-6xl mb-4"></i>
                    <p>Aucune connexion active</p>
                    <p class="text-sm mt-2">Les adhérents apparaîtront ici dès qu'ils se connecteront</p>
                </div>
            `;
            return;
        }

        // Récupérer les infos des membres
        const members = await SupabaseManager.getMembers();
        const membersMap = new Map(members.map(m => [m.id, m]));

        const cards = Array.from(this.activeConnections.values())
            .map(conn => {
                const member = membersMap.get(conn.memberId);
                const name = member?.name || 'Adhérent inconnu';
                const age = member?.age || 30;
                const zone = this.calculateZone(conn.heartRate, age);
                const zoneColor = this.getZoneColor(zone);
                const sourceIcon =
                    conn.source === 'bluetooth'
                        ? 'fa-bluetooth'
                        : conn.source === 'terra'
                          ? 'fa-cloud'
                          : 'fa-wifi';

                return `
                <div class="bg-slate-700/50 rounded-xl p-6 border-2" style="border-color: ${zoneColor};">
                    <div class="flex items-center justify-between mb-4">
                        <h4 class="text-white font-bold text-lg">${name}</h4>
                        <i class="fas ${sourceIcon} text-slate-400"></i>
                    </div>
                    <div class="text-center mb-4">
                        <div class="text-5xl font-black text-white">${conn.heartRate}</div>
                        <div class="text-slate-400 font-semibold">BPM</div>
                    </div>
                    <div class="px-3 py-1 rounded-lg text-white text-sm font-bold text-center" style="background: ${zoneColor};">
                        Zone ${zone}
                    </div>
                </div>
            `;
            })
            .join('');

        grid.innerHTML = cards;

        // Mettre à jour les stats
        this.updateMonitorStats();
    },

    updateMonitorStats() {
        const hrs = Array.from(this.activeConnections.values()).map(c => c.heartRate);

        document.getElementById('totalConnectedMonitor').textContent = hrs.length;

        if (hrs.length > 0) {
            const avg = Math.round(hrs.reduce((a, b) => a + b, 0) / hrs.length);
            const max = Math.max(...hrs);
            const min = Math.min(...hrs);

            document.getElementById('avgHRMonitor').textContent = avg;
            document.getElementById('maxHRMonitor').textContent = max;
            document.getElementById('minHRMonitor').textContent = min;
        }
    },

    // ===================================================================
    // AFFICHAGE TV
    // ===================================================================
    async loadTVDisplay() {
        this.updateTVDisplay();
    },

    async updateTVDisplay() {
        const grid = document.getElementById('tvMembersGrid');
        if (!grid) {
            return;
        }

        if (this.activeConnections.size === 0) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-12 text-slate-500">
                    <i class="fas fa-heartbeat text-6xl mb-4 opacity-30"></i>
                    <p class="text-xl">Aucun adhérent connecté</p>
                </div>
            `;

            document.getElementById('totalConnectedTV').textContent = '0';
            document.getElementById('avgHRTV').textContent = '--';
            return;
        }

        // Récupérer les infos des membres
        const members = await SupabaseManager.getMembers();
        const membersMap = new Map(members.map(m => [m.id, m]));

        const cards = Array.from(this.activeConnections.values())
            .map(conn => {
                const member = membersMap.get(conn.memberId);
                const name = member?.name || 'Adhérent inconnu';
                const age = member?.age || 30;
                const zone = this.calculateZone(conn.heartRate, age);
                const zoneColor = this.getZoneColor(zone);

                return `
                <div class="bg-slate-800/80 rounded-xl p-6 border-2" style="border-color: ${zoneColor};">
                    <h4 class="text-white font-bold text-lg mb-4">${name}</h4>
                    <div class="text-center">
                        <div class="text-6xl font-black text-white mb-2">${conn.heartRate}</div>
                        <div class="text-slate-400 font-semibold mb-3">BPM</div>
                        <div class="px-3 py-1 rounded-lg text-white text-sm font-bold" style="background: ${zoneColor};">
                            Zone ${zone}
                        </div>
                    </div>
                </div>
            `;
            })
            .join('');

        grid.innerHTML = cards;

        // Stats TV
        const hrs = Array.from(this.activeConnections.values()).map(c => c.heartRate);
        const avg = Math.round(hrs.reduce((a, b) => a + b, 0) / hrs.length);

        document.getElementById('totalConnectedTV').textContent = hrs.length;
        document.getElementById('avgHRTV').textContent = avg;
    },

    toggleFullscreenTV() {
        const tvDisplay = document.getElementById('tvDisplay');
        if (!tvDisplay) {
            return;
        }

        if (!document.fullscreenElement) {
            tvDisplay.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    },

    openTVWindow() {
        if (!this.currentSession) {
            alert("Veuillez d'abord créer une séance");
            return;
        }

        localStorage.setItem('cardio_tv_session_id', this.currentSession.id);

        const width = 1920;
        const height = 1080;
        const left = screen.width;
        const top = 0;

        const tvWindow = window.open(
            'cardio-tv-external.html',
            'CardioTVExternal',
            `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
        );

        if (!tvWindow) {
            alert(
                "Impossible d'ouvrir la fenêtre TV. Vérifiez que les popups ne sont pas bloqués."
            );
        }
    },

    // ===================================================================
    // UTILITAIRES
    // ===================================================================
    updateConnectedCount() {
        const count = this.activeConnections.size;
        const el = document.getElementById('connectedCount');
        if (el) {
            el.textContent = count;
        }
    },

    renderSessionsList() {
        const container = document.getElementById('sessionsList');
        if (!container) {
            return;
        }

        if (this.sessions.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12 text-slate-500">
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
            <div class="flex items-center justify-between p-4 bg-slate-700/50 border-2 border-slate-600 rounded-xl mb-3 hover:border-sky-500 transition-all">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full ${session.isActive ? 'bg-green-500' : 'bg-slate-500'} flex items-center justify-center">
                        <i class="fas ${session.isActive ? 'fa-signal' : 'fa-history'} text-white"></i>
                    </div>
                    <div>
                        <div class="font-bold text-white">${session.name}</div>
                        <div class="text-sm text-slate-400">
                            ${new Date(session.date).toLocaleString('fr-FR')} • ${session.members.length} adhérents
                        </div>
                    </div>
                </div>
                <div class="flex gap-2">
                    ${
                        session.isActive
                            ? `
                        <button onclick="CardioSessionManager.editSession('${session.id}')"
                                class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all">
                            <i class="fas fa-users-cog"></i>
                        </button>
                        <button onclick="CardioSessionManager.endCurrentSession()"
                                class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all">
                            <i class="fas fa-stop"></i>
                        </button>
                    `
                            : ''
                    }
                    <button onclick="CardioSessionManager.deleteSession('${session.id}')"
                            class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `
            )
            .join('');
    },

    async deleteSession(sessionId) {
        if (!confirm('Voulez-vous vraiment SUPPRIMER cette séance ?')) {
            return;
        }

        this.sessions = this.sessions.filter(s => s.id !== sessionId);
        const allSessions = JSON.parse(localStorage.getItem('hr_sessions') || '[]');
        const filtered = allSessions.filter(s => s.id !== sessionId);
        localStorage.setItem('hr_sessions', JSON.stringify(filtered));

        if (this.currentSession?.id === sessionId) {
            this.currentSession = null;
        }

        this.renderSessionsList();
    },

    calculateZone(hr, age) {
        const maxHR = 220 - age;
        const percentage = (hr / maxHR) * 100;

        if (percentage >= 90) {
            return 5;
        }
        if (percentage >= 80) {
            return 4;
        }
        if (percentage >= 70) {
            return 3;
        }
        if (percentage >= 60) {
            return 2;
        }
        return 1;
    },

    getZoneColor(zone) {
        const colors = {
            1: '#22c55e',
            2: '#3b82f6',
            3: '#eab308',
            4: '#f97316',
            5: '#ef4444'
        };
        return colors[zone] || '#22c55e';
    },

    // ===================================================================
    // PERSISTENCE
    // ===================================================================
    async saveSession(session) {
        let sessions = JSON.parse(localStorage.getItem('hr_sessions') || '[]');
        const index = sessions.findIndex(s => s.id === session.id);

        if (index > -1) {
            sessions[index] = session;
        } else {
            sessions.push(session);
        }

        localStorage.setItem('hr_sessions', JSON.stringify(sessions));
    },

    async loadSessions() {
        this.sessions = JSON.parse(localStorage.getItem('hr_sessions') || '[]');
        this.currentSession = this.sessions.find(s => s.isActive);
    },

    // ===================================================================
    // STYLES
    // ===================================================================
    getStyles() {
        return `
            <style>
                .card-premium {
                    background: rgba(30, 41, 59, 0.8);
                    backdrop-filter: blur(10px);
                    border-radius: 1rem;
                    padding: 1.5rem;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                }

                .active-tab {
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
                    color: white;
                    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
                }

                .inactive-tab {
                    background: rgba(51, 65, 85, 0.5);
                    color: #94a3b8;
                }

                .inactive-tab:hover {
                    background: rgba(71, 85, 105, 0.7);
                    color: white;
                }
            </style>
        `;
    }
};

// Exposer globalement
window.CardioSessionManager = CardioSessionManager;

console.log('✅ Module Cardio Session Manager chargé');
