const CACHE = 'kakeibo-v3';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  self.skipWaiting(); // 新しいSWを即座に有効化
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim()) // 開いているページをすぐ新SWの管理下に
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // 外部リクエスト（レートAPI / Firebase / フォント等）はキャッシュせずネットワーク優先
  if (url.includes('frankfurter') || url.includes('er-api') ||
      url.includes('firebase') || url.includes('gstatic') ||
      url.includes('googleapis')) {
    return;
  }

  // HTML（アプリ本体）は「ネットワーク優先」— 常に最新を取得、失敗時のみキャッシュ
  if (e.request.mode === 'navigate' ||
      e.request.destination === 'document' ||
      url.endsWith('/') || url.endsWith('index.html')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
          return res;
        })
        .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // その他のアセット（アイコン等）はキャッシュ優先で高速表示
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
