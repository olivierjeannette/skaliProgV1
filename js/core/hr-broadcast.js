/**
 * HR BROADCAST - Communication temps réel entre onglets/fenêtres
 *
 * Utilise BroadcastChannel API pour transmettre les événements HR
 * entre le portail adhérent et la TV en temps réel
 */

const HRBroadcast = {
    channel: null,
    channelName: 'skali-hr-channel',

    /**
     * Initialiser le canal de communication
     */
    init() {
        if (!window.BroadcastChannel) {
            console.warn('⚠️ BroadcastChannel non supporté - fallback sur localStorage');
            this.useFallback = true;
            return;
        }

        this.channel = new BroadcastChannel(this.channelName);

        // Écouter les messages entrants
        this.channel.onmessage = event => {
            this.handleMessage(event.data);
        };

        console.log('✅ HRBroadcast initialisé');
    },

    /**
     * Envoyer une mise à jour HR
     * @param memberId
     * @param heartRate
     * @param source
     */
    sendHRUpdate(memberId, heartRate, source = 'unknown') {
        const message = {
            type: 'hr-update',
            data: {
                memberId,
                heartRate,
                source,
                timestamp: new Date().toISOString()
            }
        };

        if (this.channel) {
            this.channel.postMessage(message);
        } else {
            // Fallback: localStorage
            this.sendViaLocalStorage(message);
        }

        console.log(`📡 HR diffusée: Adhérent ${memberId} = ${heartRate} BPM`);
    },

    /**
     * Envoyer une déconnexion
     * @param memberId
     */
    sendDisconnect(memberId) {
        const message = {
            type: 'hr-disconnect',
            data: { memberId }
        };

        if (this.channel) {
            this.channel.postMessage(message);
        } else {
            this.sendViaLocalStorage(message);
        }

        console.log(`📡 Déconnexion diffusée: Adhérent ${memberId}`);
    },

    /**
     * Gérer les messages reçus
     * @param message
     */
    handleMessage(message) {
        if (message.type === 'hr-update') {
            // Émettre un événement custom pour que les modules l'écoutent
            const event = new CustomEvent('wearable-hr-update', {
                detail: message.data
            });
            window.dispatchEvent(event);

            console.log(
                `📥 HR reçue: Adhérent ${message.data.memberId} = ${message.data.heartRate} BPM`
            );
        } else if (message.type === 'hr-disconnect') {
            const event = new CustomEvent('wearable-disconnected', {
                detail: { memberId: message.data.memberId }
            });
            window.dispatchEvent(event);

            console.log(`📥 Déconnexion reçue: Adhérent ${message.data.memberId}`);
        }
    },

    /**
     * Fallback: utiliser localStorage pour communication
     * @param message
     */
    sendViaLocalStorage(message) {
        // Écrire dans localStorage avec timestamp unique
        const key = `hr_message_${Date.now()}`;
        localStorage.setItem(key, JSON.stringify(message));

        // Nettoyer après 1 seconde
        setTimeout(() => {
            localStorage.removeItem(key);
        }, 1000);

        // Émettre l'événement aussi localement
        this.handleMessage(message);
    },

    /**
     * Écouter les changements localStorage (fallback)
     */
    listenLocalStorage() {
        window.addEventListener('storage', event => {
            if (event.key && event.key.startsWith('hr_message_')) {
                try {
                    const message = JSON.parse(event.newValue);
                    this.handleMessage(message);
                } catch (e) {
                    console.error('Erreur parsing message localStorage:', e);
                }
            }
        });
    }
};

// Auto-initialisation
if (typeof window !== 'undefined') {
    HRBroadcast.init();
    HRBroadcast.listenLocalStorage();
}

// Exposer globalement
window.HRBroadcast = HRBroadcast;

console.log('✅ hr-broadcast.js chargé');
