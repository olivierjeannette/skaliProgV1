/**
 * CardioTV - Version Simplifiée
 * Mode TV uniquement avec connexion Bluetooth
 * Sauvegarde automatique des associations membre-capteur
 */

const CardioTVSimple = {
    // Participants actifs (Map<memberId, participantData>)
    participants: new Map(),

    // Associations sauvegardées (Map<deviceId, memberId>)
    deviceAssociations: new Map(),

    // Capteurs connectés (Map<deviceId, deviceData>)
    connectedDevices: new Map(),

    /**
     * Charger les associations sauvegardées
     */
    loadAssociations() {
        try {
            const saved = localStorage.getItem('cardio_device_associations');
            if (saved) {
                const data = JSON.parse(saved);
                this.deviceAssociations = new Map(data);
                console.log(`✅ ${this.deviceAssociations.size} associations chargées`);
            }
        } catch (error) {
            console.error('Erreur chargement associations:', error);
        }
    },

    /**
     * Sauvegarder les associations
     */
    saveAssociations() {
        try {
            const data = Array.from(this.deviceAssociations.entries());
            localStorage.setItem('cardio_device_associations', JSON.stringify(data));
            console.log('✅ Associations sauvegardées');
        } catch (error) {
            console.error('Erreur sauvegarde associations:', error);
        }
    },

    /**
     * Afficher le mode TV
     */
    async showTVMode() {
        try {
            console.log('📺 Ouverture Cardio TV Simplifié...');

            // Charger les associations
            this.loadAssociations();

            // Charger les adhérents
            const members = await SupabaseManager.getMembers();

            const html = `
                <div class="cardio-tv-container">
                    <!-- Header -->
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
                            <button onclick="CardioTVSimple.addParticipant()" class="btn-add-participant">
                                <i class="fas fa-user-plus"></i>
                                Ajouter Participant
                            </button>
                            <button onclick="CardioTVSimple.exitTVMode()" class="btn-exit-tv">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Grille participants -->
                    <div id="participantsGrid" class="participants-grid">
                        <div class="no-participants">
                            <i class="fas fa-users text-6xl mb-4 text-gray-500"></i>
                            <p>Aucun participant actif</p>
                            <button onclick="CardioTVSimple.addParticipant()" class="btn-add-participant mt-4">
                                <i class="fas fa-user-plus mr-2"></i>
                                Ajouter un participant
                            </button>
                        </div>
                    </div>

                    <!-- Modal ajout participant -->
                    <div id="addParticipantModal" class="modal-overlay hidden">
                        <div class="modal-content-tv">
                            <div class="modal-header">
                                <h3><i class="fas fa-user-plus mr-2"></i>Ajouter un participant</h3>
                                <button onclick="CardioTVSimple.closeModal()" class="modal-close">
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
                                            .map(m => {
                                                const name =
                                                    m.firstName ||
                                                    m.first_name ||
                                                    m.name ||
                                                    'Sans nom';
                                                const lastName = m.lastName || m.last_name || '';
                                                return `<option value="${m.id}">${name} ${lastName}</option>`;
                                            })
                                            .join('')}
                                    </select>
                                </div>

                                <!-- Info si déjà associé -->
                                <div id="deviceInfo" class="device-info hidden">
                                    <i class="fas fa-check-circle"></i>
                                    <div>
                                        <strong id="deviceName">Capteur déjà associé</strong>
                                        <p style="font-size: 0.875rem; opacity: 0.8;">Reconnexion automatique...</p>
                                    </div>
                                </div>

                                <!-- Boutons connexion -->
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1.5rem;">
                                    <button onclick="CardioTVSimple.connectAppleWatch()" class="btn-primary">
                                        <i class="fas fa-mobile-alt"></i>
                                        Apple Watch
                                    </button>
                                    <button onclick="CardioTVSimple.connectBluetooth()" class="btn-primary">
                                        <i class="fas fa-bluetooth"></i>
                                        Capteur BT
                                    </button>
                                </div>

                                <!-- Code PIN pour Apple Watch -->
                                <div id="pinCodeSection" class="hidden" style="margin-top: 1.5rem; padding: 1.5rem; background: rgba(59, 130, 246, 0.1); border-radius: 12px; text-align: center;">
                                    <p style="font-size: 0.875rem; margin-bottom: 0.5rem;">Code PIN à entrer sur l'iPhone</p>
                                    <div id="pinCode" style="font-size: 3rem; font-weight: 800; letter-spacing: 0.3em; color: #3b82f6; font-family: monospace;">----</div>
                                    <p style="font-size: 0.75rem; opacity: 0.7; margin-top: 0.5rem;">Ou scanner le QR code</p>
                                    <div id="qrCodeAppleWatch" style="margin-top: 1rem;"></div>
                                    <p style="font-size: 0.75rem; opacity: 0.7; margin-top: 1rem;">
                                        <a id="appleWatchUrl" href="#" target="_blank" style="color: #3b82f6;">Ouvrir sur ce téléphone</a>
                                    </p>
                                </div>

                                <div class="info-box mt-4">
                                    <p style="font-size: 0.875rem;">
                                        <strong>Apple Watch :</strong> Code PIN simple<br>
                                        <strong>Capteur BT :</strong> Polar, Garmin, Wahoo...
                                    </p>
                                </div>
                            </div>

                            <div class="modal-footer">
                                <button onclick="CardioTVSimple.closeModal()" class="btn-secondary">
                                    Annuler
                                </button>
                                <button onclick="CardioTVSimple.confirmAddParticipant()" class="btn-primary" id="btnConfirmAdd" disabled>
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

        // Vérifier si membre déjà associé quand on sélectionne
        const select = document.getElementById('selectMember');
        if (select) {
            select.addEventListener('change', () => {
                this.checkExistingAssociation(select.value);
            });
        }
    },

    /**
     * Vérifier si un membre a déjà un capteur associé
     * @param memberId
     */
    checkExistingAssociation(memberId) {
        if (!memberId) {
            return;
        }

        // Chercher si ce membre a déjà un capteur associé
        const deviceId = Array.from(this.deviceAssociations.entries()).find(
            ([_, mid]) => mid === memberId
        )?.[0];

        const deviceInfo = document.getElementById('deviceInfo');
        const deviceName = document.getElementById('deviceName');

        if (deviceId && deviceInfo && deviceName) {
            deviceName.textContent = `Capteur ${deviceId.substring(0, 8)}... déjà associé`;
            deviceInfo.classList.remove('hidden');
        } else if (deviceInfo) {
            deviceInfo.classList.add('hidden');
        }
    },

    /**
     * Connecter via Apple Watch (code PIN)
     */
    async connectAppleWatch() {
        try {
            const selectMember = document.getElementById('selectMember');
            const memberId = selectMember?.value;

            if (!memberId) {
                Utils.showNotification('Veuillez sélectionner un adhérent', 'warning');
                return;
            }

            if (!SupabaseManager.supabase) {
                Utils.showNotification('Supabase non initialisé', 'error');
                return;
            }

            // Générer un code PIN à 4 chiffres
            const pinCode = Math.floor(1000 + Math.random() * 9000).toString();

            // Créer une session dans cardio_sessions
            const { data: session, error } = await SupabaseManager.supabase
                .from('cardio_sessions')
                .insert({
                    member_id: memberId,
                    pairing_code: pinCode,
                    status: 'active',
                    mode: 'phone'
                })
                .select()
                .single();

            if (error) {
                console.error('❌ Erreur création session:', error);
                Utils.showNotification('Erreur de connexion', 'error');
                return;
            }

            console.log('✅ Session Apple Watch créée:', session.id, 'PIN:', pinCode);

            // Afficher le code PIN
            const pinCodeSection = document.getElementById('pinCodeSection');
            const pinCodeDisplay = document.getElementById('pinCode');
            const qrCodeDiv = document.getElementById('qrCodeAppleWatch');
            const urlLink = document.getElementById('appleWatchUrl');

            if (pinCodeSection && pinCodeDisplay) {
                pinCodeDisplay.textContent = pinCode;
                pinCodeSection.classList.remove('hidden');

                // Générer l'URL
                const baseUrl = window.location.origin;
                const appleWatchUrl = `${baseUrl}/apple-watch.html?pin=${pinCode}`;

                // Lien direct
                if (urlLink) {
                    urlLink.href = appleWatchUrl;
                }

                // QR Code
                if (qrCodeDiv) {
                    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(appleWatchUrl)}`;
                    qrCodeDiv.innerHTML = `
                        <img src="${qrApiUrl}"
                             alt="QR Code"
                             style="width: 200px; height: 200px; border-radius: 8px; background: white; padding: 10px;">
                    `;
                }
            }

            // Écouter les mises à jour en temps réel
            this.listenAppleWatchSession(session.id, memberId);

            // Activer le bouton d'ajout
            const btnConfirm = document.getElementById('btnConfirmAdd');
            if (btnConfirm) {
                btnConfirm.disabled = false;
            }

            Utils.showNotification("Code PIN généré ! L'adhérent peut se connecter.", 'success');
        } catch (error) {
            console.error('❌ Erreur Apple Watch:', error);
            Utils.showNotification('Erreur de connexion', 'error');
        }
    },

    /**
     * Écouter les mises à jour de la session Apple Watch
     * @param sessionId
     * @param memberId
     */
    async listenAppleWatchSession(sessionId, memberId) {
        console.log('👂 Écoute session Apple Watch:', sessionId);

        const subscription = SupabaseManager.supabase
            .channel(`cardio_session_${sessionId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'cardio_sessions',
                    filter: `id=eq.${sessionId}`
                },
                payload => {
                    console.log('📡 Mise à jour session cardio:', payload.new);

                    const participant = this.participants.get(memberId);
                    if (participant && payload.new.hr) {
                        // Mettre à jour la HR
                        participant.hr = payload.new.hr;
                        participant.zone = this.getCurrentZone(payload.new.hr, participant.zones);
                        participant.lastUpdate = Date.now();

                        // Rafraîchir l'affichage
                        this.updateParticipantCard(memberId);
                    }

                    // Si mode = phone, afficher notification de connexion
                    if (payload.new.mode === 'phone' && payload.new.hr && !payload.old?.hr) {
                        Utils.showNotification('📱 iPhone connecté !', 'success');
                    }
                }
            )
            .subscribe();

        // Sauvegarder la subscription
        if (!this.appleWatchSubscriptions) {
            this.appleWatchSubscriptions = new Map();
        }
        this.appleWatchSubscriptions.set(memberId, {
            subscription,
            sessionId
        });
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

            Utils.showNotification('Recherche de capteurs...', 'info');

            // Demander un appareil Bluetooth
            const device = await navigator.bluetooth.requestDevice({
                filters: [{ services: ['heart_rate'] }],
                optionalServices: ['battery_service', 'device_information']
            });

            console.log('📱 Capteur trouvé:', device.name, device.id);

            // Connecter au GATT server
            const server = await device.gatt.connect();
            const service = await server.getPrimaryService('heart_rate');
            const characteristic = await service.getCharacteristic('heart_rate_measurement');

            // Sauvegarder l'association
            this.deviceAssociations.set(device.id, memberId);
            this.saveAssociations();

            // Sauvegarder le device connecté
            this.connectedDevices.set(device.id, {
                device,
                characteristic,
                memberId,
                name: device.name || 'Capteur HR'
            });

            // Afficher info
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

            Utils.showNotification(`✅ ${device.name} connecté et associé !`, 'success');
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
            const birthDate = member.birthDate || member.birth_date || member.birthdate;
            const age = birthDate ? this.calculateAge(birthDate) : 30;
            const maxHR = 220 - age;
            const zones = this.calculateZones(maxHR);

            // Trouver le device connecté pour ce membre
            const deviceData = Array.from(this.connectedDevices.values()).find(
                d => d.memberId === memberId
            );

            if (!deviceData) {
                Utils.showNotification('Veuillez connecter un capteur Bluetooth', 'warning');
                return;
            }

            // Ajouter le participant
            this.participants.set(memberId, {
                member,
                device: deviceData.device,
                characteristic: deviceData.characteristic,
                hr: 0,
                zone: 0,
                zones,
                maxHR,
                lastUpdate: Date.now()
            });

            // Démarrer l'écoute des données HR
            this.startHRMonitoring(memberId);

            // Rafraîchir la grille
            this.refreshGrid();

            // Fermer modal
            this.closeModal();

            const name = member.firstName || member.first_name || member.name || 'Membre';
            const lastName = member.lastName || member.last_name || '';
            Utils.showNotification(`✅ ${name} ${lastName} ajouté !`, 'success');
        } catch (error) {
            console.error('❌ Erreur ajout participant:', error);
            Utils.showNotification("Erreur lors de l'ajout", 'error');
        }
    },

    /**
     * Démarrer la surveillance HR pour un participant
     * @param memberId
     */
    async startHRMonitoring(memberId) {
        const participant = this.participants.get(memberId);
        if (!participant || !participant.characteristic) {
            return;
        }

        try {
            // S'abonner aux notifications
            await participant.characteristic.startNotifications();

            participant.characteristic.addEventListener('characteristicvaluechanged', event => {
                const value = event.target.value;
                const hr = value.getUint8(1); // Le HR est au 2ème byte

                // Mettre à jour le participant
                participant.hr = hr;
                participant.zone = this.getCurrentZone(hr, participant.zones);
                participant.lastUpdate = Date.now();

                // Rafraîchir l'affichage
                this.updateParticipantCard(memberId);
            });

            console.log(`✅ Surveillance HR démarrée pour ${memberId}`);
        } catch (error) {
            console.error('❌ Erreur surveillance HR:', error);
        }
    },

    /**
     * Rafraîchir la grille
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
                    <button onclick="CardioTVSimple.addParticipant()" class="btn-add-participant mt-4">
                        <i class="fas fa-user-plus mr-2"></i>
                        Ajouter un participant
                    </button>
                </div>
            `;
            return;
        }

        const cards = Array.from(this.participants.values())
            .map(participant => this.renderParticipantCard(participant))
            .join('');

        grid.innerHTML = cards;
    },

    /**
     * Rendu carte participant
     * @param participant
     */
    renderParticipantCard(participant) {
        const { member, hr, zone, zones, maxHR, device } = participant;
        const zoneColor = this.getZoneColor(zone);
        const zoneName = this.getZoneName(zone);
        const hrPercent = Math.round((hr / maxHR) * 100);

        const name = member.firstName || member.first_name || member.name || 'Membre';
        const lastName = member.lastName || member.last_name || '';
        const deviceName = device?.name || 'Capteur';

        return `
            <div class="participant-card" data-member-id="${member.id}">
                <div class="card-header-tv" style="background: ${zoneColor};">
                    <div>
                        <div class="participant-name">${name} ${lastName}</div>
                        <div style="font-size: 0.75rem; opacity: 0.8;">${deviceName}</div>
                    </div>
                    <button onclick="CardioTVSimple.removeParticipant('${member.id}')" class="btn-remove">
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
    removeParticipant(memberId) {
        const participant = this.participants.get(memberId);

        if (participant && participant.characteristic) {
            // Arrêter les notifications
            participant.characteristic.stopNotifications().catch(err => console.log(err));
        }

        if (participant && participant.device && participant.device.gatt?.connected) {
            participant.device.gatt.disconnect();
        }

        this.participants.delete(memberId);
        this.refreshGrid();

        Utils.showNotification('Participant supprimé', 'info');
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
        }
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
     * Fermer modal
     */
    closeModal() {
        const modal = document.getElementById('addParticipantModal');
        if (modal) {
            modal.classList.add('hidden');
        }

        document.getElementById('selectMember').value = '';
        document.getElementById('deviceInfo')?.classList.add('hidden');
        document.getElementById('btnConfirmAdd').disabled = true;
    },

    /**
     * Quitter mode TV
     */
    exitTVMode() {
        if (confirm('Quitter le mode TV ? Toutes les connexions seront perdues.')) {
            // Déconnecter tous les devices
            this.participants.forEach(participant => {
                if (participant.characteristic) {
                    participant.characteristic.stopNotifications().catch(() => {});
                }
                if (participant.device?.gatt?.connected) {
                    participant.device.gatt.disconnect();
                }
            });

            this.participants.clear();
            this.connectedDevices.clear();

            // Retour au dashboard
            if (window.ViewManager) {
                ViewManager.showView('dashboard');
            }
        }
    }
};

// Exposer globalement
window.CardioTVSimple = CardioTVSimple;

console.log('✅ CardioTV Simplifié chargé');
