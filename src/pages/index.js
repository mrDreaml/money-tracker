import "../features/add-spends/components/spends-form/index.js";
import "../features/add-spends/components/recent-added-list/index.js";
import SpendsHistory from "../features/spends/services/spendsHistory.js";

const main = async () => {
  await customElements.whenDefined("spends-form");
  await customElements.whenDefined("recent-added-list");

  const spendsFormEl = document.getElementById("spends-form");
  const recentAddedListEl = document.getElementById("recent-added-list");

  recentAddedListEl.getItems = () => SpendsHistory.items;
  recentAddedListEl.onAddItem = (value, purpose) => {
    SpendsHistory.addItem(value, purpose);
  };

  recentAddedListEl.onSelect = (value, purpose) => {
    spendsFormEl.setValues(value, purpose);
  };

  spendsFormEl.onChange = (value, purpose) => {
    recentAddedListEl.addItem(value, purpose);
  };

  recentAddedListEl.init();
};

main();
