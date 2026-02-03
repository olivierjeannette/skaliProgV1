/**
 * Configuration des URLs API
 * Gère automatiquement les URLs selon l'environnement (dev local vs production Netlify)
 */

const ApiConfig = {
    /**
     * URL FIXE ngrok (ne change JAMAIS)
     *
     * Cette URL est permanente grâce à ngrok.
     * Plus besoin de la changer à chaque démarrage !
     */
    PRODUCTION_API_URL: 'https://nonintrospective-rosella-kiddingly.ngrok-free.dev',

    /**
     * URL locale pour le développement
     */
    LOCAL_API_URL: 'http://localhost:3001',

    /**
     * Détecte automatiquement l'environnement et retourne la bonne URL
     */
    getApiUrl() {
        const hostname = window.location.hostname;

        // Si on est en développement local
        if (
            hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname.startsWith('192.168.') ||
            hostname.startsWith('10.')
        ) {
            console.log('🔧 Mode DEV - Utilisation API locale:', this.LOCAL_API_URL);
            return this.LOCAL_API_URL;
        }

        // Si on est sur Netlify ou autre domaine de production
        console.log('🌐 Mode PROD - Utilisation API tunnel:', this.PRODUCTION_API_URL);

        // Vérifier que l'URL a été configurée
        if (this.PRODUCTION_API_URL.includes('REMPLACEZ')) {
            console.error('❌ ERREUR: URL du tunnel Cloudflare non configurée !');
            console.error('   Modifiez PRODUCTION_API_URL dans js/core/api-config.js');
            alert("⚠️ Configuration API manquante. Contactez l'administrateur.");
        }

        return this.PRODUCTION_API_URL;
    },

    /**
     * URLs des différents endpoints
     */
    endpoints: {
        claudeVision: '/api/vision',
        claudeText: '/api/chat'
        // Ajoutez d'autres endpoints ici si nécessaire
    },

    /**
     * Obtenir l'URL complète d'un endpoint
     * @param endpoint
     */
    getEndpointUrl(endpoint) {
        const baseUrl = this.getApiUrl();
        return `${baseUrl}${this.endpoints[endpoint] || endpoint}`;
    },

    /**
     * Test de connexion à l'API
     */
    async testConnection() {
        try {
            console.log("🔍 Test de connexion à l'API...");
            const response = await fetch(this.getApiUrl() + '/health', {
                method: 'GET',
                timeout: 5000
            });

            if (response.ok) {
                console.log('✅ API accessible !');
                return true;
            } else {
                console.warn('⚠️ API répond mais avec erreur:', response.status);
                return false;
            }
        } catch (error) {
            console.error('❌ API inaccessible:', error.message);
            return false;
        }
    }
};

// Log de l'URL au chargement pour debugging
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📡 Configuration API chargée');
console.log('   URL utilisée:', ApiConfig.getApiUrl());
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Exposer globalement pour utilisation dans d'autres fichiers
window.ApiConfig = ApiConfig;
