class CalcSpendsPerPeriod extends HTMLElement {
  static observedAttributes = [];
  getData = () => {}

  constructor() {
    super();
    this.startDateInputEl = this.shadowRoot.querySelector(
      "[name='start-date']"
    );
    this.endDateInputEl = this.shadowRoot.querySelector("[name='end-date']");
    this.calculateButtonEl = this.shadowRoot.querySelector(
      "[data-id='calculate-button']"
    );
    this.resultEl = this.shadowRoot.querySelector("[data-id='result-value']");
  }

  connectedCallback() {
    this.calculateButtonEl.onclick = (e) => {
      const startDate = new Date(`${this.startDateInputEl.value}T00:00`);
      const endDate = new Date(`${this.endDateInputEl.value}T23:59`);

      if (isNaN(startDate) || isNaN(endDate)) {
        alert('Заполните "с" и "по" 📅');
        return;
      }

      const filteredByDateAmount = this.getData().filter(item => {
        const dateObj = new Date(item.date)
        return dateObj >= startDate && dateObj <= endDate
      }).reduce((acc, item) => acc + item.amount, 0)
      
      this.resultEl.innerText = filteredByDateAmount
    };
  }

  disconnectedCallback() {}

  attributeChangedCallback(name, oldValue, newValue) {}
}

customElements.define("calc-spends-per-period", CalcSpendsPerPeriod);

export default CalcSpendsPerPeriod;
