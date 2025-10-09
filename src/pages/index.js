import "features/add-spends/components/spends-form/index.js";
import "features/mobile-only/components/index.js";
import "features/add-spends/components/available-spends/index.js";
import SpendsHistory from "features/spends/services/spendsHistory.js";

const main = async () => {
  await customElements.whenDefined("spends-form");

  const spendsFormEl = document.getElementById("spends-form");

  spendsFormEl.onChange = (value, purpose) => {
    alert("Добавлено 😊");
    SpendsHistory.addItem(value, purpose);
  };
};

main();
