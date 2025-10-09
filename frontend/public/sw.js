const CACHE_NAME = 'pwa-auth-cache-v1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;
  const isApiRequest = requestUrl.pathname.startsWith('/api/');

  if (!isSameOrigin || isApiRequest) {
    // Allow cross-origin and API requests to hit the network directly so that
    // authenticated responses are never cached and authorization can be
    // validated by the backend.
    return;
  }

  const staticDestinations = ['style', 'script', 'image', 'font', 'manifest'];
  const isDocumentRequest = event.request.mode === 'navigate';
  const isStaticAsset =
    staticDestinations.includes(event.request.destination) ||
    isDocumentRequest ||
    APP_SHELL.includes(requestUrl.pathname);

  if (!isStaticAsset) {
    // Skip caching for non-static requests (e.g., JSON, API-like data) so they
    // always consult the network and preserve auth semantics.
    return;
  }

  if (isDocumentRequest) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clonedResponse = response.clone();
            caches.open(CACHE_NAME).then((cache) =>
              cache.put('/index.html', clonedResponse)
            );
          }

          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return caches.open(CACHE_NAME).then((cache) =>
        fetch(event.request).then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            cache.put(event.request, response.clone());
          }

          return response;
        })
      );
    })
  );
});
