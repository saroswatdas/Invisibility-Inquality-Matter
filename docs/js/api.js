const API_BASE = "https://invisibility-inquality-matter.onrender.com";

export async function getAreas() {
  const res = await fetch(`${API_BASE}/areas`);
  return await res.json();
}

export async function getCompare(id1, id2) {
  const res = await fetch(`${API_BASE}/compare?id1=${id1}&id2=${id2}`);
  return await res.json();
}
