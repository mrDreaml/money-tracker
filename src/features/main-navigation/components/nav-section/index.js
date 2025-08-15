class NavSection extends HTMLElement {
  constructor() {
    super();
    this.#initListeners();
  }

  connectedCallback() {
    document.documentElement.classList.add("transition-group");
  }

  #initListeners() {
    window.addEventListener("pageswap", async (e) => {
      if (!e.viewTransition) return;
      const transitionType = "backwards";
      e.viewTransition.types.add(transitionType);
    });

    window.addEventListener("pagereveal", async (e) => {
      if (!e.viewTransition) return;
      const transitionType = "backwards";

      e.viewTransition.types.add(transitionType);
    });
  }
}

customElements.define("nav-section", NavSection);
