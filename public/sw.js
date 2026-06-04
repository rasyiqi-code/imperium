const CACHE_NAME = 'imperium-pwa-cache-v1';
const OFFLINE_URL = '/offline';

const ASSETS_TO_CACHE = [
  OFFLINE_URL,
  '/favicon.ico',
  '/logo.webp',
  '/icon.png',
];

// Tahap Install: Cache aset-aset penting awal dan halaman offline fallback
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('PWA Service Worker: Membuka cache dan melakukan pre-cache...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Tahap Aktifasi: Bersihkan cache lama yang tidak cocok dengan versi CACHE_NAME baru
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('PWA Service Worker: Menghapus cache usang:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Intersepsi Request (Fetch)
self.addEventListener('fetch', (event) => {
  // Hanya intercept HTTP/HTTPS GET request
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Lewati intersepsi untuk rute API, Webhook, Cron, dan admin panel
  const url = new URL(event.request.url);
  if (
    url.pathname.startsWith('/api/') || 
    url.pathname.startsWith('/admin-panel') ||
    url.pathname.includes('_next/webpack-hmr')
  ) {
    return;
  }

  // Gunakan Network-First dengan Cache-Fallback untuk rute navigasi halaman
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Simpan respons terbaru ke dalam cache jika sukses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Jika offline/jaringan gagal, cari di cache
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Jika tidak ada di cache sama sekali, arahkan ke halaman offline fallback
            return caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // Gunakan Cache-First dengan Network-Fallback untuk aset statis (CSS, JS, Gambar, Font)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Coba perbarui cache di latar belakang (stale-while-revalidate)
        fetch(event.request)
          .then((response) => {
            if (response.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response));
            }
          })
          .catch(() => {/* Abaikan error pembaruan jika offline */});
          
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      });
    })
  );
});
