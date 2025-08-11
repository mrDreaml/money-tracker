import { defineElementOnContentLoaded } from "/src/shared/services/webComponents.js";

class View extends HTMLElement {
  static observedAttributes = [];
  counterValue = 0;

  constructor() {
    super();

    this.shadow = this.attachShadow({ mode: "open" });
    const template = document.getElementById("template-{{componentName}}");
    this.shadow.appendChild(template.content.cloneNode(true));
    this.counterButtonEl = this.shadow.querySelector("button");
    this.counterValueEl = this.shadow.querySelector("[data-id=counter]");

    this.#renderCountValue(this.counterValue);
    this.#initListeners();
  }

  connectedCallback() {
    console.log("Custom element added to page.");
  }

  disconnectedCallback() {
    console.log("Custom element removed from page.");
  }

  adoptedCallback() {
    console.log("Custom element moved to new page.");
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(`Attribute \${name} has changed.`);
  }

  #initListeners() {
    this.counterButtonEl.onclick = () => {
      this.#onIncrement();
    };
  }

  #renderCountValue(value) {
    this.counterValueEl.textContent = value;
  }

  #onIncrement() {
    this.counterValue++;
    this.#renderCountValue(this.counterValue);
  }
}

defineElementOnContentLoaded("{{componentName}}", View);
