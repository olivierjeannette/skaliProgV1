// Intégration Eppy Pro pour afficher les adhérents présents
const EppyProIntegration = {
    // Configuration de l'intégration
    config: {
        eppyProUrl: 'eppy-pro-simple.html', // Version simple pour Eppy Pro
        iframeSelector: '#eppyProIframe',
        containerSelector: '#eppyProContainer',
        refreshInterval: 30000, // 30 secondes
        isEnabled: true
    },

    // Initialiser l'intégration
    init() {
        if (!this.config.isEnabled) {
            console.log('🔌 Intégration Eppy Pro désactivée');
            return;
        }

        console.log("🔌 Initialisation de l'intégration Eppy Pro...");
        this.createEppyProContainer();
        this.loadEppyProPage();
        this.startAutoRefresh();
    },

    // Créer le conteneur pour Eppy Pro
    createEppyProContainer() {
        // Vérifier si le conteneur existe déjà
        if (document.getElementById('eppyProContainer')) {
            return;
        }

        // Créer le conteneur dans la section équipes
        const teamsSection = document.querySelector('#mainContent');
        if (teamsSection) {
            const container = document.createElement('div');
            container.id = 'eppyProContainer';
            container.className = 'eppy-pro-integration mt-6';
            container.innerHTML = `
                <div class="bg-gray-800 rounded-lg p-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold text-white">
                            <i class="fas fa-users mr-2 text-blue-500"></i>Adhérents Présents (Eppy Pro)
                        </h3>
                        <div class="flex space-x-2">
                            <button onclick="EppyProIntegration.refresh()" 
                                    class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm">
                                <i class="fas fa-sync-alt mr-1"></i>Actualiser
                            </button>
                            <button onclick="EppyProIntegration.toggleFullscreen()" 
                                    class="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-lg text-sm">
                                <i class="fas fa-expand mr-1"></i>Plein écran
                            </button>
                        </div>
                    </div>
                    <div class="relative">
                        <div id="eppyProLoading" class="text-center py-8">
                            <i class="fas fa-spinner fa-spin text-2xl text-blue-400 mb-2"></i>
                            <p class="text-gray-400">Chargement de Eppy Pro...</p>
                        </div>
                        <iframe id="eppyProIframe" 
                                src="" 
                                class="w-full h-96 border border-gray-700 rounded-lg hidden"
                                frameborder="0"
                                allow="camera; microphone; geolocation">
                        </iframe>
                        <div id="eppyProError" class="text-center py-8 hidden">
                            <i class="fas fa-exclamation-triangle text-2xl text-red-400 mb-2"></i>
                            <p class="text-red-400">Impossible de charger Eppy Pro</p>
                            <button onclick="EppyProIntegration.loadEppyProPage()" 
                                    class="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
                                Réessayer
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // Insérer le conteneur dans la section équipes
            teamsSection.appendChild(container);
        }
    },

    // Charger la page Eppy Pro
    loadEppyProPage() {
        const iframe = document.getElementById('eppyProIframe');
        const loading = document.getElementById('eppyProLoading');
        const error = document.getElementById('eppyProError');

        if (!iframe) return;

        // Afficher le loading
        loading.classList.remove('hidden');
        iframe.classList.add('hidden');
        error.classList.add('hidden');

        // Configurer l'iframe
        iframe.src = this.config.eppyProUrl;

        // Gérer le chargement
        iframe.onload = () => {
            try {
                // Vérifier si l'iframe peut accéder au contenu
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (iframeDoc) {
                    console.log('✅ Eppy Pro chargé avec succès');
                } else {
                    console.warn("⚠️ Accès CORS refusé, affichage de l'iframe quand même");
                }
                loading.classList.add('hidden');
                iframe.classList.remove('hidden');
            } catch (e) {
                console.warn("⚠️ Accès CORS refusé, affichage de l'iframe quand même");
                loading.classList.add('hidden');
                iframe.classList.remove('hidden');
            }
        };

        // Gérer les erreurs
        iframe.onerror = () => {
            console.error('❌ Erreur lors du chargement de Eppy Pro');
            loading.classList.add('hidden');
            error.classList.remove('hidden');
        };

        // Timeout de sécurité
        setTimeout(() => {
            if (loading && !loading.classList.contains('hidden')) {
                console.warn('⚠️ Timeout de chargement Eppy Pro');
                loading.classList.add('hidden');
                error.classList.remove('hidden');
            }
        }, 10000);
    },

    // Actualiser la page Eppy Pro
    refresh() {
        console.log('🔄 Actualisation de Eppy Pro...');
        this.loadEppyProPage();
    },

    // Démarrer l'actualisation automatique
    startAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }

        this.refreshTimer = setInterval(() => {
            this.refresh();
        }, this.config.refreshInterval);
    },

    // Arrêter l'actualisation automatique
    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    },

    // Basculer le mode plein écran
    toggleFullscreen() {
        const container = document.getElementById('eppyProContainer');
        const iframe = document.getElementById('eppyProIframe');

        if (!container || !iframe) return;

        if (container.classList.contains('fullscreen')) {
            // Sortir du plein écran
            container.classList.remove('fullscreen');
            iframe.classList.remove('h-screen');
            iframe.classList.add('h-96');
            document.body.classList.remove('overflow-hidden');
        } else {
            // Entrer en plein écran
            container.classList.add('fullscreen');
            iframe.classList.remove('h-96');
            iframe.classList.add('h-screen');
            document.body.classList.add('overflow-hidden');
        }
    },

    // Configurer l'URL Eppy Pro
    setEppyProUrl(url) {
        this.config.eppyProUrl = url;
        console.log(`🔗 URL Eppy Pro mise à jour: ${url}`);
    },

    // Activer/Désactiver l'intégration
    setEnabled(enabled) {
        this.config.isEnabled = enabled;
        if (enabled) {
            this.init();
        } else {
            this.destroy();
        }
    },

    // Détruire l'intégration
    destroy() {
        this.stopAutoRefresh();
        const container = document.getElementById('eppyProContainer');
        if (container) {
            container.remove();
        }
    },

    // Obtenir les informations de l'intégration
    getInfo() {
        return {
            isEnabled: this.config.isEnabled,
            url: this.config.eppyProUrl,
            refreshInterval: this.config.refreshInterval,
            isLoaded: !!document.getElementById('eppyProIframe')?.src
        };
    }
};

// Styles CSS pour l'intégration
const eppyProStyles = `
<style>
.eppy-pro-integration.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
}

.eppy-pro-integration.fullscreen .bg-gray-800 {
    width: 100%;
    height: 100%;
    max-width: none;
    max-height: none;
}

.eppy-pro-integration iframe {
    transition: all 0.3s ease;
}

.eppy-pro-integration .loading-spinner {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
</style>
`;

// Ajouter les styles au document
if (typeof document !== 'undefined') {
    document.head.insertAdjacentHTML('beforeend', eppyProStyles);
}
