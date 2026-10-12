const CACHE_NAME = "v6";
const SCOPE = "/money-tracker/";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // Don't intercept cross-origin (fonts, CDN) — avoids failed fetch → broken respondWith
  if (url.origin !== self.location.origin) {
    return;
  }

  // Never cache the service worker itself
  if (url.pathname.endsWith("/sw.js")) {
    return;
  }

  event.respondWith(networkFirst(request));
});

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok && request.url.startsWith(self.location.origin + SCOPE)) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // Always return a real Response — undefined here caused reload loops
    return new Response("Offline", {
      status: 503,
      statusText: "Service Unavailable",
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
