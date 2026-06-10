const CACHE_NAME = 'achados-st-v2'; // Alterado para v2 para forçar atualização
const ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/script.js',
  '/js/firebase.js',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Força o novo service worker a assumir imediatamente
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache); // Deleta o cache antigo (v1)
          }
        })
      );
    })
  );
});

// Estratégia: Stale-While-Revalidate
// Retorna do cache se existir, mas vai na rede buscar a versão mais nova e atualiza o cache no fundo.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        // Se for uma requisição válida e for da nossa origem, atualiza o cache
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, networkResponse.clone());
            });
        }
        return networkResponse;
      });
      return cachedResponse || fetchPromise;
    })
  );
});
