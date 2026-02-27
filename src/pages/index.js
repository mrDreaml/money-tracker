import "features/add-spends/components/spends-form/index.js";
import "features/mobile-only/components/index.js";
import "features/add-spends/components/available-spends/index.js";
import SpendsHistory from "features/spends/services/spendsHistory.js";

const COUNTS_TO_LOG = 10

const main = async () => {
  let countsToLogI = 0
  await customElements.whenDefined("spends-form");

  const spendsFormEl = document.getElementById("spends-form");

  spendsFormEl.onChange = (value, purpose) => {
    alert("Добавлено 😊");
    SpendsHistory.addItem(value, purpose);
  };

  document.getElementById('app-version').onclick = () => {
    countsToLogI++

    if (countsToLogI >= COUNTS_TO_LOG) {
      window.location.href = 'log'
    }
  }
};

main();
