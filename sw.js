const CACHE_NAME = 'studentfin-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
  // Tambahkan file CSS/JS utama Anda di sini jika ada
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch data dari cache jika offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
