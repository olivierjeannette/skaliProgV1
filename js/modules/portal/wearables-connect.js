/**
 * WEARABLES CONNECT - Interface adhérent pour connexion des montres
 * Accessible via le portail adhérent
 *
 * Permet aux adhérents de connecter:
 * - Montre Bluetooth (Garmin, Polar, Suunto, Apple Watch, etc.)
 * - Compte Strava
 * - Compte Garmin Connect
 * - Compte Fitbit
 * - HypeRate.io
 *
 * @author Skali Prog Team
 * @version 1.0.0
 */

const WearablesConnect = {
    currentMember: null,
    currentConnection: null,

    // ===================================================================
    // AFFICHAGE PRINCIPAL
    // ===================================================================
    async show(memberId) {
        this.currentMember = memberId;

        // Vérifier les connexions existantes
        const existingConnection = await this.checkExistingConnection(memberId);

        const html = `
            <div class="min-h-screen" style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);">

                <!-- Header -->
                <div class="px-6 py-8 mb-8" style="background: linear-gradient(135deg, #0ea5e9, #0284c7); border-bottom: 4px solid #0369a1; box-shadow: 0 8px 32px rgba(14, 165, 233, 0.3);">
                    <div class="max-w-4xl mx-auto">
                        <h1 class="text-4xl font-black text-white mb-2 flex items-center">
                            <i class="fas fa-heartbeat mr-4"></i>
                            Connecter ma montre
                        </h1>
                        <p class="text-sky-100 text-lg">
                            Connectez votre montre pour afficher votre fréquence cardiaque en direct sur les écrans TV
                        </p>
                    </div>
                </div>

                <div class="max-w-4xl mx-auto px-6 pb-12">

                    ${existingConnection ? this.renderExistingConnection(existingConnection) : ''}

                    <!-- Options de connexion -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                        <!-- Web Bluetooth -->
                        <div class="bg-white rounded-2xl p-6 border-2 border-sky-200 shadow-lg hover:shadow-xl transition-all">
                            <div class="flex items-start justify-between mb-4">
                                <div class="w-14 h-14 rounded-full flex items-center justify-center" style="background: linear-gradient(135deg, #0ea5e9, #0284c7);">
                                    <i class="fab fa-bluetooth text-2xl text-white"></i>
                                </div>
                                <span class="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                    Temps réel
                                </span>
                            </div>
                            <h3 class="text-xl font-bold text-slate-800 mb-2">Bluetooth Direct</h3>
                            <p class="text-slate-600 text-sm mb-4">
                                Connectez votre montre directement via Bluetooth. Fonctionne avec Garmin, Polar, Suunto, Apple Watch, etc.
                            </p>
                            <button onclick="WearablesConnect.connectBluetooth()"
                                    class="w-full px-6 py-3 rounded-lg font-bold text-white transition-all"
                                    style="background: linear-gradient(135deg, #0ea5e9, #0284c7); box-shadow: 0 4px 16px rgba(14, 165, 233, 0.3);"
                                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(14, 165, 233, 0.4)'"
                                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 16px rgba(14, 165, 233, 0.3)'">
                                <i class="fas fa-link mr-2"></i>Connecter via Bluetooth
                            </button>
                        </div>

                        <!-- Strava -->
                        <div class="bg-white rounded-2xl p-6 border-2 border-orange-200 shadow-lg hover:shadow-xl transition-all">
                            <div class="flex items-start justify-between mb-4">
                                <div class="w-14 h-14 rounded-full flex items-center justify-center bg-orange-500">
                                    <i class="fab fa-strava text-2xl text-white"></i>
                                </div>
                                <span class="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                                    Après activité
                                </span>
                            </div>
                            <h3 class="text-xl font-bold text-slate-800 mb-2">Strava</h3>
                            <p class="text-slate-600 text-sm mb-4">
                                Connectez votre compte Strava pour importer automatiquement vos données cardiaques après chaque séance.
                            </p>
                            <button onclick="WearablesConnect.connectProvider('STRAVA')"
                                    class="w-full px-6 py-3 rounded-lg font-bold text-white bg-orange-500 hover:bg-orange-600 transition-all">
                                <i class="fab fa-strava mr-2"></i>Connecter Strava
                            </button>
                        </div>

                        <!-- Garmin -->
                        <div class="bg-white rounded-2xl p-6 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all">
                            <div class="flex items-start justify-between mb-4">
                                <div class="w-14 h-14 rounded-full flex items-center justify-center bg-blue-600">
                                    <i class="fas fa-running text-2xl text-white"></i>
                                </div>
                                <span class="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                                    Après activité
                                </span>
                            </div>
                            <h3 class="text-xl font-bold text-slate-800 mb-2">Garmin Connect</h3>
                            <p class="text-slate-600 text-sm mb-4">
                                Connectez votre compte Garmin Connect pour synchroniser vos données cardiaques automatiquement.
                            </p>
                            <button onclick="WearablesConnect.connectProvider('GARMIN')"
                                    class="w-full px-6 py-3 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all">
                                <i class="fas fa-link mr-2"></i>Connecter Garmin
                            </button>
                        </div>

                        <!-- HypeRate.io -->
                        <div class="bg-white rounded-2xl p-6 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all">
                            <div class="flex items-start justify-between mb-4">
                                <div class="w-14 h-14 rounded-full flex items-center justify-center bg-purple-600">
                                    <i class="fas fa-broadcast-tower text-2xl text-white"></i>
                                </div>
                                <span class="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                    Streaming
                                </span>
                            </div>
                            <h3 class="text-xl font-bold text-slate-800 mb-2">HypeRate.io</h3>
                            <p class="text-slate-600 text-sm mb-4">
                                Utilisez l'app HypeRate.io pour streamer votre FC en temps réel depuis n'importe quelle montre.
                            </p>
                            <button onclick="WearablesConnect.connectHypeRate()"
                                    class="w-full px-6 py-3 rounded-lg font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all">
                                <i class="fas fa-wifi mr-2"></i>Configurer HypeRate
                            </button>
                        </div>

                    </div>

                    <!-- Guide d'utilisation -->
                    <div class="bg-white rounded-2xl p-6 border-2 border-sky-200 shadow-lg">
                        <h3 class="text-xl font-bold text-slate-800 mb-4 flex items-center">
                            <i class="fas fa-info-circle mr-3 text-sky-500"></i>
                            Comment ça marche ?
                        </h3>
                        <div class="space-y-4 text-slate-700">
                            <div class="flex items-start gap-4">
                                <div class="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                                <div>
                                    <h4 class="font-bold mb-1">Choisissez votre méthode</h4>
                                    <p class="text-sm text-slate-600">Bluetooth pour le temps réel, ou Strava/Garmin pour les données après séance</p>
                                </div>
                            </div>
                            <div class="flex items-start gap-4">
                                <div class="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                                <div>
                                    <h4 class="font-bold mb-1">Connectez votre appareil</h4>
                                    <p class="text-sm text-slate-600">Suivez les instructions pour connecter votre montre ou compte</p>
                                </div>
                            </div>
                            <div class="flex items-start gap-4">
                                <div class="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                                <div>
                                    <h4 class="font-bold mb-1">Votre FC s'affiche sur les écrans TV</h4>
                                    <p class="text-sm text-slate-600">Pendant les séances, votre fréquence cardiaque sera visible en temps réel pour vous et les coachs</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Compatibilité -->
                    <div class="mt-6 bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <h4 class="font-bold text-slate-700 mb-2 text-sm">Montres compatibles (Bluetooth)</h4>
                        <div class="flex flex-wrap gap-2 text-xs">
                            <span class="px-3 py-1 bg-white rounded-full text-slate-600 border border-slate-300">Garmin Forerunner</span>
                            <span class="px-3 py-1 bg-white rounded-full text-slate-600 border border-slate-300">Polar Vantage</span>
                            <span class="px-3 py-1 bg-white rounded-full text-slate-600 border border-slate-300">Suunto</span>
                            <span class="px-3 py-1 bg-white rounded-full text-slate-600 border border-slate-300">Apple Watch</span>
                            <span class="px-3 py-1 bg-white rounded-full text-slate-600 border border-slate-300">Samsung Galaxy Watch</span>
                            <span class="px-3 py-1 bg-white rounded-full text-slate-600 border border-slate-300">Fitbit</span>
                            <span class="px-3 py-1 bg-white rounded-full text-slate-600 border border-slate-300">Coros</span>
                            <span class="px-3 py-1 bg-white rounded-full text-slate-600 border border-slate-300">Wahoo</span>
                        </div>
                    </div>

                </div>

            </div>
        `;

        document.getElementById('mainContent').innerHTML = html;
    },

    renderExistingConnection(connection) {
        return `
            <div class="bg-green-50 border-2 border-green-300 rounded-2xl p-6 mb-8">
                <div class="flex items-start justify-between">
                    <div class="flex items-start gap-4">
                        <div class="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                            <i class="fas fa-check text-xl text-white"></i>
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-green-800 mb-1">Appareil connecté</h3>
                            <p class="text-green-700 mb-2">${connection.deviceName || connection.type}</p>
                            <div class="flex items-center gap-4 text-sm text-green-600">
                                <span><i class="fas fa-heartbeat mr-1"></i>Dernière FC: ${connection.lastHR || '--'} bpm</span>
                                <span><i class="fas fa-clock mr-1"></i>Connecté ${this.formatTimeAgo(connection.connectedAt)}</span>
                            </div>
                        </div>
                    </div>
                    <button onclick="WearablesConnect.disconnect()"
                            class="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-lg transition-all">
                        <i class="fas fa-unlink mr-2"></i>Déconnecter
                    </button>
                </div>
            </div>
        `;
    },

    // ===================================================================
    // CONNEXIONS
    // ===================================================================
    async connectBluetooth() {
        if (typeof WearablesIntegration === 'undefined') {
            this.showError('Module WearablesIntegration non chargé');
            return;
        }

        this.showLoading('Recherche de votre montre...');

        try {
            const result = await WearablesIntegration.connectBluetoothDevice(this.currentMember);

            this.hideLoading();

            if (result.success) {
                this.showSuccess(`✅ Montre connectée: ${result.deviceName}`);
                setTimeout(() => this.show(this.currentMember), 2000);
            } else {
                this.showError(result.error);
            }
        } catch (error) {
            this.hideLoading();
            this.showError(error.message);
        }
    },

    async connectProvider(provider) {
        if (typeof WearablesIntegration === 'undefined') {
            this.showError('Module WearablesIntegration non chargé');
            return;
        }

        this.showLoading(`Connexion à ${provider}...`);

        try {
            const result = await WearablesIntegration.generateTerraAuthLink(
                this.currentMember,
                provider
            );

            this.hideLoading();

            if (result.success) {
                // Ouvrir la page d'auth dans une nouvelle fenêtre
                window.open(result.authUrl, '_blank', 'width=600,height=800');
                this.showSuccess("Suivez les instructions dans la fenêtre qui vient de s'ouvrir");
            } else {
                this.showError(result.error);
            }
        } catch (error) {
            this.hideLoading();
            this.showError(error.message);
        }
    },

    async connectHypeRate() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                <h3 class="text-2xl font-bold text-slate-800 mb-4 flex items-center">
                    <i class="fab fa-twitch mr-3 text-purple-500"></i>
                    Configurer HypeRate.io
                </h3>
                <div class="space-y-4 text-slate-700">
                    <p class="text-sm">
                        1. Téléchargez l'app <strong>HypeRate Companion</strong> sur votre téléphone
                    </p>
                    <p class="text-sm">
                        2. Connectez votre montre via l'app
                    </p>
                    <p class="text-sm">
                        3. Récupérez votre <strong>HypeRate ID</strong> dans l'app
                    </p>
                    <p class="text-sm">
                        4. Entrez-le ci-dessous:
                    </p>
                    <input type="text" id="hyperateIdInput" placeholder="Votre HypeRate ID"
                           class="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none">
                    <div class="flex gap-3">
                        <button onclick="this.closest('.fixed').remove()"
                                class="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 rounded-lg font-semibold transition-all">
                            Annuler
                        </button>
                        <button onclick="WearablesConnect.submitHypeRateId()"
                                class="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all">
                            Connecter
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    },

    async submitHypeRateId() {
        const input = document.getElementById('hyperateIdInput');
        const hyperateId = input?.value.trim();

        if (!hyperateId) {
            alert('Veuillez entrer votre HypeRate ID');
            return;
        }

        document.querySelector('.fixed.inset-0')?.remove();

        this.showLoading('Connexion à HypeRate.io...');

        try {
            const result = await WearablesIntegration.connectHypeRate(
                this.currentMember,
                hyperateId
            );

            this.hideLoading();

            if (result.success) {
                this.showSuccess('✅ HypeRate.io connecté !');
                setTimeout(() => this.show(this.currentMember), 2000);
            } else {
                this.showError(result.error);
            }
        } catch (error) {
            this.hideLoading();
            this.showError(error.message);
        }
    },

    async disconnect() {
        if (!confirm('Voulez-vous vraiment déconnecter votre montre ?')) {
            return;
        }

        this.showLoading('Déconnexion...');

        try {
            await WearablesIntegration.disconnect(this.currentMember);
            this.hideLoading();
            this.showSuccess('Déconnecté avec succès');
            setTimeout(() => this.show(this.currentMember), 1500);
        } catch (error) {
            this.hideLoading();
            this.showError(error.message);
        }
    },

    // ===================================================================
    // UTILITAIRES
    // ===================================================================
    async checkExistingConnection(memberId) {
        if (typeof WearablesIntegration === 'undefined') {
            return null;
        }

        const connections = WearablesIntegration.getActiveConnections();
        return connections.find(c => c.memberId === memberId) || null;
    },

    formatTimeAgo(date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);

        if (seconds < 60) {
            return "à l'instant";
        }
        if (seconds < 3600) {
            return `il y a ${Math.floor(seconds / 60)} min`;
        }
        if (seconds < 86400) {
            return `il y a ${Math.floor(seconds / 3600)}h`;
        }
        return `il y a ${Math.floor(seconds / 86400)}j`;
    },

    showLoading(message) {
        const loader = document.createElement('div');
        loader.id = 'wearables-loader';
        loader.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
        loader.innerHTML = `
            <div class="bg-white rounded-2xl p-8 text-center shadow-2xl">
                <div class="animate-spin rounded-full h-16 w-16 border-4 border-sky-500 border-t-transparent mx-auto mb-4"></div>
                <p class="text-lg font-semibold text-slate-700">${message}</p>
            </div>
        `;
        document.body.appendChild(loader);
    },

    hideLoading() {
        document.getElementById('wearables-loader')?.remove();
    },

    showSuccess(message) {
        this.showNotification(message, 'success');
    },

    showError(message) {
        this.showNotification(message, 'error');
    },

    showNotification(message, type = 'info') {
        const colors = {
            success: { bg: '#10b981', border: '#059669' },
            error: { bg: '#ef4444', border: '#dc2626' },
            info: { bg: '#0ea5e9', border: '#0284c7' }
        };

        const notif = document.createElement('div');
        notif.className =
            'fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-2xl text-white font-semibold animate-fade-in';
        notif.style.cssText = `background: ${colors[type].bg}; border: 2px solid ${colors[type].border};`;
        notif.textContent = message;

        document.body.appendChild(notif);

        setTimeout(() => {
            notif.style.opacity = '0';
            notif.style.transform = 'translateY(-20px)';
            notif.style.transition = 'all 0.3s';
            setTimeout(() => notif.remove(), 300);
        }, 3000);
    }
};

// Exposer globalement
window.WearablesConnect = WearablesConnect;

console.log('✅ Module Wearables Connect chargé');
