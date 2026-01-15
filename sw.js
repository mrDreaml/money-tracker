const CACHE_NAME = "v1";

self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...");

  // delete old cache
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log(`clean old cache: ${name}`);
            return caches.delete(name);
          })
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(request).then((responseNew) => {
        caches
          .open(CACHE_NAME)
          .then((cache) => cache.put(request, responseNew));
        return responseNew.clone();
      });
    })
  );
});

console.log(self);
