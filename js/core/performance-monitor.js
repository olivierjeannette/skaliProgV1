/**
 * ═══════════════════════════════════════════════════════════════════════
 * MONITEUR DE PERFORMANCE - Mesure INP, LCP, CLS, FID
 * ═══════════════════════════════════════════════════════════════════════
 */

const PerformanceMonitor = {
    metrics: {
        INP: null,
        LCP: null,
        FID: null,
        CLS: null,
        TTFB: null
    },

    /**
     * Initialise le monitoring des Core Web Vitals
     */
    init() {
        console.log('📊 PerformanceMonitor initialisé');

        // Mesurer INP (Interaction to Next Paint)
        this.measureINP();

        // Mesurer LCP (Largest Contentful Paint)
        this.measureLCP();

        // Mesurer CLS (Cumulative Layout Shift)
        this.measureCLS();

        // Mesurer FID (First Input Delay)
        this.measureFID();

        // Mesurer TTFB (Time to First Byte)
        this.measureTTFB();

        // Afficher un résumé après 5 secondes
        setTimeout(() => {
            this.displaySummary();
        }, 5000);
    },

    /**
     * Mesure l'INP (Interaction to Next Paint)
     */
    measureINP() {
        // INP = mesure du temps de réponse aux interactions
        let worstINP = 0;
        let interactionCount = 0;

        const measureInteraction = event => {
            const startTime = performance.now();

            requestAnimationFrame(() => {
                const endTime = performance.now();
                const duration = endTime - startTime;

                interactionCount++;
                if (duration > worstINP) {
                    worstINP = duration;
                    this.metrics.INP = Math.round(worstINP);

                    // Log si > 200ms (mauvais)
                    if (worstINP > 200) {
                        console.warn(`⚠️ INP élevé: ${Math.round(worstINP)}ms sur ${event.type}`);
                    }
                }
            });
        };

        // Écouter les interactions principales
        ['click', 'keydown', 'pointerdown'].forEach(eventType => {
            document.addEventListener(eventType, measureInteraction, {
                passive: true,
                capture: true
            });
        });

        console.log('✅ Monitoring INP actif');
    },

    /**
     * Mesure le LCP (Largest Contentful Paint)
     */
    measureLCP() {
        if (!window.PerformanceObserver) {
            return;
        }

        try {
            const observer = new PerformanceObserver(list => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.LCP = Math.round(lastEntry.renderTime || lastEntry.loadTime);

                // Log si > 2.5s (mauvais)
                if (this.metrics.LCP > 2500) {
                    console.warn(`⚠️ LCP lent: ${this.metrics.LCP}ms`);
                } else {
                    console.log(`✅ LCP: ${this.metrics.LCP}ms`);
                }
            });

            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
            console.log('ℹ️ LCP monitoring non disponible');
        }
    },

    /**
     * Mesure le CLS (Cumulative Layout Shift)
     */
    measureCLS() {
        if (!window.PerformanceObserver) {
            return;
        }

        try {
            let clsValue = 0;

            const observer = new PerformanceObserver(list => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                        this.metrics.CLS = Math.round(clsValue * 1000) / 1000;

                        // Log si > 0.1 (mauvais)
                        if (clsValue > 0.1) {
                            console.warn(`⚠️ CLS élevé: ${this.metrics.CLS}`);
                        }
                    }
                }
            });

            observer.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
            console.log('ℹ️ CLS monitoring non disponible');
        }
    },

    /**
     * Mesure le FID (First Input Delay)
     */
    measureFID() {
        if (!window.PerformanceObserver) {
            return;
        }

        try {
            const observer = new PerformanceObserver(list => {
                for (const entry of list.getEntries()) {
                    this.metrics.FID = Math.round(entry.processingStart - entry.startTime);

                    // Log si > 100ms (mauvais)
                    if (this.metrics.FID > 100) {
                        console.warn(`⚠️ FID élevé: ${this.metrics.FID}ms`);
                    } else {
                        console.log(`✅ FID: ${this.metrics.FID}ms`);
                    }
                }
            });

            observer.observe({ entryTypes: ['first-input'] });
        } catch (e) {
            console.log('ℹ️ FID monitoring non disponible');
        }
    },

    /**
     * Mesure le TTFB (Time to First Byte)
     */
    measureTTFB() {
        if (window.performance && window.performance.timing) {
            const { responseStart, requestStart } = window.performance.timing;
            this.metrics.TTFB = Math.round(responseStart - requestStart);

            if (this.metrics.TTFB > 600) {
                console.warn(`⚠️ TTFB lent: ${this.metrics.TTFB}ms`);
            } else {
                console.log(`✅ TTFB: ${this.metrics.TTFB}ms`);
            }
        }
    },

    /**
     * Affiche un résumé des performances
     */
    displaySummary() {
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('📊 RÉSUMÉ DES PERFORMANCES (Core Web Vitals)');
        console.log('═══════════════════════════════════════════════════════');

        // INP
        if (this.metrics.INP !== null) {
            const inpStatus =
                this.metrics.INP <= 200
                    ? '✅ BON'
                    : this.metrics.INP <= 500
                      ? '⚠️ MOYEN'
                      : '❌ MAUVAIS';
            console.log(`INP (Interaction to Next Paint): ${this.metrics.INP}ms ${inpStatus}`);
            console.log('  → Objectif: < 200ms | Limite: < 500ms');
        }

        // LCP
        if (this.metrics.LCP !== null) {
            const lcpStatus =
                this.metrics.LCP <= 2500
                    ? '✅ BON'
                    : this.metrics.LCP <= 4000
                      ? '⚠️ MOYEN'
                      : '❌ MAUVAIS';
            console.log(`LCP (Largest Contentful Paint): ${this.metrics.LCP}ms ${lcpStatus}`);
            console.log('  → Objectif: < 2.5s | Limite: < 4s');
        }

        // FID
        if (this.metrics.FID !== null) {
            const fidStatus =
                this.metrics.FID <= 100
                    ? '✅ BON'
                    : this.metrics.FID <= 300
                      ? '⚠️ MOYEN'
                      : '❌ MAUVAIS';
            console.log(`FID (First Input Delay): ${this.metrics.FID}ms ${fidStatus}`);
            console.log('  → Objectif: < 100ms | Limite: < 300ms');
        }

        // CLS
        if (this.metrics.CLS !== null) {
            const clsStatus =
                this.metrics.CLS <= 0.1
                    ? '✅ BON'
                    : this.metrics.CLS <= 0.25
                      ? '⚠️ MOYEN'
                      : '❌ MAUVAIS';
            console.log(`CLS (Cumulative Layout Shift): ${this.metrics.CLS} ${clsStatus}`);
            console.log('  → Objectif: < 0.1 | Limite: < 0.25');
        }

        // TTFB
        if (this.metrics.TTFB !== null) {
            const ttfbStatus =
                this.metrics.TTFB <= 600
                    ? '✅ BON'
                    : this.metrics.TTFB <= 1500
                      ? '⚠️ MOYEN'
                      : '❌ MAUVAIS';
            console.log(`TTFB (Time to First Byte): ${this.metrics.TTFB}ms ${ttfbStatus}`);
            console.log('  → Objectif: < 600ms | Limite: < 1500ms');
        }

        console.log('═══════════════════════════════════════════════════════\n');

        // Recommandations
        this.provideRecommendations();
    },

    /**
     * Fournit des recommandations basées sur les métriques
     */
    provideRecommendations() {
        const recommendations = [];

        if (this.metrics.INP > 200) {
            recommendations.push('• Réduire le JavaScript bloquant sur les interactions');
            recommendations.push('• Utiliser requestAnimationFrame pour les mises à jour DOM');
            recommendations.push('• Activer le mode performance (désactiver animations)');
        }

        if (this.metrics.LCP > 2500) {
            recommendations.push('• Optimiser le chargement des images critiques');
            recommendations.push('• Précharger les ressources importantes');
            recommendations.push('• Réduire la taille des fichiers CSS/JS');
        }

        if (this.metrics.CLS > 0.1) {
            recommendations.push('• Définir des dimensions explicites pour les images');
            recommendations.push("• Éviter d'insérer du contenu au-dessus du contenu existant");
        }

        if (this.metrics.FID > 100) {
            recommendations.push("• Réduire le temps d'exécution JavaScript");
            recommendations.push('• Fragmenter les tâches longues');
        }

        if (recommendations.length > 0) {
            console.log("💡 RECOMMANDATIONS D'OPTIMISATION:");
            recommendations.forEach(rec => console.log(rec));
            console.log('');
        }
    },

    /**
     * Log une opération longue (> 50ms)
     * @param taskName
     * @param duration
     */
    logLongTask(taskName, duration) {
        if (duration > 50) {
            console.warn(`⚠️ Tâche longue détectée: ${taskName} (${Math.round(duration)}ms)`);
        }
    },

    /**
     * Wrapper pour mesurer une fonction
     * @param name
     * @param fn
     */
    async measureFunction(name, fn) {
        const start = performance.now();
        const result = await fn();
        const duration = performance.now() - start;

        this.logLongTask(name, duration);
        return result;
    }
};

// Auto-initialisation
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PerformanceMonitor.init());
} else {
    PerformanceMonitor.init();
}

// Export global
window.PerformanceMonitor = PerformanceMonitor;
