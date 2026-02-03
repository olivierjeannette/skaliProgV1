/**
 * SMART BUTTON LOADER
 * Intercepte les clics sur les boutons et charge les modules nécessaires à la demande
 */

const SmartButtonLoader = {
    initialized: false,
    loadingOverlay: null,

    /**
     * Initialiser le système de chargement intelligent
     */
    init() {
        if (this.initialized) {
            return;
        }

        console.log('🎯 Initialisation du Smart Button Loader...');

        // Créer l'overlay de chargement
        this.createLoadingOverlay();

        // Intercepter tous les clics sur les boutons de navigation
        this.attachButtonListeners();

        this.initialized = true;
        console.log('✅ Smart Button Loader prêt');
    },

    /**
     * Créer l'overlay de chargement
     */
    createLoadingOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'moduleLoadingOverlay';
        overlay.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10000;
            align-items: center;
            justify-content: center;
        `;

        overlay.innerHTML = `
            <div style="
                background: white;
                padding: 30px 50px;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                text-align: center;
            ">
                <div style="
                    width: 40px;
                    height: 40px;
                    border: 4px solid #22c55e;
                    border-top-color: transparent;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                    margin: 0 auto 15px;
                "></div>
                <p style="
                    margin: 0;
                    color: #14532d;
                    font-weight: 600;
                    font-size: 16px;
                ">Chargement du module...</p>
            </div>
        `;

        // Ajouter l'animation de rotation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(overlay);
        this.loadingOverlay = overlay;
    },

    /**
     * Afficher l'overlay de chargement
     */
    showLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'flex';
        }
    },

    /**
     * Cacher l'overlay de chargement
     */
    hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'none';
        }
    },

    /**
     * Attacher les listeners aux boutons de navigation
     */
    attachButtonListeners() {
        // Liste des boutons qui nécessitent un chargement de module
        const buttonsConfig = window.ModuleLoaderConfig?.BUTTON_TO_MODULE || {};

        // Boutons optionnels (ne pas logger si absents)
        const optionalButtons = [
            'cardioDrawBtn',
            'pokemonBtn',
            'videoBtn',
            'discordBtn',
            'syncBtn',
            'backupBtn',
            'tvBtn'
        ];

        let foundCount = 0;
        Object.keys(buttonsConfig).forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (!button) {
                // Logger uniquement si ce n'est pas un bouton optionnel
                if (!optionalButtons.includes(buttonId)) {
                    console.warn(`⚠️ Bouton ${buttonId} non trouvé`);
                }
                return;
            }

            // Intercepter le clic
            button.addEventListener(
                'click',
                async e => {
                    // Charger les modules requis avant d'exécuter l'action
                    await this.handleButtonClick(buttonId, button);
                },
                { capture: true, passive: false }
            );

            foundCount++;
        });

        console.log(`✅ ${foundCount}/${Object.keys(buttonsConfig).length} boutons configurés`);
    },

    /**
     * Gérer le clic sur un bouton
     * @param buttonId
     * @param button
     */
    async handleButtonClick(buttonId, button) {
        const modulesToLoad = window.ModuleLoaderConfig?.BUTTON_TO_MODULE[buttonId];

        if (!modulesToLoad || modulesToLoad.length === 0) {
            // Pas de modules à charger
            return;
        }

        // Vérifier si tous les modules sont déjà chargés
        const allLoaded = modulesToLoad.every(moduleName =>
            window.LazyLoader.loadedGroups.has(moduleName)
        );

        if (allLoaded) {
            // Tous les modules sont déjà chargés, laisser le clic se propager
            return;
        }

        // Afficher le loader
        this.showLoading();

        try {
            // Charger les modules requis
            console.log(`📦 Chargement des modules pour ${buttonId}...`);
            await window.LazyLoader.loadForButton(buttonId);

            // Modules chargés avec succès
            console.log(`✅ Modules chargés pour ${buttonId}`);
        } catch (error) {
            console.error(`❌ Erreur lors du chargement des modules pour ${buttonId}:`, error);
            alert('Erreur lors du chargement du module. Veuillez rafraîchir la page.');
        } finally {
            // Cacher le loader
            this.hideLoading();
        }
    }
};

// Exposer globalement
window.SmartButtonLoader = SmartButtonLoader;

// Auto-initialisation après le DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Attendre que LazyLoader soit disponible
        if (window.LazyLoader && window.ModuleLoaderConfig) {
            SmartButtonLoader.init();
        } else {
            console.warn('⚠️ LazyLoader ou ModuleLoaderConfig non disponible');
        }
    });
} else {
    // DOM déjà chargé
    if (window.LazyLoader && window.ModuleLoaderConfig) {
        SmartButtonLoader.init();
    }
}
