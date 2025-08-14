// PWA Service Worker Registration
class PWA {
  constructor() {
    this.swRegistration = null;
    this.isOnline = navigator.onLine;
    this.init();
  }

  async init() {
    await this.registerServiceWorker();
    this.setupEventListeners();
    this.checkForUpdates();
  }

  async registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      try {
        console.log("PWA: Registering Service Worker...");

        this.swRegistration = await navigator.serviceWorker.register(
          "./src/features/pwa/sw.js",
          {
            scope: "/",
          }
        );

        console.log(
          "PWA: Service Worker registered successfully",
          this.swRegistration
        );

        // Обработка обновлений Service Worker
        this.swRegistration.addEventListener("updatefound", () => {
          console.log("PWA: Service Worker update found");
          this.showUpdateNotification();
        });

        // Обработка успешной активации
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          console.log("PWA: Service Worker controller changed");
          this.hideUpdateNotification();
        });
      } catch (error) {
        console.error("PWA: Service Worker registration failed:", error);
      }
    } else {
      console.warn("PWA: Service Worker not supported");
    }
  }

  setupEventListeners() {
    // Слушаем изменения состояния сети
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.hideOfflineNotification();
      console.log("PWA: Back online");
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      this.showOfflineNotification();
      console.log("PWA: Gone offline");
    });

    // Слушаем установку PWA
    window.addEventListener("beforeinstallprompt", (event) => {
      console.log("PWA: Install prompt available");
      this.showInstallPrompt(event);
    });

    // Слушаем успешную установку
    window.addEventListener("appinstalled", () => {
      console.log("PWA: App installed successfully");
      this.hideInstallPrompt();
    });
  }

  showOfflineNotification() {
    // Создаем уведомление о том, что приложение работает офлайн
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Gold Rock", {
        body: "Приложение работает в офлайн режиме",
        icon: "/features/page/assets/icon-192x192.png",
        badge: "/features/page/assets/icon-72x72.png",
        tag: "offline-notification",
      });
    }

    // Показываем индикатор офлайн режима в UI
    this.showOfflineIndicator();
  }

  hideOfflineNotification() {
    // Скрываем индикатор офлайн режима
    this.hideOfflineIndicator();
  }

  showOfflineIndicator() {
    let indicator = document.getElementById("offline-indicator");
    if (!indicator) {
      indicator = document.createElement("div");
      indicator.id = "offline-indicator";
      indicator.innerHTML = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: #ff6b6b;
          color: white;
          text-align: center;
          padding: 8px;
          font-size: 14px;
          z-index: 9999;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        ">
          📱 Работает офлайн
        </div>
      `;
      document.body.appendChild(indicator);
    }
    indicator.style.display = "block";
  }

  hideOfflineIndicator() {
    const indicator = document.getElementById("offline-indicator");
    if (indicator) {
      indicator.style.display = "none";
    }
  }

  showUpdateNotification() {
    let updateBanner = document.getElementById("update-banner");
    if (!updateBanner) {
      updateBanner = document.createElement("div");
      updateBanner.id = "update-banner";
      updateBanner.innerHTML = `
        <div style="
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #4CAF50;
          color: white;
          text-align: center;
          padding: 12px;
          font-size: 14px;
          z-index: 9999;
          box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
        ">
          <span>🔄 Доступно обновление приложения</span>
          <button onclick="window.pwa.updateApp()" style="
            background: white;
            color: #4CAF50;
            border: none;
            padding: 6px 12px;
            margin-left: 12px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
          ">Обновить</button>
        </div>
      `;
      document.body.appendChild(updateBanner);
    }
    updateBanner.style.display = "block";
  }

  hideUpdateNotification() {
    const updateBanner = document.getElementById("update-banner");
    if (updateBanner) {
      updateBanner.style.display = "none";
    }
  }

  updateApp() {
    if (this.swRegistration && this.swRegistration.waiting) {
      this.swRegistration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
  }

  showInstallPrompt(event) {
    // Сохраняем событие для использования позже
    this.deferredPrompt = event;

    let installBanner = document.getElementById("install-banner");
    if (!installBanner) {
      installBanner = document.createElement("div");
      installBanner.id = "install-banner";
      installBanner.innerHTML = `
        <div style="
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #2196F3;
          color: white;
          text-align: center;
          padding: 12px;
          font-size: 14px;
          z-index: 9999;
          box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
        ">
          <span>📱 Установить Gold Rock на устройство</span>
          <button onclick="window.pwa.installApp()" style="
            background: white;
            color: #2196F3;
            border: none;
            padding: 6px 12px;
            margin-left: 12px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
          ">Установить</button>
          <button onclick="window.pwa.hideInstallPrompt()" style="
            background: transparent;
            color: white;
            border: 1px solid white;
            padding: 6px 12px;
            margin-left: 8px;
            border-radius: 4px;
            cursor: pointer;
          ">Позже</button>
        </div>
      `;
      document.body.appendChild(installBanner);
    }
    installBanner.style.display = "block";
  }

  hideInstallPrompt() {
    const installBanner = document.getElementById("install-banner");
    if (installBanner) {
      installBanner.style.display = "none";
    }
  }

  async installApp() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      console.log("PWA: Install prompt outcome:", outcome);
      this.deferredPrompt = null;
      this.hideInstallPrompt();
    }
  }

  async checkForUpdates() {
    if (this.swRegistration) {
      try {
        await this.swRegistration.update();
      } catch (error) {
        console.error("PWA: Error checking for updates:", error);
      }
    }
  }

  // Метод для отправки push уведомлений
  async requestNotificationPermission() {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      console.log("PWA: Notification permission:", permission);
      return permission === "granted";
    }
    return false;
  }

  // Метод для отправки тестового уведомления
  async sendTestNotification() {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Gold Rock", {
        body: "Тестовое уведомление от Gold Rock!",
        icon: "/features/page/assets/icon-192x192.png",
        badge: "/features/page/assets/icon-72x72.png",
        vibrate: [100, 50, 100],
      });
    }
  }

  // Метод для синхронизации в фоне
  async registerBackgroundSync() {
    if (
      "serviceWorker" in navigator &&
      "sync" in window.ServiceWorkerRegistration.prototype
    ) {
      try {
        await this.swRegistration.sync.register("background-sync");
        console.log("PWA: Background sync registered");
      } catch (error) {
        console.error("PWA: Background sync registration failed:", error);
      }
    }
  }
}

// Инициализация PWA при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
  window.pwa = new PWA();
});

// Экспорт для использования в других модулях
export default PWA;
