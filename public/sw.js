/* Only static assets are cached. Navigation, personalized pages and APIs are never stored. */
const CACHE = "ecorescate-static-v1";
const OFFLINE = "/offline.html";
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll([OFFLINE, "/icon.svg", "/icons/icon-192.png"])).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith("ecorescate-static-") && key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(async () => (await caches.match(OFFLINE)) || new Response("Sin conexión. Vuelve a intentarlo.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } })));
    return;
  }
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/images/") || url.pathname.startsWith("/icons/") || url.pathname === "/icon.svg") {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok && response.type === "basic") {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE).then((cache) => cache.put(request, copy)));
      }
      return response;
    })));
  }
});
