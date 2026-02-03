/**
 * ═══════════════════════════════════════════════════════════════
 * RESPONSIVE MANAGER
 * Gestion intelligente de l'auto-scaling pour tous les écrans
 * ═══════════════════════════════════════════════════════════════
 */

const ResponsiveManager = {
    // État
    currentScale: 1.0,
    currentBreakpoint: 'desktop',
    isInitialized: false,

    // Configuration
    config: {
        minScale: 0.5,
        maxScale: 2.0,
        scaleStep: 0.05,
        breakpoints: {
            mobile: 768,
            tablet: 1024,
            desktop: 1920,
            large: 2560
        }
    },

    /**
     * INITIALISATION - DÉSACTIVÉE
     * Le scaling automatique causait des problèmes de "crop" du menu
     */
    init() {
        if (this.isInitialized) {
            return;
        }

        console.log('📱 Responsive Manager - DÉSACTIVÉ (causait des problèmes de scaling)');

        // On ne fait RIEN - pas de scaling, pas de contrôles
        // L'utilisateur peut utiliser le zoom natif du navigateur (Ctrl +/-)

        this.isInitialized = true;
        this.currentScale = 1.0; // Toujours 100%
        console.log('✅ Responsive Manager désactivé - Scaling à 100% fixe');
    },

    /**
     * DÉTECTION DU BREAKPOINT
     */
    detectBreakpoint() {
        const width = window.innerWidth;

        if (width <= this.config.breakpoints.mobile) {
            this.currentBreakpoint = 'mobile';
        } else if (width <= this.config.breakpoints.tablet) {
            this.currentBreakpoint = 'tablet';
        } else if (width <= this.config.breakpoints.desktop) {
            this.currentBreakpoint = 'desktop';
        } else {
            this.currentBreakpoint = 'large';
        }

        // Mettre à jour le body class
        document.body.className = document.body.className.replace(/breakpoint-\w+/g, '');
        document.body.classList.add(`breakpoint-${this.currentBreakpoint}`);

        return this.currentBreakpoint;
    },

    /**
     * AUTO-SCALE INTELLIGENT
     * Calcule le scale optimal selon l'écran
     */
    applyAutoScale() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Scale de base selon le breakpoint
        let baseScale = 1.0;

        switch (this.currentBreakpoint) {
            case 'mobile':
                baseScale = 0.85;
                break;
            case 'tablet':
                baseScale = 0.95;
                break;
            case 'desktop':
                baseScale = 1.0;
                break;
            case 'large':
                baseScale = 1.1;
                break;
        }

        // Ajuster selon la hauteur disponible
        const heightRatio = height / 1080; // 1080p comme référence
        if (heightRatio < 0.8) {
            baseScale *= 0.9; // Réduire si écran petit en hauteur
        }

        // Appliquer le scale (sauf si utilisateur a modifié manuellement)
        if (!this.userHasManuallyAdjusted) {
            this.currentScale = baseScale;
        }

        this.applyScale();
    },

    /**
     * APPLIQUER LE SCALE
     */
    applyScale() {
        // NE PAS APPLIQUER SI MODE TV EST ACTIF!
        if (document.body.classList.contains('tv-mode-active')) {
            console.log('⏸️ ResponsiveManager désactivé (Mode TV actif)');
            return;
        }

        // ❌ SCALE DÉSACTIVÉ - causait le "crop" du menu sidebar
        // Le scaling global est trop agressif et rogne le menu
        // Si besoin de zoom, l'utilisateur peut utiliser le zoom navigateur (Ctrl+/-)

        console.log(
            `📐 Scale détecté: ${this.currentScale}x - Mais scaling désactivé pour éviter le crop du menu`
        );

        // Stocker dans root pour CSS (au cas où d'autres modules l'utilisent)
        document.documentElement.style.setProperty('--current-scale', this.currentScale);

        // Afficher les contrôles de zoom (désactivés visuellement)
        this.updateZoomControls();

        // Sauvegarder la préférence
        this.saveUserPreferences();
    },

    /**
     * DÉFINIR LE SCALE MANUELLEMENT
     * @param scale
     */
    setScale(scale) {
        this.currentScale = Math.max(this.config.minScale, Math.min(this.config.maxScale, scale));

        this.userHasManuallyAdjusted = true;
        this.applyScale();

        console.log(`🔍 Scale ajusté: ${this.currentScale.toFixed(2)}x`);
    },

    /**
     * ZOOM IN
     */
    zoomIn() {
        this.setScale(this.currentScale + this.config.scaleStep);
    },

    /**
     * ZOOM OUT
     */
    zoomOut() {
        this.setScale(this.currentScale - this.config.scaleStep);
    },

    /**
     * RESET ZOOM
     */
    resetZoom() {
        this.userHasManuallyAdjusted = false;
        this.applyAutoScale();
    },

    /**
     * AFFICHER LES CONTRÔLES DE ZOOM
     */
    renderZoomControls() {
        return `
            <div class="responsive-zoom-controls" id="responsiveZoomControls">
                <button onclick="ResponsiveManager.zoomOut()"
                        class="zoom-btn zoom-btn-out"
                        title="Réduire (Ctrl + -)">
                    <i class="fas fa-minus"></i>
                </button>

                <div class="zoom-display">
                    ${Math.round(this.currentScale * 100)}%
                </div>

                <button onclick="ResponsiveManager.zoomIn()"
                        class="zoom-btn zoom-btn-in"
                        title="Agrandir (Ctrl + +)">
                    <i class="fas fa-plus"></i>
                </button>

                <button onclick="ResponsiveManager.resetZoom()"
                        class="zoom-btn zoom-btn-reset"
                        title="Réinitialiser (Ctrl + 0)">
                    <i class="fas fa-undo"></i>
                </button>

                <div class="breakpoint-indicator">
                    <i class="fas ${this.getBreakpointIcon()}"></i>
                    ${this.currentBreakpoint}
                </div>
            </div>
        `;
    },

    /**
     * METTRE À JOUR LES CONTRÔLES
     */
    updateZoomControls() {
        const controls = document.getElementById('responsiveZoomControls');
        if (!controls) {
            return;
        }

        const display = controls.querySelector('.zoom-display');
        if (display) {
            display.textContent = `${Math.round(this.currentScale * 100)}%`;
        }

        const indicator = controls.querySelector('.breakpoint-indicator');
        if (indicator) {
            indicator.innerHTML = `
                <i class="fas ${this.getBreakpointIcon()}"></i>
                ${this.currentBreakpoint}
            `;
        }
    },

    /**
     * ICÔNE SELON BREAKPOINT
     */
    getBreakpointIcon() {
        const icons = {
            mobile: 'fa-mobile-alt',
            tablet: 'fa-tablet-alt',
            desktop: 'fa-desktop',
            large: 'fa-tv'
        };
        return icons[this.currentBreakpoint] || 'fa-desktop';
    },

    /**
     * ÉCOUTER LES ÉVÉNEMENTS
     */
    attachListeners() {
        // Resize window
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const oldBreakpoint = this.currentBreakpoint;
                this.detectBreakpoint();

                // Si le breakpoint a changé, recalculer l'auto-scale
                if (oldBreakpoint !== this.currentBreakpoint) {
                    console.log(
                        `📱 Breakpoint changé: ${oldBreakpoint} → ${this.currentBreakpoint}`
                    );
                    this.applyAutoScale();
                }
            }, 250);
        });

        // Raccourcis clavier
        document.addEventListener('keydown', e => {
            // Ctrl/Cmd + Plus/Minus pour zoom
            if (e.ctrlKey || e.metaKey) {
                if (e.key === '+' || e.key === '=') {
                    e.preventDefault();
                    this.zoomIn();
                } else if (e.key === '-' || e.key === '_') {
                    e.preventDefault();
                    this.zoomOut();
                } else if (e.key === '0') {
                    e.preventDefault();
                    this.resetZoom();
                }
            }
        });

        // Molette souris + Ctrl pour zoom
        document.addEventListener(
            'wheel',
            e => {
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    const delta = e.deltaY > 0 ? -this.config.scaleStep : this.config.scaleStep;
                    this.setScale(this.currentScale + delta);
                }
            },
            { passive: false }
        );

        // Orientation change (mobile)
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.detectBreakpoint();
                this.applyAutoScale();
            }, 300);
        });
    },

    /**
     * SAUVEGARDER LES PRÉFÉRENCES
     */
    saveUserPreferences() {
        try {
            const prefs = {
                scale: this.currentScale,
                manuallyAdjusted: this.userHasManuallyAdjusted || false,
                timestamp: Date.now()
            };
            localStorage.setItem('responsive_preferences', JSON.stringify(prefs));
        } catch (error) {
            console.warn('Impossible de sauvegarder les préférences:', error);
        }
    },

    /**
     * CHARGER LES PRÉFÉRENCES
     */
    loadUserPreferences() {
        try {
            const saved = localStorage.getItem('responsive_preferences');
            if (!saved) {
                return;
            }

            const prefs = JSON.parse(saved);

            // Seulement si modifié récemment (< 7 jours)
            const age = Date.now() - (prefs.timestamp || 0);
            if (age < 7 * 24 * 60 * 60 * 1000) {
                this.currentScale = prefs.scale || 1.0;
                this.userHasManuallyAdjusted = prefs.manuallyAdjusted || false;
                console.log('✅ Préférences chargées:', prefs);
            }
        } catch (error) {
            console.warn('Impossible de charger les préférences:', error);
        }
    },

    /**
     * FIX SCROLL POUR TOUS LES CONTENEURS
     */
    fixScrollIssues() {
        // Forcer le scroll sur mainContent
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.style.overflowY = 'auto';
            mainContent.style.overflowX = 'hidden';
            mainContent.style.height = '100vh';
        }

        // Fix pour les tableaux
        const tables = document.querySelectorAll('.methodology-table-container');
        tables.forEach(table => {
            table.style.maxHeight = 'none';
            table.style.overflowY = 'visible';
        });

        // Le scroll est géré par le parent
        const layouts = document.querySelectorAll('.methodology-layout, .inventory-layout');
        layouts.forEach(layout => {
            layout.style.overflowY = 'auto';
            layout.style.maxHeight = 'calc(100vh - 250px)';
        });
    },

    /**
     * UTILITAIRE: INFO DEBUG
     */
    getDebugInfo() {
        return {
            breakpoint: this.currentBreakpoint,
            scale: this.currentScale,
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio,
            userAgent: navigator.userAgent
        };
    }
};

// Export global
window.ResponsiveManager = ResponsiveManager;

// Auto-init après chargement du DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ResponsiveManager.init());
} else {
    ResponsiveManager.init();
}
