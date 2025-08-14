const CACHE_NAME = "gold-rock-v1.0.0";
const STATIC_CACHE = "gold-rock-static-v1.0.0";
const DYNAMIC_CACHE = "gold-rock-dynamic-v1.0.0";

// Файлы для кэширования при установке
// Паттерны для автоматического определения файлов для кэширования
const STATIC_FILE_PATTERNS = [
  "/",
  "/pages/**/index.{html,css,js}",
  "/features/**/*.{js,css}",
  "/features/pwa/manifest.json",
  "/features/page/assets/*",
];

// Функция для получения списка файлов по паттернам
async function getStaticFiles() {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const requests = await Promise.all(
      STATIC_FILE_PATTERNS.map((pattern) =>
        fetch(pattern)
          .then((response) => (response.ok ? response : null))
          .catch(() => null)
      )
    );

    return requests.filter((req) => req !== null);
  } catch (error) {
    console.error("Error getting static files:", error);
    return [];
  }
}

const STATIC_FILES = getStaticFiles();

// Установка Service Worker
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("Service Worker: Caching static files");
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log("Service Worker: Static files cached");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("Service Worker: Error caching static files", error);
      })
  );
});

// Активация Service Worker
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log("Service Worker: Deleting old cache", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("Service Worker: Activated");
        return self.clients.claim();
      })
  );
});

// Перехват запросов
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Пропускаем запросы к внешним ресурсам
  if (url.origin !== location.origin) {
    return;
  }

  // Стратегия кэширования для разных типов файлов
  if (request.method === "GET") {
    event.respondWith(handleRequest(request));
  }
});

async function handleRequest(request) {
  const url = new URL(request.url);

  // Для HTML страниц используем Network First
  if (request.headers.get("accept").includes("text/html")) {
    return handleHtmlRequest(request);
  }

  // Для статических ресурсов используем Cache First
  if (isStaticResource(request)) {
    return handleStaticRequest(request);
  }

  // Для остальных запросов используем Network First
  return handleDynamicRequest(request);
}

async function handleHtmlRequest(request) {
  try {
    // Сначала пробуем сеть
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Кэшируем успешный ответ
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log("Network failed for HTML request, trying cache");
  }

  // Если сеть недоступна, используем кэш
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Если нет в кэше, возвращаем офлайн страницу
  return caches.match("/pages/offline.html");
}

async function handleStaticRequest(request) {
  // Сначала проверяем кэш
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    // Если нет в кэше, загружаем из сети
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Кэшируем для будущего использования
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error("Failed to fetch static resource:", error);
    throw error;
  }
}

async function handleDynamicRequest(request) {
  try {
    // Сначала пробуем сеть
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Кэшируем успешный ответ
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log("Network failed for dynamic request, trying cache");
  }

  // Если сеть недоступна, используем кэш
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  throw new Error("No cached version available");
}

function isStaticResource(request) {
  const url = new URL(request.url);
  const staticExtensions = [
    ".css",
    ".js",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".ico",
    ".webp",
  ];

  return staticExtensions.some((ext) => url.pathname.endsWith(ext));
}

// Обработка push уведомлений
self.addEventListener("push", (event) => {
  console.log("Service Worker: Push received");

  const options = {
    body: event.data ? event.data.text() : "Новое уведомление от Gold Rock",
    icon: "/features/page/assets/icon-192x192.png",
    badge: "/features/page/assets/icon-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "Открыть приложение",
        icon: "/features/page/assets/icon-96x96.png",
      },
      {
        action: "close",
        title: "Закрыть",
        icon: "/features/page/assets/icon-96x96.png",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification("Gold Rock", options));
});

// Обработка кликов по уведомлениям
self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification click received");

  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/"));
  }
});

// Синхронизация в фоне
self.addEventListener("sync", (event) => {
  console.log("Service Worker: Background sync", event.tag);

  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Здесь можно добавить логику синхронизации данных
    console.log("Background sync completed");
  } catch (error) {
    console.error("Background sync failed:", error);
  }
}
