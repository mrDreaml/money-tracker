const APP_SCOPE = "/money-tracker/";

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
      this.swRegistration = await navigator.serviceWorker.register(
        `${APP_SCOPE}sw.js`,
        { scope: APP_SCOPE },
      );

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
