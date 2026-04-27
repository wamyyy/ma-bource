// ════════════════════════════════════════════════════════
//  WAMY — sw.js  (Service Worker)
//  Strategy: Cache-First for static assets, Network for data
// ════════════════════════════════════════════════════════

const CACHE_NAME  = 'wamy-v7';
const STATIC_URLS = [
  '/',
  '/index.html',
  '/style.css',
  '/js/App.js',
  '/js/Stock.js',
  '/js/UIController.js',
  '/js/Constants.js',
  '/js/Utility.js',
  '/js/ChartController.js',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500;700&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://unpkg.com/lightweight-charts/dist/lightweight-charts.standalone.production.js'
];

// ── Install: pre-cache all static resources ────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_URLS))
  );
  self.skipWaiting();
});

// ── Activate: clean up old caches ─────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch: Cache-First strategy ───────────────────────
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request)
        .then(response => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
    })
  );
});

// ── Background Polling / Push Notifications ───────────
let currentAlerts = {};

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'UPDATE_ALERTS') {
    currentAlerts = event.data.alerts;
    
    // DEMO LOGIC: Simulate hitting the price target after 5 seconds to show the notification
    const tickers = Object.keys(currentAlerts);
    if (tickers.length > 0) {
      setTimeout(() => {
        const t = tickers[0];
        const a = currentAlerts[t];
        if (a && a.active) {
          self.registration.showNotification(`Alerte de Prix: ${t}`, {
            body: `Le cours de ${t} a atteint votre seuil de ${a.threshold} MAD.`,
            icon: 'https://ui-avatars.com/api/?name=Wamy&background=34d378&color=ffffff', // Demo icon
            vibrate: [200, 100, 200],
            data: { ticker: t }
          });
        }
      }, 5000);
    }
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  // Focus the window (or open it if closed)
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      const client = windowClients.find(c => c.visibilityState === 'visible') || windowClients[0];
      if (client) {
        return client.focus();
      } else {
        return clients.openWindow('/');
      }
    })
  );
});
