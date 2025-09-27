self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Basic offline fallback to serve cached assets if desired.
self.addEventListener('fetch', () => {
  // In a production app you would add caching strategies here.
});
