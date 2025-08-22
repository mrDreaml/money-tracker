import { isMobile } from "features/mobile-only/utils/index.js";

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
}

customElements.define("mobile-only", MobileOnly);
