const CACHE_VERSION = 'v2';
const CACHE_NAME = `pwa-auth-cache-${CACHE_VERSION}`;
const APP_SHELL = ['/', '/index.html', '/manifest.json', '/icons/icon.svg'];

const addToCache = async (request, response) => {
  if (response && response.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response);
  }
};

const cacheFirst = async (request) => {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  const networkResponse = await fetch(request);
  addToCache(request, networkResponse.clone());

  return networkResponse;
};

const networkFirst = async (request) => {
  try {
    const networkResponse = await fetch(request);
    addToCache(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    if (request.mode === 'navigate') {
      return caches.match('/index.html');
    }

    throw error;
  }
};

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
        Promise.all(keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : null)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const isSameOrigin = request.url.startsWith(self.location.origin);

  if (!isSameOrigin) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  const assetTypes = ['style', 'script', 'worker', 'font'];

  if (assetTypes.includes(request.destination)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});
