class AvailableSpends extends HTMLElement {
  static observedAttributes = [];
  #selectedValue = "";

  constructor() {
    super();
  }

  get selectedValue() {
    return this.#selectedValue;
  }

  resetSelectedValue() {
    this.#onSelect("");
  }

  #onSelect = (value) => {
    this.shadowRoot.querySelectorAll("[data-id=tag]").forEach((el) => {
      el.classList.remove("spend-tag--selected");
    });
    this.#selectedValue = value;

    if (value) {
      this.shadowRoot
        .querySelector(`[data-id=tag][data-value="${value}"]`)
        .classList.add("spend-tag--selected");
    }
  };

  connectedCallback() {
    this.shadowRoot.addEventListener("click", (event) => {
      const el = event.target.closest("[data-id=tag]");
      this.#onSelect(el.dataset.value);
    });
  }
}

customElements.define("available-spends", AvailableSpends);
