import SpendsHistoryService from "/src/features/spends/services/spendsHistory.js";
import "/src/features/spends-history/components/spends-history-table/index.js";

const main = async () => {
  await customElements.whenDefined("spends-history-table");

  const spendsHistoryTableEl = document.getElementById("spends-history-table");

  spendsHistoryTableEl.render(SpendsHistoryService.items);
  spendsHistoryTableEl.onDelete = (index) => {
    SpendsHistoryService.removeItem(index);
  };
};

main();
