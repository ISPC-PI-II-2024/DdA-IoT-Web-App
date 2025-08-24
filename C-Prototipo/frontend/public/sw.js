// ==========================
// Service Worker básico (PWA)
// - Precache de shell mínimo
// - Runtime cache GET (network-first con fallback a cache)
// ==========================
const CACHE = "shell-v1";
const ASSETS = [
  "/", "/index.html", "/style.css",
  "/manifest.webmanifest"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener("fetch", e => {
  const { request } = e;
  if (request.method !== "GET" || request.url.startsWith("chrome-extension:")) return;
  e.respondWith(
    fetch(request).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(request, copy));
      return resp;
    }).catch(() => caches.match(request).then(r => r || caches.match("/index.html")))
  );
});
