/**
 * WEARABLES INTEGRATION MODULE
 * Intégration des montres connectées pour données cardiaques en temps réel
 *
 * Méthodes supportées:
 * 1. Web Bluetooth (direct, temps réel)
 * 2. Terra API (Strava, Garmin, Fitbit, etc. via webhooks)
 * 3. HypeRate.io (streaming temps réel)
 *
 * @author Skali Prog Team
 * @version 1.0.0
 */

const WearablesIntegration = {
    // Configuration
    config: {
        terraApiKey: null, // À configurer dans ENV
        terraDevId: null, // À configurer dans ENV
        hyperateApiKey: null, // À configurer dans ENV
        webhookUrl: null // URL pour recevoir les webhooks Terra
    },

    // Connexions actives
    activeConnections: new Map(), // memberId -> connection details

    // ===================================================================
    // INITIALISATION
    // ===================================================================
    async init() {
        console.log('🌐 Initialisation Wearables Integration...');

        // Charger la config depuis ENV
        if (typeof ENV !== 'undefined') {
            this.config.terraApiKey = ENV.get('TERRA_API_KEY');
            this.config.terraDevId = ENV.get('TERRA_DEV_ID');
            this.config.hyperateApiKey = ENV.get('HYPERATE_API_KEY');
            this.config.webhookUrl = ENV.get('TERRA_WEBHOOK_URL');
        }

        // Vérifier support Web Bluetooth
        if ('bluetooth' in navigator) {
            console.log('✅ Web Bluetooth supporté');
        } else {
            console.warn('⚠️ Web Bluetooth non supporté sur ce navigateur');
        }
    },

    // ===================================================================
    // WEB BLUETOOTH (Méthode 1 - Direct)
    // ===================================================================
    /**
     * Connecter une montre via Web Bluetooth
     * Fonctionne avec: Garmin, Polar, Suunto, Apple Watch, Samsung, etc.
     * @param memberId
     */
    async connectBluetoothDevice(memberId) {
        try {
            console.log('🔵 Recherche périphérique Bluetooth...');

            // Demander un périphérique avec Heart Rate Service
            const device = await navigator.bluetooth.requestDevice({
                filters: [{ services: ['heart_rate'] }],
                optionalServices: ['battery_service']
            });

            console.log(`✅ Périphérique trouvé: ${device.name}`);

            // Connecter au GATT Server
            const server = await device.gatt.connect();

            // Récupérer le service Heart Rate
            const hrService = await server.getPrimaryService('heart_rate');
            const hrCharacteristic = await hrService.getCharacteristic('heart_rate_measurement');

            // Récupérer la batterie si disponible
            let batteryLevel = null;
            try {
                const batteryService = await server.getPrimaryService('battery_service');
                const batteryCharacteristic =
                    await batteryService.getCharacteristic('battery_level');
                const value = await batteryCharacteristic.readValue();
                batteryLevel = value.getUint8(0);
            } catch (e) {
                console.log('ℹ️ Batterie non disponible');
            }

            // Stocker la connexion
            const connection = {
                type: 'bluetooth',
                memberId,
                device,
                server,
                characteristic: hrCharacteristic,
                batteryLevel,
                lastHR: 0,
                isActive: true,
                connectedAt: new Date()
            };

            this.activeConnections.set(memberId, connection);

            // Écouter les notifications
            await hrCharacteristic.startNotifications();
            hrCharacteristic.addEventListener('characteristicvaluechanged', event => {
                this.handleBluetoothHRData(memberId, event);
            });

            // Gérer la déconnexion
            device.addEventListener('gattserverdisconnected', () => {
                this.handleDisconnection(memberId);
            });

            return {
                success: true,
                deviceName: device.name,
                batteryLevel,
                connectionType: 'bluetooth'
            };
        } catch (error) {
            console.error('❌ Erreur connexion Bluetooth:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Traiter les données HR Bluetooth
     * @param memberId
     * @param event
     */
    handleBluetoothHRData(memberId, event) {
        const value = event.target.value;
        const flags = value.getUint8(0);
        const rate = flags & 0x01 ? value.getUint16(1, true) : value.getUint8(1);

        const connection = this.activeConnections.get(memberId);
        if (connection) {
            connection.lastHR = rate;
            connection.lastUpdate = new Date();

            // Envoyer l'événement pour CardioTV et CardioMon
            this.emitHRUpdate(memberId, rate, 'bluetooth');
        }
    },

    // ===================================================================
    // TERRA API (Méthode 2 - Strava, Garmin, Fitbit)
    // ===================================================================
    /**
     * Générer un lien d'authentification Terra pour un membre
     * Permet de connecter Strava, Garmin, Fitbit, etc.
     * @param memberId
     * @param provider
     */
    async generateTerraAuthLink(memberId, provider) {
        if (!this.config.terraApiKey || !this.config.terraDevId) {
            throw new Error(
                'Terra API non configurée. Ajoutez TERRA_API_KEY et TERRA_DEV_ID dans ENV.'
            );
        }

        // Providers supportés: STRAVA, GARMIN, FITBIT, POLAR, SUUNTO, etc.
        const validProviders = ['STRAVA', 'GARMIN', 'FITBIT', 'POLAR', 'SUUNTO', 'OURA', 'WHOOP'];

        if (!validProviders.includes(provider.toUpperCase())) {
            throw new Error(`Provider invalide. Utilisez: ${validProviders.join(', ')}`);
        }

        try {
            // Appel API Terra pour générer le widget URL
            const response = await fetch('https://api.tryterra.co/v2/auth/generateWidgetSession', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'dev-id': this.config.terraDevId,
                    'x-api-key': this.config.terraApiKey
                },
                body: JSON.stringify({
                    reference_id: memberId,
                    providers: provider.toUpperCase(),
                    language: 'fr',
                    auth_success_redirect_url: `${window.location.origin}/portal`,
                    auth_failure_redirect_url: `${window.location.origin}/portal?error=auth_failed`
                })
            });

            const data = await response.json();

            if (data.status === 'success') {
                return {
                    success: true,
                    authUrl: data.url,
                    sessionId: data.session_id,
                    expiresAt: data.expires_at
                };
            } else {
                throw new Error(data.message || 'Erreur génération lien Terra');
            }
        } catch (error) {
            console.error('❌ Erreur Terra API:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Récupérer les données HR depuis Terra
     * Appelé via webhook ou polling
     * @param memberId
     * @param startDate
     */
    async fetchTerraHeartRate(memberId, startDate = null) {
        if (!this.config.terraApiKey || !this.config.terraDevId) {
            throw new Error('Terra API non configurée');
        }

        const start = startDate || new Date(Date.now() - 3600000); // Dernière heure par défaut

        try {
            const response = await fetch(
                `https://api.tryterra.co/v2/body?user_id=${memberId}&start_date=${start.toISOString()}`,
                {
                    headers: {
                        Accept: 'application/json',
                        'dev-id': this.config.terraDevId,
                        'x-api-key': this.config.terraApiKey
                    }
                }
            );

            const data = await response.json();

            if (data.status === 'success' && data.data.length > 0) {
                const latestData = data.data[0];
                const hrData = latestData.heart_rate_data;

                return {
                    success: true,
                    averageHR: hrData?.avg_hr_bpm,
                    maxHR: hrData?.max_hr_bpm,
                    minHR: hrData?.min_hr_bpm,
                    restingHR: hrData?.resting_hr_bpm,
                    samples: hrData?.detailed?.hr_samples || []
                };
            }

            return { success: false, error: 'Pas de données disponibles' };
        } catch (error) {
            console.error('❌ Erreur fetch Terra HR:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Webhook handler pour Terra
     * À appeler depuis un endpoint serveur
     * @param webhookData
     */
    handleTerraWebhook(webhookData) {
        const { type, user } = webhookData;

        if (type === 'body') {
            const memberId = user.reference_id;
            const hrData = webhookData.data?.[0]?.heart_rate_data;

            if (hrData && hrData.detailed?.hr_samples) {
                // Récupérer le dernier échantillon
                const latestSample =
                    hrData.detailed.hr_samples[hrData.detailed.hr_samples.length - 1];

                if (latestSample) {
                    this.emitHRUpdate(memberId, latestSample.bpm, 'terra');
                }
            }
        }
    },

    // ===================================================================
    // HYPERATE.IO (Méthode 3 - Streaming temps réel)
    // ===================================================================
    /**
     * Connecter via HypeRate.io pour streaming temps réel
     * Supporte: Apple Watch, Garmin, Polar, Fitbit via leur app
     * MODE PUBLIC - Pas besoin de clé API !
     * @param memberId
     * @param hyperateId
     */
    async connectHypeRate(memberId, hyperateId) {
        try {
            // Se connecter au WebSocket HypeRate en mode PUBLIC
            const ws = new WebSocket('wss://app.hyperate.io/socket/websocket');

            ws.onopen = () => {
                console.log('✅ Connecté à HypeRate.io (mode public)');

                // Joindre le channel public du membre
                ws.send(
                    JSON.stringify({
                        topic: `hr:${hyperateId}`,
                        event: 'phx_join',
                        payload: {},
                        ref: 0
                    })
                );

                console.log(`📡 En écoute du HypeRate ID: ${hyperateId}`);
            };

            ws.onmessage = event => {
                const data = JSON.parse(event.data);

                console.log('📨 Message HypeRate:', data);

                if (data.event === 'hr_update') {
                    const hr = data.payload.hr;
                    console.log(`💓 HypeRate HR Update: ${hr} bpm pour membre ${memberId}`);
                    this.emitHRUpdate(memberId, hr, 'hyperate');

                    // Mettre à jour la connexion
                    const connection = this.activeConnections.get(memberId);
                    if (connection) {
                        connection.lastHR = hr;
                    }
                }
            };

            ws.onerror = error => {
                console.error('❌ Erreur HypeRate WebSocket:', error);
            };

            ws.onclose = () => {
                console.log('🔌 Déconnecté de HypeRate.io');
                this.activeConnections.delete(memberId);
                this.emitDisconnection(memberId);
            };

            // Stocker la connexion
            const connection = {
                type: 'hyperate',
                memberId,
                websocket: ws,
                hyperateId,
                lastHR: 0,
                isActive: true,
                connectedAt: new Date()
            };

            this.activeConnections.set(memberId, connection);

            return { success: true, connectionType: 'hyperate' };
        } catch (error) {
            console.error('❌ Erreur connexion HypeRate:', error);
            return { success: false, error: error.message };
        }
    },

    // ===================================================================
    // GESTION GLOBALE
    // ===================================================================
    /**
     * Émettre une mise à jour HR vers tous les listeners
     * @param memberId
     * @param heartRate
     * @param source
     */
    emitHRUpdate(memberId, heartRate, source) {
        const event = new CustomEvent('wearable-hr-update', {
            detail: {
                memberId,
                heartRate,
                source,
                timestamp: new Date()
            }
        });

        window.dispatchEvent(event);

        // Log pour debug
        console.log(`💓 HR Update - Membre ${memberId}: ${heartRate} bpm (${source})`);
    },

    /**
     * Déconnecter un membre
     * @param memberId
     */
    async disconnect(memberId) {
        const connection = this.activeConnections.get(memberId);

        if (!connection) {
            return { success: false, error: 'Pas de connexion active' };
        }

        try {
            if (connection.type === 'bluetooth' && connection.server) {
                connection.server.disconnect();
            } else if (connection.type === 'hyperate' && connection.websocket) {
                connection.websocket.close();
            }

            this.activeConnections.delete(memberId);
            console.log(`✅ Déconnexion membre ${memberId}`);

            return { success: true };
        } catch (error) {
            console.error('❌ Erreur déconnexion:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Gérer la déconnexion automatique
     * @param memberId
     */
    handleDisconnection(memberId) {
        console.log(`⚠️ Déconnexion détectée pour membre ${memberId}`);
        this.activeConnections.delete(memberId);

        // Émettre événement de déconnexion
        const event = new CustomEvent('wearable-disconnected', {
            detail: { memberId }
        });
        window.dispatchEvent(event);
    },

    /**
     * Récupérer toutes les connexions actives
     */
    getActiveConnections() {
        const connections = [];

        for (const [memberId, conn] of this.activeConnections.entries()) {
            connections.push({
                memberId,
                type: conn.type,
                lastHR: conn.lastHR,
                lastUpdate: conn.lastUpdate,
                batteryLevel: conn.batteryLevel,
                deviceName: conn.device?.name || conn.hyperateId,
                connectedAt: conn.connectedAt
            });
        }

        return connections;
    },

    /**
     * Récupérer la dernière HR d'un membre
     * @param memberId
     */
    getLastHeartRate(memberId) {
        const connection = this.activeConnections.get(memberId);
        return connection ? connection.lastHR : null;
    }
};

// Exposer globalement
window.WearablesIntegration = WearablesIntegration;

console.log('✅ Module Wearables Integration chargé');
