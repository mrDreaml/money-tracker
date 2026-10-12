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
        // GitHub Pages caches sw.js; without this updates may never apply
        updateViaCache: "none",
      });

      this.swRegistration.addEventListener("updatefound", () => {
        const newWorker = this.swRegistration.installing;
        if (!newWorker) {
          return;
        }

        console.log("PWA: Service Worker update found");

        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            console.log("PWA: New Service Worker installed, reloading");
          }
        });
      });

      // After skipWaiting + clients.claim, reload once to pick up new assets
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (refreshing) {
          return;
        }
        refreshing = true;
        console.log("PWA: Service Worker controller changed, reloading");
        window.location.reload();
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
