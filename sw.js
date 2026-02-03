/**
 * SERVICE WORKER - DÉSACTIVÉ
 * Le cache causait des problèmes de chargement de vieux CSS
 * Pour usage local, le Service Worker n'est pas nécessaire
 */

console.log('[SW] Service Worker désactivé - Mode sans cache');

// Désinstaller immédiatement
self.addEventListener('install', event => {
    console.log('[SW] Installation... (désactivé, pas de cache)');
    self.skipWaiting();
});

// DÉSACTIVÉ - Pas de cache
const CACHE_NAME = 'skali-prog-disabled';
const urlsToCache = [];

// Activation du Service Worker
self.addEventListener('activate', event => {
    console.log('[SW] Activation...');

    event.waitUntil(
        caches
            .keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[SW] Suppression ancien cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Stratégie de fetch : Network First, puis Cache
self.addEventListener('fetch', event => {
    // ❌ CACHE DÉSACTIVÉ - Toujours charger depuis le réseau
    // Pas de cache = pas de problème de vieux fichiers
    event.respondWith(fetch(event.request));
});

// Écouter les messages du client
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('[SW] Service Worker chargé');
