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
          "./sw.js",
          {
            scope: "/money-tracker/",
          }
        );

        console.log(
          "PWA: Service Worker registered successfully",
          this.swRegistration
        );

        // Обработка обновлений Service Worker
        this.swRegistration.addEventListener("updatefound", () => {
          console.log("PWA: Service Worker update found");
        });

        // Обработка успешной активации
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          console.log("PWA: Service Worker controller changed");
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
      console.log("PWA: Gone offline");
    });

    // Слушаем установку PWA
    window.addEventListener("beforeinstallprompt", (event) => {
      console.log("PWA: Install prompt available");
    });

    // Слушаем успешную установку
    window.addEventListener("appinstalled", () => {
      console.log("PWA: App installed successfully");
      this.hideInstallPrompt();
    });
  }

  async installApp() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      console.log("PWA: Install prompt outcome:", outcome);
      this.deferredPrompt = null;
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
}

// Инициализация PWA при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
  window.pwa = new PWA();
});

// Экспорт для использования в других модулях
export default PWA;
