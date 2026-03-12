// Vestige GPS — Service Worker
// Strategy:
//   Static assets (JS/CSS/images/audio) → Cache-first (immutable hashed filenames)
//   index.html → Network-first (pick up new deploys)
//   API calls (/auth, /save, /nodes, etc.) → Network-only (don't cache API)
//   OSM/tile fetches → Cache-first with network fallback

const CACHE_VERSION = 'vestige-v11';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const TILE_CACHE = `${CACHE_VERSION}-tiles`;

const PRECACHE_URLS = [
    './',
    './index.html',
    './manifest.webmanifest',
];

// ============================================
// INSTALL — pre-cache shell
// ============================================
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting())
    );
});

// ============================================
// ACTIVATE — purge old caches
// ============================================
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key.startsWith('vestige-') && !key.startsWith(CACHE_VERSION))
                    .map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

// ============================================
// FETCH
// ============================================
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Skip non-GET
    if (event.request.method !== 'GET') return;
    // Skip WebSocket
    if (event.request.headers.get('upgrade') === 'websocket') return;

    // API calls — network only, don't cache
    if (url.pathname.startsWith('/auth/') ||
        url.pathname.startsWith('/player') ||
        url.pathname.startsWith('/save') ||
        url.pathname.startsWith('/safehouse') ||
        url.pathname.startsWith('/nodes/') ||
        url.pathname.startsWith('/mission/') ||
        url.pathname.startsWith('/inventory') ||
        url.pathname.startsWith('/route/') ||
        url.pathname.startsWith('/health') ||
        url.pathname.startsWith('/presence')) {
        return; // Let browser handle normally
    }

    // Tile data (OSM, MS Buildings) — cache-first
    if (url.pathname.startsWith('/buildings/tile/') ||
        url.hostname.includes('overpass-api') ||
        url.hostname.includes('tile.openstreetmap') ||
        url.hostname.includes('raw.githubusercontent.com') ||
        (url.hostname.includes('lattymoy.github.io') && (url.pathname.endsWith('.json') || url.pathname.includes('/buildings/')))) {
        event.respondWith(cacheFirst(event.request, TILE_CACHE));
        return;
    }

    // index.html — network-first (picks up new deploys)
    if (event.request.mode === 'navigate' ||
        url.pathname === '/' ||
        url.pathname === '/index.html') {
        event.respondWith(networkFirst(event.request, STATIC_CACHE));
        return;
    }

    // All other static assets (JS chunks, audio, vehicle PNGs) — cache-first
    // Vite hashes filenames so cached versions are always correct
    event.respondWith(cacheFirst(event.request, STATIC_CACHE));
});

// ============================================
// STRATEGIES
// ============================================
async function cacheFirst(request, cacheName) {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch (err) {
        // Offline and not cached — return offline fallback
        return new Response('Offline', { status: 503 });
    }
}

async function networkFirst(request, cacheName) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch (err) {
        const cached = await caches.match(request);
        if (cached) return cached;
        return new Response('Offline', { status: 503 });
    }
}
