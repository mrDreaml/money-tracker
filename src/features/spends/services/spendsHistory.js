class SpendsHistory {
  #items = [];

  constructor() {
    this.#readItems();
  }

  get items() {
    return this.#items;
  }

  #readItems() {
    const itemsStoreFormat = localStorage.getItem("spends-history");
    if (!itemsStoreFormat) {
      this.#items = [];
      return;
    }
    this.#items = JSON.parse(itemsStoreFormat).map((item) => {
      return {
        amount: item[0],
        purpose: item[1],
        date: item[2],
      };
    });
  }

  #saveItems() {
    const itemsStoreFormat = JSON.stringify(
      this.#items.map((item) => {
        return [item.amount, item.purpose, item.date];
      })
    );
    localStorage.setItem("spends-history", itemsStoreFormat);
  }

  addItem(amount, purpose) {
    this.#items.push({
      amount: Number(amount),
      purpose,
      date: new Date().toISOString(),
    });
    this.#saveItems();
  }

  removeItem(index) {
    this.#items.splice(index, 1);
    this.#saveItems();
  }
}

const SpendsHistoryService = new SpendsHistory();

export default SpendsHistoryService;
