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
    if (!("serviceWorker" in navigator)) {
      console.warn("PWA: Service Worker not supported");
      return;
    }

    try {
      const swUrl = new URL("./sw.js", import.meta.url);
      const scope = new URL("./", import.meta.url);

      this.swRegistration = await navigator.serviceWorker.register(swUrl, {
        scope: scope.pathname,
      });

      this.swRegistration.addEventListener("updatefound", () => {
        console.log("PWA: Service Worker update found");
      });
    } catch (error) {
      console.error("PWA: Service Worker registration failed:", error);
    }
  }

  setupEventListeners() {
    window.addEventListener("online", () => {
      this.isOnline = true;
      console.log("PWA: Back online");
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      console.log("PWA: Gone offline");
    });
  }

  async checkForUpdates() {
    if (!this.swRegistration) {
      return;
    }

    try {
      await this.swRegistration.update();
    } catch (error) {
      console.error("PWA: Error checking for updates:", error);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.pwa = new PWA();
});

export default PWA;
