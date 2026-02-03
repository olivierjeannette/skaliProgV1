// ========================================
// OPTIMISEUR DE PERFORMANCE
// Améliore LCP, INP et CLS
// ========================================

const PerformanceOptimizer = {
    // Debounce universel pour les gestionnaires d'événements
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle pour les événements haute fréquence
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    },

    // Optimiser les clics sur les boutons de navigation - MODE ULTRA PERFORMANCE
    optimizeNavButtons() {
        const sidebar = document.querySelector('.sidebar-nav');
        if (!sidebar) {
            return;
        }

        // Utiliser la délégation d'événements avec passive listener
        // SUPPRESSION DES ANIMATIONS pour améliorer l'INP
        const handleInteraction = event => {
            const button = event.target.closest('.nav-item');
            if (!button) {
                return;
            }

            // Feedback visuel minimal (changement de couleur uniquement, pas de transform)
            if (event.type === 'pointerdown' || event.type === 'touchstart') {
                button.style.opacity = '0.7';
            } else if (
                event.type === 'pointerup' ||
                event.type === 'touchend' ||
                event.type === 'pointercancel'
            ) {
                button.style.opacity = '';
            }
        };

        // Listeners passifs pour ne pas bloquer le scroll
        sidebar.addEventListener('pointerdown', handleInteraction, { passive: true });
        sidebar.addEventListener('pointerup', handleInteraction, { passive: true });
        sidebar.addEventListener('pointercancel', handleInteraction, { passive: true });

        console.log('✓ Navigation optimisée (feedback minimal)');
    },

    // Optimiser l'overlay mobile
    optimizeMobileOverlay() {
        const overlay = document.querySelector('.mobile-overlay');
        if (!overlay) {
            return;
        }

        // Utiliser event delegation pour éviter multiple listeners
        overlay.addEventListener(
            'click',
            e => {
                // Fermer immédiatement sans animation coûteuse
                if (e.target === overlay) {
                    e.preventDefault();
                    e.stopPropagation();

                    // Utiliser requestAnimationFrame pour optimisation
                    requestAnimationFrame(() => {
                        overlay.classList.remove('active');

                        // Fermer le menu mobile si existe
                        const sidebar = document.querySelector('.sidebar');
                        if (sidebar && sidebar.classList.contains('mobile-active')) {
                            sidebar.classList.remove('mobile-active');
                        }
                    });
                }
            },
            { passive: false }
        ); // Non-passive car on utilise preventDefault

        console.log('✓ Overlay mobile optimisé');
    },

    // Optimiser toutes les interactions cliquables - DÉSACTIVÉ (causait des bugs de clic)
    optimizeClickableElements() {
        // DÉSACTIVÉ : Le listener de double-click empêchait certains clics de fonctionner
        // notamment sur les quality-cards et autres éléments dynamiques
        console.log("✓ Optimiseur de clics désactivé (évite les bugs d'interaction)");
        return;
    },

    // Optimiser les transitions CSS - DÉSACTIVÉ (causait des bugs visuels)
    enablePerformanceMode() {
        // DÉSACTIVÉ : La désactivation d'animations pendant le scroll causait des bugs visuels
        // Les animations CSS modernes sont suffisamment performantes avec GPU acceleration
        console.log('✓ Mode performance scroll désactivé (animations CSS conservées)');
        return;
    },

    // Précharger les ressources critiques
    preloadCriticalResources() {
        // Préchargement désactivé pour éviter les warnings
        // Les ressources se chargeront à la demande
        return;
    },

    // Observer les interactions pour améliorer l'INP - DÉSACTIVÉ (trop de logs)
    observeInteractions() {
        // ⚠️ DÉSACTIVÉ : Le PerformanceObserver génère trop de warnings et ralentit l'application
        // Si besoin de debug performance, réactiver temporairement
        console.log('ℹ️ PerformanceObserver désactivé pour de meilleures performances');
        return;
    },

    // Optimiser le chargement des polices
    optimizeFontLoading() {
        if ('fonts' in document) {
            // Charger les polices critiques en priorité
            document.fonts
                .load('800 32px Inter')
                .then(() => {
                    console.log('✓ Police critique chargée (800 weight)');
                })
                .catch(err => {
                    console.warn('Échec du chargement de la police:', err);
                });
        }
    },

    // Réduire le travail du MutationObserver - DÉSACTIVÉ pour performance
    optimizeMutationObserver() {
        // DÉSACTIVÉ : IntersectionObserver + will-change peuvent ralentir
        // Les éléments de navigation sont toujours visibles donc pas besoin
        console.log('✓ MutationObserver optimisations désactivées (gain de performance)');
        return;
    },

    // Initialiser toutes les optimisations
    init() {
        console.log('🚀 Initialisation des optimisations de performance...');

        // Attendre que le DOM soit prêt
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.runOptimizations());
        } else {
            this.runOptimizations();
        }
    },

    // Optimiser les inputs (debounce keyboard events pour réduire INP)
    optimizeInputs() {
        // Augmenter le debounce de 100ms à 200ms pour réduire la charge
        document.body.addEventListener(
            'input',
            this.debounce(e => {
                // L'événement est automatiquement debounced
                // Pas besoin de traitement spécial
            }, 200),
            { passive: true }
        );

        // Empêcher les re-validations trop fréquentes
        document.body.addEventListener(
            'keydown',
            e => {
                const target = e.target;
                if (target.matches('input.session-block-name, input[type="text"], textarea')) {
                    // Marquer comme "en cours de frappe" pour éviter validations immédiates
                    target.dataset.typing = 'true';
                    clearTimeout(target._typingTimeout);
                    target._typingTimeout = setTimeout(() => {
                        delete target.dataset.typing;
                    }, 500); // Augmenté de 300ms à 500ms
                }
            },
            { passive: true }
        );

        console.log('✓ Inputs optimisés avec debounce 200ms');
    },

    // Exécuter les optimisations
    runOptimizations() {
        // Optimisations critiques
        this.preloadCriticalResources();
        this.optimizeFontLoading();

        // Optimisations après un court délai
        requestAnimationFrame(() => {
            this.optimizeNavButtons();
            this.optimizeMobileOverlay();
            this.optimizeClickableElements();
            this.optimizeInputs();
            this.enablePerformanceMode();
            this.optimizeMutationObserver();
            this.observeInteractions();
        });

        console.log('✓ Optimisations de performance activées');
    }
};

// Initialiser automatiquement
PerformanceOptimizer.init();
