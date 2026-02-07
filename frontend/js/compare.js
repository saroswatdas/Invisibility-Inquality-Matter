import { getAreas } from "./api.js";

function calcInequalityScore(indicators) {
  const values = Object.values(indicators);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.round(100 - avg);
}

function formatIndicatorName(key) {
  if (key === "healthcare") return "Healthcare";
  if (key === "education") return "Education";
  if (key === "sanitation") return "Sanitation";
  if (key === "digital") return "Digital Access";
  if (key === "safety") return "Safety";
  return key;
}

let areas = [];

async function initCompare() {
  areas = await getAreas();
  console.log("Compare loaded areas:", areas);

  const area1Select = document.getElementById("area1");
  const area2Select = document.getElementById("area2");

  areas.forEach((a) => {
    const opt1 = document.createElement("option");
    opt1.value = a.id;
    opt1.textContent = a.name;
    area1Select.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = a.id;
    opt2.textContent = a.name;
    area2Select.appendChild(opt2);
  });

  if (areas.length >= 2) {
    area1Select.value = areas[0].id;
    area2Select.value = areas[1].id;
  }

  document.getElementById("compareBtn").addEventListener("click", compareAreas);
}

function compareAreas() {
  const id1 = Number(document.getElementById("area1").value);
  const id2 = Number(document.getElementById("area2").value);

  const a1 = areas.find((a) => a.id === id1);
  const a2 = areas.find((a) => a.id === id2);

  if (!a1 || !a2) return;

  if (a1.id === a2.id) {
    alert("Please select two different areas.");
    return;
  }

  const score1 = calcInequalityScore(a1.indicators);
  const score2 = calcInequalityScore(a2.indicators);

  let overallWinner = "";
  if (score1 > score2) overallWinner = a1.name;
  else if (score2 > score1) overallWinner = a2.name;
  else overallWinner = "Both are equal";

  const indicatorKeys = Object.keys(a1.indicators);

  let a1Wins = 0;
  let a2Wins = 0;

  let tableHTML = `
    <table class="compare-table">
      <thead>
        <tr>
          <th>Indicator</th>
          <th>${a1.name}</th>
          <th>${a2.name}</th>
          <th>More Inequal</th>
        </tr>
      </thead>
      <tbody>
  `;

  indicatorKeys.forEach((key) => {
    const val1 = a1.indicators[key];
    const val2 = a2.indicators[key];

    let moreInequal = "";
    if (val1 < val2) {
      moreInequal = a1.name;
      a1Wins++;
    } else if (val2 < val1) {
      moreInequal = a2.name;
      a2Wins++;
    } else {
      moreInequal = "Equal";
    }

    tableHTML += `
      <tr>
        <td><b>${formatIndicatorName(key)}</b></td>
        <td>${val1}</td>
        <td>${val2}</td>
        <td>${moreInequal}</td>
      </tr>
    `;
  });

  tableHTML += `
      </tbody>
    </table>
  `;

  document.getElementById("compareTable").innerHTML = tableHTML;
  document.getElementById("compareTableCard").style.display = "block";

  let conclusion = "";
  if (a1Wins > a2Wins) {
    conclusion = `${a1.name} shows worse inequality in most indicators (${a1Wins}/${indicatorKeys.length}).`;
  } else if (a2Wins > a1Wins) {
    conclusion = `${a2.name} shows worse inequality in most indicators (${a2Wins}/${indicatorKeys.length}).`;
  } else {
    conclusion = `Both areas show similar inequality levels across indicators.`;
  }

  document.getElementById("compareResult").innerHTML = `
    <h3>Result</h3>
    <p><b>${a1.name}</b> Overall Inequality Score: <b>${score1}/100</b></p>
    <p><b>${a2.name}</b> Overall Inequality Score: <b>${score2}/100</b></p>

    <hr />

    <p><b>Overall (worse inequality):</b> ${overallWinner}</p>
    <p><b>Indicator Comparison:</b> ${conclusion}</p>
  `;
}

initCompare();
