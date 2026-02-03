/**
 * ═══════════════════════════════════════════════════════════════════════
 * OPTIMISEUR DOM - Réduit l'INP pour les opérations DOM lourdes
 * ═══════════════════════════════════════════════════════════════════════
 */

const DOMOptimizer = {
    /**
     * Remplace innerHTML de manière optimisée (utilise requestAnimationFrame)
     * @param {HTMLElement} element - L'élément à modifier
     * @param {string} html - Le HTML à insérer
     * @param {Function} callback - Callback optionnel après insertion
     */
    setHTML(element, html, callback) {
        if (!element) {
            return;
        }

        // Utiliser requestAnimationFrame pour ne pas bloquer le thread principal
        requestAnimationFrame(() => {
            element.innerHTML = html;
            if (callback) {
                callback();
            }
        });
    },

    /**
     * Ajoute/retire des classes de manière optimisée (batch)
     * @param {HTMLElement} element - L'élément à modifier
     * @param {object} classes - {add: [], remove: [], toggle: []}
     */
    updateClasses(element, classes) {
        if (!element) {
            return;
        }

        requestAnimationFrame(() => {
            if (classes.remove) {
                element.classList.remove(...classes.remove);
            }
            if (classes.add) {
                element.classList.add(...classes.add);
            }
            if (classes.toggle) {
                classes.toggle.forEach(cls => element.classList.toggle(cls));
            }
        });
    },

    /**
     * Batch update de plusieurs éléments (plus efficace)
     * @param {Array} updates - [{element, html}, ...]
     */
    batchUpdate(updates) {
        requestAnimationFrame(() => {
            updates.forEach(({ element, html, classes }) => {
                if (html !== undefined) {
                    element.innerHTML = html;
                }
                if (classes) {
                    if (classes.remove) {
                        element.classList.remove(...classes.remove);
                    }
                    if (classes.add) {
                        element.classList.add(...classes.add);
                    }
                    if (classes.toggle) {
                        classes.toggle.forEach(cls => element.classList.toggle(cls));
                    }
                }
            });
        });
    },

    /**
     * Debounce pour les événements haute fréquence
     * @param {Function} func - Fonction à debounce
     * @param {number} wait - Délai en ms
     */
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

    /**
     * Throttle pour les événements très fréquents (scroll, resize)
     * @param {Function} func - Fonction à throttle
     * @param {number} limit - Limite en ms
     */
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

    /**
     * Ajoute un event listener optimisé (passive par défaut)
     * @param {HTMLElement} element - L'élément
     * @param {string} event - Type d'événement
     * @param {Function} handler - Gestionnaire
     * @param {object} options - Options (passive: true par défaut)
     */
    addEventListener(element, event, handler, options = {}) {
        if (!element) {
            return;
        }

        const defaultOptions = {
            passive: true, // Par défaut passive pour ne pas bloquer
            ...options
        };

        element.addEventListener(event, handler, defaultOptions);
    },

    /**
     * Optimise les querySelectorAll en cachant les résultats
     */
    _cache: new Map(),

    querySelector(selector, useCache = false) {
        if (useCache && this._cache.has(selector)) {
            return this._cache.get(selector);
        }

        const result = document.querySelector(selector);
        if (useCache) {
            this._cache.set(selector, result);
        }
        return result;
    },

    querySelectorAll(selector, useCache = false) {
        if (useCache && this._cache.has(selector)) {
            return this._cache.get(selector);
        }

        const result = document.querySelectorAll(selector);
        if (useCache) {
            this._cache.set(selector, result);
        }
        return result;
    },

    clearCache() {
        this._cache.clear();
    },

    /**
     * Effectue des modifications DOM en lot pour éviter les reflows multiples
     * @param {Function} callback - Fonction contenant les modifications DOM
     */
    batchDOMUpdate(callback) {
        // Utiliser DocumentFragment pour les insertions multiples
        requestAnimationFrame(() => {
            callback();
        });
    },

    /**
     * Désactive temporairement les transitions pendant une opération DOM lourde
     * @param {Function} callback - Opération à effectuer
     */
    withoutTransitions(callback) {
        document.body.classList.add('disable-animations');

        requestAnimationFrame(() => {
            callback();

            // Réactiver après un court délai
            setTimeout(() => {
                document.body.classList.remove('disable-animations');
            }, 50);
        });
    },

    /**
     * Charge une image de manière lazy (Intersection Observer)
     * @param {HTMLImageElement} img - Image à charger
     */
    lazyLoadImage(img) {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const image = entry.target;
                        if (image.dataset.src) {
                            image.src = image.dataset.src;
                            image.removeAttribute('data-src');
                        }
                        observer.unobserve(image);
                    }
                });
            });
            observer.observe(img);
        } else {
            // Fallback pour navigateurs anciens
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
        }
    },

    /**
     * Mesure les performances d'une opération
     * @param {string} name - Nom de l'opération
     * @param {Function} callback - Opération à mesurer
     */
    async measure(name, callback) {
        const start = performance.now();
        const result = await callback();
        const end = performance.now();
        console.log(`⚡ ${name}: ${(end - start).toFixed(2)}ms`);
        return result;
    },

    /**
     * Vérifie si un élément est visible dans le viewport
     * @param {HTMLElement} element - Élément à vérifier
     * @returns {boolean}
     */
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    /**
     * Initialise l'optimiseur
     */
    init() {
        console.log('✅ DOMOptimizer initialisé');

        // Nettoyer le cache périodiquement (toutes les 5 minutes)
        setInterval(
            () => {
                this.clearCache();
                console.log('🧹 Cache DOM nettoyé');
            },
            5 * 60 * 1000
        );
    }
};

// Auto-initialisation
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => DOMOptimizer.init());
} else {
    DOMOptimizer.init();
}

// Export global
window.DOMOptimizer = DOMOptimizer;
