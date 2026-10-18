// =====================================================================
// SERVICE WORKER — PLACA QR (PWA)
// =====================================================================

const CACHE_NAME = 'placaqr-cache-v1';

// Recursos essenciais do App Shell
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/favicon.svg',
  '/icons/launchericon-192x192.png',
  '/icons/launchericon-512x512.png'
];

// Instalação do Service Worker: pré-carrega os arquivos do shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    }).then(() => self.skipWaiting())
  );
});

// Ativação: limpa versões antigas do cache e assume o controle
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 1. Não intercepta esquemas não HTTP (ex: chrome-extension://)
  if (!url.protocol.startsWith('http')) return;

  // 2. CRÍTICO: NUNCA intercepta ou armazena em cache as rotas dinâmicas de redirecionamento (/r/*) e APIs (/api/*)
  // Essas rotas gravam scans em telemetria e comunicam diretamente com o backend Pages Functions / Supabase
  if (url.pathname.startsWith('/r/') || url.pathname.startsWith('/api/')) {
    return;
  }

  // 3. Para navegação de páginas (HTML): Network-first com fallback para cache e offline.html
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return networkRes;
        })
        .catch(async () => {
          const cachedRes = await caches.match(req);
          if (cachedRes) return cachedRes;

          // Se for rota da SPA (/admin, /p/:code, etc), tenta servir o index.html em cache
          const indexCached = await caches.match('/index.html');
          if (indexCached) return indexCached;

          // Fallback para página offline estilizada
          const offlineCached = await caches.match('/offline.html');
          if (offlineCached) return offlineCached;

          return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
        })
    );
    return;
  }

  // 4. Para ativos estáticos (scripts, estilos, ícones, imagens): Stale-While-Revalidate
  event.respondWith(
    caches.match(req).then((cachedRes) => {
      const fetchPromise = fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200 && req.method === 'GET') {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return networkRes;
        })
        .catch(() => cachedRes);

      return cachedRes || fetchPromise;
    })
  );
});
