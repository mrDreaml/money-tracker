import "chart.js";

class View extends HTMLElement {
  #dailyChartEl = null;
  #weeklyChartEl = null;
  #dailyChart = null;
  #weeklyChart = null;
  #data = [];
  #totalSpendsEl = null;
  #colors = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
    "#FF6384",
  ];

  getData = () => [];

  constructor() {
    super();
    this.#initListeners();
  }

  connectedCallback() {
    this.#dailyChartEl = this.querySelector("[data-id='daily-chart']");
    this.#weeklyChartEl = this.querySelector("[data-id='weekly-chart']");
    this.#totalSpendsEl = this.querySelector("[data-id='total-spends-value']");
  }

  disconnectedCallback() {
    if (this.#dailyChart) {
      this.#dailyChart.destroy();
    }
    if (this.#weeklyChart) {
      this.#weeklyChart.destroy();
    }
  }

  init() {
    this.render();
  }

  render() {
    this.#renderDailyChart();
    this.#renderWeeklyChart();
    this.#totalSpendsEl.textContent = this.#getTotalSpends();
  }

  #initListeners() {
    this.addEventListener("mouseenter", this.#handleMouseEnter.bind(this));
    this.addEventListener("mouseleave", this.#handleMouseLeave.bind(this));
  }

  #handleMouseEnter(e) {
    if (this.#dailyChart || this.#weeklyChart) {
      this.style.cursor = "pointer";
    }
  }

  #handleMouseLeave(e) {
    if (this.#dailyChart || this.#weeklyChart) {
      this.style.cursor = "default";
    }
  }

  #getTotalSpends() {
    const data = this.getData();
    if (!data || data.length === 0) return 0;

    console.log(">>", data);
    return data.reduce((acc, item) => acc + item.amount, 0).toFixed(3);
  }

  #renderDailyChart() {
    if (!this.#dailyChartEl) {
      console.warn("Daily chart element not found, cannot render chart");
      return;
    }

    if (this.#dailyChart) {
      this.#dailyChart.destroy();
    }

    const dailyData = this.#getDailyData();

    if (dailyData.length === 0) {
      this.#showEmptyState(this.#dailyChartEl, "No daily data available");
      return;
    }

    const chartData = {
      labels: dailyData.map((item) => item.date),
      datasets: [
        {
          label: "Daily Spends",
          data: dailyData.map((item) => item.amount),
          backgroundColor: this.#colors[0],
          borderColor: this.#colors[0],
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    };

    const config = {
      type: "bar",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: "Daily Spends",
            color: "#333",
            font: {
              size: 16,
              weight: "bold",
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(0, 0, 0, 0.1)",
            },
            ticks: {
              color: "#666",
              font: {
                size: 12,
              },
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: "#666",
              font: {
                size: 11,
              },
              maxRotation: 45,
            },
          },
        },
        interaction: {
          intersect: false,
          mode: "index",
        },
      },
    };

    this.#dailyChart = new Chart(this.#dailyChartEl, config);
  }

  #renderWeeklyChart() {
    // Проверяем, что элемент графика существует
    if (!this.#weeklyChartEl) {
      console.warn("Weekly chart element not found, cannot render chart");
      return;
    }

    if (this.#weeklyChart) {
      this.#weeklyChart.destroy();
    }

    const weeklyData = this.#getWeeklyData();

    if (weeklyData.length === 0) {
      this.#showEmptyState(this.#weeklyChartEl, "No weekly data available");
      return;
    }

    const chartData = {
      labels: weeklyData.map((item) => item.week),
      datasets: [
        {
          label: "Weekly Spends",
          data: weeklyData.map((item) => item.amount),
          backgroundColor: this.#colors[1],
          borderColor: this.#colors[1],
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    };

    const config = {
      type: "bar",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: "Weekly Spends",
            color: "#333",
            font: {
              size: 16,
              weight: "bold",
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(244, 244, 244, 0.1)",
            },
            ticks: {
              color: "#666",
              font: {
                size: 12,
              },
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: "#666",
              font: {
                size: 11,
              },
              maxRotation: 45,
            },
          },
        },
        interaction: {
          intersect: false,
          mode: "index",
        },
      },
    };

    this.#weeklyChart = new Chart(this.#weeklyChartEl, config);
  }

  #getDailyData() {
    const data = this.getData();
    if (!data || data.length === 0) return [];

    const dailyMap = new Map();

    data.forEach((item) => {
      const date = new Date(item.date);
      const dateKey = date.toISOString().split("T")[0];

      if (dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, dailyMap.get(dateKey) + item.amount);
      } else {
        dailyMap.set(dateKey, item.amount);
      }
    });

    const dailyData = Array.from(dailyMap.entries())
      .map(([date, amount]) => ({
        date: new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        amount: amount,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    // Возвращаем последние 7 дней
    return dailyData.slice(-7);
  }

  #getWeeklyData() {
    const data = this.getData();
    if (!data || data.length === 0) return [];

    const weeklyMap = new Map();

    data.forEach((item) => {
      const date = new Date(item.date);
      const weekStart = this.#getWeekStart(date);
      const weekKey = weekStart.toISOString().split("T")[0];

      if (weeklyMap.has(weekKey)) {
        weeklyMap.set(weekKey, weeklyMap.get(weekKey) + item.amount);
      } else {
        weeklyMap.set(weekKey, item.amount);
      }
    });

    const weeklyData = Array.from(weeklyMap.entries())
      .map(([weekKey, amount]) => {
        const weekStart = new Date(weekKey);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        return {
          week: `${weekStart.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })} - ${weekEnd.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}`,
          amount: amount,
        };
      })
      .sort(
        (a, b) =>
          new Date(a.week.split(" - ")[0]) - new Date(b.week.split(" - ")[0])
      );
    // Возвращаем последние 4 недели
    return weeklyData.slice(-4);
  }

  #getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  #showEmptyState(chartElement, message) {
    chartElement.style.display = "none";

    // Создаем элемент для пустого состояния
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.innerHTML = `
      <div class="empty-icon">📊</div>
      <p>${message}</p>
    `;

    chartElement.parentNode.appendChild(emptyState);
  }
}

customElements.define("spends-per-periods", View);
