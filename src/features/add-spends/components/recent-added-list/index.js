import { formatCurrency } from "features/format-value/utils/currency.js";

const MAX_ITEMS = 5;

class View extends HTMLElement {
  static observedAttributes = [];
  #listEl = null;
  onSelect = () => {};
  getItems = () => [];
  onAddItem = () => {};
  #handleClick;

  constructor() {
    super();

    this.#listEl = this.querySelector("[data-id='recent-added-list']");
    this.#initListeners();
    this.#handleClick = this.#handleClick_.bind(this);
  }

  init() {
    this.#renderItems();
  }

  #getLatestItems() {
    const uniqItemsSerialized = [
      ...new Set(this.getItems().map(JSON.stringify)),
    ].map(JSON.parse);
    return uniqItemsSerialized.slice(-MAX_ITEMS);
  }

  addItem(value, purpose) {
    this.onAddItem(value, purpose);
    this.#renderItems();
  }

  #handleClick_(e) {
    const itemEl = e.target.closest(".recent-added-item");
    if (itemEl) {
      const { value, purpose } = itemEl.dataset;
      this.onSelect(Number(value), purpose);
    }
  }

  #renderItems() {
    this.#listEl.innerHTML = "";

    this.#getLatestItems().forEach((item) => {
      const templateContent = this.querySelector(
        "[data-id='recent-added-list__item-template']"
      ).content;
      const itemEl = templateContent.cloneNode(true);
      itemEl.querySelector("[data-id='value']").textContent = formatCurrency(
        item.amount
      );
      itemEl.querySelector("[data-id='purpose']").textContent = item.purpose;
      itemEl.children[0].dataset.value = item.amount;
      itemEl.children[0].dataset.purpose = item.purpose;
      this.#listEl.appendChild(itemEl);
    });
  }

  #initListeners() {
    this.addEventListener("click", this.#handleClick_);
  }
}

customElements.define("recent-added-list", View);
