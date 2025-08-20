import { isMobile } from "../utils/index.js";

class MobileOnly extends HTMLElement {
  constructor() {
    super();

    const mobileOnlyEl = this.shadowRoot.querySelector(
      "[data-id='mobile-only']"
    );
    if (isMobile) {
      mobileOnlyEl.remove();
      this.shadowRoot.querySelector("slot").removeAttribute("hidden");
    } else {
      mobileOnlyEl.removeAttribute("hidden");
      this.shadowRoot.querySelector("slot").remove();
    }
  }

  connectedCallback() {
    console.log("MobileOnly component added to page.");
  }

  disconnectedCallback() {
    console.log("MobileOnly component removed from page.");
  }
}

customElements.define("mobile-only", MobileOnly);
