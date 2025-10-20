import SpendsHistoryService from "features/spends/services/spendsHistory.js";
import "features/spends-per-day/components/spends-per-day/index.js";
import "features/spends-chart/components/top-spends-chart/index.js";
import "features/spends-chart/components/spends-per-periods/index.js";
import "features/calc-spends-per-period/components/index.js";
import "features/mobile-only/components/index.js";

const main = async () => {
  await customElements.whenDefined("spends-per-day");
  await customElements.whenDefined("top-spends-chart");
  await customElements.whenDefined("spends-per-periods");
  await customElements.whenDefined("calc-spends-per-period");

  const spendsPerDayEl = document.getElementById("spends-per-day");
  const topSpendsChartEl = document.getElementById("top-spends-chart");
  const spendsPerPeriodsEl = document.getElementById("spends-per-periods");
  const calcSpendPerPeriod = document.getElementById("calc-spends-per-period");

  calcSpendPerPeriod.getData = () => SpendsHistoryService.items;

  spendsPerDayEl.getItems = () => SpendsHistoryService.items;
  spendsPerDayEl.init();

  topSpendsChartEl.getData = () => SpendsHistoryService.items;
  topSpendsChartEl.init();

  spendsPerPeriodsEl.getData = () => SpendsHistoryService.items;
  spendsPerPeriodsEl.init();
};

main();
