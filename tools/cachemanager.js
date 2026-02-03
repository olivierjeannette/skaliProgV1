// Gestionnaire de cache et mémoire - Skali Prog
const CacheManager = {
    // Configuration
    config: {
        maxCacheSize: 50 * 1024 * 1024, // 50MB
        maxItems: 1000,
        autoCleanup: true,
        cleanupInterval: 300000, // 5 minutes
        warningThreshold: 0.8 // 80% de la limite
    },

    // Statistiques du cache
    stats: {
        totalSize: 0,
        itemCount: 0,
        lastCleanup: null,
        cleanupCount: 0
    },

    // Initialiser le gestionnaire de cache
    init() {
        console.log('🗄️ Initialisation du CacheManager...');
        this.loadStats();
        this.startAutoCleanup();
        this.createCacheUI();
        this.updateStats();
    },

    // Créer l'interface utilisateur du cache
    createCacheUI() {
        // Vérifier si l'UI existe déjà
        if (document.getElementById('cacheManagerUI')) {
            return;
        }

        // Créer le bouton de cache dans le header
        const header = document.querySelector('.header, .navbar, .top-bar');
        if (header) {
            const cacheButton = document.createElement('button');
            cacheButton.id = 'cacheManagerButton';
            cacheButton.className =
                'bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center';
            cacheButton.innerHTML = `
                <i class="fas fa-memory mr-2"></i>
                <span id="cacheStatus">Cache</span>
            `;
            cacheButton.onclick = () => this.toggleCachePanel();
            header.appendChild(cacheButton);
        }

        // Créer le panneau de cache
        const cachePanel = document.createElement('div');
        cachePanel.id = 'cacheManagerUI';
        cachePanel.className =
            'fixed top-20 right-4 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50 hidden w-80';
        cachePanel.innerHTML = `
            <div class="p-4">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold text-white">
                        <i class="fas fa-memory mr-2"></i>Gestion du Cache
                    </h3>
                    <button onclick="CacheManager.toggleCachePanel()" 
                            class="text-gray-400 hover:text-white">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <!-- Statistiques -->
                <div class="space-y-3 mb-4">
                    <div class="bg-gray-700 rounded-lg p-3">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-sm text-gray-300">Taille du cache</span>
                            <span id="cacheSize" class="text-sm font-semibold text-white">0 MB</span>
                        </div>
                        <div class="w-full bg-gray-600 rounded-full h-2">
                            <div id="cacheProgress" class="bg-blue-500 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3">
                        <div class="bg-gray-700 rounded-lg p-3">
                            <div class="text-xs text-gray-400 mb-1">Éléments</div>
                            <div id="cacheItems" class="text-lg font-semibold text-white">0</div>
                        </div>
                        <div class="bg-gray-700 rounded-lg p-3">
                            <div class="text-xs text-gray-400 mb-1">Nettoyages</div>
                            <div id="cacheCleanups" class="text-lg font-semibold text-white">0</div>
                        </div>
                    </div>
                </div>
                
                <!-- Actions -->
                <div class="space-y-2">
                    <button onclick="CacheManager.clearAllCache()" 
                            class="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center">
                        <i class="fas fa-trash mr-2"></i>Vider le Cache
                    </button>
                    
                    <button onclick="CacheManager.clearOldCache()" 
                            class="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center">
                        <i class="fas fa-broom mr-2"></i>Nettoyer l'Ancien
                    </button>
                    
                    <button onclick="CacheManager.optimizeCache()" 
                            class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center">
                        <i class="fas fa-magic mr-2"></i>Optimiser
                    </button>
                    
                    <button onclick="CacheManager.exportCacheInfo()" 
                            class="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center">
                        <i class="fas fa-download mr-2"></i>Exporter Info
                    </button>
                </div>
                
                <!-- Informations système -->
                <div class="mt-4 pt-4 border-t border-gray-700">
                    <div class="text-xs text-gray-400 space-y-1">
                        <div>Limite: ${this.formatBytes(this.config.maxCacheSize)}</div>
                        <div>Dernier nettoyage: <span id="lastCleanup">Jamais</span></div>
                        <div>Auto-nettoyage: <span id="autoCleanupStatus">Activé</span></div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(cachePanel);
    },

    // Basculer l'affichage du panneau de cache
    toggleCachePanel() {
        const panel = document.getElementById('cacheManagerUI');
        if (panel) {
            panel.classList.toggle('hidden');
            if (!panel.classList.contains('hidden')) {
                this.updateStats();
            }
        }
    },

    // Vider complètement le cache
    clearAllCache() {
        if (
            confirm(
                'Êtes-vous sûr de vouloir vider complètement le cache ? Cette action est irréversible.'
            )
        ) {
            console.log('🗑️ Vidage complet du cache...');

            try {
                // Vider localStorage
                const keysToKeep = ['auth', 'userRole', 'tenantId', 'userId', 'theme'];
                const allKeys = Object.keys(localStorage);
                allKeys.forEach(key => {
                    if (!keysToKeep.includes(key)) {
                        localStorage.removeItem(key);
                    }
                });

                // Vider sessionStorage
                const sessionKeysToKeep = ['auth', 'userRole', 'currentView'];
                const allSessionKeys = Object.keys(sessionStorage);
                allSessionKeys.forEach(key => {
                    if (!sessionKeysToKeep.includes(key)) {
                        sessionStorage.removeItem(key);
                    }
                });

                // Vider le cache des images
                this.clearImageCache();

                // Vider le cache des données
                this.clearDataCache();

                // Réinitialiser les statistiques
                this.stats = {
                    totalSize: 0,
                    itemCount: 0,
                    lastCleanup: new Date(),
                    cleanupCount: this.stats.cleanupCount + 1
                };

                this.saveStats();
                this.updateStats();

                // Notification de succès
                this.showNotification('Cache vidé avec succès', 'success');

                // Redémarrer l'application si nécessaire
                setTimeout(() => {
                    if (
                        confirm(
                            "Voulez-vous redémarrer l'application pour optimiser les performances ?"
                        )
                    ) {
                        window.location.reload();
                    }
                }, 1000);
            } catch (error) {
                console.error('❌ Erreur lors du vidage du cache:', error);
                this.showNotification('Erreur lors du vidage du cache', 'error');
            }
        }
    },

    // Nettoyer l'ancien cache
    clearOldCache() {
        console.log("🧹 Nettoyage de l'ancien cache...");

        try {
            const now = Date.now();
            const maxAge = 24 * 60 * 60 * 1000; // 24 heures
            let cleanedCount = 0;

            // Nettoyer localStorage
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('cache_') || key.startsWith('temp_')) {
                    const item = localStorage.getItem(key);
                    if (item) {
                        try {
                            const data = JSON.parse(item);
                            if (data.timestamp && now - data.timestamp > maxAge) {
                                localStorage.removeItem(key);
                                cleanedCount++;
                            }
                        } catch (e) {
                            // Si ce n'est pas du JSON, supprimer si c'est ancien
                            localStorage.removeItem(key);
                            cleanedCount++;
                        }
                    }
                }
            });

            // Nettoyer sessionStorage
            Object.keys(sessionStorage).forEach(key => {
                if (key.startsWith('cache_') || key.startsWith('temp_')) {
                    sessionStorage.removeItem(key);
                    cleanedCount++;
                }
            });

            this.stats.cleanupCount++;
            this.stats.lastCleanup = new Date();
            this.saveStats();
            this.updateStats();

            this.showNotification(`${cleanedCount} éléments anciens supprimés`, 'success');
        } catch (error) {
            console.error('❌ Erreur lors du nettoyage:', error);
            this.showNotification('Erreur lors du nettoyage', 'error');
        }
    },

    // Optimiser le cache
    optimizeCache() {
        console.log('⚡ Optimisation du cache...');

        try {
            // Compresser les données volumineuses
            this.compressLargeData();

            // Supprimer les doublons
            this.removeDuplicates();

            // Réorganiser le cache
            this.reorganizeCache();

            this.stats.cleanupCount++;
            this.stats.lastCleanup = new Date();
            this.saveStats();
            this.updateStats();

            this.showNotification('Cache optimisé avec succès', 'success');
        } catch (error) {
            console.error("❌ Erreur lors de l'optimisation:", error);
            this.showNotification("Erreur lors de l'optimisation", 'error');
        }
    },

    // Vider le cache des images
    clearImageCache() {
        // Supprimer les images en cache
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (img.src.startsWith('blob:')) {
                URL.revokeObjectURL(img.src);
            }
        });

        // Vider le cache du navigateur si possible
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => {
                    caches.delete(name);
                });
            });
        }
    },

    // Vider le cache des données
    clearDataCache() {
        // Vider les caches des différents gestionnaires
        if (typeof DataManager !== 'undefined' && DataManager.clearCache) {
            DataManager.clearCache();
        }

        if (typeof MemberManager !== 'undefined' && MemberManager.clearCache) {
            MemberManager.clearCache();
        }

        if (typeof TeamBuilder !== 'undefined' && TeamBuilder.clearCache) {
            TeamBuilder.clearCache();
        }

        if (typeof PerformanceManager !== 'undefined' && PerformanceManager.clearCache) {
            PerformanceManager.clearCache();
        }
    },

    // Compresser les données volumineuses
    compressLargeData() {
        Object.keys(localStorage).forEach(key => {
            const item = localStorage.getItem(key);
            if (item && item.length > 10000) {
                // Plus de 10KB
                try {
                    const data = JSON.parse(item);
                    if (data && typeof data === 'object') {
                        // Compression simple : supprimer les propriétés vides
                        const compressed = this.compressObject(data);
                        localStorage.setItem(key, JSON.stringify(compressed));
                    }
                } catch (e) {
                    // Ignorer les erreurs de parsing
                }
            }
        });
    },

    // Compresser un objet
    compressObject(obj) {
        if (Array.isArray(obj)) {
            return obj.map(item => this.compressObject(item));
        } else if (obj && typeof obj === 'object') {
            const compressed = {};
            Object.keys(obj).forEach(key => {
                const value = obj[key];
                if (value !== null && value !== undefined && value !== '') {
                    compressed[key] = this.compressObject(value);
                }
            });
            return compressed;
        }
        return obj;
    },

    // Supprimer les doublons
    removeDuplicates() {
        const seen = new Set();
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('cache_')) {
                const item = localStorage.getItem(key);
                if (seen.has(item)) {
                    localStorage.removeItem(key);
                } else {
                    seen.add(item);
                }
            }
        });
    },

    // Réorganiser le cache
    reorganizeCache() {
        // Trier les éléments par taille et supprimer les plus gros si nécessaire
        const items = [];
        Object.keys(localStorage).forEach(key => {
            const item = localStorage.getItem(key);
            if (item) {
                items.push({ key, size: item.length });
            }
        });

        items.sort((a, b) => b.size - a.size);

        // Supprimer les 10% plus gros éléments si on dépasse la limite
        const maxItems = Math.floor(items.length * 0.9);
        if (items.length > maxItems) {
            for (let i = maxItems; i < items.length; i++) {
                localStorage.removeItem(items[i].key);
            }
        }
    },

    // Démarrer le nettoyage automatique
    startAutoCleanup() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }

        this.cleanupTimer = setInterval(() => {
            this.autoCleanup();
        }, this.config.cleanupInterval);
    },

    // Nettoyage automatique
    autoCleanup() {
        const currentSize = this.calculateCacheSize();
        const usageRatio = currentSize / this.config.maxCacheSize;

        if (usageRatio > this.config.warningThreshold) {
            console.log('⚠️ Cache proche de la limite, nettoyage automatique...');
            this.clearOldCache();
        }
    },

    // Calculer la taille du cache
    calculateCacheSize() {
        let totalSize = 0;

        // Taille localStorage
        Object.keys(localStorage).forEach(key => {
            const item = localStorage.getItem(key);
            if (item) {
                totalSize += item.length;
            }
        });

        // Taille sessionStorage
        Object.keys(sessionStorage).forEach(key => {
            const item = sessionStorage.getItem(key);
            if (item) {
                totalSize += item.length;
            }
        });

        return totalSize;
    },

    // Mettre à jour les statistiques
    updateStats() {
        this.stats.totalSize = this.calculateCacheSize();
        this.stats.itemCount =
            Object.keys(localStorage).length + Object.keys(sessionStorage).length;

        // Mettre à jour l'UI
        const sizeEl = document.getElementById('cacheSize');
        const progressEl = document.getElementById('cacheProgress');
        const itemsEl = document.getElementById('cacheItems');
        const cleanupsEl = document.getElementById('cacheCleanups');
        const lastCleanupEl = document.getElementById('lastCleanup');
        const statusEl = document.getElementById('cacheStatus');

        if (sizeEl) {
            sizeEl.textContent = this.formatBytes(this.stats.totalSize);
        }

        if (progressEl) {
            const percentage = (this.stats.totalSize / this.config.maxCacheSize) * 100;
            progressEl.style.width = `${Math.min(percentage, 100)}%`;

            // Changer la couleur selon l'utilisation
            if (percentage > 80) {
                progressEl.className = 'bg-red-500 h-2 rounded-full transition-all duration-300';
            } else if (percentage > 60) {
                progressEl.className = 'bg-orange-500 h-2 rounded-full transition-all duration-300';
            } else {
                progressEl.className = 'bg-blue-500 h-2 rounded-full transition-all duration-300';
            }
        }

        if (itemsEl) {
            itemsEl.textContent = this.stats.itemCount;
        }

        if (cleanupsEl) {
            cleanupsEl.textContent = this.stats.cleanupCount;
        }

        if (lastCleanupEl) {
            lastCleanupEl.textContent = this.stats.lastCleanup
                ? this.formatDate(this.stats.lastCleanup)
                : 'Jamais';
        }

        if (statusEl) {
            const percentage = (this.stats.totalSize / this.config.maxCacheSize) * 100;
            if (percentage > 80) {
                statusEl.textContent = 'Cache plein';
                statusEl.parentElement.className =
                    'bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center';
            } else if (percentage > 60) {
                statusEl.textContent = 'Cache élevé';
                statusEl.parentElement.className =
                    'bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center';
            } else {
                statusEl.textContent = 'Cache OK';
                statusEl.parentElement.className =
                    'bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center';
            }
        }
    },

    // Formater les bytes
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // Formater la date
    formatDate(date) {
        return new Intl.DateTimeFormat('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit'
        }).format(date);
    },

    // Sauvegarder les statistiques
    saveStats() {
        localStorage.setItem('cacheStats', JSON.stringify(this.stats));
    },

    // Charger les statistiques
    loadStats() {
        const saved = localStorage.getItem('cacheStats');
        if (saved) {
            try {
                this.stats = { ...this.stats, ...JSON.parse(saved) };
            } catch (e) {
                console.warn('⚠️ Impossible de charger les statistiques du cache');
            }
        }
    },

    // Exporter les informations du cache
    exportCacheInfo() {
        const info = {
            timestamp: new Date().toISOString(),
            stats: this.stats,
            config: this.config,
            localStorage: Object.keys(localStorage).length,
            sessionStorage: Object.keys(sessionStorage).length,
            userAgent: navigator.userAgent,
            memory: performance.memory
                ? {
                      used: performance.memory.usedJSHeapSize,
                      total: performance.memory.totalJSHeapSize,
                      limit: performance.memory.jsHeapSizeLimit
                  }
                : null
        };

        const blob = new Blob([JSON.stringify(info, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cache-info-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Informations du cache exportées', 'success');
    },

    // Afficher une notification
    showNotification(message, type) {
        const notification = document.createElement('div');
        const colors = {
            success: 'bg-green-600',
            error: 'bg-red-600',
            info: 'bg-blue-600',
            warning: 'bg-orange-600'
        };

        notification.className = `fixed bottom-4 right-4 ${colors[type]} text-white px-4 py-2 rounded-lg shadow-lg z-50`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : type === 'warning' ? 'exclamation-triangle' : 'info'}-circle mr-2"></i>
            ${message}
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    },

    // Détruire le gestionnaire de cache
    destroy() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }

        const panel = document.getElementById('cacheManagerUI');
        if (panel) {
            panel.remove();
        }

        const button = document.getElementById('cacheManagerButton');
        if (button) {
            button.remove();
        }
    }
};

// Initialiser automatiquement
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
        setTimeout(() => {
            CacheManager.init();
        }, 1000);
    });
}
