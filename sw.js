const CACHE_NAME = 'kantongpelajar-v2';

// Daftar asset utama yang akan di-cache untuk keperluan offline
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// 1. Install Event: Simpan asset dasar & langsung aktifkan SW baru
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Memaksa Service Worker baru langsung mengambil alih tanpa menunggu tab ditutup
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

// 2. Activate Event: Hapus SEMUA cache versi lama secara otomatis
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Memhapus Cache Lama:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // Langsung mengontrol seluruh halaman yang terbuka
  );
});

// 3. Fetch Event: Tampilkan cache cepat, tapi ambil versi TERBARU dari internet di background
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Abaikan request non-GET dan request API external (seperti Supabase)
  if (request.method !== 'GET' || request.url.includes('supabase.co')) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(request).then((cachedResponse) => {
        // Ambil versi terbaru dari jaringan (network)
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            // Jika berhasil dan respon valid, perbarui cache dengan file terbaru
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            // Jika offline dan network gagal, abaikan error agar tetap pakai cachedResponse
          });

        // Kembalikan respon dari cache jika ada, jika tidak tunggu hasil dari network
        return cachedResponse || fetchPromise;
      });
    })
  );
});
