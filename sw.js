const CACHE = 'kakeibo-v1';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('frankfurter') || e.request.url.includes('er-api')) return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
