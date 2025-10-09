import { formatCurrency } from "features/format-value/utils/currency.js";
const VALUE_STEP = 1;
const MAX_VALUE = 99999;

class View extends HTMLElement {
  #inputEl;
  #formattedEl;
  #formEl;
  #value = 0;
  #availableSpendsEl = null;

  onChange = (value, purpose) => {};

  static observedAttributes = [];

  constructor() {
    super();

    this.#inputEl = document.getElementById("spends-input");
    this.#formattedEl = document.getElementById("spends-input-formatted");
    this.#formEl = this.querySelector("[data-id='spends-form']");
    this.#availableSpendsEl = this.querySelector("#available-spends");
    this.#initListeners();
    this.#renderFormattedValue();
  }

  #toggleInput() {
    this.#inputEl.hidden = !this.#inputEl.hidden;
    this.#formattedEl.hidden = !this.#formattedEl.hidden;
    if (this.#inputEl.hidden) {
      this.#renderFormattedValue();
    } else {
      this.#inputEl.focus();
    }
  }

  #renderFormattedValue() {
    this.#formattedEl.textContent = formatCurrency(this.#value);
  }

  #setupValue() {
    this.#inputEl.value = this.#value;
    this.#renderFormattedValue();
  }

  #changeValue(newValue) {
    if (newValue < 0 || newValue > MAX_VALUE || isNaN(newValue)) {
      this.#inputEl.value = this.#value;
      return;
    }
    this.#value = newValue;
    this.#inputEl.value = this.#value;
  }

  #initListeners() {
    this.querySelector("button[name='add']").addEventListener(
      "mousedown",
      () => {
        this.#changeValue(this.#value + VALUE_STEP);
        this.#setupValue();
      }
    );
    this.querySelector("button[name='sub']").addEventListener(
      "mousedown",
      () => {
        this.#changeValue(this.#value - VALUE_STEP);
        this.#setupValue();
      }
    );

    this.#formattedEl.addEventListener("click", () => {
      this.#toggleInput();
    });

    this.#inputEl.addEventListener("input", () => {
      this.#changeValue(Number(this.#inputEl.value));
    });

    this.#inputEl.addEventListener("blur", () => {
      this.#toggleInput();
    });

    this.#formEl.addEventListener("submit", (e) => {
      e.preventDefault();
      const { selectedValue: purpose } = this.#availableSpendsEl;

      if (!this.#value) {
        alert("Необходимо указать сумму 🫰");
        return;
      }

      if (!purpose) {
        alert("Необходимо выбрать категорию 🤷‍♂️");
        return;
      }

      this.onChange(this.#value, purpose);

      this.#value = 0;
      this.#setupValue();
      this.#availableSpendsEl.resetSelectedValue();
    });
  }
}

customElements.define("spends-form", View);
