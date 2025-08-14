import SpendsHistoryService from "../../features/spends/services/spendsHistory.js";
import "../../features/spends-per-day/components/spends-per-day/index.js";
import "../../features/spends-chart/components/top-spends-chart/index.js";
import "../../features/spends-chart/components/spends-per-periods/index.js";

const main = async () => {
  await customElements.whenDefined("spends-per-day");
  await customElements.whenDefined("top-spends-chart");
  await customElements.whenDefined("spends-per-periods");

  const spendsPerDayEl = document.getElementById("spends-per-day");
  const topSpendsChartEl = document.getElementById("top-spends-chart");
  const spendsPerPeriodsEl = document.getElementById("spends-per-periods");

  spendsPerDayEl.getItems = () => SpendsHistoryService.items;
  spendsPerDayEl.init();

  topSpendsChartEl.getData = () => SpendsHistoryService.items;
  topSpendsChartEl.init();

  spendsPerPeriodsEl.getData = () => SpendsHistoryService.items;
  spendsPerPeriodsEl.init();
};

main();
