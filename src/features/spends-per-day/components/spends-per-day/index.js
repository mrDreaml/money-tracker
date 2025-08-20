class View extends HTMLElement {
  #spdValueEl = null;
  getItems = () => [];

  static observedAttributes = [];

  constructor() {
    super();

    this.#spdValueEl = this.querySelector("[data-id='spd-value']");
  }

  calculateSps(items) {
    if (items.length === 0) {
      return 0;
    }
    const firstItem = items.at(-1);
    const timeDiff = new Date() - new Date(firstItem.date);
    const totalSpends = items.reduce((acc, item) => acc + item.amount, 0);
    return (totalSpends / timeDiff) * 1000 * 60 * 60 * 24;
  }

  init() {
    this.render();

    let lastTime = 0;
    const animationFrame = (time) => {
      if (time - lastTime < 1000) {
        return requestAnimationFrame(animationFrame);
      }
      this.render();
      lastTime = time;
      return requestAnimationFrame(animationFrame);
    };
    animationFrame();
  }

  render() {
    const items = this.getItems();
    this.#spdValueEl.textContent = this.calculateSps(items).toFixed(3);
  }
}

customElements.define("spends-per-day", View);
