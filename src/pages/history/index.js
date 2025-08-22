import SpendsHistoryService from "../../features/spends/services/spendsHistory.js";
import "../../features/spends-history/components/spends-history-table/index.js";
import "../../features/mobile-only/components/index.js";

const main = async () => {
  await customElements.whenDefined("spends-history-table");

  const spendsHistoryTableEl = document.getElementById("spends-history-table");

  spendsHistoryTableEl.getData = () => SpendsHistoryService.items;
  spendsHistoryTableEl.render();
  spendsHistoryTableEl.onDelete = (index) => {
    SpendsHistoryService.removeItem(index);
  };
};

main();
