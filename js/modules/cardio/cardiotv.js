/**
 * CardioTV - Mode TV pour affichage multi-utilisateurs temps réel
 * Affichage en grille des fréquences cardiaques de tous les adhérents
 * Compatible Apple Watch (via iPhone), capteurs Bluetooth, et mode simulation
 */

const CardioTV = {
    // Participants actifs
    participants: new Map(), // Map<memberId, {member, device, hr, zone, lastUpdate}>

    // Devices connectés
    connectedDevices: new Map(), // Map<deviceId, {device, characteristic, memberId}>

    // Mode affichage
    displayMode: 'grid', // 'grid', 'list', 'focus'
    gridSize: 6, // Nombre de participants visibles

    // WebSocket pour sync temps réel (optionnel)
    ws: null,

    // Rafraîchissement
    refreshInterval: null,

    // Base de données locale pour associations
    deviceMemberMap: new Map(), // Map<deviceId, memberId> - sauvegarde locale

    /**
     * Afficher le mode TV
     */
    async showTVMode() {
        try {
            console.log('📺 Ouverture mode TV Cardio...');

            // Charger les adhérents
            const members = await SupabaseManager.getMembers();
            console.log('👥 Membres chargés:', members.length);
            if (members.length > 0) {
                console.log('📋 Premier membre (exemple):', {
                    id: members[0].id,
                    nom: `${members[0].firstName} ${members[0].lastName}`,
                    type_id: typeof members[0].id
                });
            }

            const html = `
                <div class="cardio-tv-container">
                    <!-- Header TV -->
                    <div class="tv-header">
                        <div class="tv-title">
                            <i class="fas fa-heartbeat pulse-icon"></i>
                            <h1>SKALI CARDIO LIVE</h1>
                            <div class="live-indicator">
                                <span class="live-dot"></span>
                                EN DIRECT
                            </div>
                        </div>

                        <div class="tv-controls">
                            <button onclick="CardioTV.addParticipant()" class="btn-add-participant">
                                <i class="fas fa-user-plus"></i>
                                Ajouter Participant
                            </button>
                            <button onclick="CardioTV.toggleFullscreen()" class="btn-fullscreen">
                                <i class="fas fa-expand"></i>
                            </button>
                            <button onclick="CardioTV.exitTVMode()" class="btn-exit-tv">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Grille participants -->
                    <div id="participantsGrid" class="participants-grid">
                        <!-- Les cartes seront ajoutées dynamiquement -->
                    </div>

                    <!-- Modal ajout participant -->
                    <div id="addParticipantModal" class="modal-overlay hidden">
                        <div class="modal-content-tv">
                            <div class="modal-header">
                                <h3><i class="fas fa-user-plus mr-2"></i>Ajouter un participant</h3>
                                <button onclick="CardioTV.closeModal()" class="modal-close">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>

                            <div class="modal-body">
                                <!-- Sélection adhérent -->
                                <div class="form-group">
                                    <label>Adhérent</label>
                                    <select id="selectMember" class="form-control">
                                        <option value="">-- Sélectionner un adhérent --</option>
                                        ${members
                                            .map(
                                                m => `
                                            <option value="${m.id}">${m.firstName} ${m.lastName}</option>
                                        `
                                            )
                                            .join('')}
                                    </select>
                                </div>

                                <!-- Mode de connexion -->
                                <div class="form-group">
                                    <label>Mode de connexion</label>
                                    <div class="connection-mode-buttons">
                                        <button onclick="CardioTV.connectBluetooth()" class="mode-btn">
                                            <i class="fas fa-bluetooth"></i>
                                            <span>Capteur Bluetooth</span>
                                            <small>Polar, Garmin, Wahoo...</small>
                                        </button>
                                        <button onclick="CardioTV.connectPhone()" class="mode-btn">
                                            <i class="fas fa-mobile-alt"></i>
                                            <span>Téléphone</span>
                                            <small>Apple Watch via iPhone</small>
                                        </button>
                                        <button onclick="CardioTV.useSimulation()" class="mode-btn">
                                            <i class="fas fa-flask"></i>
                                            <span>Simulation</span>
                                            <small>Données de test</small>
                                        </button>
                                    </div>
                                </div>

                                <!-- QR Code pour connexion rapide téléphone -->
                                <div id="qrCodeSection" class="qr-section hidden">
                                    <p class="text-center mb-3">
                                        <i class="fas fa-mobile-alt"></i>
                                        Scanner ce QR code avec le téléphone de l'adhérent
                                    </p>
                                    <div id="qrCode" class="qr-code-container"></div>
                                    <p class="text-center text-sm mt-2">
                                        Ou entrer le code: <strong id="pairingCode" class="pairing-code">----</strong>
                                    </p>
                                </div>

                                <!-- Info capteur reconnu -->
                                <div id="deviceInfo" class="device-info hidden">
                                    <i class="fas fa-check-circle text-green-500"></i>
                                    <span id="deviceName">Capteur connecté</span>
                                </div>
                            </div>

                            <div class="modal-footer">
                                <button onclick="CardioTV.closeModal()" class="btn-secondary">
                                    Annuler
                                </button>
                                <button onclick="CardioTV.confirmAddParticipant()" class="btn-primary" id="btnConfirmAdd" disabled>
                                    <i class="fas fa-check mr-2"></i>
                                    Ajouter
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            const mainContent = document.getElementById('mainContent');
            if (mainContent) {
                mainContent.innerHTML = html;
            }

            // Charger les associations sauvegardées
            this.loadDeviceMemberMap();

            // Démarrer le rafraîchissement
            this.startRefresh();
        } catch (error) {
            console.error('❌ Erreur affichage mode TV:', error);
            Utils.showNotification('Erreur lors du chargement du mode TV', 'error');
        }
    },

    /**
     * Ajouter un participant
     */
    addParticipant() {
        const modal = document.getElementById('addParticipantModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    },

    /**
     * Connecter un capteur Bluetooth
     */
    async connectBluetooth() {
        try {
            const selectMember = document.getElementById('selectMember');
            const memberId = selectMember?.value;

            if (!memberId) {
                Utils.showNotification('Veuillez sélectionner un adhérent', 'warning');
                return;
            }

            if (!navigator.bluetooth) {
                Utils.showNotification('Bluetooth non supporté. Utilisez Chrome/Edge.', 'error');
                return;
            }

            Utils.showNotification('Recherche de capteurs Bluetooth...', 'info');

            // Demander un appareil
            const device = await navigator.bluetooth.requestDevice({
                filters: [{ services: ['heart_rate'] }],
                optionalServices: ['battery_service', 'device_information']
            });

            console.log('📱 Capteur trouvé:', device.name);

            // Connecter au GATT server
            const server = await device.gatt.connect();
            const service = await server.getPrimaryService('heart_rate');
            const characteristic = await service.getCharacteristic('heart_rate_measurement');

            // Sauvegarder l'association
            this.connectedDevices.set(device.id, {
                device,
                characteristic,
                memberId
            });

            // Sauvegarder pour reconnaissance automatique
            this.deviceMemberMap.set(device.id, memberId);
            this.saveDeviceMemberMap();

            // Afficher info device
            const deviceInfo = document.getElementById('deviceInfo');
            const deviceName = document.getElementById('deviceName');
            if (deviceInfo && deviceName) {
                deviceName.textContent = device.name || 'Capteur Bluetooth';
                deviceInfo.classList.remove('hidden');
            }

            // Activer bouton confirmation
            const btnConfirm = document.getElementById('btnConfirmAdd');
            if (btnConfirm) {
                btnConfirm.disabled = false;
            }

            Utils.showNotification(`Capteur ${device.name} connecté !`, 'success');
        } catch (error) {
            console.error('❌ Erreur connexion Bluetooth:', error);
            if (error.name === 'NotFoundError') {
                Utils.showNotification('Aucun capteur trouvé', 'warning');
            } else {
                Utils.showNotification('Erreur de connexion Bluetooth', 'error');
            }
        }
    },

    /**
     * Connecter via téléphone (Apple Watch via iPhone)
     */
    async connectPhone() {
        const selectMember = document.getElementById('selectMember');
        const memberId = selectMember?.value;

        console.log('🔍 connectPhone appelé');
        console.log('   selectMember:', selectMember);
        console.log('   memberId:', memberId);
        console.log('   type:', typeof memberId);
        console.log('   longueur:', memberId?.length);

        if (!memberId) {
            Utils.showNotification('Veuillez sélectionner un adhérent', 'warning');
            return;
        }

        // Générer code d'appairage unique
        const pairingCode = this.generatePairingCode();

        // Générer URL pour mobile - Utiliser l'IP locale si en développement
        let baseUrl = window.location.origin;

        // Si localhost, demander l'IP locale
        if (
            baseUrl.includes('localhost') ||
            baseUrl.includes('127.0.0.1') ||
            baseUrl.startsWith('file://')
        ) {
            // En local, on doit utiliser l'IP du réseau local
            const savedIp = localStorage.getItem('local_network_ip');

            if (!savedIp) {
                // Demander à l'utilisateur de saisir son IP locale
                const userIp = prompt(
                    '⚠️ DÉVELOPPEMENT LOCAL DÉTECTÉ\n\n' +
                        'Pour que votre iPhone puisse se connecter, entrez votre adresse IP locale.\n\n' +
                        'Comment la trouver :\n' +
                        '• Windows : Ouvrez CMD et tapez "ipconfig" (cherchez IPv4)\n' +
                        '• Mac : Préférences Système → Réseau\n\n' +
                        'Exemple : 192.168.1.100',
                    '192.168.1.'
                );

                if (userIp) {
                    localStorage.setItem('local_network_ip', userIp);
                    baseUrl = `http://${userIp}:5500`; // Port Live Server par défaut
                } else {
                    Utils.showNotification('IP locale requise pour le mode mobile', 'error');
                    return;
                }
            } else {
                baseUrl = `http://${savedIp}:5500`;
            }

            // Afficher un message d'aide
            Utils.showNotification(
                `📱 Assurez-vous que votre iPhone est sur le même WiFi que votre PC (${savedIp || baseUrl})`,
                'info',
                8000
            );
        }

        const mobileUrl = `${baseUrl}/mobile-hr.html?code=${pairingCode}&member=${memberId}`;
        const testUrl = `${baseUrl}/test-mobile-simple.html?code=${pairingCode}&member=${memberId}`;

        console.log('📱 URL mobile générée:', mobileUrl);
        console.log('🧪 URL test générée:', testUrl);

        // Afficher section QR Code
        const qrSection = document.getElementById('qrCodeSection');
        const qrCodeDiv = document.getElementById('qrCode');
        const pairingCodeSpan = document.getElementById('pairingCode');

        if (qrSection && qrCodeDiv && pairingCodeSpan) {
            qrSection.classList.remove('hidden');
            pairingCodeSpan.textContent = pairingCode;

            // Générer QR Code via API (plus fiable pour iPhone)
            qrCodeDiv.innerHTML = '';

            // Utiliser l'API QR Code Generator (gratuite, sans limite)
            const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mobileUrl)}`;

            qrCodeDiv.innerHTML = `
                <div style="text-align: center;">
                    <img src="${qrApiUrl}"
                         alt="QR Code"
                         style="width: 200px; height: 200px; border-radius: 8px; background: white; padding: 10px;"
                         onerror="this.onerror=null; this.parentElement.innerHTML='<p>Erreur chargement QR Code</p><p><a href=\\'${mobileUrl}\\' target=\\'_blank\\' style=\\'color: #3b82f6; word-break: break-all;\\'>${mobileUrl}</a></p>';">
                    <p style="margin-top: 1rem; font-size: 0.875rem; opacity: 0.8;">Scannez avec votre iPhone</p>
                    <p style="margin-top: 0.5rem; font-size: 0.75rem; opacity: 0.6;">
                        <a href="${mobileUrl}" target="_blank" style="color: #3b82f6; text-decoration: underline;">
                            Ou cliquez ici pour ouvrir
                        </a>
                    </p>
                    <p style="margin-top: 0.5rem; font-size: 0.75rem; opacity: 0.6;">
                        <a href="${testUrl}" target="_blank" style="color: #fbbf24; text-decoration: underline;">
                            🧪 Page de test (si écran noir)
                        </a>
                    </p>
                </div>
            `;
        }

        // Créer listener pour recevoir les données du mobile
        this.setupMobileListener(pairingCode, memberId);

        // Activer bouton confirmation
        const btnConfirm = document.getElementById('btnConfirmAdd');
        if (btnConfirm) {
            btnConfirm.disabled = false;
        }
    },

    /**
     * Utiliser le mode simulation
     */
    useSimulation() {
        const selectMember = document.getElementById('selectMember');
        const memberId = selectMember?.value;

        if (!memberId) {
            Utils.showNotification('Veuillez sélectionner un adhérent', 'warning');
            return;
        }

        // Afficher info
        const deviceInfo = document.getElementById('deviceInfo');
        const deviceName = document.getElementById('deviceName');
        if (deviceInfo && deviceName) {
            deviceName.textContent = 'Mode Simulation';
            deviceInfo.classList.remove('hidden');
        }

        // Activer bouton confirmation
        const btnConfirm = document.getElementById('btnConfirmAdd');
        if (btnConfirm) {
            btnConfirm.disabled = false;
        }

        Utils.showNotification('Mode simulation activé', 'info');
    },

    /**
     * Confirmer l'ajout du participant
     */
    async confirmAddParticipant() {
        try {
            const selectMember = document.getElementById('selectMember');
            const memberId = selectMember?.value;

            if (!memberId) {
                Utils.showNotification('Veuillez sélectionner un adhérent', 'warning');
                return;
            }

            // Récupérer les infos du membre
            const members = await SupabaseManager.getMembers();
            const member = members.find(m => m.id === memberId);

            if (!member) {
                Utils.showNotification('Adhérent introuvable', 'error');
                return;
            }

            // Calculer les zones cardio
            const age = this.calculateAge(member.birthDate);
            const maxHR = 220 - age;
            const zones = this.calculateZones(maxHR);

            // Ajouter le participant
            this.participants.set(memberId, {
                member,
                device: null,
                hr: 0,
                zone: 1,
                zones,
                maxHR,
                lastUpdate: Date.now(),
                mode: 'simulation' // 'bluetooth', 'phone', 'simulation'
            });

            // Rafraîchir la grille
            this.refreshGrid();

            // Fermer modal
            this.closeModal();

            // Démarrer simulation si mode simulation
            const deviceInfo = document.getElementById('deviceInfo');
            const deviceName = document.getElementById('deviceName');
            if (deviceName?.textContent === 'Mode Simulation') {
                this.startSimulation(memberId);
            }

            Utils.showNotification(`${member.firstName} ${member.lastName} ajouté(e) !`, 'success');
        } catch (error) {
            console.error('❌ Erreur ajout participant:', error);
            Utils.showNotification("Erreur lors de l'ajout", 'error');
        }
    },

    /**
     * Rafraîchir la grille des participants
     */
    refreshGrid() {
        const grid = document.getElementById('participantsGrid');
        if (!grid) {
            return;
        }

        if (this.participants.size === 0) {
            grid.innerHTML = `
                <div class="no-participants">
                    <i class="fas fa-users text-6xl mb-4 text-gray-500"></i>
                    <p>Aucun participant actif</p>
                    <button onclick="CardioTV.addParticipant()" class="btn-add-participant mt-4">
                        <i class="fas fa-user-plus mr-2"></i>
                        Ajouter un participant
                    </button>
                </div>
            `;
            return;
        }

        // Générer les cartes
        const cards = Array.from(this.participants.values())
            .map(participant => {
                return this.renderParticipantCard(participant);
            })
            .join('');

        grid.innerHTML = cards;
    },

    /**
     * Rendu carte participant
     * @param participant
     */
    renderParticipantCard(participant) {
        const { member, hr, zone, zones, maxHR } = participant;
        const zoneColor = this.getZoneColor(zone);
        const zoneName = this.getZoneName(zone);
        const hrPercent = Math.round((hr / maxHR) * 100);

        return `
            <div class="participant-card" data-member-id="${member.id}">
                <div class="card-header-tv" style="background: ${zoneColor};">
                    <div class="participant-name">
                        ${member.firstName} ${member.lastName}
                    </div>
                    <button onclick="CardioTV.removeParticipant('${member.id}')" class="btn-remove">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="card-body-tv">
                    <div class="hr-display">
                        <div class="hr-value">${hr}</div>
                        <div class="hr-unit">BPM</div>
                    </div>

                    <div class="hr-bar-container">
                        <div class="hr-bar" style="width: ${hrPercent}%; background: ${zoneColor};"></div>
                    </div>

                    <div class="zone-display" style="background: ${zoneColor};">
                        <i class="fas fa-fire"></i>
                        ${zoneName}
                    </div>

                    <div class="hr-stats">
                        <div class="stat">
                            <span class="stat-label">Max</span>
                            <span class="stat-value">${maxHR}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">%</span>
                            <span class="stat-value">${hrPercent}%</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Calculer les zones cardio
     * @param maxHR
     */
    calculateZones(maxHR) {
        return {
            zone1: { min: Math.round(maxHR * 0.5), max: Math.round(maxHR * 0.6) },
            zone2: { min: Math.round(maxHR * 0.6), max: Math.round(maxHR * 0.7) },
            zone3: { min: Math.round(maxHR * 0.7), max: Math.round(maxHR * 0.8) },
            zone4: { min: Math.round(maxHR * 0.8), max: Math.round(maxHR * 0.9) },
            zone5: { min: Math.round(maxHR * 0.9), max: maxHR }
        };
    },

    /**
     * Déterminer la zone actuelle
     * @param hr
     * @param zones
     */
    getCurrentZone(hr, zones) {
        if (hr < zones.zone1.min) {
            return 0;
        }
        if (hr <= zones.zone1.max) {
            return 1;
        }
        if (hr <= zones.zone2.max) {
            return 2;
        }
        if (hr <= zones.zone3.max) {
            return 3;
        }
        if (hr <= zones.zone4.max) {
            return 4;
        }
        return 5;
    },

    /**
     * Couleur de zone
     * @param zone
     */
    getZoneColor(zone) {
        const colors = {
            0: '#6b7280', // Gris
            1: '#3b82f6', // Bleu
            2: '#10b981', // Vert
            3: '#f59e0b', // Orange
            4: '#ef4444', // Rouge
            5: '#dc2626' // Rouge foncé
        };
        return colors[zone] || colors[0];
    },

    /**
     * Nom de zone
     * @param zone
     */
    getZoneName(zone) {
        const names = {
            0: 'Repos',
            1: 'Échauffement',
            2: 'Endurance',
            3: 'Tempo',
            4: 'Seuil',
            5: 'Maximum'
        };
        return names[zone] || 'Inconnu';
    },

    /**
     * Calculer l'âge
     * @param birthDate
     */
    calculateAge(birthDate) {
        if (!birthDate) {
            return 30;
        } // Âge par défaut
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    },

    /**
     * Générer code d'appairage
     */
    generatePairingCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    },

    /**
     * Configurer listener pour données mobile avec Supabase Realtime
     * @param code
     * @param memberId
     */
    async setupMobileListener(code, memberId) {
        console.log(`📱 Configuration listener Supabase pour code: ${code}, memberId: ${memberId}`);
        console.log('Type de memberId:', typeof memberId);

        // Vérifier que Supabase est initialisé
        if (!SupabaseManager.supabase) {
            console.error('❌ SupabaseManager.supabase est null !');
            Utils.showNotification('Erreur: Supabase non initialisé. Rechargez la page.', 'error');
            return;
        }

        try {
            // Créer une session dans Supabase
            const sessionData = {
                member_id: memberId,
                pairing_code: code,
                status: 'active',
                mode: 'phone'
            };

            console.log('📤 Tentative création session avec:', sessionData);

            const { data: session, error } = await SupabaseManager.supabase
                .from('cardio_sessions')
                .insert(sessionData)
                .select()
                .single();

            if (error) {
                console.error('❌ Erreur création session:', error);
                console.error('❌ Code erreur:', error.code);
                console.error('❌ Message:', error.message);
                console.error('❌ Détails:', error.details);
                console.error('❌ Hint:', error.hint);

                let errorMessage = 'Erreur de connexion Supabase';
                if (error.code === '42P01') {
                    errorMessage =
                        'Table cardio_sessions introuvable. Vérifiez la base de données.';
                } else if (error.code === '23503') {
                    errorMessage = 'Membre invalide. Vérifiez que le membre existe.';
                } else if (error.message) {
                    errorMessage = `Erreur: ${error.message}`;
                }

                Utils.showNotification(errorMessage, 'error');
                return;
            }

            console.log('✅ Session créée:', session.id);
            console.log('✅ Données session:', session);

            // S'abonner aux changements en temps réel
            const subscription = SupabaseManager.supabase
                .channel(`cardio_session_${session.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'cardio_sessions',
                        filter: `id=eq.${session.id}`
                    },
                    payload => {
                        console.log('📡 Données HR reçues:', payload.new);

                        const participant = this.participants.get(memberId);
                        if (participant && payload.new.hr) {
                            // Mettre à jour les données
                            participant.hr = payload.new.hr;
                            participant.zone = this.getCurrentZone(
                                payload.new.hr,
                                participant.zones
                            );
                            participant.lastUpdate = Date.now();
                            participant.mode = payload.new.mode || 'phone';
                            participant.sessionId = session.id;

                            // Rafraîchir l'affichage
                            this.updateParticipantCard(memberId);
                        }
                    }
                )
                .subscribe(status => {
                    console.log('📡 Statut subscription:', status);
                });

            // Sauvegarder la subscription pour pouvoir se désabonner plus tard
            if (!this.realtimeSubscriptions) {
                this.realtimeSubscriptions = new Map();
            }
            this.realtimeSubscriptions.set(memberId, {
                subscription,
                sessionId: session.id
            });

            // Sauvegarder l'ID de session dans le participant
            const participant = this.participants.get(memberId);
            if (participant) {
                participant.sessionId = session.id;
            }
        } catch (error) {
            console.error('❌ Erreur setup listener:', error);
            Utils.showNotification('Erreur de configuration', 'error');
        }
    },

    /**
     * Démarrer simulation pour un participant
     * @param memberId
     */
    startSimulation(memberId) {
        setInterval(() => {
            const participant = this.participants.get(memberId);
            if (!participant) {
                return;
            }

            // Simuler HR entre 60 et 180
            const hr = Math.floor(Math.random() * 120) + 60;
            const zone = this.getCurrentZone(hr, participant.zones);

            // Mettre à jour
            participant.hr = hr;
            participant.zone = zone;
            participant.lastUpdate = Date.now();

            // Rafraîchir la carte
            this.updateParticipantCard(memberId);
        }, 1000);
    },

    /**
     * Mettre à jour une carte participant
     * @param memberId
     */
    updateParticipantCard(memberId) {
        const participant = this.participants.get(memberId);
        if (!participant) {
            return;
        }

        const card = document.querySelector(`[data-member-id="${memberId}"]`);
        if (!card) {
            return;
        }

        const { hr, zone, zones, maxHR } = participant;
        const zoneColor = this.getZoneColor(zone);
        const zoneName = this.getZoneName(zone);
        const hrPercent = Math.round((hr / maxHR) * 100);

        // Mettre à jour les éléments
        const hrValue = card.querySelector('.hr-value');
        const hrBar = card.querySelector('.hr-bar');
        const zoneDisplay = card.querySelector('.zone-display');
        const headerTV = card.querySelector('.card-header-tv');
        const statPercent = card.querySelectorAll('.stat-value')[1];

        if (hrValue) {
            hrValue.textContent = hr;
        }
        if (hrBar) {
            hrBar.style.width = `${hrPercent}%`;
            hrBar.style.background = zoneColor;
        }
        if (zoneDisplay) {
            zoneDisplay.style.background = zoneColor;
            zoneDisplay.innerHTML = `<i class="fas fa-fire"></i> ${zoneName}`;
        }
        if (headerTV) {
            headerTV.style.background = zoneColor;
        }
        if (statPercent) {
            statPercent.textContent = `${hrPercent}%`;
        }
    },

    /**
     * Supprimer un participant
     * @param memberId
     */
    async removeParticipant(memberId) {
        const participant = this.participants.get(memberId);

        // Désabonner du realtime Supabase
        if (this.realtimeSubscriptions && this.realtimeSubscriptions.has(memberId)) {
            const { subscription, sessionId } = this.realtimeSubscriptions.get(memberId);

            // Unsubscribe
            await subscription.unsubscribe();
            this.realtimeSubscriptions.delete(memberId);

            // Terminer la session dans Supabase
            if (sessionId) {
                await SupabaseManager.supabase
                    .from('cardio_sessions')
                    .update({
                        status: 'ended',
                        ended_at: new Date().toISOString()
                    })
                    .eq('id', sessionId);
            }
        }

        // Supprimer le participant
        this.participants.delete(memberId);
        this.refreshGrid();

        Utils.showNotification('Participant supprimé', 'info');
    },

    /**
     * Démarrer rafraîchissement
     */
    startRefresh() {
        this.refreshInterval = setInterval(() => {
            // Vérifier les connexions perdues
            const now = Date.now();
            this.participants.forEach((participant, memberId) => {
                if (now - participant.lastUpdate > 5000) {
                    // Pas de données depuis 5 secondes
                    participant.hr = 0;
                    this.updateParticipantCard(memberId);
                }
            });
        }, 1000);
    },

    /**
     * Plein écran
     */
    toggleFullscreen() {
        const container = document.querySelector('.cardio-tv-container');
        if (!document.fullscreenElement) {
            container?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    },

    /**
     * Quitter mode TV
     */
    exitTVMode() {
        if (confirm('Quitter le mode TV ? Toutes les connexions seront perdues.')) {
            // Arrêter rafraîchissement
            if (this.refreshInterval) {
                clearInterval(this.refreshInterval);
            }

            // Déconnecter tous les devices
            this.connectedDevices.forEach(({ device }) => {
                if (device.gatt?.connected) {
                    device.gatt.disconnect();
                }
            });

            // Retour au module cardio normal
            CardioMon.showCardioMonView();
        }
    },

    /**
     * Fermer modal
     */
    closeModal() {
        const modal = document.getElementById('addParticipantModal');
        if (modal) {
            modal.classList.add('hidden');
        }

        // Reset form
        document.getElementById('selectMember').value = '';
        document.getElementById('qrCodeSection')?.classList.add('hidden');
        document.getElementById('deviceInfo')?.classList.add('hidden');
        document.getElementById('btnConfirmAdd').disabled = true;
    },

    /**
     * Sauvegarder associations device-member
     */
    saveDeviceMemberMap() {
        const data = Array.from(this.deviceMemberMap.entries());
        localStorage.setItem('cardio_device_member_map', JSON.stringify(data));
    },

    /**
     * Charger associations device-member
     */
    loadDeviceMemberMap() {
        try {
            const data = localStorage.getItem('cardio_device_member_map');
            if (data) {
                const entries = JSON.parse(data);
                this.deviceMemberMap = new Map(entries);
                console.log('✅ Associations chargées:', this.deviceMemberMap.size);
            }
        } catch (error) {
            console.error('Erreur chargement associations:', error);
        }
    }
};
