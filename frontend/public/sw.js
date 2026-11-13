const CACHE_NAME = 'goldenprime-v2';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(Promise.all([
    caches.delete('goldenprime-v1'),
    self.clients.claim(),
  ]));
});
