import { formatCurrency } from "../../../format-value/utils/currency.js";

const VALUE_STEP = 1;
const MAX_VALUE = 99999;

class View extends HTMLElement {
  #inputEl;
  #formattedEl;
  #formEl;
  #purposeEl;
  #value = 0;

  onChange = (value, purpose) => {};

  static observedAttributes = [];

  constructor() {
    super();

    this.#inputEl = document.getElementById("spends-input");
    this.#formattedEl = document.getElementById("spends-input-formatted");
    this.#formEl = this.querySelector("[data-id='spends-form']");
    this.#purposeEl = document.getElementById("spends-purpose");
    this.#initListeners();
    this.#renderFormattedValue();
  }

  setValues(value, purpose) {
    this.#value = value;
    this.#purposeEl.value = purpose;
    this.#setupValue();
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

      if (this.#value === 0) {
        return;
      }
      this.onChange(this.#value, this.#purposeEl.value);

      this.#value = 0;
      this.#setupValue();
    });
  }
}

customElements.define("spends-form", View);
