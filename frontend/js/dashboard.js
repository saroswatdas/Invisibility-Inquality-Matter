import { getAreas } from "./api.js";

function calcInequalityScore(indicators) {
  const values = Object.values(indicators);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.round(100 - avg);
}

async function initDashboard() {
  const areas = await getAreas();
  console.log("Dashboard loaded areas:", areas);

  // Priority distribution
  const priorityCounts = {
    Critical: 0,
    High: 0,
    Moderate: 0,
    Low: 0,
  };

  areas.forEach((a) => {
    if (priorityCounts[a.priority] !== undefined) {
      priorityCounts[a.priority]++;
    }
  });

  new Chart(document.getElementById("priorityChart"), {
    type: "bar",
    data: {
      labels: Object.keys(priorityCounts),
      datasets: [
        {
          label: "Number of Areas",
          data: Object.values(priorityCounts),
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
    },
  });

  // Top 5 inequality
  const ranked = [...areas]
    .map((a) => ({
      name: a.name,
      score: calcInequalityScore(a.indicators),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  new Chart(document.getElementById("topAreasChart"), {
    type: "bar",
    data: {
      labels: ranked.map((x) => x.name),
      datasets: [
        {
          label: "Inequality Score",
          data: ranked.map((x) => x.score),
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          min: 0,
          max: 100,
        },
      },
    },
  });
}

initDashboard();
