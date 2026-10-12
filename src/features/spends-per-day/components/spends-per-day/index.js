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

    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    const now = Date.now();
    const periodStart = new Date();
    periodStart.setMonth(periodStart.getMonth() - 1);

    const periodItems = items.filter(
      ({ date }) => new Date(date).getTime() >= periodStart.getTime()
    );

    if (periodItems.length === 0) {
      return 0;
    }

    const totalSpends = periodItems.reduce(
      (acc, { amount }) => acc + amount,
      0
    );
    const oldestDate = Math.min(
      ...periodItems.map(({ date }) => new Date(date).getTime())
    );
    const daysSpan = (now - oldestDate) / MS_PER_DAY;

    if (daysSpan <= 1) {
      return totalSpends;
    }

    return totalSpends / daysSpan;
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
