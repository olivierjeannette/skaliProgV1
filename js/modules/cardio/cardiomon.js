/**
 * CardioMon - Moniteur cardiaque Bluetooth
 * Support: Garmin, Suunto, Polar, Apple Watch via Bluetooth Heart Rate Service
 * Fonctionnalités: Web Bluetooth, Sessions temps réel, Zones cardio, Chart.js, Supabase
 */

const CardioMon = {
    // Device Bluetooth
    device: null,
    characteristic: null,
    batteryCharacteristic: null,
    isConnected: false,
    currentHR: 0,
    batteryLevel: null,

    // Sessions actives
    activeSessions: [],
    currentSessionId: null,
    currentMemberId: null,

    // Historique temps réel (60 secondes)
    hrHistory: [],

    // Graphiques Chart.js
    hrChart: null,
    zonesChart: null,

    // Timer session
    sessionTimer: null,
    sessionStartTime: null,
    sessionElapsedSeconds: 0,
    isSessionRunning: false,
    isSessionPaused: false,

    // Stats session en cours
    sessionStats: {
        avgHR: 0,
        maxHR: 0,
        minHR: 999,
        totalBeats: 0,
        hrSum: 0,
        zone1Time: 0,
        zone2Time: 0,
        zone3Time: 0,
        zone4Time: 0,
        zone5Time: 0,
        calories: 0
    },

    // Zones cardio calculées
    zones: null,
    currentZone: null,

    // Mode simulation si pas de Bluetooth
    simulationMode: false,
    simulationInterval: null,

    /**
     * Afficher la vue principale - Lance directement Cardio Live
     */
    async showCardioMonView() {
        try {
            console.log('💓 Ouverture Cardio Live...');

            // Lancer directement le mode TV simplifié
            CardioTVSimple.showTVMode();
        } catch (error) {
            console.error('❌ Erreur ouverture Cardio Live:', error);
            Utils.showNotification('Erreur lors du chargement', 'error');
        }
    },

    /**
     * Ancienne méthode pour compatibilité (non utilisée)
     */
    async _showCardioMonViewOld() {
        try {
            console.log('💓 Ouverture module Cardio Monitor...');

            const html = `
                <div class="cardio-mon-container">
                    <!-- Header -->
                    <div class="cardio-header">
                        <div>
                            <h2>
                                <i class="fas fa-heartbeat text-red-500 mr-3"></i>
                                Cardio Monitor
                            </h2>
                            <p class="text-gray-400">
                                Suivi temps réel de la fréquence cardiaque
                            </p>
                        </div>
                        <div class="connection-status">
                            <div id="btStatus" class="status-indicator disconnected">
                                <i class="fas fa-bluetooth"></i>
                                <span>Déconnecté</span>
                            </div>
                            <button onclick="CardioTVSimple.showTVMode()" class="btn-tv-mode" title="Mode TV multi-utilisateurs">
                                <i class="fas fa-tv mr-2"></i>
                                Cardio Live
                            </button>
                        </div>
                    </div>

                    <!-- Session Controls -->
                    <div id="sessionControls" class="session-controls hidden">
                        <div class="session-info">
                            <div class="session-member">
                                <i class="fas fa-user-circle"></i>
                                <span id="sessionMemberName">Aucun adhérent</span>
                            </div>
                            <div class="session-timer">
                                <i class="fas fa-clock"></i>
                                <span id="sessionTimer">00:00:00</span>
                            </div>
                        </div>
                        <div class="session-buttons">
                            <button onclick="CardioMon.selectMember()" class="btn-session">
                                <i class="fas fa-user-plus"></i>
                                Sélectionner adhérent
                            </button>
                            <button onclick="CardioMon.startSession()" id="startBtn" class="btn-session btn-start" disabled>
                                <i class="fas fa-play"></i>
                                Démarrer
                            </button>
                            <button onclick="CardioMon.pauseSession()" id="pauseBtn" class="btn-session btn-pause hidden">
                                <i class="fas fa-pause"></i>
                                Pause
                            </button>
                            <button onclick="CardioMon.resumeSession()" id="resumeBtn" class="btn-session btn-resume hidden">
                                <i class="fas fa-play"></i>
                                Reprendre
                            </button>
                            <button onclick="CardioMon.stopSession()" id="stopBtn" class="btn-session btn-stop hidden">
                                <i class="fas fa-stop"></i>
                                Terminer
                            </button>
                        </div>
                    </div>

                    <!-- Monitoring principal -->
                    <div class="monitoring-grid">
                        <!-- Capteur cardiaque principal -->
                        <div class="heart-rate-display">
                            <div class="hr-circle" id="hrCircle">
                                <i class="fas fa-heart pulse-icon"></i>
                                <div class="hr-value" id="currentHR">--</div>
                                <div class="hr-unit">BPM</div>
                            </div>

                            <!-- Stats session en cours -->
                            <div id="sessionStatsDisplay" class="session-stats hidden">
                                <div class="stat-item">
                                    <span class="stat-label">Moyenne</span>
                                    <span class="stat-value" id="avgHR">--</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Max</span>
                                    <span class="stat-value" id="maxHR">--</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Min</span>
                                    <span class="stat-value" id="minHR">--</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Calories</span>
                                    <span class="stat-value" id="calories">0</span>
                                </div>
                            </div>

                            <div class="hr-zones" id="hrZones">
                                <div class="zone zone-1" id="zone1" data-zone="1">
                                    <span class="zone-label">Zone 1</span>
                                    <span class="zone-range" id="zone1Range">--</span>
                                    <span class="zone-time" id="zone1Time">0s</span>
                                </div>
                                <div class="zone zone-2" id="zone2" data-zone="2">
                                    <span class="zone-label">Zone 2</span>
                                    <span class="zone-range" id="zone2Range">--</span>
                                    <span class="zone-time" id="zone2Time">0s</span>
                                </div>
                                <div class="zone zone-3" id="zone3" data-zone="3">
                                    <span class="zone-label">Zone 3</span>
                                    <span class="zone-range" id="zone3Range">--</span>
                                    <span class="zone-time" id="zone3Time">0s</span>
                                </div>
                                <div class="zone zone-4" id="zone4" data-zone="4">
                                    <span class="zone-label">Zone 4</span>
                                    <span class="zone-range" id="zone4Range">--</span>
                                    <span class="zone-time" id="zone4Time">0s</span>
                                </div>
                                <div class="zone zone-5" id="zone5" data-zone="5">
                                    <span class="zone-label">Zone 5</span>
                                    <span class="zone-range" id="zone5Range">--</span>
                                    <span class="zone-time" id="zone5Time">0s</span>
                                </div>
                            </div>
                        </div>

                        <!-- Graphique temps réel -->
                        <div class="hr-chart-card">
                            <h3><i class="fas fa-chart-line mr-2"></i>Historique (dernières 60 secondes)</h3>
                            <canvas id="hrChart"></canvas>
                        </div>
                    </div>

                    <!-- Graphique zones -->
                    <div class="zones-chart-card">
                        <h3><i class="fas fa-chart-pie mr-2"></i>Répartition par zones</h3>
                        <canvas id="zonesChart"></canvas>
                    </div>

                    <!-- Détails device connecté -->
                    <div id="deviceInfo" class="device-info-card hidden">
                        <h3><i class="fas fa-info-circle mr-2"></i>Appareil connecté</h3>
                        <div id="deviceDetails"></div>
                    </div>

                    <!-- Historique sessions -->
                    <div class="sessions-history-card">
                        <div class="card-header">
                            <h3><i class="fas fa-history mr-2"></i>Historique des sessions</h3>
                            <button onclick="CardioMon.loadSessionsHistory()" class="btn-refresh">
                                <i class="fas fa-sync"></i>
                                Actualiser
                            </button>
                        </div>
                        <div id="sessionsHistory" class="sessions-history">
                            <div class="no-data">
                                <i class="fas fa-clock text-4xl mb-2"></i>
                                <p>Aucune session enregistrée</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            const mainContent = document.getElementById('mainContent');
            if (mainContent) {
                mainContent.innerHTML = html;
            }

            // Activer le bouton de navigation
            document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
            const cardioBtn = document.getElementById('cardioBtn');
            if (cardioBtn) {
                cardioBtn.classList.add('active');
            }

            // Initialiser les graphiques
            await this.initCharts();

            // Charger l'historique
            await this.loadSessionsHistory();

            // Vérifier si Bluetooth disponible
            if (!navigator.bluetooth) {
                Utils.showNotification(
                    'Bluetooth non disponible. Utilisez le mode simulation.',
                    'info'
                );
            }
        } catch (error) {
            console.error('❌ Erreur affichage Cardio Monitor:', error);
            Utils.showNotification('Erreur lors du chargement du module Cardio', 'error');
        }
    },

    /**
     * Connecter un appareil Bluetooth
     */
    async connectDevice() {
        try {
            // Vérifier si Bluetooth est supporté
            if (!navigator.bluetooth) {
                Utils.showNotification(
                    'Bluetooth non supporté par ce navigateur. Utilisez Chrome/Edge et activez le mode simulation.',
                    'error'
                );
                this.showBluetoothHelp();
                return;
            }

            // Vérifier si Bluetooth est bloqué
            try {
                const availability = await navigator.bluetooth.getAvailability();
                if (!availability) {
                    Utils.showNotification(
                        "Bluetooth désactivé. Veuillez l'activer dans les paramètres système.",
                        'error'
                    );
                    this.showBluetoothHelp();
                    return;
                }
            } catch (e) {
                console.log('getAvailability non supporté, on continue...');
            }

            Utils.showNotification("Recherche d'appareils Bluetooth...", 'info');

            // Demander un appareil avec le service Heart Rate
            this.device = await navigator.bluetooth.requestDevice({
                filters: [{ services: ['heart_rate'] }],
                optionalServices: ['battery_service', 'device_information']
            });

            console.log('📱 Appareil trouvé:', this.device.name);

            // Gérer la déconnexion
            this.device.addEventListener('gattserverdisconnected', () => {
                this.onDeviceDisconnected();
            });

            // Connecter au GATT Server
            const server = await this.device.gatt.connect();
            console.log('✅ Connecté au GATT Server');

            // Récupérer le service Heart Rate
            const service = await server.getPrimaryService('heart_rate');
            this.characteristic = await service.getCharacteristic('heart_rate_measurement');

            // S'abonner aux notifications
            await this.characteristic.startNotifications();
            this.characteristic.addEventListener('characteristicvaluechanged', event => {
                this.handleHeartRateUpdate(event);
            });

            // Essayer de récupérer le niveau de batterie
            try {
                const batteryService = await server.getPrimaryService('battery_service');
                this.batteryCharacteristic =
                    await batteryService.getCharacteristic('battery_level');
                const batteryValue = await this.batteryCharacteristic.readValue();
                this.batteryLevel = batteryValue.getUint8(0);
            } catch (e) {
                console.log('Batterie non disponible');
            }

            this.isConnected = true;
            this.updateConnectionStatus();

            Utils.showNotification(`Connecté à ${this.device.name}`, 'success');

            // Afficher les infos du device
            this.showDeviceInfo();

            // Afficher les contrôles de session
            document.getElementById('sessionControls')?.classList.remove('hidden');
        } catch (error) {
            console.error('❌ Erreur connexion Bluetooth:', error);

            // Gestion des erreurs spécifiques
            if (error.name === 'NotFoundError') {
                Utils.showNotification('Aucun appareil sélectionné', 'info');
            } else if (
                error.name === 'SecurityError' ||
                error.message.includes('globally disabled')
            ) {
                Utils.showNotification('Bluetooth bloqué par le navigateur', 'error');
                this.showBluetoothHelp();
            } else if (error.name === 'NotAllowedError') {
                Utils.showNotification('Permission Bluetooth refusée', 'error');
                this.showBluetoothHelp();
            } else {
                Utils.showNotification('Erreur de connexion Bluetooth', 'error');
            }
        }
    },

    /**
     * Afficher l'aide pour activer Bluetooth
     */
    showBluetoothHelp() {
        const helpHTML = `
            <div class="fixed inset-0 modal-backdrop flex items-center justify-center z-50 fade-in-premium" onclick="Utils.closeModal(event)">
                <div class="bg-wood-dark rounded-xl p-6 max-w-2xl mx-4 border-2 border-wood-accent" onclick="event.stopPropagation()">
                    <h3 class="text-2xl font-bold text-wood-accent mb-4">
                        <i class="fas fa-bluetooth"></i> Comment activer Bluetooth ?
                    </h3>

                    <div class="space-y-4 text-gray-300">
                        <div class="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                            <h4 class="font-bold text-red-400 mb-2">🚫 Bluetooth bloqué</h4>
                            <p>Le Bluetooth Web API est bloqué par votre navigateur ou système.</p>
                        </div>

                        <div class="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                            <h4 class="font-bold text-blue-400 mb-2">🌐 Navigateur</h4>
                            <ul class="list-disc pl-5 space-y-1 text-sm">
                                <li>Utilisez <strong>Chrome</strong> ou <strong>Edge</strong> (Firefox/Safari ne supportent pas Bluetooth Web API)</li>
                                <li>Accédez via <strong>HTTPS</strong> ou <strong>localhost</strong></li>
                                <li>Vérifiez que Bluetooth n'est pas bloqué dans les paramètres du site</li>
                            </ul>
                        </div>

                        <div class="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                            <h4 class="font-bold text-green-400 mb-2">💻 Windows</h4>
                            <ol class="list-decimal pl-5 space-y-1 text-sm">
                                <li>Paramètres → Bluetooth et appareils</li>
                                <li>Activez Bluetooth</li>
                                <li>Dans Chrome : chrome://flags → Recherchez "Web Bluetooth"</li>
                                <li>Activez "Web Bluetooth API"</li>
                            </ol>
                        </div>

                        <div class="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                            <h4 class="font-bold text-purple-400 mb-2">🍎 macOS</h4>
                            <ol class="list-decimal pl-5 space-y-1 text-sm">
                                <li>Préférences Système → Bluetooth</li>
                                <li>Activez Bluetooth</li>
                                <li>Autorisez l'accès Bluetooth à Chrome dans Sécurité & Confidentialité</li>
                            </ol>
                        </div>

                        <div class="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                            <h4 class="font-bold text-yellow-400 mb-2">🎯 Solution rapide</h4>
                            <p>Utilisez le <strong>Mode Simulation</strong> pour tester sans appareil Bluetooth réel !</p>
                            <button onclick="CardioMon.closeModal(); CardioMon.startSimulation();"
                                    class="mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition">
                                <i class="fas fa-play"></i> Lancer la simulation
                            </button>
                        </div>
                    </div>

                    <button onclick="Utils.closeModal()"
                            class="mt-6 w-full px-6 py-3 bg-wood-accent hover:bg-wood-accent-dark text-white rounded-lg font-semibold transition">
                        Fermer
                    </button>
                </div>
            </div>
        `;

        document.getElementById('modalContainer').innerHTML = helpHTML;
    },

    closeModal() {
        const modal = document.querySelector('.modal-backdrop');
        if (modal) {
            modal.remove();
        }
    },

    /**
     * Gérer la déconnexion du device
     */
    onDeviceDisconnected() {
        console.log('📱 Appareil déconnecté');
        this.isConnected = false;
        this.updateConnectionStatus();
        Utils.showNotification('Appareil déconnecté', 'warning');

        // Tenter une reconnexion automatique
        setTimeout(() => {
            if (!this.isConnected && this.device) {
                console.log('🔄 Tentative de reconnexion...');
                this.reconnectDevice();
            }
        }, 3000);
    },

    /**
     * Reconnexion automatique
     */
    async reconnectDevice() {
        try {
            if (!this.device) {
                return;
            }

            const server = await this.device.gatt.connect();
            const service = await server.getPrimaryService('heart_rate');
            this.characteristic = await service.getCharacteristic('heart_rate_measurement');

            await this.characteristic.startNotifications();
            this.characteristic.addEventListener('characteristicvaluechanged', event => {
                this.handleHeartRateUpdate(event);
            });

            this.isConnected = true;
            this.updateConnectionStatus();
            Utils.showNotification('Reconnecté avec succès', 'success');
        } catch (error) {
            console.error('❌ Échec reconnexion:', error);
        }
    },

    /**
     * Gérer les mises à jour de fréquence cardiaque
     * @param event
     */
    handleHeartRateUpdate(event) {
        const value = event.target.value;
        const flags = value.getUint8(0);

        // Format 16-bit ou 8-bit ?
        const hrFormat = flags & 0x01;
        const hr = hrFormat ? value.getUint16(1, true) : value.getUint8(1);

        this.currentHR = hr;
        this.updateHeartRateDisplay(hr);
        this.addToHistory(hr);

        // Si session active, sauvegarder
        if (this.isSessionRunning && !this.isSessionPaused) {
            this.updateSessionStats(hr);
            this.saveDataPoint(hr);
        }
    },

    /**
     * Mettre à jour l'affichage de la FC
     * @param hr
     */
    updateHeartRateDisplay(hr) {
        const hrElement = document.getElementById('currentHR');
        if (hrElement) {
            hrElement.textContent = hr;

            // Animation pulse en fonction de la FC
            const pulseIcon = document.querySelector('.pulse-icon');
            if (pulseIcon) {
                const duration = 60 / hr; // Durée en secondes
                pulseIcon.style.animationDuration = `${duration}s`;
            }

            // Couleur cercle selon zone
            const hrCircle = document.getElementById('hrCircle');
            if (hrCircle && this.zones) {
                const zoneData = this.calculateCurrentZone(hr);
                this.currentZone = zoneData.zone;

                // Mise à jour zones visuelles
                this.updateZonesDisplay(zoneData.zone);

                // Couleur du cercle
                const zoneColors = {
                    1: 'rgba(16, 185, 129, 0.3)',
                    2: 'rgba(59, 130, 246, 0.3)',
                    3: 'rgba(245, 158, 11, 0.3)',
                    4: 'rgba(249, 115, 22, 0.3)',
                    5: 'rgba(239, 68, 68, 0.3)'
                };

                if (zoneData.zone) {
                    hrCircle.style.background = `radial-gradient(circle, ${zoneColors[zoneData.zone]}, rgba(239, 68, 68, 0.05))`;
                }
            }
        }
    },

    /**
     * Ajouter à l'historique
     * @param hr
     */
    addToHistory(hr) {
        const now = Date.now();
        this.hrHistory.push({ time: now, value: hr });

        // Garder seulement les 60 dernières secondes
        const oneMinuteAgo = now - 60000;
        this.hrHistory = this.hrHistory.filter(h => h.time > oneMinuteAgo);

        this.updateHRChart();
    },

    /**
     * Mettre à jour les zones visuelles
     * @param activeZone
     */
    updateZonesDisplay(activeZone) {
        document.querySelectorAll('.zone').forEach(z => {
            z.classList.remove('active');
        });

        if (activeZone) {
            const zoneEl = document.getElementById(`zone${activeZone}`);
            if (zoneEl) {
                zoneEl.classList.add('active');
            }
        }
    },

    /**
     * Calculer la zone actuelle
     * @param hr
     */
    calculateCurrentZone(hr) {
        if (!this.zones) {
            return { zone: null, percentage: 0 };
        }

        const maxHR = this.zones.maxHR;
        const percentage = (hr / maxHR) * 100;

        let zone = null;
        if (hr >= this.zones.zone5.min) {
            zone = 5;
        } else if (hr >= this.zones.zone4.min) {
            zone = 4;
        } else if (hr >= this.zones.zone3.min) {
            zone = 3;
        } else if (hr >= this.zones.zone2.min) {
            zone = 2;
        } else if (hr >= this.zones.zone1.min) {
            zone = 1;
        }

        return { zone, percentage };
    },

    /**
     * Sélectionner un adhérent
     */
    async selectMember() {
        try {
            const members = await SupabaseManager.getMembers();

            if (!members || members.length === 0) {
                Utils.showNotification('Aucun adhérent trouvé', 'warning');
                return;
            }

            // Créer modal de sélection
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 600px;">
                    <div class="modal-header">
                        <h3>Sélectionner un adhérent</h3>
                        <button onclick="this.closest('.modal-overlay').remove()" class="modal-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <input type="text" id="memberSearch" placeholder="Rechercher..."
                               class="search-input" oninput="CardioMon.filterMembers(this.value)">
                        <div id="membersList" class="members-list">
                            ${members
                                .map(
                                    m => `
                                <div class="member-item" onclick="CardioMon.onMemberSelected('${m.id}', '${m.name}')">
                                    <i class="fas fa-user-circle"></i>
                                    <div>
                                        <div class="member-name">${m.name}</div>
                                        <div class="member-info">
                                            ${m.max_heart_rate ? `FCmax: ${m.max_heart_rate} bpm` : 'FCmax non définie'}
                                        </div>
                                    </div>
                                </div>
                            `
                                )
                                .join('')}
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
        } catch (error) {
            console.error('❌ Erreur sélection adhérent:', error);
            Utils.showNotification('Erreur lors de la sélection', 'error');
        }
    },

    /**
     * Filtrer les adhérents
     * @param search
     */
    filterMembers(search) {
        const items = document.querySelectorAll('.member-item');
        items.forEach(item => {
            const name = item.querySelector('.member-name').textContent.toLowerCase();
            if (name.includes(search.toLowerCase())) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    },

    /**
     * Adhérent sélectionné
     * @param memberId
     * @param memberName
     */
    async onMemberSelected(memberId, memberName) {
        this.currentMemberId = memberId;

        // Afficher le nom
        const nameEl = document.getElementById('sessionMemberName');
        if (nameEl) {
            nameEl.textContent = memberName;
        }

        // Calculer les zones pour cet adhérent
        try {
            const zoneData = await SupabaseManager.calculateHRZones(memberId, this.currentHR);
            this.zones = zoneData.zones;

            // Afficher les zones
            this.displayZones(zoneData.zones);

            // Activer le bouton start
            const startBtn = document.getElementById('startBtn');
            if (startBtn) {
                startBtn.disabled = false;
            }
        } catch (error) {
            console.error('❌ Erreur calcul zones:', error);
            Utils.showNotification('Erreur calcul zones cardio', 'error');
        }

        // Fermer la modal
        document.querySelector('.modal-overlay')?.remove();
    },

    /**
     * Afficher les zones calculées
     * @param zones
     */
    displayZones(zones) {
        const zoneElements = [
            { id: 'zone1Range', range: `${zones.zone1.min}-${zones.zone1.max}` },
            { id: 'zone2Range', range: `${zones.zone2.min}-${zones.zone2.max}` },
            { id: 'zone3Range', range: `${zones.zone3.min}-${zones.zone3.max}` },
            { id: 'zone4Range', range: `${zones.zone4.min}-${zones.zone4.max}` },
            { id: 'zone5Range', range: `${zones.zone5.min}-${zones.zone5.max}` }
        ];

        zoneElements.forEach(ze => {
            const el = document.getElementById(ze.id);
            if (el) {
                el.textContent = ze.range;
            }
        });
    },

    /**
     * Démarrer une session
     */
    async startSession() {
        try {
            if (!this.currentMemberId) {
                Utils.showNotification('Sélectionnez un adhérent', 'warning');
                return;
            }

            if (!this.isConnected && !this.simulationMode) {
                Utils.showNotification('Connectez un appareil ou activez la simulation', 'warning');
                return;
            }

            // Créer la session dans Supabase
            const sessionData = {
                memberId: this.currentMemberId,
                sessionType: 'workout',
                startTime: new Date().toISOString()
            };

            const session = await SupabaseManager.createHeartRateSession(sessionData);
            this.currentSessionId = session.id;

            // Initialiser les stats
            this.sessionStats = {
                avgHR: 0,
                maxHR: 0,
                minHR: 999,
                totalBeats: 0,
                hrSum: 0,
                zone1Time: 0,
                zone2Time: 0,
                zone3Time: 0,
                zone4Time: 0,
                zone5Time: 0,
                calories: 0
            };

            // Démarrer le timer
            this.sessionStartTime = Date.now();
            this.sessionElapsedSeconds = 0;
            this.isSessionRunning = true;
            this.isSessionPaused = false;

            this.sessionTimer = setInterval(() => {
                if (!this.isSessionPaused) {
                    this.sessionElapsedSeconds++;
                    this.updateSessionTimer();

                    // Incrémenter temps de zone
                    if (this.currentZone) {
                        this.sessionStats[`zone${this.currentZone}Time`]++;
                        this.updateZonesTimes();
                        this.updateZonesChart();
                    }
                }
            }, 1000);

            // Afficher les stats
            document.getElementById('sessionStatsDisplay')?.classList.remove('hidden');

            // Boutons
            document.getElementById('startBtn')?.classList.add('hidden');
            document.getElementById('pauseBtn')?.classList.remove('hidden');
            document.getElementById('stopBtn')?.classList.remove('hidden');

            Utils.showNotification('Session démarrée', 'success');
        } catch (error) {
            console.error('❌ Erreur démarrage session:', error);
            Utils.showNotification('Erreur lors du démarrage', 'error');
        }
    },

    /**
     * Mettre en pause la session
     */
    pauseSession() {
        this.isSessionPaused = true;
        document.getElementById('pauseBtn')?.classList.add('hidden');
        document.getElementById('resumeBtn')?.classList.remove('hidden');
        Utils.showNotification('Session en pause', 'info');
    },

    /**
     * Reprendre la session
     */
    resumeSession() {
        this.isSessionPaused = false;
        document.getElementById('pauseBtn')?.classList.remove('hidden');
        document.getElementById('resumeBtn')?.classList.add('hidden');
        Utils.showNotification('Session reprise', 'success');
    },

    /**
     * Terminer la session
     */
    async stopSession() {
        try {
            if (!this.currentSessionId) {
                return;
            }

            // Arrêter le timer
            if (this.sessionTimer) {
                clearInterval(this.sessionTimer);
                this.sessionTimer = null;
            }

            this.isSessionRunning = false;
            this.isSessionPaused = false;

            // Mettre à jour la session dans Supabase
            const updates = {
                endTime: new Date().toISOString(),
                avgHeartRate: this.sessionStats.avgHR,
                maxHeartRate: this.sessionStats.maxHR,
                minHeartRate: this.sessionStats.minHR,
                caloriesBurned: this.sessionStats.calories,
                zone1Time: this.sessionStats.zone1Time,
                zone2Time: this.sessionStats.zone2Time,
                zone3Time: this.sessionStats.zone3Time,
                zone4Time: this.sessionStats.zone4Time,
                zone5Time: this.sessionStats.zone5Time
            };

            await SupabaseManager.updateHeartRateSession(this.currentSessionId, updates);

            Utils.showNotification('Session terminée et sauvegardée', 'success');

            // Reset UI
            this.currentSessionId = null;
            this.sessionElapsedSeconds = 0;

            document.getElementById('sessionStatsDisplay')?.classList.add('hidden');
            document.getElementById('startBtn')?.classList.remove('hidden');
            document.getElementById('pauseBtn')?.classList.add('hidden');
            document.getElementById('resumeBtn')?.classList.add('hidden');
            document.getElementById('stopBtn')?.classList.add('hidden');

            // Recharger l'historique
            await this.loadSessionsHistory();
        } catch (error) {
            console.error('❌ Erreur arrêt session:', error);
            Utils.showNotification("Erreur lors de l'arrêt", 'error');
        }
    },

    /**
     * Mettre à jour les stats de la session
     * @param hr
     */
    updateSessionStats(hr) {
        this.sessionStats.totalBeats++;
        this.sessionStats.hrSum += hr;
        this.sessionStats.avgHR = Math.round(
            this.sessionStats.hrSum / this.sessionStats.totalBeats
        );

        if (hr > this.sessionStats.maxHR) {
            this.sessionStats.maxHR = hr;
        }
        if (hr < this.sessionStats.minHR) {
            this.sessionStats.minHR = hr;
        }

        // Calcul calories (formule simple: MET)
        // Calories = (MET * poids en kg * temps en heures)
        // Pour cardio: MET varie selon intensité (zone)
        const metValues = { 1: 3, 2: 5, 3: 7, 4: 9, 5: 12 };
        const met = this.currentZone ? metValues[this.currentZone] : 5;
        const hours = this.sessionElapsedSeconds / 3600;
        const weight = 75; // Poids moyen, devrait venir du profil membre
        this.sessionStats.calories = Math.round(met * weight * hours);

        // Afficher
        document.getElementById('avgHR').textContent = this.sessionStats.avgHR;
        document.getElementById('maxHR').textContent = this.sessionStats.maxHR;
        document.getElementById('minHR').textContent =
            this.sessionStats.minHR === 999 ? '--' : this.sessionStats.minHR;
        document.getElementById('calories').textContent = this.sessionStats.calories;
    },

    /**
     * Sauvegarder un point de données
     * @param hr
     */
    async saveDataPoint(hr) {
        try {
            if (!this.currentSessionId) {
                return;
            }

            const dataPoint = {
                sessionId: this.currentSessionId,
                timestamp: new Date().toISOString(),
                heartRate: hr,
                zone: this.currentZone
            };

            // Sauvegarder (sans attendre pour ne pas ralentir)
            SupabaseManager.saveHeartRateDataPoint(dataPoint).catch(err => {
                console.error('Erreur sauvegarde point:', err);
            });
        } catch (error) {
            console.error('❌ Erreur sauvegarde data point:', error);
        }
    },

    /**
     * Mettre à jour le timer de session
     */
    updateSessionTimer() {
        const hours = Math.floor(this.sessionElapsedSeconds / 3600);
        const minutes = Math.floor((this.sessionElapsedSeconds % 3600) / 60);
        const seconds = this.sessionElapsedSeconds % 60;

        const timerEl = document.getElementById('sessionTimer');
        if (timerEl) {
            timerEl.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    },

    /**
     * Mettre à jour les temps par zone
     */
    updateZonesTimes() {
        for (let i = 1; i <= 5; i++) {
            const time = this.sessionStats[`zone${i}Time`];
            const el = document.getElementById(`zone${i}Time`);
            if (el) {
                const minutes = Math.floor(time / 60);
                const seconds = time % 60;
                el.textContent = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
            }
        }
    },

    /**
     * Initialiser les graphiques Chart.js
     */
    async initCharts() {
        // Charger Chart.js dynamiquement si pas déjà chargé
        if (typeof Chart === 'undefined') {
            await this.loadChartJS();
        }

        // Graphique HR temps réel
        const hrCtx = document.getElementById('hrChart')?.getContext('2d');
        if (hrCtx) {
            this.hrChart = new Chart(hrCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'Fréquence cardiaque',
                            data: [],
                            borderColor: '#ef4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            borderWidth: 2,
                            tension: 0.4,
                            fill: true,
                            pointRadius: 0
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: true }
                    },
                    scales: {
                        x: {
                            display: true,
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            ticks: { color: '#94a3b8', maxTicksLimit: 6 }
                        },
                        y: {
                            display: true,
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            ticks: { color: '#94a3b8' },
                            suggestedMin: 60,
                            suggestedMax: 200
                        }
                    },
                    animation: { duration: 0 }
                }
            });
        }

        // Graphique zones (camembert)
        const zonesCtx = document.getElementById('zonesChart')?.getContext('2d');
        if (zonesCtx) {
            this.zonesChart = new Chart(zonesCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5'],
                    datasets: [
                        {
                            data: [0, 0, 0, 0, 0],
                            backgroundColor: [
                                'rgba(16, 185, 129, 0.8)',
                                'rgba(59, 130, 246, 0.8)',
                                'rgba(245, 158, 11, 0.8)',
                                'rgba(249, 115, 22, 0.8)',
                                'rgba(239, 68, 68, 0.8)'
                            ],
                            borderWidth: 0
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: { color: '#94a3b8', font: { size: 12 } }
                        },
                        tooltip: {
                            callbacks: {
                                label: context => {
                                    const seconds = context.parsed;
                                    const minutes = Math.floor(seconds / 60);
                                    const secs = seconds % 60;
                                    return `${context.label}: ${minutes}m ${secs}s`;
                                }
                            }
                        }
                    }
                }
            });
        }
    },

    /**
     * Charger Chart.js dynamiquement
     */
    async loadChartJS() {
        return new Promise((resolve, reject) => {
            if (typeof Chart !== 'undefined') {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Erreur chargement Chart.js'));
            document.head.appendChild(script);
        });
    },

    /**
     * Mettre à jour le graphique HR
     */
    updateHRChart() {
        if (!this.hrChart) {
            return;
        }

        const labels = this.hrHistory.map(h => {
            const date = new Date(h.time);
            return `${date.getSeconds()}s`;
        });

        const data = this.hrHistory.map(h => h.value);

        this.hrChart.data.labels = labels;
        this.hrChart.data.datasets[0].data = data;
        this.hrChart.update('none'); // Update sans animation pour performance
    },

    /**
     * Mettre à jour le graphique zones
     */
    updateZonesChart() {
        if (!this.zonesChart) {
            return;
        }

        this.zonesChart.data.datasets[0].data = [
            this.sessionStats.zone1Time,
            this.sessionStats.zone2Time,
            this.sessionStats.zone3Time,
            this.sessionStats.zone4Time,
            this.sessionStats.zone5Time
        ];

        this.zonesChart.update('none');
    },

    /**
     * Mettre à jour le statut de connexion
     */
    updateConnectionStatus() {
        const statusEl = document.getElementById('btStatus');
        const btnEl = document.getElementById('connectBtn');

        if (this.isConnected) {
            statusEl.className = 'status-indicator connected';
            statusEl.innerHTML = `
                <i class="fas fa-bluetooth"></i>
                <span>Connecté${this.batteryLevel !== null ? ` (${this.batteryLevel}%)` : ''}</span>
            `;
            btnEl.innerHTML = '<i class="fas fa-times mr-2"></i>Déconnecter';
            btnEl.onclick = () => this.disconnectDevice();
        } else if (this.simulationMode) {
            statusEl.className = 'status-indicator connected';
            statusEl.innerHTML = '<i class="fas fa-flask"></i><span>Simulation</span>';
        } else {
            statusEl.className = 'status-indicator disconnected';
            statusEl.innerHTML = '<i class="fas fa-bluetooth"></i><span>Déconnecté</span>';
            btnEl.innerHTML = '<i class="fas fa-plug mr-2"></i>Connecter';
            btnEl.onclick = () => this.connectDevice();
        }
    },

    /**
     * Déconnecter l'appareil
     */
    disconnectDevice() {
        if (this.device && this.device.gatt.connected) {
            this.device.gatt.disconnect();
        }
        this.isConnected = false;
        this.device = null;
        this.characteristic = null;
        this.batteryCharacteristic = null;
        this.batteryLevel = null;
        this.updateConnectionStatus();
        Utils.showNotification('Appareil déconnecté', 'info');
    },

    /**
     * Afficher les infos du device
     */
    showDeviceInfo() {
        const infoCard = document.getElementById('deviceInfo');
        const detailsEl = document.getElementById('deviceDetails');

        if (infoCard && detailsEl && this.device) {
            detailsEl.innerHTML = `
                <div class="text-white space-y-2">
                    <p><strong>Nom:</strong> ${this.device.name || 'Inconnu'}</p>
                    <p><strong>ID:</strong> ${this.device.id}</p>
                    ${this.batteryLevel !== null ? `<p><strong>Batterie:</strong> ${this.batteryLevel}%</p>` : ''}
                </div>
            `;
            infoCard.classList.remove('hidden');
        }
    },

    /**
     * Toggle mode simulation
     */
    toggleSimulation() {
        if (this.simulationMode) {
            // Arrêter simulation
            if (this.simulationInterval) {
                clearInterval(this.simulationInterval);
                this.simulationInterval = null;
            }
            this.simulationMode = false;
            this.updateConnectionStatus();
            Utils.showNotification('Mode simulation désactivé', 'info');
        } else {
            // Démarrer simulation
            this.simulationMode = true;
            this.startSimulation();
            this.updateConnectionStatus();

            // Afficher les contrôles
            document.getElementById('sessionControls')?.classList.remove('hidden');

            Utils.showNotification('Mode simulation activé', 'success');
        }
    },

    /**
     * Démarrer la simulation
     */
    startSimulation() {
        let baseHR = 80;

        this.simulationInterval = setInterval(() => {
            // Simuler variation réaliste de FC
            const variation = (Math.random() - 0.5) * 10;
            baseHR = Math.max(60, Math.min(180, baseHR + variation));

            const hr = Math.round(baseHR);
            this.currentHR = hr;

            this.updateHeartRateDisplay(hr);
            this.addToHistory(hr);

            // Si session active, sauvegarder
            if (this.isSessionRunning && !this.isSessionPaused) {
                this.updateSessionStats(hr);
                this.saveDataPoint(hr);
            }
        }, 1000);
    },

    /**
     * Charger l'historique des sessions
     */
    async loadSessionsHistory() {
        try {
            const container = document.getElementById('sessionsHistory');
            if (!container) {
                return;
            }

            // Récupérer toutes les sessions récentes
            const allSessions = await SupabaseManager.getHeartRateSessions(null, 20);

            if (!allSessions || allSessions.length === 0) {
                container.innerHTML = `
                    <div class="no-data">
                        <i class="fas fa-clock text-4xl mb-2"></i>
                        <p>Aucune session enregistrée</p>
                    </div>
                `;
                return;
            }

            // Récupérer les membres pour afficher les noms
            const members = await SupabaseManager.getMembers();
            const membersMap = {};
            members.forEach(m => (membersMap[m.id] = m.name));

            container.innerHTML = allSessions
                .map(session => {
                    const memberName = membersMap[session.member_id] || 'Inconnu';
                    const startDate = new Date(session.start_time);
                    const duration = session.end_time
                        ? Math.round((new Date(session.end_time) - startDate) / 1000)
                        : 0;

                    const hours = Math.floor(duration / 3600);
                    const minutes = Math.floor((duration % 3600) / 60);
                    const seconds = duration % 60;

                    return `
                    <div class="session-history-item">
                        <div class="session-history-header">
                            <span class="session-member">${memberName}</span>
                            <span class="session-date">${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString()}</span>
                        </div>
                        <div class="session-history-stats">
                            <div class="stat">
                                <i class="fas fa-clock"></i>
                                ${hours > 0 ? `${hours}h ` : ''}${minutes}m ${seconds}s
                            </div>
                            <div class="stat">
                                <i class="fas fa-heartbeat"></i>
                                Moy: ${session.avg_heart_rate || '--'} bpm
                            </div>
                            <div class="stat">
                                <i class="fas fa-arrow-up"></i>
                                Max: ${session.max_heart_rate || '--'} bpm
                            </div>
                            <div class="stat">
                                <i class="fas fa-fire"></i>
                                ${session.calories_burned || 0} kcal
                            </div>
                        </div>
                    </div>
                `;
                })
                .join('');
        } catch (error) {
            console.error('❌ Erreur chargement historique:', error);
        }
    }
};

// Exposer globalement
window.CardioMon = CardioMon;
