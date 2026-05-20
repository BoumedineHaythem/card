const CACHE_NAME = 'neobank-v1.0.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) return cachedResponse;
            return caches.match('/index.html');
          });
      })
  );
});

// Background sync for offline transactions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncTransactions());
  }
});

async function syncTransactions() {
  console.log('[SW] Syncing pending transactions...');
}

// Push notifications
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' },
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };
  event.waitUntil(
    self.registration.showNotification(data.title || 'NeoBank', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'view') {
    clients.openWindow(event.notification.data.url);
  }
});
