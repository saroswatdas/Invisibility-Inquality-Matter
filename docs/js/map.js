import { getAreas } from "./api.js";

let map = L.map("map").setView([22.5937, 78.9629], 5);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

let layers = [];
let allAreas = [];
let currentPriority = "All";
let searchTerm = "";
let selectedIndicator = "overall";

// ------------------- helpers -------------------

function calcInequalityScore(indicators) {
  const values = Object.values(indicators);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.round(100 - avg);
}

function priorityColor(priority) {
  if (priority === "Critical") return "#ff1b1b";
  if (priority === "High") return "#ff9f1c";
  if (priority === "Moderate") return "#ffd60a";
  return "#00ff99";
}

function badgeClass(priority) {
  if (priority === "Critical") return "critical";
  if (priority === "High") return "high";
  if (priority === "Moderate") return "moderate";
  return "low";
}

// Better radius (not huge)
function radiusFromScore(score) {
  return 4000 + score * 120;
}

function clearLayers() {
  layers.forEach((l) => map.removeLayer(l));
  layers = [];
}

function showInfo(area) {
  const overallScore = calcInequalityScore(area.indicators);

  document.getElementById("infoBox").innerHTML = `
    <h3>${area.name}</h3>
    <span class="badge ${badgeClass(area.priority)}">${area.priority}</span>
    <p><b>Overall Inequality Score:</b> ${overallScore}/100</p>
    <hr />
    <p><b>Healthcare:</b> ${area.indicators.healthcare}</p>
    <p><b>Education:</b> ${area.indicators.education}</p>
    <p><b>Sanitation:</b> ${area.indicators.sanitation}</p>
    <p><b>Digital Access:</b> ${area.indicators.digital}</p>
    <p><b>Safety:</b> ${area.indicators.safety}</p>
  `;
}

// ------------------- render -------------------

function renderHeatmap() {
  clearLayers();

  let filtered =
    currentPriority === "All"
      ? allAreas
      : allAreas.filter((a) => a.priority === currentPriority);

  if (searchTerm.trim() !== "") {
    filtered = filtered.filter((a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  filtered.forEach((area) => {
    const overallScore = calcInequalityScore(area.indicators);

    let scoreForCircle = overallScore;
    if (selectedIndicator !== "overall") {
      scoreForCircle = 100 - area.indicators[selectedIndicator];
    }

    const baseColor = priorityColor(area.priority);

    // Opacity based on score
    const opacity = Math.min(0.55, 0.2 + scoreForCircle / 220);

    const lat = Number(area.lat);
    const lng = Number(area.lng);

    // Glow
    const glow = L.circle([lat, lng], {
      radius: radiusFromScore(scoreForCircle) * 1.7,
      color: baseColor,
      fillColor: baseColor,
      fillOpacity: 0.12,
      weight: 0,
    }).addTo(map);

    // Main
    const circle = L.circle([lat, lng], {
      radius: radiusFromScore(scoreForCircle),
      color: baseColor,
      fillColor: baseColor,
      fillOpacity: opacity,
      weight: 3,
    }).addTo(map);

    circle.bindPopup(`
      <b>${area.name}</b><br/>
      Priority: ${area.priority}<br/>
      Inequality Score: ${overallScore}/100
    `);

    circle.on("click", () => showInfo(area));

    layers.push(glow);
    layers.push(circle);
  });
}

// ------------------- legend -------------------

function addLegend() {
  const legend = L.control({ position: "bottomright" });

  legend.onAdd = function () {
    const div = L.DomUtil.create("div", "legend");

    div.innerHTML = `
      <h4>Legend</h4>
      <div><span class="dot critical"></span> Critical</div>
      <div><span class="dot high"></span> High</div>
      <div><span class="dot moderate"></span> Moderate</div>
      <div><span class="dot low"></span> Low</div>
    `;

    return div;
  };

  legend.addTo(map);
}

// ------------------- UI events -------------------

// Filter buttons
document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    currentPriority = btn.dataset.priority;
    renderHeatmap();
  });
});

// Search
document.getElementById("searchBox").addEventListener("input", (e) => {
  searchTerm = e.target.value;
  renderHeatmap();
});

// Indicator focus
document.getElementById("indicatorSelect").addEventListener("change", (e) => {
  selectedIndicator = e.target.value;
  renderHeatmap();
});

// Report (demo)
document.getElementById("repBtn").addEventListener("click", () => {
  const name = document.getElementById("repName").value.trim();
  const lat = Number(document.getElementById("repLat").value);
  const lng = Number(document.getElementById("repLng").value);
  const priority = document.getElementById("repPriority").value;

  if (!name || !lat || !lng) {
    alert("Please enter valid name, latitude, and longitude.");
    return;
  }

  const newArea = {
    id: Date.now(),
    name,
    lat,
    lng,
    priority,
    indicators: {
      healthcare: 50,
      education: 50,
      sanitation: 50,
      digital: 50,
      safety: 50
    }
  };

  allAreas.push(newArea);
  alert("Report added successfully (demo mode).");
  renderHeatmap();

  document.getElementById("repName").value = "";
  document.getElementById("repLat").value = "";
  document.getElementById("repLng").value = "";
});

// ------------------- init -------------------

async function init() {
  allAreas = await getAreas();
  addLegend();
  renderHeatmap();

  setTimeout(() => map.invalidateSize(), 600);
}

init();
