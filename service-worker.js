/* Manifest version: BZPiOa4I */
// Service Worker for Published PWA
self.addEventListener('install', event => event.waitUntil(onInstall(event)));
self.addEventListener('activate', event => event.waitUntil(onActivate(event)));
self.addEventListener('fetch', event => event.respondWith(onFetch(event)));

const cacheNamePrefix = 'offline-cache-';
const cacheName = `${cacheNamePrefix}${self.assetsManifest ? self.assetsManifest.version : 'v1'}`;

async function onInstall(event) {
    console.log('Service worker installing...');
    self.skipWaiting();
}

async function onActivate(event) {
    console.log('Service worker activating...');
    const cacheKeys = await caches.keys();
    await Promise.all(
        cacheKeys
            .filter(key => key.startsWith(cacheNamePrefix) && key !== cacheName)
            .map(key => caches.delete(key))
    );
}

async function onFetch(event) {
    if (event.request.method !== 'GET') {
        return fetch(event.request);
    }

    try {
        // Fetch network resource without strict integrity checks
        return await fetch(event.request);
    } catch (error) {
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
            return cachedResponse;
        }
        return fetch(event.request);
    }
}