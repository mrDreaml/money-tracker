import { formatCurrency } from "/src/features/format-value/utils/currency.js";

class View extends HTMLElement {
  static observedAttributes = [];
  #tbodyEl = null;
  #data = [];
  #longPressTimer = null;
  #longPressDelay = 1000;
  #currentLongPressRow = null;
  #deleteBtnEl = null;
  #activeRow = null;
  onDelete = () => {};

  constructor() {
    super();
    this.#tbodyEl = this.querySelector("[data-id='spends-history-table-body']");
    this.#deleteBtnEl = this.querySelector(
      "[data-id='spends-history-table-delete-btn']"
    );
    this.#initListeners();
  }

  connectedCallback() {
    console.log("Spends history table component added to page.");
  }

  disconnectedCallback() {
    console.log("Spends history table component removed from page.");
  }

  adoptedCallback() {
    console.log("Spends history table component moved to new page.");
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(`Attribute ${name} has changed.`);
  }

  // Метод render для отображения данных
  render(data) {
    this.#data = data || [];
    this.#renderTable();
  }

  #renderTable() {
    this.#tbodyEl.innerHTML = "";

    this.#data.forEach((item, index) => {
      const row = document.createElement("tr");
      row.className = "spends-history-row";
      row.dataset.index = index;

      row.innerHTML = `
        <td class="amount">${formatCurrency(item.amount)}</td>
        <td class="purpose">${item.purpose}</td>
        <td class="date">${this.#formatDate(item.date)}</td>
      `;

      this.#tbodyEl.appendChild(row);
    });
  }

  #formatDate(date) {
    if (typeof date === "string") {
      return new Date(date).toLocaleDateString("ru-RU");
    }
    if (date instanceof Date) {
      return date.toLocaleDateString("ru-RU");
    }
    return date;
  }

  #initListeners() {
    // Обработчик длительного нажатия
    this.addEventListener("touchstart", this.#handleTouchStart.bind(this));
    this.addEventListener("touchend", this.#handleTouchEnd.bind(this));
    this.addEventListener("touchcancel", this.#handleTouchEnd.bind(this));

    document.addEventListener("click", this.#handleOutsideClick.bind(this));
    // Обработчик клика для отмены длительного нажатия
    this.addEventListener("click", this.#handleClick.bind(this));

    this.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });
  }

  #handleOutsideClick(e) {
    if (!this.#activeRow) return;
    if (!this.#activeRow.contains(e.target)) {
      this.#hideDeleteMode();
    }
  }

  #handleTouchStart(e) {
    const row = e.target.closest(".spends-history-row");
    if (!row) return;

    this.#currentLongPressRow = row;

    this.#longPressTimer = setTimeout(() => {
      this.#showDeleteMode(row);
    }, this.#longPressDelay);
  }

  #handleTouchEnd(e) {
    if (this.#longPressTimer) {
      clearTimeout(this.#longPressTimer);
      this.#longPressTimer = null;
    }
  }

  #handleClick(e) {
    // Если кликнули на кнопку удаления
    if (e.target.dataset.id === "spends-history-table-delete-btn") {
      if (this.#activeRow) {
        const index = parseInt(this.#activeRow.dataset.index);
        this.onDelete(index);
        this.#activeRow.remove();
        this.#hideDeleteMode();
      }
      return;
    }
  }

  #showDeleteMode(row) {
    // Блюрим все строки кроме текущей
    const allRows = this.querySelectorAll(".spends-history-row");
    allRows.forEach((r) => {
      if (r !== row) {
        r.classList.add("blurred");
      }
    });

    this.#deleteBtnEl.removeAttribute("hidden");
    row.classList.add("delete-mode");
    this.#activeRow = row;
  }

  #hideDeleteMode() {
    // Убираем блюр со всех строк
    const allRows = this.querySelectorAll(".spends-history-row");
    allRows.forEach((row) => {
      row.classList.remove("blurred", "delete-mode");
      row.style.position = "";
    });

    this.#deleteBtnEl.setAttribute("hidden", "");
    this.#currentLongPressRow = null;
    this.#activeRow = null;
  }
}

customElements.define("spends-history-table", View);
