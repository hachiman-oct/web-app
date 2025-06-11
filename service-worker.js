self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('mp3-player-cache').then((cache) => {
            return cache.addAll([
                '/web-app/',
                '/web-app/index.html',
                '/web-app/manifest.json',
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
