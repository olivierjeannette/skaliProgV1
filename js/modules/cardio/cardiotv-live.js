/**
 * CARDIO TV LIVE - Mode TV avec affichage cardio en temps réel
 * Affiche les fréquences cardiaques des adhérents en direct pendant les séances
 *
 * Fonctionnalités:
 * - Affichage grille des adhérents connectés
 * - Zones cardio colorées (Z1-Z5)
 * - Alertes visuelles si HR trop haute/basse
 * - Graphiques temps réel avec Chart.js
 * - Support multi-sources (Bluetooth, Strava, Garmin via Terra, HypeRate)
 *
 * @author Skali Prog Team
 * @version 1.0.0
 */

const CardioTVLive = {
    // Configuration
    config: {
        refreshRate: 1000, // Mise à jour toutes les 1 seconde
        gridColumns: 4, // 4 colonnes par défaut
        alertThresholdHigh: 180, // Alerte si HR > 180
        alertThresholdLow: 40, // Alerte si HR < 40
        showGraphs: true, // Afficher mini-graphiques
        autoScroll: true // Auto-scroll si > 12 adhérents
    },

    // Données
    activeMembers: new Map(), // memberId -> {name, hr, zone, history, source}
    updateInterval: null,
    isActive: false,
    currentSession: null, // Session active (si filtrage activé)
    filterBySession: false, // Filtrer par session ou afficher tous

    // Zones cardio (calculées par âge)
    zones: {
        z1: { min: 0, max: 60, color: '#22c55e', label: 'Récupération' },
        z2: { min: 60, max: 70, color: '#3b82f6', label: 'Endurance' },
        z3: { min: 70, max: 80, color: '#eab308', label: 'Tempo' },
        z4: { min: 80, max: 90, color: '#f97316', label: 'Seuil' },
        z5: { min: 90, max: 100, color: '#ef4444', label: 'VO2 Max' }
    },

    // ===================================================================
    // INITIALISATION
    // ===================================================================
    async init() {
        console.log('📺 Initialisation Cardio TV Live...');

        // Écouter les mises à jour HR depuis WearablesIntegration
        window.addEventListener('wearable-hr-update', event => {
            this.handleHRUpdate(event.detail);
        });

        // Écouter les déconnexions
        window.addEventListener('wearable-disconnected', event => {
            this.handleDisconnection(event.detail.memberId);
        });

        // Écouter le redimensionnement de la fenêtre pour recalculer la grille
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const grid = document.getElementById('membersGrid');
                if (grid && this.activeMembers.size > 0 && this.isActive) {
                    this.calculateOptimalGrid(grid, this.activeMembers.size);
                    console.log('🔄 Grille recalculée après redimensionnement');
                }
            }, 250);
        });

        // Initialiser WearablesIntegration si pas déjà fait
        if (typeof WearablesIntegration !== 'undefined' && !WearablesIntegration.initialized) {
            await WearablesIntegration.init();
        }
    },

    // ===================================================================
    // AFFICHAGE
    // ===================================================================
    async show() {
        if (typeof ViewManager !== 'undefined') {
            ViewManager.clearAllActiveStates();
        }

        this.isActive = true;

        // Vérifier si une session est disponible (localStorage ou URL)
        let sessionId = localStorage.getItem('cardio_tv_session_id');

        if (!sessionId) {
            // Sinon vérifier dans l'URL
            const urlParams = new URLSearchParams(window.location.search);
            sessionId = urlParams.get('sessionId');
        }

        if (sessionId) {
            console.log(`📋 Session ID trouvée: ${sessionId}`);
            await this.loadSession(sessionId);
        } else {
            console.log('ℹ️ Aucune session - Mode tous les adhérents');
            this.filterBySession = false;
            this.currentSession = null;
        }

        const html = `
            <div class="fixed inset-0 cardio-tv-bg">

                <!-- Header TV -->
                <div class="px-8 py-6 cardio-tv-header">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-6">
                            <div class="flex items-center gap-4">
                                <div class="w-16 h-16 cardio-tv-icon-circle">
                                    <i class="fas fa-heartbeat text-3xl text-white"></i>
                                </div>
                                <div>
                                    <h1 class="text-4xl font-black text-white tracking-tight">CARDIO LIVE</h1>
                                    <p class="text-slate-400 font-semibold mt-1">Fréquences cardiaques en temps réel</p>
                                </div>
                            </div>
                        </div>

                        <div class="flex items-center gap-6">
                            <!-- Heure -->
                            <div class="text-right">
                                <div id="currentTime" class="text-3xl font-bold text-white"></div>
                                <div id="currentDate" class="text-sm text-slate-400"></div>
                            </div>

                            <!-- Stats globales -->
                            <div class="flex gap-4">
                                <div class="cardio-tv-stat-connected">
                                    <div class="text-center">
                                        <div id="totalConnected" class="text-3xl font-black text-red-400">0</div>
                                        <div class="text-xs text-slate-400 font-semibold">CONNECTÉS</div>
                                    </div>
                                </div>
                                <div class="cardio-tv-stat-avg">
                                    <div class="text-center">
                                        <div id="avgHR" class="text-3xl font-black text-green-400">--</div>
                                        <div class="text-xs text-slate-400 font-semibold">MOY BPM</div>
                                    </div>
                                </div>
                            </div>

                            <!-- Boutons contrôle -->
                            <div class="flex gap-2">
                                <button onclick="CardioTVLive.toggleFullscreen()"
                                        class="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-all">
                                    <i class="fas fa-expand"></i>
                                </button>
                                <button onclick="CardioTVLive.close()"
                                        class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Grille des adhérents -->
                <div class="cardio-tv-content">
                    <div id="membersGrid" class="cardio-tv-grid"></div>

                    <!-- Message si aucun adhérent -->
                    <div id="noMembers" class="flex flex-col items-center justify-center h-full text-center">
                        <i class="fas fa-heartbeat text-8xl text-slate-700 mb-6"></i>
                        <h2 class="text-3xl font-bold text-slate-400 mb-3">Aucun adhérent connecté</h2>
                        <p class="text-slate-500 max-w-md">
                            Les adhérents peuvent connecter leur montre via:<br>
                            • Bluetooth (direct)<br>
                            • Strava / Garmin (via Terra API)<br>
                            • HypeRate.io (streaming)
                        </p>
                    </div>
                </div>

            </div>
        `;

        document.getElementById('mainContent').innerHTML = html;

        // Démarrer les mises à jour
        this.startUpdates();

        // Charger les connexions actives
        this.loadActiveConnections();

        // Mettre à jour l'heure
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    },

    // ===================================================================
    // GESTION DES DONNÉES
    // ===================================================================
    handleHRUpdate(data) {
        const { memberId, heartRate, source, timestamp } = data;

        console.log(`📨 HR reçue brute: Adhérent ${memberId} = ${heartRate} BPM`);

        // FILTRAGE: Si session active, ignorer les adhérents pas dans la session
        if (this.filterBySession && this.currentSession) {
            console.log(
                `🔍 Vérification filtrage: memberId=${memberId}, liste=${this.currentSession.members.join(',')}`
            );

            if (!this.currentSession.members.includes(memberId)) {
                console.log(
                    `⚠️ HR ignorée pour adhérent ${memberId} (pas dans la séance ${this.currentSession.name})`
                );
                return;
            }

            console.log(`✅ Adhérent ${memberId} autorisé dans la séance`);
        }

        // Récupérer ou créer le membre
        let member = this.activeMembers.get(memberId);

        if (!member) {
            // Nouveau membre - récupérer les infos depuis la DB
            this.addMember(memberId, heartRate, source);
        } else {
            // Membre existant - mettre à jour
            member.hr = heartRate;
            member.lastUpdate = timestamp;
            member.source = source;

            // Ajouter à l'historique (garder 60 dernières valeurs = 1 minute)
            member.history.push({ hr: heartRate, time: timestamp });
            if (member.history.length > 60) {
                member.history.shift();
            }

            // Calculer la zone
            member.zone = this.calculateZone(heartRate, member.age);

            this.activeMembers.set(memberId, member);
        }

        // Rafraîchir l'affichage si TV active
        if (this.isActive) {
            this.renderMember(memberId);
            this.updateGlobalStats();
        }
    },

    async addMember(memberId, initialHR, source) {
        // Récupérer les infos du membre depuis Supabase
        let memberData = { name: 'Adhérent', age: 30 };

        if (typeof SupabaseManager !== 'undefined') {
            try {
                const members = await SupabaseManager.getMembers();
                const found = members.find(m => m.id === memberId);
                if (found) {
                    memberData = {
                        name: found.name,
                        age: found.age || 30
                    };
                }
            } catch (error) {
                console.error('Erreur chargement membre:', error);
            }
        }

        const member = {
            id: memberId,
            name: memberData.name,
            age: memberData.age,
            hr: initialHR,
            zone: this.calculateZone(initialHR, memberData.age),
            history: [{ hr: initialHR, time: new Date() }],
            source,
            lastUpdate: new Date(),
            connectedAt: new Date()
        };

        this.activeMembers.set(memberId, member);
    },

    handleDisconnection(memberId) {
        this.activeMembers.delete(memberId);

        if (this.isActive) {
            // Supprimer la carte visuellement
            const card = document.getElementById(`member-card-${memberId}`);
            if (card) {
                card.remove();
            }

            // Recalculer la grille avec le nouveau nombre
            const grid = document.getElementById('membersGrid');
            if (grid && this.activeMembers.size > 0) {
                this.calculateOptimalGrid(grid, this.activeMembers.size);
            } else if (this.activeMembers.size === 0) {
                // Afficher le message "aucun adhérent"
                if (grid) {
                    grid.style.display = 'none';
                }
                const noMembers = document.getElementById('noMembers');
                if (noMembers) {
                    noMembers.style.display = 'flex';
                }
            }

            this.updateGlobalStats();
        }
    },

    // ===================================================================
    // CALCULS
    // ===================================================================
    calculateZone(hr, age) {
        const maxHR = 220 - age;

        for (const [zoneName, zone] of Object.entries(this.zones)) {
            const minBPM = (zone.min / 100) * maxHR;
            const maxBPM = (zone.max / 100) * maxHR;

            if (hr >= minBPM && hr < maxBPM) {
                return zoneName;
            }
        }

        return hr > maxHR * 0.9 ? 'z5' : 'z1';
    },

    getZoneData(zoneName) {
        return this.zones[zoneName] || this.zones.z1;
    },

    // ===================================================================
    // RENDU
    // ===================================================================
    renderAllMembers() {
        const grid = document.getElementById('membersGrid');
        const noMembers = document.getElementById('noMembers');

        if (!grid) {
            return;
        }

        if (this.activeMembers.size === 0) {
            grid.style.display = 'none';
            if (noMembers) {
                noMembers.style.display = 'flex';
            }
            return;
        }

        grid.style.display = 'grid';
        if (noMembers) {
            noMembers.style.display = 'none';
        }

        // Calculer la grille automatiquement pour remplir l'écran
        this.calculateOptimalGrid(grid, this.activeMembers.size);

        grid.innerHTML = '';

        for (const [memberId, member] of this.activeMembers.entries()) {
            grid.appendChild(this.createMemberCard(memberId, member));
        }
    },

    /**
     * Calcule la configuration de grille optimale pour afficher tous les adhérents sans scroll
     * @param gridElement
     * @param memberCount
     */
    calculateOptimalGrid(gridElement, memberCount) {
        if (memberCount === 0) {
            return;
        }

        // Dimensions disponibles
        const availableHeight = window.innerHeight - 180; // Retirer header + padding
        const availableWidth = window.innerWidth - 64; // Retirer padding (32px de chaque côté)

        // Configurations possibles (colonnes x lignes)
        const configs = [
            { cols: 1, rows: Math.ceil(memberCount / 1) },
            { cols: 2, rows: Math.ceil(memberCount / 2) },
            { cols: 3, rows: Math.ceil(memberCount / 3) },
            { cols: 4, rows: Math.ceil(memberCount / 4) },
            { cols: 5, rows: Math.ceil(memberCount / 5) },
            { cols: 6, rows: Math.ceil(memberCount / 6) }
        ];

        let bestConfig = null;
        let bestScore = 0;

        const gap = 24; // 1.5rem en pixels

        for (const config of configs) {
            // Calculer taille des cartes avec cette configuration
            const cardWidth = (availableWidth - gap * (config.cols - 1)) / config.cols;
            const cardHeight = (availableHeight - gap * (config.rows - 1)) / config.rows;

            // Vérifier si toutes les cartes tiennent sans scroll
            const totalHeight = cardHeight * config.rows + gap * (config.rows - 1);

            if (totalHeight <= availableHeight && cardWidth >= 200 && cardHeight >= 200) {
                // Score basé sur l'utilisation de l'espace (favoriser cartes carrées)
                const aspectRatio =
                    Math.min(cardWidth, cardHeight) / Math.max(cardWidth, cardHeight);
                const spaceUsage =
                    (cardWidth * config.cols * cardHeight * config.rows) /
                    (availableWidth * availableHeight);
                const score = aspectRatio * spaceUsage;

                if (score > bestScore) {
                    bestScore = score;
                    bestConfig = { ...config, cardWidth, cardHeight };
                }
            }
        }

        // Appliquer la configuration optimale
        if (bestConfig) {
            gridElement.style.gridTemplateColumns = `repeat(${bestConfig.cols}, 1fr)`;
            gridElement.style.gap = `${gap}px`;

            console.log(
                `📐 Grille auto-calculée: ${bestConfig.cols} colonnes × ${bestConfig.rows} lignes pour ${memberCount} adhérents`
            );
            console.log(
                `   Taille carte: ${Math.round(bestConfig.cardWidth)}px × ${Math.round(bestConfig.cardHeight)}px`
            );
        } else {
            // Fallback: grille auto-fill standard
            gridElement.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
            gridElement.style.gap = '1.5rem';
            console.warn(
                `⚠️ Impossible de tout afficher sans scroll pour ${memberCount} adhérents`
            );
        }
    },

    renderMember(memberId) {
        const member = this.activeMembers.get(memberId);
        if (!member) {
            return;
        }

        const existingCard = document.getElementById(`member-card-${memberId}`);

        if (existingCard) {
            // Mettre à jour la carte existante
            const hrDisplay = existingCard.querySelector('.hr-display');
            const zoneLabel = existingCard.querySelector('.zone-label');
            const timeAgo = existingCard.querySelector('.time-ago');

            if (hrDisplay) {
                hrDisplay.textContent = member.hr;
            }
            if (zoneLabel) {
                const zoneData = this.getZoneData(member.zone);
                zoneLabel.textContent = zoneData.label;
                zoneLabel.style.background = zoneData.color;
            }
            if (timeAgo) {
                const seconds = Math.floor((new Date() - member.lastUpdate) / 1000);
                timeAgo.textContent = seconds < 5 ? "À l'instant" : `Il y a ${seconds}s`;
            }
        } else {
            // Créer nouvelle carte + recalculer la grille
            const grid = document.getElementById('membersGrid');
            if (grid) {
                const noMembers = document.getElementById('noMembers');

                // Masquer le message "aucun adhérent"
                if (noMembers) {
                    noMembers.style.display = 'none';
                }
                grid.style.display = 'grid';

                // Ajouter la carte
                grid.appendChild(this.createMemberCard(memberId, member));

                // Recalculer la grille avec le nouveau nombre d'adhérents
                this.calculateOptimalGrid(grid, this.activeMembers.size);
            }
        }
    },

    createMemberCard(memberId, member) {
        const card = document.createElement('div');
        card.id = `member-card-${memberId}`;

        const zoneData = this.getZoneData(member.zone);
        const isAlert =
            member.hr > this.config.alertThresholdHigh || member.hr < this.config.alertThresholdLow;

        card.className = 'rounded-xl p-6 transition-all';
        card.style.cssText = `
            background: linear-gradient(135deg, #1e293b, #334155);
            border: 3px solid ${isAlert ? '#ef4444' : zoneData.color};
            box-shadow: 0 8px 32px ${isAlert ? 'rgba(239, 68, 68, 0.4)' : `rgba(${this.hexToRgb(zoneData.color)}, 0.3)`};
            ${isAlert ? 'animation: pulse 1s infinite;' : ''}
        `;

        const sourceIcon =
            member.source === 'bluetooth'
                ? 'fa-bluetooth'
                : member.source === 'terra'
                  ? 'fa-cloud'
                  : 'fa-wifi';

        card.innerHTML = `
            <div class="flex items-start justify-between mb-4">
                <div>
                    <h3 class="text-xl font-bold text-white mb-1">${member.name}</h3>
                    <div class="flex items-center gap-2 text-sm text-slate-400">
                        <i class="fas ${sourceIcon}"></i>
                        <span class="time-ago">À l'instant</span>
                    </div>
                </div>
                ${isAlert ? '<i class="fas fa-exclamation-triangle text-3xl text-red-400"></i>' : ''}
            </div>

            <div class="text-center my-6">
                <div class="hr-display text-7xl font-black text-white mb-2">${member.hr}</div>
                <div class="text-2xl text-slate-400 font-semibold">BPM</div>
            </div>

            <div class="flex items-center justify-center gap-2 mb-4">
                <div class="zone-label px-4 py-2 rounded-lg text-white font-bold text-sm"
                     style="background: ${zoneData.color};">
                    ${zoneData.label}
                </div>
            </div>

            ${
                this.config.showGraphs
                    ? `
                <div class="mt-4 h-20 bg-slate-800/50 rounded-lg p-2">
                    <canvas id="chart-${memberId}" width="100" height="60"></canvas>
                </div>
            `
                    : ''
            }
        `;

        // Créer mini-graphique si activé
        if (this.config.showGraphs && member.history.length > 1) {
            setTimeout(() => {
                this.createMiniChart(memberId, member.history);
            }, 100);
        }

        return card;
    },

    createMiniChart(memberId, history) {
        const canvas = document.getElementById(`chart-${memberId}`);
        if (!canvas) {
            return;
        }

        // Vérifier si Chart.js est disponible
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js non chargé - graphiques désactivés');
            return;
        }

        const ctx = canvas.getContext('2d');

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: history.map((_, i) => i),
                datasets: [
                    {
                        data: history.map(h => h.hr),
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { display: false },
                    y: { display: false }
                }
            }
        });
    },

    // ===================================================================
    // MISES À JOUR
    // ===================================================================
    startUpdates() {
        if (this.updateInterval) {
            return;
        }

        this.updateInterval = setInterval(() => {
            this.renderAllMembers();
            this.updateGlobalStats();
        }, this.config.refreshRate);
    },

    stopUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    },

    updateGlobalStats() {
        const totalConnected = document.getElementById('totalConnected');
        const avgHR = document.getElementById('avgHR');

        if (totalConnected) {
            totalConnected.textContent = this.activeMembers.size;
        }

        if (avgHR && this.activeMembers.size > 0) {
            const sum = Array.from(this.activeMembers.values()).reduce((acc, m) => acc + m.hr, 0);
            const avg = Math.round(sum / this.activeMembers.size);
            avgHR.textContent = avg;
        } else if (avgHR) {
            avgHR.textContent = '--';
        }
    },

    updateClock() {
        const now = new Date();
        const timeEl = document.getElementById('currentTime');
        const dateEl = document.getElementById('currentDate');

        if (timeEl) {
            timeEl.textContent = now.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        if (dateEl) {
            dateEl.textContent = now.toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
            });
        }
    },

    async loadActiveConnections() {
        if (typeof WearablesIntegration === 'undefined') {
            return;
        }

        const connections = WearablesIntegration.getActiveConnections();

        for (const conn of connections) {
            if (conn.lastHR && conn.lastHR > 0) {
                await this.addMember(conn.memberId, conn.lastHR, conn.type);
            }
        }

        this.renderAllMembers();
        this.updateGlobalStats();
    },

    // ===================================================================
    // CONTRÔLES
    // ===================================================================
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    },

    close() {
        this.isActive = false;
        this.stopUpdates();
        this.activeMembers.clear();

        if (typeof ViewManager !== 'undefined') {
            ViewManager.showView('calendar');
        }
    },

    // ===================================================================
    // UTILITAIRES
    // ===================================================================
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
            : '255, 255, 255';
    },

    /**
     * Charger une session pour filtrage
     * @param sessionId
     */
    async loadSession(sessionId) {
        try {
            console.log(`📋 Chargement session: ${sessionId}`);

            // Récupérer depuis localStorage (TODO: Supabase)
            const sessions = JSON.parse(localStorage.getItem('hr_sessions') || '[]');
            const session = sessions.find(s => s.id === sessionId);

            if (!session) {
                console.warn(`⚠️ Session ${sessionId} introuvable`);
                this.filterBySession = false;
                return;
            }

            this.currentSession = session;
            this.filterBySession = true;

            console.log(
                `✅ Session chargée: "${session.name}" avec ${session.members.length} adhérents`
            );
            console.log('👥 Adhérents autorisés:', session.members);

            // Mettre à jour le titre si élément existe
            const titleElement = document.querySelector('h1');
            if (titleElement) {
                titleElement.innerHTML = `<i class="fas fa-heartbeat mr-4"></i>${session.name} - CARDIO LIVE`;
            }
        } catch (error) {
            console.error('❌ Erreur chargement session:', error);
            this.filterBySession = false;
        }
    }
};

// Exposer globalement
window.CardioTVLive = CardioTVLive;

console.log('✅ Module Cardio TV Live chargé');
