import "chart.js";

class View extends HTMLElement {
  #chartEl = null;
  #chartLegendEl = null;
  #chart = null;
  #data = [];
  #colors = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
    "#FF6384",
    "#C9CBCF",
    "#4BC0C0",
    "#FF6384",
  ];
  getData = () => [];

  constructor() {
    super();
    this.#initListeners();
  }

  connectedCallback() {
    this.#chartEl = this.querySelector("[data-id='chart']");
    this.#chartLegendEl = this.querySelector("[data-id='chart-legend']");
  }

  disconnectedCallback() {
    if (this.#chart) {
      this.#chart.destroy();
    }
  }

  init() {
    this.render();
  }

  render() {
    this.#renderChart();
    this.#renderLegend();
  }

  #initListeners() {
    this.addEventListener("mouseenter", this.#handleMouseEnter.bind(this));
    this.addEventListener("mouseleave", this.#handleMouseLeave.bind(this));
  }

  #handleMouseEnter(e) {
    if (this.#chart) {
      this.#chartEl.style.cursor = "pointer";
    }
  }

  #handleMouseLeave(e) {
    if (this.#chart) {
      this.#chartEl.style.cursor = "default";
    }
  }

  #renderChart() {
    if (!this.#chartEl) {
      console.warn("Chart element not found, cannot render chart");
      return;
    }

    if (this.#chart) {
      this.#chart.destroy();
    }

    const topData = this.#getTopSpends(10);

    if (topData.length === 0) {
      this.#showEmptyState();
      return;
    }

    const topDataColors = this.#colors.slice(0, topData.length);

    const chartData = {
      labels: topData.map((item) => item.purpose),
      datasets: [
        {
          data: topData.map((item) => item.amount),
          backgroundColor: topDataColors.map((color) =>
            this.#lightenColor(color, 20)
          ),
          borderColor: "#ffffff",
          borderWidth: 2,
          hoverBackgroundColor: topDataColors,
          hoverBorderColor: "#ffffff",
          hoverBorderWidth: 3,
        },
      ],
    };

    this.#chart = new Chart(this.#chartEl, {
      type: "doughnut",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || "";
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${this.#formatCurrency(
                  value
                )} (${percentage}%)`;
              }.bind(this),
            },
          },
        },
        animation: {
          animateRotate: true,
          animateScale: true,
        },
        cutout: "60%",
        elements: {
          arc: {
            borderWidth: 2,
          },
        },
      },
    });
  }

  #renderLegend() {
    if (!this.#chartLegendEl) {
      console.warn("Chart legend element not found, cannot render legend");
      return;
    }

    const topData = this.#getTopSpends(10);

    if (topData.length === 0) {
      this.#chartLegendEl.innerHTML =
        '<p class="empty-legend">Нет данных для отображения</p>';
      return;
    }

    const total = topData.reduce((sum, item) => sum + item.amount, 0);

    const legendHTML = topData
      .map((item, index) => {
        const percentage = ((item.amount / total) * 100).toFixed(1);
        return `
        <div class="legend-item" data-index="${index}">
          <div class="legend-color" style="background-color: ${
            this.#colors[index]
          }"></div>
          <div class="legend-content">
            <div class="legend-label">${item.purpose}</div>
            <div class="legend-value">${this.#formatCurrency(
              item.amount
            )} (${percentage}%)</div>
          </div>
        </div>
      `;
      })
      .join("");

    this.#chartLegendEl.innerHTML = legendHTML;

    this.#addLegendListeners();
  }

  #addLegendListeners() {
    const legendItems = this.#chartLegendEl.querySelectorAll(".legend-item");

    legendItems.forEach((item, index) => {
      item.addEventListener("mouseenter", () => {
        if (this.#chart) {
          this.#chart.setActiveElements([
            {
              datasetIndex: 0,
              index: index,
            },
          ]);

          const originalData = this.#getTopSpends(10).map(
            (item) => item.amount
          );
          this.#chart.data.datasets[0].data = originalData.map((value, i) => {
            return i === index ? value * 1.1 : value;
          });
          this.#chart.update("none");
        }
        item.classList.add("active");
      });

      item.addEventListener("mouseleave", () => {
        if (this.#chart) {
          this.#chart.setActiveElements([]);

          this.#chart.data.datasets[0].data = this.#getTopSpends(10).map(
            (item) => item.amount
          );
          this.#chart.update("none");
        }
        item.classList.remove("active");
      });
    });
  }

  #getTopSpends(limit) {
    const dataWithUniquePurposes = this.getData().reduce((acc, item) => {
      const purpose = item.purpose.toLowerCase().trim();
      if (!acc[purpose]) {
        acc[purpose] = item;
      } else {
        acc[purpose].amount += item.amount;
      }

      return acc;
    }, {});

    return Object.values(dataWithUniquePurposes)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, limit);
  }

  #formatCurrency(value) {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "BYN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  #lightenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;
    return (
      "#" +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
    );
  }

  #showEmptyState() {
    this.#chartEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📊</div>
        <p>Нет данных для отображения</p>
      </div>
    `;
  }
}

customElements.define("top-spends-chart", View);
